import { NextResponse } from "next/server";

import {
  MEMBERSHIP_VALIDITY_DAYS,
  pricePurchase,
} from "@/features/checkout/server/purchase-pricing.server";
import { getWhatsAppPhoneNumber } from "@/features/site-settings/whatsapp.helpers";
import { createAdminClient } from "@/lib/supabase/admin";

interface MembershipApplicationBody {
  planId?: string;
  customer?: {
    name?: string;
    email?: string;
    mobile?: string;
    address?: string;
    district?: string;
    pincode?: string;
  };
}

export async function POST(request: Request) {
  try {
    const body = (await request.json()) as MembershipApplicationBody;
    const customer = body.customer;
    const email = customer?.email?.trim().toLowerCase() ?? "";

    if (
      !body.planId ||
      !customer?.name?.trim() ||
      !/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email) ||
      !customer.mobile?.trim() ||
      !customer.address?.trim() ||
      !customer.district?.trim() ||
      !customer.pincode?.trim()
    ) {
      return NextResponse.json(
        { error: "Complete your plan, name, email, phone, and address." },
        { status: 400 },
      );
    }

    const supabase = createAdminClient();
    const { data: settings, error: settingsError } = await supabase
      .from("site_settings")
      .select("social_links, whatsapp_orders_enabled, qr_payment_enabled, payment_qr_url")
      .eq("id", "public")
      .maybeSingle();

    if (settingsError) throw new Error(settingsError.message);
    if (!settings?.whatsapp_orders_enabled) {
      return NextResponse.json(
        { error: "WhatsApp payments are currently disabled. Please contact the store." },
        { status: 403 },
      );
    }

    const socialLinks = settings.social_links as { whatsapp?: string } | null;
    const whatsappPhone = getWhatsAppPhoneNumber(socialLinks?.whatsapp ?? "");
    if (!whatsappPhone) {
      return NextResponse.json(
        { error: "The store has not configured a valid WhatsApp contact yet." },
        { status: 503 },
      );
    }

    const qrPaymentEnabled = settings.qr_payment_enabled === true;
    const paymentQrUrl = qrPaymentEnabled ? settings.payment_qr_url : null;
    if (qrPaymentEnabled && !paymentQrUrl) {
      return NextResponse.json(
        { error: "QR payment is enabled but its QR image is missing. Please contact the store." },
        { status: 503 },
      );
    }

    const priced = await pricePurchase({
      flow: "membership",
      planId: body.planId,
    });
    if (!priced.plan) {
      return NextResponse.json({ error: "Membership plan is unavailable." }, { status: 400 });
    }

    let { data: existingCustomer, error: customerLookupError } = await supabase
      .from("customers")
      .select("id")
      .ilike("email", email)
      .maybeSingle();

    if (customerLookupError) throw new Error(customerLookupError.message);

    if (!existingCustomer) {
      const { data: createdCustomer, error: customerInsertError } = await supabase
        .from("customers")
        .insert({
          name: customer.name.trim(),
          email,
          phone: customer.mobile.trim(),
          address: customer.address.trim(),
          city: customer.district.trim(),
          pincode: customer.pincode.trim(),
        })
        .select("id")
        .single();

      if (customerInsertError) throw new Error(customerInsertError.message);
      existingCustomer = createdCustomer;
    }

    const startDate = new Date();
    const expiryDate = new Date(startDate);
    expiryDate.setDate(expiryDate.getDate() + MEMBERSHIP_VALIDITY_DAYS);

    const { data: membership, error: membershipError } = await supabase
      .from("memberships")
      .insert({
        customer_id: existingCustomer.id,
        plan_id: priced.plan.id,
        payment_amount: priced.totalPaise / 100,
        payment_status: "pending",
        start_date: startDate.toISOString().slice(0, 10),
        expiry_date: expiryDate.toISOString().slice(0, 10),
        status: "active",
      })
      .select("membership_id")
      .single();

    if (membershipError) throw new Error(membershipError.message);

    const message = [
      "வணக்கம், membership payment அனுப்புகிறேன்.",
      `பெயர்: ${customer.name.trim()}`,
      `திட்டம்: ${priced.plan.name}`,
      `Membership reference: ${membership.membership_id}`,
      `மொத்தம்: ₹${(priced.totalPaise / 100).toFixed(2)}`,
      qrPaymentEnabled
        ? "QR மூலம் பணம் செலுத்தி, payment screenshot-ஐ இந்த WhatsApp-ல் அனுப்புகிறேன்."
        : "பணம் செலுத்தும் விவரங்களை WhatsApp-ல் தெரிவிக்கவும். பணம் செலுத்தியதும் screenshot அனுப்புகிறேன்.",
    ].join("\n");

    return NextResponse.json({
      membershipId: membership.membership_id,
      planName: priced.plan.name,
      total: priced.totalPaise / 100,
      whatsappHref: `https://wa.me/${whatsappPhone}?text=${encodeURIComponent(message)}`,
      qrPaymentEnabled,
      paymentQrUrl,
    });
  } catch (error) {
    const message = error instanceof Error ? error.message : "Unable to submit membership application.";
    const isConfigurationError = [
      "SUPABASE_SERVICE_ROLE_KEY",
      "whatsapp_orders_enabled",
      "qr_payment_enabled",
      "payment_qr_url",
    ].some((setting) => message.includes(setting));

    return NextResponse.json(
      { error: message },
      { status: isConfigurationError ? 503 : 400 },
    );
  }
}
