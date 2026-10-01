import { NextResponse } from "next/server";
import { createHmac } from "node:crypto";
import { authConfig } from "@/config/auth";
import { appConfig } from "@/config/app";
import { isAtLeastRole } from "@/constants/roles.constants";
import { getServerAuthUser } from "@/features/auth/services/session.service";
import { createAdminClient } from "@/lib/supabase/admin";

async function isAdmin() {
  const user = await getServerAuthUser();
  return Boolean(user && isAtLeastRole(user.role, authConfig.minimumAdminRole));
}

function render(template: string, values: Record<string, string>) {
  return template.replace(/\{\{\s*([a-z_]+)\s*\}\}/gi, (_, key: string) => values[key.toLowerCase()] ?? "");
}

function escapeHtml(value: string) {
  return value.replace(/[&<>"']/g, (character) => ({
    "&": "&amp;",
    "<": "&lt;",
    ">": "&gt;",
    "\"": "&quot;",
    "'": "&#39;",
  })[character] ?? character);
}

function unsubscribeUrl(customerId: string) {
  const secret = process.env.SUPABASE_SERVICE_ROLE_KEY;
  if (!secret) throw new Error("Marketing email signing key is not configured.");
  const signature = createHmac("sha256", secret).update(customerId).digest("hex");
  const url = new URL("/unsubscribe", appConfig.url);
  url.searchParams.set("token", `${customerId}.${signature}`);
  return url.toString();
}

export async function POST(request: Request) {
  if (!(await isAdmin())) return NextResponse.json({ error: "Admin access required." }, { status: 403 });

  const apiKey = process.env.RESEND_API_KEY;
  const from = process.env.ORDER_EMAIL_FROM;
  if (!apiKey || !from) return NextResponse.json({ error: "Set RESEND_API_KEY and ORDER_EMAIL_FROM to send campaigns." }, { status: 503 });

  try {
    const input = await request.json() as { offerId?: string };
    if (!input.offerId) return NextResponse.json({ error: "Offer is required." }, { status: 400 });
    const supabase = createAdminClient();
    const { data: offer, error: offerError } = await supabase.from("offers").select("*").eq("id", input.offerId).maybeSingle();
    if (offerError) throw new Error(offerError.message);
    if (!offer) return NextResponse.json({ error: "Offer not found." }, { status: 404 });

    const today = new Date().toISOString().slice(0, 10);
    if (offer.status !== "active" || offer.end_date < today) {
      return NextResponse.json({ error: "Only active, unexpired offers can be emailed." }, { status: 400 });
    }

    const customers: { id: string; name: string | null; email: string | null }[] = [];
    for (let from = 0; ; from += 1000) {
      const { data, error } = await supabase
        .from("customers")
        .select("id, name, email")
        .eq("marketing_consent", true)
        .not("email", "is", null)
        .order("id", { ascending: true })
        .range(from, from + 999);
      if (error) throw new Error(error.message);
      customers.push(...(data ?? []));
      if (!data || data.length < 1000) break;
    }

    const defaultSubject = `A special offer from Karisal Books: ${offer.title}`;
    const subjectTemplate = String(offer.campaign_email_subject || defaultSubject).slice(0, 180);
    const defaultBody = [
      "Vanakkam {{name}},",
      "",
      "{{title}}",
      "{{description}}",
      "Enjoy {{discount}}% off.",
      "{{price_details}}",
      "Offer code: {{code}}",
      "Valid: {{start_date}} to {{end_date}}",
    ].join("\n");
    const bodyTemplate = String(offer.campaign_email_body || defaultBody).slice(0, 5000);
    const offerUrl = new URL("/offer-zone", appConfig.url).toString();
    const emails = customers.filter((customer) => customer.email).map((customer) => {
      const values = {
        name: String(customer.name ?? "Reader"),
        title: String(offer.title),
        description: String(offer.description ?? ""),
        discount: String(offer.discount_percentage),
        price_details: String(offer.campaign_price_details ?? ""),
        code: String(offer.coupon_code ?? "No code required"),
        start_date: String(offer.start_date),
        end_date: String(offer.end_date),
        offer_url: offerUrl,
      };
      const poster = offer.campaign_poster_url ? `\n\nOffer poster: ${offer.campaign_poster_url}` : "";
      const unsubscribe = unsubscribeUrl(String(customer.id));
      const renderedBody = render(bodyTemplate, values);
      const posterMarkup = offer.campaign_poster_url
        ? `<img src="${escapeHtml(String(offer.campaign_poster_url))}" alt="${escapeHtml(String(offer.title))}" style="display:block;max-width:100%;height:auto;margin:20px auto" />`
        : "";
      return {
        from,
        to: [String(customer.email)],
        subject: render(subjectTemplate, values),
        text: `${renderedBody}${poster}\n\nView current offers: ${offerUrl}\n\nUnsubscribe from offer emails: ${unsubscribe}`,
        html: `<div style="max-width:600px;margin:0 auto;padding:24px;font-family:Arial,sans-serif;color:#202820"><p style="white-space:pre-line;line-height:1.65">${escapeHtml(renderedBody).replace(/\n/g, "<br>")}</p>${posterMarkup}<p><a href="${escapeHtml(offerUrl)}">View current offers</a></p><hr style="border:0;border-top:1px solid #ddd;margin:28px 0"><p style="font-size:12px;color:#666">You received this because you opted in to Karisal Books offer emails. <a href="${escapeHtml(unsubscribe)}">Unsubscribe</a></p></div>`,
        headers: { "List-Unsubscribe": `<${unsubscribe}>` },
      };
    });

    let sentCount = 0;
    let failedCount = 0;
    for (let index = 0; index < emails.length; index += 100) {
      const batch = emails.slice(index, index + 100);
      const response = await fetch("https://api.resend.com/emails/batch", {
        method: "POST",
        headers: { Authorization: `Bearer ${apiKey}`, "Content-Type": "application/json" },
        body: JSON.stringify(batch),
        signal: AbortSignal.timeout(15000),
      });
      if (response.ok) sentCount += batch.length;
      else {
        failedCount += batch.length;
        console.error("OFFER CAMPAIGN BATCH FAILED", response.status);
      }
    }

    const { error: updateError } = await supabase.from("offers").update({
      campaign_sent_at: new Date().toISOString(),
      campaign_sent_count: sentCount,
    }).eq("id", offer.id);
    if (updateError) throw new Error(updateError.message);

    return NextResponse.json({ targetCount: emails.length, sentCount, failedCount });
  } catch (error) {
    const message = error instanceof Error ? error.message : "Unable to send offer campaign.";
    return NextResponse.json({ error: message }, { status: message.includes("SUPABASE_SERVICE_ROLE_KEY") ? 503 : 500 });
  }
}