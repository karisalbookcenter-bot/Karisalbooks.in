import { NextResponse } from "next/server";
import { authConfig } from "@/config/auth";
import { isAtLeastRole } from "@/constants/roles.constants";
import { getServerAuthUser } from "@/features/auth/services/session.service";
import { createAdminClient } from "@/lib/supabase/admin";

export const runtime = "nodejs";

const MAX_BYTES = 5 * 1024 * 1024;
const MIME_EXTENSIONS: Record<string, string> = {
  "image/jpeg": "jpg",
  "image/png": "png",
  "image/webp": "webp",
};

export async function POST(request: Request) {
  const user = await getServerAuthUser();
  if (!user) return NextResponse.json({ error: "Sign in required." }, { status: 401 });
  if (!isAtLeastRole(user.role, authConfig.minimumAdminRole)) {
    return NextResponse.json({ error: "Admin access required." }, { status: 403 });
  }

  const form = await request.formData();
  const file = form.get("file");
  const requestedAssetType = form.get("assetType");
  const assetType =
    requestedAssetType === "payment-qr" || requestedAssetType === "combo-poster"
      ? requestedAssetType
      : "logo";
  if (!(file instanceof File) || !MIME_EXTENSIONS[file.type] || file.size > MAX_BYTES) {
    const assetLabel = assetType === "logo"
      ? "logo"
      : assetType === "combo-poster"
        ? "combo poster"
        : "payment QR";
    return NextResponse.json({ error: `Upload a JPG, PNG, or WEBP ${assetLabel} up to 5 MB.` }, { status: 400 });
  }

  try {
    const supabase = createAdminClient();
    const pathPrefix =
      assetType === "logo"
        ? "logos"
        : assetType === "combo-poster"
          ? "combo-posters"
          : "payment-qr";
    const path = `${pathPrefix}/${crypto.randomUUID()}.${MIME_EXTENSIONS[file.type]}`;
    const { error } = await supabase.storage.from("site-assets").upload(path, new Uint8Array(await file.arrayBuffer()), {
      contentType: file.type,
      upsert: false,
    });
    if (error) throw new Error(error.message);
    const { data } = supabase.storage.from("site-assets").getPublicUrl(path);
    if (assetType === "logo" || assetType === "payment-qr") {
      const { error: settingsError } = await supabase
        .from("site_settings")
        .upsert(
          {
            id: "public",
            ...(assetType === "logo"
              ? { site_logo_url: data.publicUrl }
              : { payment_qr_url: data.publicUrl }),
            updated_by: user.id,
          },
          { onConflict: "id" },
        );
      if (settingsError) throw new Error(settingsError.message);
    }
    return NextResponse.json({ url: data.publicUrl });
  } catch (error) {
    return NextResponse.json({ error: error instanceof Error ? error.message : "Unable to upload logo." }, { status: 500 });
  }
}