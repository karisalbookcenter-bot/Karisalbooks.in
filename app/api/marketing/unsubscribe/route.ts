import { createHmac, timingSafeEqual } from "node:crypto";
import { NextResponse } from "next/server";
import { createAdminClient } from "@/lib/supabase/admin";

export async function POST(request: Request) {
  try {
    const { token } = await request.json() as { token?: string };
    const [customerId, signature] = String(token ?? "").split(".");
    const secret = process.env.SUPABASE_SERVICE_ROLE_KEY;
    if (!secret || !customerId || !signature || !/^[a-f0-9]{64}$/i.test(signature)) {
      return NextResponse.json({ error: "This unsubscribe link is invalid." }, { status: 400 });
    }

    const expected = createHmac("sha256", secret).update(customerId).digest();
    const received = Buffer.from(signature, "hex");
    if (received.length !== expected.length || !timingSafeEqual(expected, received)) {
      return NextResponse.json({ error: "This unsubscribe link is invalid." }, { status: 400 });
    }

    const supabase = createAdminClient();
    const { error } = await supabase.from("customers").update({ marketing_consent: false }).eq("id", customerId);
    if (error) throw new Error(error.message);
    return NextResponse.json({ success: true });
  } catch (error) {
    return NextResponse.json({ error: error instanceof Error ? error.message : "Unable to update email preferences." }, { status: 500 });
  }
}