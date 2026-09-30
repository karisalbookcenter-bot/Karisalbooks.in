import { NextResponse } from "next/server";

import { resolveDiscountCode } from "@/features/checkout/server/purchase-pricing.server";

export async function POST(request: Request) {
  try {
    const body = (await request.json()) as { code?: unknown };
    if (typeof body.code !== "string" || !body.code.trim()) {
      return NextResponse.json({ error: "Enter a membership number or coupon code." }, { status: 400 });
    }

    const discount = await resolveDiscountCode(body.code);
    if (!discount) {
      return NextResponse.json({ error: "Enter a membership number or coupon code." }, { status: 404 });
    }

    return NextResponse.json({
      code: discount.code,
      kind: discount.kind,
      percentage: discount.percentage,
      description: discount.description,
    });
  } catch (error) {
    const message = error instanceof Error ? error.message : "Unable to validate this code.";
    return NextResponse.json(
      { error: message },
      { status: message.includes("SUPABASE_SERVICE_ROLE_KEY") ? 503 : 400 }
    );
  }
}