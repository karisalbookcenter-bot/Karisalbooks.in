import { NextResponse } from "next/server";

import { pricePurchase } from "@/features/checkout/server/purchase-pricing.server";

export async function POST(request: Request) {
  try {
    const body = (await request.json()) as {
      code?: unknown;
      flow?: unknown;
      items?: { book_id: string; quantity: number }[];
      shippingMethod?: "India Post" | "Professional Courier";
      state?: string;
    };
    if (
      (body.code !== undefined && (typeof body.code !== "string" || !body.code.trim())) ||
      !Array.isArray(body.items)
    ) {
      return NextResponse.json({ error: "Enter a valid membership number or coupon code." }, { status: 400 });
    }

    if (body.flow !== undefined && body.flow !== "books" && body.flow !== "prebooking") {
      return NextResponse.json({ error: "Invalid purchase type." }, { status: 400 });
    }
    if (body.flow === "prebooking" && body.code !== undefined) {
      return NextResponse.json({ error: "Pre-booking prices cannot be combined with discounts." }, { status: 400 });
    }

    const priced = body.flow === "prebooking"
      ? await pricePurchase({
          flow: "prebooking",
          items: body.items,
          shippingMethod: body.shippingMethod,
          state: body.state,
        })
      : await pricePurchase({
          flow: "books",
          items: body.items,
          shippingMethod: body.shippingMethod,
          state: body.state,
          discountCode: typeof body.code === "string" ? body.code : undefined,
        });

    return NextResponse.json({
      code: priced.discount?.code,
      kind: priced.discount?.kind,
      percentage: priced.discount?.percentage ?? 0,
      description: priced.discount?.description ?? "Valid membership",
      subtotal: priced.subtotalPaise / 100,
      bookDiscountAmount: priced.bookDiscountPaise / 100,
      automaticBookDiscountAmount: (priced.automaticBookDiscountPaise ?? 0) / 100,
      courierCharge: priced.courierChargePaise / 100,
      courierDiscount: priced.courierDiscountPaise / 100,
      indiaPostCourierCharge: priced.indiaPostCourierChargePaise / 100,
      professionalCourierCharge: priced.professionalCourierChargePaise / 100,
      discountAmount: priced.discountPaise / 100,
      total: priced.totalPaise / 100,
    });
  } catch (error) {
    const message = error instanceof Error ? error.message : "Unable to validate this code.";
    return NextResponse.json(
      { error: message },
      { status: message.includes("SUPABASE_SERVICE_ROLE_KEY") || message.includes("COURIER_CHARGE_INR") || message.includes("INDIA_POST_CHARGE_INR") || message.includes("PROFESSIONAL_COURIER_CHARGE_INR") ? 503 : 400 }
    );
  }
}