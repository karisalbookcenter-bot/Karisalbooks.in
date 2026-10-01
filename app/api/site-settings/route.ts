import { NextResponse } from "next/server";

import { isAtLeastRole, ROLES } from "@/constants/roles.constants";
import { getServerAuthUser } from "@/features/auth/services/session.service";
import { DEFAULT_SOCIAL_LINKS, type PublicSocialLinks } from "@/features/site-settings/site-settings.types";
import { createAdminClient } from "@/lib/supabase/admin";

function isSafeSocialLink(value: unknown): value is string {
  if (typeof value !== "string") return false;
  if (!value.trim()) return true;
  try {
    const url = new URL(value);
    return url.protocol === "https:" || url.protocol === "http:";
  } catch {
    return false;
  }
}

export async function GET() {
  try {
    const supabase = createAdminClient();
    const { data, error } = await supabase
      .from("site_settings")
      .select("social_links")
      .eq("id", "public")
      .maybeSingle();
    if (error) throw new Error(error.message);

    return NextResponse.json({
      social: { ...DEFAULT_SOCIAL_LINKS, ...(data?.social_links ?? {}) },
    });
  } catch (error) {
    const message = error instanceof Error ? error.message : "Unable to load site settings.";
    if (message.toLowerCase().includes("site_settings") || message.toLowerCase().includes("relation")) {
      return NextResponse.json({ social: DEFAULT_SOCIAL_LINKS, migrationPending: true });
    }
    return NextResponse.json({ error: message }, { status: 503 });
  }
}

export async function PUT(request: Request) {
  const user = await getServerAuthUser();
  if (!user) return NextResponse.json({ error: "Sign in required." }, { status: 401 });
  if (!isAtLeastRole(user.role, ROLES.ADMIN)) {
    return NextResponse.json({ error: "Admin access required." }, { status: 403 });
  }

  try {
    const body = (await request.json()) as { social?: Partial<PublicSocialLinks> };
    const social = body.social;
    if (!social || !Object.keys(DEFAULT_SOCIAL_LINKS).every((key) => isSafeSocialLink(social[key as keyof PublicSocialLinks] ?? ""))) {
      return NextResponse.json({ error: "Enter valid http or https social URLs." }, { status: 400 });
    }

    const normalized: PublicSocialLinks = {
      facebook: (social.facebook ?? "").trim(),
      instagram: (social.instagram ?? "").trim(),
      youtube: (social.youtube ?? "").trim(),
      x: (social.x ?? "").trim(),
      whatsapp: (social.whatsapp ?? "").trim(),
    };

    const supabase = createAdminClient();
    const { error } = await supabase
      .from("site_settings")
      .upsert({ id: "public", social_links: normalized, updated_by: user.id }, { onConflict: "id" });
    if (error) throw new Error(error.message);

    return NextResponse.json({ social: normalized });
  } catch (error) {
    const message = error instanceof Error ? error.message : "Unable to save site settings.";
    return NextResponse.json({ error: message }, { status: 500 });
  }
}