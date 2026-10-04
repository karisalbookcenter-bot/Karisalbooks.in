import { NextResponse } from "next/server";

import { pricePurchase, type PurchaseInput } from "@/features/checkout/server/purchase-pricing.server";
import { getWhatsAppPhoneNumber } from "@/features/site-settings/whatsapp.helpers";
import { createAdminClient } from "@/lib/supabase/admin";

interface ManualOrderBody {
  purchase?: PurchaseInput;
  customer?: {
    name?: string;
    email?: string;
    mobile?: string;
    address?: string;
    district?: string;
    state?: string;
    pincode?: string;
    marketingConsent?: boolean;
  };
}

export async function POST(request: Request) {
  try {
    const body = (await request.json()) as ManualOrderBody;
    const { purchase, customer } = body;
    if (!purchase || purchase.flow !== "books") {
      return NextResponse.json({ error: "WhatsApp checkout is currently available for book orders only." }, { status: 400 });
    }
    if (
      !customer?.name?.trim() ||
      !customer.email?.trim() ||
      !/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(customer.email.trim()) ||
      !customer.mobile?.trim() ||
      !customer.address?.trim() ||
      !customer.district?.trim() ||
      !customer.state?.trim() ||
      !customer.pincode?.trim()
    ) {
      return NextResponse.json({ error: "Complete your name, email, phone, and delivery address before placing the order." }, { status: 400 });
    }

    const supabase = createAdminClient();
    const { data: settings, error: settingsError } = await supabase
      .from("site_settings")
      .select("social_links, whatsapp_orders_enabled, qr_payment_enabled, payment_qr_url")
      .eq("id", "public")
      .maybeSingle();
    if (settingsError) throw new Error(settingsError.message);
    if (!settings?.whatsapp_orders_enabled) {
      return NextResponse.json({ error: "WhatsApp orders are currently disabled. Please refresh checkout or contact the store." }, { status: 403 });
    }

    const socialLinks = settings.social_links as { whatsapp?: string } | null;
    const whatsappPhone = getWhatsAppPhoneNumber(socialLinks?.whatsapp ?? "");
    if (!whatsappPhone) {
      return NextResponse.json({ error: "The store has not configured a valid WhatsApp order number yet." }, { status: 503 });
    }

    const qrPaymentEnabled = settings.qr_payment_enabled === true;
    const paymentQrUrl = qrPaymentEnabled ? settings.payment_qr_url : null;
    if (qrPaymentEnabled && !paymentQrUrl) {
      return NextResponse.json({ error: "QR payment is enabled but its QR image is missing. Please contact the store." }, { status: 503 });
    }

    const priced = await pricePurchase(purchase);
    const { data: order, error: orderError } = await supabase
      .from("orders")
      .insert({
        customer_name: customer.name.trim(),
        customer_email: customer.email.trim().toLowerCase(),
        mobile: customer.mobile.trim(),
        address: customer.address.trim(),
        district: customer.district.trim(),
        state: priced.deliveryState,
        pincode: customer.pincode.trim(),
        total_amount: priced.totalPaise / 100,
        courier_name: priced.shippingMethod,
        shipping_method: priced.shippingMethod,
        subtotal_amount: priced.subtotalPaise / 100,
        discount_amount: priced.bookDiscountPaise / 100,
        courier_charge: (priced.courierChargePaise - priced.courierDiscountPaise) / 100,
        courier_discount: priced.courierDiscountPaise / 100,
        payment_status: "pending",
        payment_method: qrPaymentEnabled ? "UPI QR" : "WhatsApp",
        status: "pending",
      })
      .select("id, total_amount")
      .single();
    if (orderError) throw new Error(orderError.message);

    const { error: itemsError } = await supabase.from("order_items").insert(
      priced.items.map((item) => ({
        order_id: order.id,
        book_id: item.book_id,
        title: item.title,
        price: item.price,
        quantity: item.quantity,
      }))
    );
    if (itemsError) {
      const { error: cleanupError } = await supabase.from("orders").delete().eq("id", order.id);
      if (cleanupError) {
        console.error("MANUAL ORDER CLEANUP FAILED", order.id, cleanupError.message);
      }
      throw new Error(itemsError.message);
    }

    return NextResponse.json({
      orderId: order.id,
      total: Number(order.total_amount),
      whatsappPhone,
      qrPaymentEnabled,
      paymentQrUrl,
    });
  } catch (error) {
    const message = error instanceof Error ? error.message : "Unable to place the order.";
    const isCheckoutConfigurationError = [
      "SUPABASE_SERVICE_ROLE_KEY",
      "whatsapp_orders_enabled",
      "qr_payment_enabled",
      "payment_qr_url",
    ].some((setting) => message.includes(setting));
    return NextResponse.json(
      { error: message },
      { status: isCheckoutConfigurationError ? 503 : 400 }
    );
  }
}
