import { createHmac, timingSafeEqual } from "node:crypto";
import { NextResponse } from "next/server";

import {
  pricePurchase,
  type PurchaseInput,
} from "@/features/checkout/server/purchase-pricing.server";
import { createAdminClient } from "@/lib/supabase/admin";
import { razorpay } from "@/lib/razorpay";

interface PaymentVerificationInput {
  purchase: PurchaseInput;
  razorpay_order_id: string;
  razorpay_payment_id: string;
  razorpay_signature: string;
  customer?: {
    name: string;
    email: string;
    mobile: string;
    address: string;
    district: string;
    pincode: string;
  };
}

function hasValidSignature(orderId: string, paymentId: string, signature: string) {
  const secret = process.env.RAZORPAY_KEY_SECRET;
  if (!secret || !/^[a-f0-9]{64}$/i.test(signature)) return false;
  const expected = createHmac("sha256", secret).update(`${orderId}|${paymentId}`).digest();
  const received = Buffer.from(signature, "hex");
  return received.length === expected.length && timingSafeEqual(received, expected);
}

export async function POST(request: Request) {
  try {
    const body = (await request.json()) as PaymentVerificationInput;
    const { purchase, razorpay_order_id: orderId, razorpay_payment_id: paymentId, razorpay_signature: signature } = body;
    if (!purchase || !orderId || !paymentId || !signature) {
      return NextResponse.json({ error: "Payment details are incomplete." }, { status: 400 });
    }
    if (!hasValidSignature(orderId, paymentId, signature)) {
      return NextResponse.json({ error: "Payment signature could not be verified." }, { status: 400 });
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
      payment.order_id !== orderId ||
      payment.amount !== priced.totalPaise ||
      payment.currency !== "INR"
    ) {
      return NextResponse.json({ error: "The paid amount does not match this purchase." }, { status: 400 });
    }

    let capturedPayment = payment;
    if (payment.status === "authorized") {
      capturedPayment = await razorpay.payments.capture(paymentId, priced.totalPaise, "INR");
    }
    if (capturedPayment.status !== "captured") {
      return NextResponse.json({ error: "Payment has not been captured." }, { status: 402 });
    }

    const supabase = createAdminClient();
    if (purchase.flow === "membership") {
      if (!body.customer || !body.customer.name || !body.customer.email || !body.customer.mobile) {
        return NextResponse.json({ error: "Customer details are required." }, { status: 400 });
      }
      if (!priced.plan) return NextResponse.json({ error: "Membership plan is unavailable." }, { status: 400 });

      const email = body.customer.email.trim().toLowerCase();
      let { data: customer, error: customerLookupError } = await supabase
        .from("customers")
        .select("id")
        .ilike("email", email)
        .maybeSingle();
      if (customerLookupError) throw new Error(customerLookupError.message);

      if (!customer) {
        const { data: createdCustomer, error: customerInsertError } = await supabase
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
        if (customerInsertError) throw new Error(customerInsertError.message);
        customer = createdCustomer;
      }

      const startDate = new Date();
      const expiryDate = new Date(startDate);
      expiryDate.setDate(expiryDate.getDate() + priced.plan.validityDays);
      const { data: membership, error: membershipError } = await supabase
        .from("memberships")
        .insert({
          customer_id: customer.id,
          plan_id: priced.plan.id,
          payment_amount: priced.totalPaise / 100,
          payment_status: "paid",
          start_date: startDate.toISOString().slice(0, 10),
          expiry_date: expiryDate.toISOString().slice(0, 10),
          status: "active",
        })
        .select("id, membership_id")
        .single();
      if (membershipError) throw new Error(membershipError.message);

      const { error: customerUpdateError } = await supabase
        .from("customers")
        .update({ membership_id: membership.membership_id })
        .eq("id", customer.id);
      if (customerUpdateError) throw new Error(customerUpdateError.message);

      return NextResponse.json({
        success: true,
        flow: "membership",
        membershipId: membership.membership_id,
        planName: priced.plan.name,
        expiryDate: expiryDate.toISOString().slice(0, 10),
      });
    }

    const customer = body.customer;
    if (!customer || !customer.name || !customer.mobile || !customer.address || !customer.district || !customer.pincode) {
      return NextResponse.json({ error: "Complete your delivery details before paying." }, { status: 400 });
    }

    const { data: orderRow, error: orderInsertError } = await supabase
      .from("orders")
      .insert({
        customer_name: customer.name.trim(),
        mobile: customer.mobile.trim(),
        address: customer.address.trim(),
        district: customer.district.trim(),
        pincode: customer.pincode.trim(),
        total_amount: priced.totalPaise / 100,
      })
      .select("id")
      .single();
    if (orderInsertError) throw new Error(orderInsertError.message);

    const { error: itemsError } = await supabase.from("order_items").insert(
      priced.items.map((item) => ({
        order_id: orderRow.id,
        book_id: item.book_id,
        title: item.title,
        price: item.price,
        quantity: item.quantity,
      }))
    );
    if (itemsError) throw new Error(itemsError.message);

    return NextResponse.json({ success: true, flow: "books", orderId: orderRow.id });
  } catch (error) {
    const message = error instanceof Error ? error.message : "Unable to verify payment.";
    return NextResponse.json(
      { error: message },
      { status: message.includes("SUPABASE_SERVICE_ROLE_KEY") ? 503 : 400 }
    );
  }
}