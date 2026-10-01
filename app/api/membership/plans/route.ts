import { NextResponse } from "next/server";

import { createAdminClient } from "@/lib/supabase/admin";
import { calculateMembershipCharge, MEMBERSHIP_VALIDITY_DAYS } from "@/features/checkout/server/purchase-pricing.server";

export async function GET() {
  try {
    const supabase = createAdminClient();
    const { data, error } = await supabase
      .from("membership_plans")
      .select("id, name, price, discount_percentage, validity_days, status, created_at, updated_at")
      .eq("status", "active")
      .order("price", { ascending: true });

    if (error) throw new Error(error.message);
    const plans = (data ?? []).map((plan) => ({
      ...plan,
      ...calculateMembershipCharge(plan.name, Number(plan.price)),
      validity_days: MEMBERSHIP_VALIDITY_DAYS,
      discount_percentage: plan.name.toLowerCase().includes("premium") ? 20 : 15,
    }));
    return NextResponse.json({ plans });
  } catch (error) {
    const message = error instanceof Error ? error.message : "Unable to load membership plans.";
    return NextResponse.json(
      { error: message },
      { status: message.includes("SUPABASE_SERVICE_ROLE_KEY") ? 503 : 500 }
    );
  }
}