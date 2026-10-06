import { createHmac, timingSafeEqual } from "node:crypto";
import { NextResponse } from "next/server";

import {
  MEMBERSHIP_VALIDITY_DAYS,
  pricePurchase,
  type PurchaseInput,
} from "@/features/checkout/server/purchase-pricing.server";
import { createAdminClient } from "@/lib/supabase/admin";
import { razorpay } from "@/lib/razorpay";
import { sendPurchaseNotifications } from "@/features/orders/notifications/order-notification.server";

interface PaymentVerificationInput {
  purchase: PurchaseInput;
  razorpay_order_id: string;
  razorpay_payment_id: string;
  razorpay_signature: string;
  customer?: {
    name: string;
    email?: string;
    mobile: string;
    address: string;
    district: string;
    state: string;
    pincode: string;
    marketingConsent?: boolean;
  };
}

function hasValidSignature(
  orderId: string,
  paymentId: string,
  signature: string
) {
  const secret = process.env.RAZORPAY_KEY_SECRET;
  if (!secret || !/^[a-f0-9]{64}$/i.test(signature)) return false;

  const expected = createHmac("sha256", secret)
    .update(`${orderId}|${paymentId}`)
    .digest();

  const received = Buffer.from(signature, "hex");

  return (
    received.length === expected.length &&
    timingSafeEqual(received, expected)
  );
}

