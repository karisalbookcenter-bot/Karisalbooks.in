import { NextResponse } from "next/server";
import { authConfig } from "@/config/auth";
import { isAtLeastRole } from "@/constants/roles.constants";
import { getServerAuthUser } from "@/features/auth/services/session.service";
import { sendPublicationQuoteEmail } from "@/features/publication-services/services/publication-quote-email.server";
import { createAdminClient } from "@/lib/supabase/admin";

async function requireAdmin() {
  const user = await getServerAuthUser();
  return user && isAtLeastRole(user.role, authConfig.minimumAdminRole) ? null : NextResponse.json({ error: "Admin access required." }, { status: 403 });
}

export async function GET() {
  const denied = await requireAdmin();
  if (denied) return denied;

  try {
    const supabase = createAdminClient();
    const { data, error } = await supabase.from("publication_quote_requests").select("*").order("created_at", { ascending: false });
    if (error) throw new Error(error.message);
    const requests = await Promise.all((data ?? []).map(async (row) => {
      const [manuscript, cover] = await Promise.all([
        supabase.storage.from("publication-submissions").createSignedUrl(row.manuscript_path, 300),
        supabase.storage.from("publication-submissions").createSignedUrl(row.cover_path, 300),
      ]);
      return { ...row, manuscriptUrl: manuscript.data?.signedUrl ?? null, coverUrl: cover.data?.signedUrl ?? null };
    }));
    return NextResponse.json({ requests });
  } catch (error) {
    return NextResponse.json({ error: error instanceof Error ? error.message : "Unable to load quotation requests." }, { status: 500 });
  }
}

export async function PATCH(request: Request) {
  const denied = await requireAdmin();
  if (denied) return denied;

  try {
    const input = await request.json() as { id?: string; status?: string; quoteAmount?: number | null; quoteNote?: string | null };
    const allowedStatuses = ["reviewing", "quoted", "accepted", "completed", "declined"];
    if (!input.id || !input.status || !allowedStatuses.includes(input.status)) {
      return NextResponse.json({ error: "Choose a valid request status." }, { status: 400 });
    }
    const quoteAmount = input.quoteAmount === null || input.quoteAmount === undefined ? null : Number(input.quoteAmount);
    if (input.status === "quoted" && (quoteAmount === null || !Number.isFinite(quoteAmount) || quoteAmount < 0)) {
      return NextResponse.json({ error: "Enter a valid quotation amount before sending it." }, { status: 400 });
    }
    const supabase = createAdminClient();
    const { data, error } = await supabase
      .from("publication_quote_requests")
      .update({ status: input.status, quote_amount: quoteAmount, quote_note: input.quoteNote?.trim() || null })
      .eq("id", input.id)
      .select("id, request_number, name, email, book_title, quote_amount, quote_note, status")
      .single();
    if (error) throw new Error(error.message);

    let emailSent = false;
    if (data.status === "quoted" && data.quote_amount !== null) {
      emailSent = await sendPublicationQuoteEmail({
        name: data.name,
        email: data.email,
        requestNumber: data.request_number,
        bookTitle: data.book_title,
        amount: Number(data.quote_amount),
        note: data.quote_note,
      });
    }

    return NextResponse.json({ request: data, emailSent });
  } catch (error) {
    return NextResponse.json({ error: error instanceof Error ? error.message : "Unable to update quotation request." }, { status: 500 });
  }
}