import { NextResponse } from "next/server";
import { pricePurchase, type PurchaseInput } from "@/features/checkout/server/purchase-pricing.server";
import { razorpay } from "@/lib/razorpay";

export async function POST(request: Request) {
  try {
    const body = (await request.json()) as { purchase?: PurchaseInput; customer?: { email?: string } };
    const purchase = body.purchase;
    if (!purchase || (purchase.flow !== "books" && purchase.flow !== "prebooking" && purchase.flow !== "membership")) {
      return NextResponse.json({ error: "Invalid purchase type." }, { status: 400 });
    }
    if (purchase.flow !== "membership" && (!body.customer?.email || !/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(body.customer.email.trim()))) {
      return NextResponse.json({ error: "A valid email address is required for book orders." }, { status: 400 });
    }
    if (purchase.flow === "prebooking") {
      if (!process.env.RESEND_API_KEY || !process.env.ORDER_EMAIL_FROM) {
        return NextResponse.json({ error: "Pre-booking is temporarily unavailable because confirmation email is not configured." }, { status: 503 });
      }
    }

    const priced = await pricePurchase(purchase);
    const order = await razorpay.orders.create({
      amount: priced.totalPaise,
      currency: "INR",
      receipt: `kb_${Date.now()}`,
      notes: {
        flow: purchase.flow,
        reference: purchase.flow === "membership" ? purchase.planId : purchase.flow,
        shipping_method: purchase.flow !== "membership" ? purchase.shippingMethod ?? "India Post" : "none",
      },
    });

    return NextResponse.json({
      order,
      keyId: process.env.RAZORPAY_KEY_ID,
      subtotal: priced.subtotalPaise / 100,
      discountAmount: priced.discountPaise / 100,
      bookDiscountAmount: priced.bookDiscountPaise / 100,
      courierCharge: priced.courierChargePaise / 100,
      courierDiscount: priced.courierDiscountPaise / 100,
      discountPercentage: priced.discount?.percentage ?? 0,
      discountDescription: priced.discount?.description ?? null,
      total: priced.totalPaise / 100,
      plan: priced.plan,
    });
  } catch (error) {
    const message = error instanceof Error ? error.message : "Unable to create payment order.";
    return NextResponse.json(
      { error: message },
      { status: message.includes("SUPABASE_SERVICE_ROLE_KEY") || message.includes("COURIER_CHARGE_INR") || message.includes("INDIA_POST_CHARGE_INR") || message.includes("PROFESSIONAL_COURIER_CHARGE_INR") ? 503 : 400 }
    );
  }
}