export async function POST(request: Request) {
  try {
    const body = (await request.json()) as PaymentVerificationInput;

    const {
      purchase,
      razorpay_order_id: orderId,
      razorpay_payment_id: paymentId,
      razorpay_signature: signature,
    } = body;

    if (!purchase || !orderId || !paymentId || !signature) {
      return NextResponse.json(
        { error: "Payment details are incomplete." },
        { status: 400 }
      );
    }

    if (!hasValidSignature(orderId, paymentId, signature)) {
      return NextResponse.json(
        { error: "Payment signature could not be verified." },
        { status: 400 }
      );
    }

    const priced = await pricePurchase(purchase);

    const [order, payment] = await Promise.all([
      razorpay.orders.fetch(orderId),
      razorpay.payments.fetch(paymentId),
    ]);

    if (
      order.amount !== priced.totalPaise ||
      order.currency !== "INR" ||
      order.notes?.flow !== purchase.flow ||
      order.notes?.reference !==
        (purchase.flow === "membership"
          ? purchase.planId
          : purchase.flow) ||
      order.notes?.shipping_method !==
        (purchase.flow !== "membership"
          ? priced.shippingMethod
          : "none") ||
      payment.order_id !== orderId ||
      payment.amount !== priced.totalPaise ||
      payment.currency !== "INR"
    ) {
      return NextResponse.json(
        { error: "The paid amount does not match this purchase." },
        { status: 400 }
      );
    }

    let capturedPayment = payment;

    if (payment.status === "authorized") {
      capturedPayment = await razorpay.payments.capture(
        paymentId,
        priced.totalPaise,
        "INR"
      );
    }

    if (capturedPayment.status !== "captured") {
      return NextResponse.json(
        { error: "Payment has not been captured." },
        { status: 402 }
      );
    }

    const supabase = createAdminClient();

    /* ------------------------------------------------------------------
     * MEMBERSHIP
     * ------------------------------------------------------------------ */

    if (purchase.flow === "membership") {
      if (
        !body.customer ||
        !body.customer.name ||
        !body.customer.email ||
        !body.customer.mobile
      ) {
        return NextResponse.json(
          { error: "Customer details are required." },
          { status: 400 }
        );
      }

      if (!priced.plan) {
        return NextResponse.json(
          { error: "Membership plan is unavailable." },
          { status: 400 }
        );
      }

      const { data: existingMembership, error: existingMembershipError } =
        await supabase
          .from("memberships")
          .select("membership_id, expiry_date")
          .eq("payment_id", paymentId)
          .maybeSingle();

      if (existingMembershipError) {
        throw new Error(existingMembershipError.message);
      }

      if (existingMembership) {
        return NextResponse.json({
          success: true,
          flow: "membership",
          membershipId: existingMembership.membership_id,
          planName: priced.plan.name,
          expiryDate: existingMembership.expiry_date,
        });
      }

      const email = body.customer.email.trim().toLowerCase();

      let { data: customer, error: customerLookupError } = await supabase
        .from("customers")
        .select("id")
        .ilike("email", email)
        .maybeSingle();

      if (customerLookupError) {
        throw new Error(customerLookupError.message);
      }

      if (!customer) {
        const { data: createdCustomer, error: customerInsertError } =
          await supabase
            .from("customers")
            .insert({
              name: body.customer.name.trim(),
              email,
              phone: body.customer.mobile.trim(),
              address: body.customer.address.trim(),
              city: body.customer.district.trim(),
              pincode: body.customer.pincode.trim(),
            })
            .select("id")
            .single();

        if (customerInsertError) {
          throw new Error(customerInsertError.message);
        }

        customer = createdCustomer;
      }

      const startDate = new Date(order.created_at * 1000);
      const expiryDate = new Date(startDate);

      expiryDate.setDate(
        expiryDate.getDate() + MEMBERSHIP_VALIDITY_DAYS
      );

      const { data: membership, error: membershipError } =
        await supabase
          .from("memberships")
          .insert({
            customer_id: customer.id,
            plan_id: priced.plan.id,
            payment_amount: priced.totalPaise / 100,
            payment_status: "paid",
            payment_id: paymentId,
            start_date: startDate.toISOString().slice(0, 10),
            expiry_date: expiryDate.toISOString().slice(0, 10),
            status: "active",
          })
          .select("id, membership_id")
          .single();

      if (membershipError) {
        throw new Error(membershipError.message);
      }

      const { error: customerUpdateError } = await supabase
        .from("customers")
        .update({
          membership_id: membership.membership_id,
        })
        .eq("id", customer.id);

      if (customerUpdateError) {
        throw new Error(customerUpdateError.message);
      }

      await sendPurchaseNotifications({
        type: "membership",
        name: body.customer.name.trim(),
        email,
        mobile: body.customer.mobile,
        reference: membership.membership_id,
        amount: priced.totalPaise / 100,
        planName: priced.plan.name,
        expiryDate: expiryDate.toISOString().slice(0, 10),
      });

      return NextResponse.json({
        success: true,
        flow: "membership",
        membershipId: membership.membership_id,
        planName: priced.plan.name,
        expiryDate: expiryDate.toISOString().slice(0, 10),
      });
    }

    /* ------------------------------------------------------------------
     * NORMAL / PREBOOKING / CUSTOMIZE ORDERS
     * ------------------------------------------------------------------ */

    const customer = body.customer;

    if (
      !customer ||
      !customer.name ||
      !customer.email?.trim() ||
      !customer.mobile ||
      !customer.address ||
      !customer.district ||
      !customer.pincode
    ) {
      return NextResponse.json(
        { error: "Complete your delivery details before paying." },
        { status: 400 }
      );
    }

    const { data: existingOrder, error: existingOrderError } =
      await supabase
        .from("orders")
        .select("*")
        .eq("payment_id", paymentId)
        .maybeSingle();

    if (existingOrderError) {
      throw new Error(existingOrderError.message);
    }

    if (existingOrder) {
      return NextResponse.json({
        success: true,
        flow: purchase.flow,
        orderId: existingOrder.id,
        prebookingId:
          "prebooking_id" in existingOrder
            ? existingOrder.prebooking_id
            : undefined,
      });
    }

    if (purchase.flow === "prebooking" && !customer.email?.trim()) {
      return NextResponse.json(
        {
          error:
            "An email address is required for pre-booking confirmation.",
        },
        { status: 400 }
      );
    }

    /* ------------------------------------------------------------------
     * ORDER
     * ------------------------------------------------------------------ */

    const { data: orderRow, error: orderInsertError } = await supabase
      .from("orders")
      .insert({
        customer_name: customer.name.trim(),
        customer_email: customer.email?.trim().toLowerCase() || null,
        mobile: customer.mobile.trim(),
        address: customer.address.trim(),
        district: customer.district.trim(),
        state: customer.state.trim(),
        pincode: customer.pincode.trim(),
        total_amount: priced.totalPaise / 100,
        courier_name: priced.shippingMethod,
        shipping_method: priced.shippingMethod,
        subtotal_amount: priced.subtotalPaise / 100,
        discount_amount: priced.bookDiscountPaise / 100,
        courier_charge:
          (priced.courierChargePaise - priced.courierDiscountPaise) / 100,
        courier_discount: priced.courierDiscountPaise / 100,
        payment_status: "paid",
        payment_method: "Razorpay",
        payment_id: paymentId,
        ...(purchase.flow === "prebooking"
          ? { purchase_type: "prebooking" }
          : {}),
        ...(purchase.flow === "customize"
          ? { purchase_type: "customize" }
          : {}),
      })
      .select("*")
      .single();

    if (orderInsertError) {
      throw new Error(orderInsertError.message);
    }

    /* ------------------------------------------------------------------
     * ORDER ITEMS
     *
     * Existing books/prebooking behaviour is preserved.
     * Customize additionally saves customization_details.
     * ------------------------------------------------------------------ */

    const { error: itemsError } = await supabase
      .from("order_items")
      .insert(
        priced.items.map((item) => ({
          order_id: orderRow.id,
          book_id: item.book_id,
          title: item.title,
          price: item.price,
          quantity: item.quantity,

          ...(purchase.flow === "prebooking"
            ? { is_prebooking: true }
            : {}),

          ...(purchase.flow === "customize"
            ? {
                customization_details:
                  item.customizationDetails,
              }
            : {}),
        }))
      );

    if (itemsError) {
      throw new Error(itemsError.message);
    }

    /* ------------------------------------------------------------------
     * CUSTOMER PROFILE
     * ------------------------------------------------------------------ */

    try {
      const email = customer.email.trim().toLowerCase();

      const { data: existingCustomer, error: customerLookupError } =
        await supabase
          .from("customers")
          .select("id")
          .ilike("email", email)
          .maybeSingle();

      if (customerLookupError) {
        throw new Error(customerLookupError.message);
      }

      const customerFields = {
        name: customer.name.trim(),
        email,
        phone: customer.mobile.trim(),
        address: customer.address.trim(),
        city: customer.district.trim(),
        state: customer.state.trim(),
        pincode: customer.pincode.trim(),
        marketing_consent: customer.marketingConsent === true,
        marketing_consent_at: customer.marketingConsent
          ? new Date().toISOString()
          : null,
      };

      const customerWrite = existingCustomer
        ? await supabase
            .from("customers")
            .update(customerFields)
            .eq("id", existingCustomer.id)
        : await supabase.from("customers").insert({
            ...customerFields,
          });

      if (customerWrite.error) {
        throw new Error(customerWrite.error.message);
      }
    } catch (customerError) {
      console.error(
        "CUSTOMER PROFILE UPDATE FAILED",
        customerError
      );
    }

    /* ------------------------------------------------------------------
     * NOTIFICATIONS
     * ------------------------------------------------------------------ */

    const notificationResult = await sendPurchaseNotifications({
      type:
        purchase.flow === "prebooking"
          ? "prebooking"
          : "order",
      name: customer.name.trim(),
      email: customer.email,
      mobile: customer.mobile,
      reference: orderRow.prebooking_id ?? orderRow.id,
      amount: priced.totalPaise / 100,
    });

    return NextResponse.json({
      success: true,
      flow: purchase.flow,
      orderId: orderRow.id,
      prebookingId: orderRow.prebooking_id,

      ...(purchase.flow === "prebooking"
        ? {
            emailSent: notificationResult.emailSent,
          }
        : {}),
    });
  } catch (error) {
    const message =
      error instanceof Error
        ? error.message
        : "Unable to verify payment.";

    return NextResponse.json(
      { error: message },
      {
        status: message.includes("SUPABASE_SERVICE_ROLE_KEY")
          ? 503
          : 400,
      }
    );
  }
}