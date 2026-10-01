import { NextResponse } from "next/server";

import { isAtLeastRole, ROLES } from "@/constants/roles.constants";
import { getServerAuthUser } from "@/features/auth/services/session.service";
import {
  DEFAULT_SOCIAL_LINKS,
  DEFAULT_SITE_SETTINGS,
  type PublicSiteSettings,
  type PublicSocialLinks,
} from "@/features/site-settings/site-settings.types";
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
      .select("social_links, site_logo_url, site_description, homepage_slider_enabled, homepage_slider_interval_seconds, homepage_arrivals_title")
      .eq("id", "public")
      .maybeSingle();
    if (error) throw new Error(error.message);

    return NextResponse.json({
      social: { ...DEFAULT_SOCIAL_LINKS, ...(data?.social_links ?? {}) },
      site: data ? {
        logoUrl: data.site_logo_url ?? "",
        description: data.site_description ?? DEFAULT_SITE_SETTINGS.description,
        arrivalsSliderEnabled: data.homepage_slider_enabled ?? DEFAULT_SITE_SETTINGS.arrivalsSliderEnabled,
        arrivalsSliderIntervalSeconds: data.homepage_slider_interval_seconds ?? DEFAULT_SITE_SETTINGS.arrivalsSliderIntervalSeconds,
        arrivalsTitle: data.homepage_arrivals_title ?? DEFAULT_SITE_SETTINGS.arrivalsTitle,
      } : DEFAULT_SITE_SETTINGS,
    });
  } catch (error) {
    const message = error instanceof Error ? error.message : "Unable to load site settings.";
    if (message.toLowerCase().includes("site_settings") || message.toLowerCase().includes("relation")) {
      return NextResponse.json({ social: DEFAULT_SOCIAL_LINKS, site: DEFAULT_SITE_SETTINGS, migrationPending: true });
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
    const body = (await request.json()) as { social?: Partial<PublicSocialLinks>; site?: Partial<PublicSiteSettings> };
    const social = body.social;
    const site = { ...DEFAULT_SITE_SETTINGS, ...(body.site ?? {}) };
    if (!social || !Object.keys(DEFAULT_SOCIAL_LINKS).every((key) => isSafeSocialLink(social[key as keyof PublicSocialLinks] ?? ""))) {
      return NextResponse.json({ error: "Enter valid http or https social URLs." }, { status: 400 });
    }
    if (!isSafeSocialLink(site.logoUrl) || typeof site.description !== "string" || site.description.trim().length > 500 || typeof site.arrivalsTitle !== "string" || !site.arrivalsTitle.trim() || site.arrivalsTitle.length > 100 || !Number.isInteger(site.arrivalsSliderIntervalSeconds) || site.arrivalsSliderIntervalSeconds < 3 || site.arrivalsSliderIntervalSeconds > 20) {
      return NextResponse.json({ error: "Enter valid branding text and a carousel interval between 3 and 20 seconds." }, { status: 400 });
    }

    const normalized: PublicSocialLinks = {
      facebook: (social.facebook ?? "").trim(),
      instagram: (social.instagram ?? "").trim(),
      youtube: (social.youtube ?? "").trim(),
      x: (social.x ?? "").trim(),
      whatsapp: (social.whatsapp ?? "").trim(),
    };
    const normalizedSite: PublicSiteSettings = {
      logoUrl: site.logoUrl.trim(),
      description: site.description.trim(),
      arrivalsSliderEnabled: Boolean(site.arrivalsSliderEnabled),
      arrivalsSliderIntervalSeconds: site.arrivalsSliderIntervalSeconds,
      arrivalsTitle: site.arrivalsTitle.trim(),
    };

    const supabase = createAdminClient();
    const { error } = await supabase
      .from("site_settings")
      .upsert({
        id: "public",
        social_links: normalized,
        site_logo_url: normalizedSite.logoUrl,
        site_description: normalizedSite.description,
        homepage_slider_enabled: normalizedSite.arrivalsSliderEnabled,
        homepage_slider_interval_seconds: normalizedSite.arrivalsSliderIntervalSeconds,
        homepage_arrivals_title: normalizedSite.arrivalsTitle,
        updated_by: user.id,
      }, { onConflict: "id" });
    if (error) throw new Error(error.message);

    return NextResponse.json({ social: normalized, site: normalizedSite });
  } catch (error) {
    const message = error instanceof Error ? error.message : "Unable to save site settings.";
    return NextResponse.json({ error: message }, { status: 500 });
  }
}