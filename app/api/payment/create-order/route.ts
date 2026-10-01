import { NextResponse } from "next/server";
import { pricePurchase, type PurchaseInput } from "@/features/checkout/server/purchase-pricing.server";
import { razorpay } from "@/lib/razorpay";

export async function POST(request: Request) {
  try {
    const body = (await request.json()) as { purchase?: PurchaseInput };
    const purchase = body.purchase;
    if (!purchase || (purchase.flow !== "books" && purchase.flow !== "membership")) {
      return NextResponse.json({ error: "Invalid purchase type." }, { status: 400 });
    }

    const priced = await pricePurchase(purchase);
    const order = await razorpay.orders.create({
      amount: priced.totalPaise,
      currency: "INR",
      receipt: `kb_${Date.now()}`,
      notes: {
        flow: purchase.flow,
        reference: purchase.flow === "membership" ? purchase.planId : "books",
        shipping_method: purchase.flow === "books" ? purchase.shippingMethod ?? "India Post" : "none",
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