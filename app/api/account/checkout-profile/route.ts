import { NextResponse } from "next/server";
import { getServerAuthUser } from "@/features/auth/services/session.service";
import { createAdminClient } from "@/lib/supabase/admin";

export async function GET() {
  const user = await getServerAuthUser();
  if (!user?.email) return NextResponse.json({ profile: null });

  try {
    const supabase = createAdminClient();
    let result = await supabase
      .from("customers")
      .select("name, email, phone, address, city, state, pincode, marketing_consent")
      .ilike("email", user.email)
      .maybeSingle();
    if (result.error?.code === "42703" && result.error.message.includes("marketing_consent")) {
      result = await supabase
        .from("customers")
        .select("name, email, phone, address, city, state, pincode")
        .ilike("email", user.email)
        .maybeSingle();
    }
    if (result.error) throw new Error(result.error.message);

    return NextResponse.json({
      profile: result.data ? {
        name: result.data.name ?? "",
        email: result.data.email ?? user.email,
        mobile: result.data.phone ?? "",
        address: result.data.address ?? "",
        district: result.data.city ?? "",
        state: result.data.state ?? "",
        pincode: result.data.pincode ?? "",
        marketingConsent: "marketing_consent" in result.data && result.data.marketing_consent === true,
      } : { email: user.email },
    });
  } catch (error) {
    return NextResponse.json({ error: error instanceof Error ? error.message : "Unable to load saved checkout details." }, { status: 500 });
  }
}