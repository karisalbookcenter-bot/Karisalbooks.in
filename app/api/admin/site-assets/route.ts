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
  const assetType = form.get("assetType") === "payment-qr" ? "payment-qr" : "logo";
  if (!(file instanceof File) || !MIME_EXTENSIONS[file.type] || file.size > MAX_BYTES) {
    return NextResponse.json({ error: `Upload a JPG, PNG, or WEBP ${assetType === "logo" ? "logo" : "payment QR"} up to 5 MB.` }, { status: 400 });
  }

  try {
    const supabase = createAdminClient();
    const path = `${assetType === "logo" ? "logos" : "payment-qr"}/${crypto.randomUUID()}.${MIME_EXTENSIONS[file.type]}`;
    const { error } = await supabase.storage.from("site-assets").upload(path, new Uint8Array(await file.arrayBuffer()), {
      contentType: file.type,
      upsert: false,
    });
    if (error) throw new Error(error.message);
    const { data } = supabase.storage.from("site-assets").getPublicUrl(path);
    return NextResponse.json({ url: data.publicUrl });
  } catch (error) {
    return NextResponse.json({ error: error instanceof Error ? error.message : "Unable to upload logo." }, { status: 500 });
  }
}