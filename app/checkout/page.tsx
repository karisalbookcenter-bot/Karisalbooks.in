"use client";

import Script from "next/script";
import { useCallback, useEffect, useState } from "react";
import { useRouter } from "next/navigation";

import { MainLayout } from "@/components/layout/MainLayout";
import { useCart } from "@/features/cart/hooks/useCart";
import { formatCurrency } from "@/lib/helpers/format.helpers";

interface DiscountResult {
  code?: string;
  kind?: "membership" | "coupon";
  percentage: number;
  description: string;
  subtotal: number;
  bookDiscountAmount: number;
  courierCharge: number;
  courierDiscount: number;
  discountAmount: number;
  total: number;
}

interface CreateOrderResult {
  error?: string;
  keyId: string;
  order: { id: string; amount: number; currency: string };
  subtotal: number;
  discountAmount: number;
  bookDiscountAmount: number;
  courierCharge: number;
  courierDiscount: number;
  discountPercentage: number;
  total: number;
}

interface VerificationResult {
  error?: string;
  orderId?: string;
  prebookingId?: string;
  emailSent?: boolean;
}

type ShippingMethod = "India Post" | "Professional Courier";

const INDIAN_STATES = [
  "Andhra Pradesh", "Arunachal Pradesh", "Assam", "Bihar", "Chhattisgarh",
  "Goa", "Gujarat", "Haryana", "Himachal Pradesh", "Jharkhand", "Karnataka",
  "Kerala", "Madhya Pradesh", "Maharashtra", "Manipur", "Meghalaya", "Mizoram",
  "Nagaland", "Odisha", "Punjab", "Rajasthan", "Sikkim", "Tamil Nadu",
  "Telangana", "Tripura", "Uttar Pradesh", "Uttarakhand", "West Bengal",
  "Andaman and Nicobar Islands", "Chandigarh", "Dadra and Nagar Haveli and Daman and Diu",
  "Delhi", "Jammu and Kashmir", "Ladakh", "Lakshadweep", "Puducherry",
];

export default function CheckoutPage() {
  const router = useRouter();
  const { items, clearCart } = useCart();
  const subtotal = items.reduce((sum, item) => sum + item.price * item.quantity, 0);
  const hasPrebookingItems = items.some((item) => item.purchaseType === "prebooking");
  const hasRegularItems = items.some((item) => item.purchaseType !== "prebooking");
  const hasMixedPurchaseTypes = hasPrebookingItems && hasRegularItems;
  const isPrebooking = hasPrebookingItems && !hasRegularItems;
  const purchaseFlow = isPrebooking ? "prebooking" : "books";

  const [name, setName] = useState("");
  const [email, setEmail] = useState("");
  const [mobile, setMobile] = useState("");
  const [address, setAddress] = useState("");
  const [district, setDistrict] = useState("");
  const [state, setState] = useState("");
  const [pincode, setPincode] = useState("");
  const [marketingConsent, setMarketingConsent] = useState(false);
  const [shippingMethod, setShippingMethod] = useState<ShippingMethod>("India Post");
  const [code, setCode] = useState("");
  const [quote, setQuote] = useState<DiscountResult | null>(null);
  const [isQuoting, setIsQuoting] = useState(false);
  const [isPaying, setIsPaying] = useState(false);
  const [error, setError] = useState("");

  useEffect(() => {
    fetch("/api/account/checkout-profile")
      .then(async (response) => {
        if (!response.ok) return;
        const result = await response.json() as { profile?: Partial<{ name: string; email: string; mobile: string; address: string; district: string; state: string; pincode: string; marketingConsent: boolean }> };
        const profile = result.profile;
        if (!profile) return;
        if (profile.name) setName((current) => current || profile.name!);
        if (profile.email) setEmail((current) => current || profile.email!);
        if (profile.mobile) setMobile((current) => current || profile.mobile!);
        if (profile.address) setAddress((current) => current || profile.address!);
        if (profile.district) setDistrict((current) => current || profile.district!);
        if (profile.state) setState((current) => current || profile.state!);
        if (profile.pincode) setPincode((current) => current || profile.pincode!);
        setMarketingConsent(profile.marketingConsent === true);
      })
      .catch(() => undefined);
  }, []);

  const loadQuote = useCallback(async (discountCode?: string) => {
    setError("");
    setIsQuoting(true);
    try {
      const response = await fetch("/api/discounts/validate", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          flow: purchaseFlow,
          code: discountCode?.trim() || undefined,
          items: items.map((item) => ({ book_id: item.id, quantity: item.quantity })),
          shippingMethod,
          state,
        }),
      });
      const result = (await response.json()) as DiscountResult & { error?: string };
      if (!response.ok) throw new Error(result.error ?? "This code could not be applied.");
      setQuote(result);
      if (result.code) setCode(result.code);
    } catch (quoteError) {
      setQuote(null);
      setError(quoteError instanceof Error ? quoteError.message : "Unable to price this order.");
    } finally {
      setIsQuoting(false);
    }
  }, [items, shippingMethod, state, purchaseFlow]);

  useEffect(() => {
    if (hasMixedPurchaseTypes) {
      setQuote(null);
      setError("Pre-booking items must be purchased separately from regular books. Remove one type from your cart to continue.");
    } else if (items.length && state) void loadQuote();
    else {
      setQuote(null);
      setError("");
    }
  }, [items, loadQuote, state, hasMixedPurchaseTypes]);

  async function applyCode() {
    await loadQuote(code);
  }

  const displayedTotal = quote?.total ?? subtotal;

  async function handleSubmit(event: React.FormEvent<HTMLFormElement>) {
    event.preventDefault();
    if (hasMixedPurchaseTypes) return;
    const formData = new FormData(event.currentTarget);
    const formValue = (field: string, fallback = "") => String(formData.get(field) ?? fallback).trim();
    const customer = {
      name: formValue("name", name),
      email: formValue("email", email).toLowerCase(),
      mobile: formValue("mobile", mobile),
      address: formValue("address", address),
      district: formValue("district", district),
      state: formValue("state", state),
      pincode: formValue("pincode", pincode),
      marketingConsent: formData.get("marketingConsent") === "on" || marketingConsent,
    };
    const selectedShipping = formValue("shippingMethod", shippingMethod) as ShippingMethod;
    setError("");
    setIsPaying(true);

    const purchase = {
      flow: purchaseFlow,
      items: items.map((item) => ({ book_id: item.id, quantity: item.quantity })),
      shippingMethod: selectedShipping,
      state: customer.state,
      ...(purchaseFlow === "books" ? { discountCode: quote?.code } : {}),
    };

    try {
      const orderResponse = await fetch("/api/payment/create-order", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ purchase, customer }),
      });
      const orderData = (await orderResponse.json()) as CreateOrderResult;
      if (!orderResponse.ok) throw new Error(orderData.error ?? "Unable to start payment.");
      if (!window.Razorpay) throw new Error("Payment window is still loading. Please try again.");

      const checkout = new window.Razorpay({
        key: orderData.keyId,
        amount: orderData.order.amount,
        currency: orderData.order.currency,
        name: "Karisal Books",
        description: "Book order",
        order_id: orderData.order.id,
        prefill: { name, email, contact: mobile },
        theme: { color: "#1f6b54" },
        modal: { ondismiss: () => setIsPaying(false) },
        handler: async (payment) => {
          try {
            const verifyResponse = await fetch("/api/payment/verify", {
              method: "POST",
              headers: { "Content-Type": "application/json" },
              body: JSON.stringify({ purchase, customer, ...payment }),
            });
            const result = (await verifyResponse.json()) as VerificationResult;
            if (!verifyResponse.ok) throw new Error(result.error ?? "Payment verification failed.");
            clearCart();
            const params = new URLSearchParams({ orderId: result.orderId ?? "" });
            if (result.prebookingId) {
              params.set("prebookingId", result.prebookingId);
              params.set("emailSent", String(result.emailSent === true));
            }
            router.push(`/order-success?${params.toString()}`);
          } catch (verificationError) {
            setError(
              verificationError instanceof Error
                ? verificationError.message
                : "Payment succeeded, but order confirmation failed. Keep your payment receipt and contact support."
            );
          } finally {
            setIsPaying(false);
          }
        },
      });
      checkout.open();
    } catch (paymentError) {
      setError(paymentError instanceof Error ? paymentError.message : "Unable to start payment.");
      setIsPaying(false);
    }
  }

  return (
    <MainLayout>
      <Script src="https://checkout.razorpay.com/v1/checkout.js" strategy="afterInteractive" />
      <div className="container grid gap-10 py-10 lg:grid-cols-[minmax(0,1fr)_360px]">
        <form onSubmit={handleSubmit} className="space-y-5">
          <div>
            <h1 className="text-3xl font-bold">Checkout</h1>
            <p className="mt-1 text-sm text-muted-foreground">Delivery details</p>
          </div>

          <div className="grid gap-4 sm:grid-cols-2">
            <label className="space-y-1 text-sm font-medium sm:col-span-2">
              Name
              <input name="name" required autoComplete="name" value={name} onChange={(event) => setName(event.target.value)} className="w-full rounded-md border bg-background px-3 py-2 font-normal" />
            </label>
            <label className="space-y-1 text-sm font-medium">
              Email for receipt
              <input name="email" required type="email" autoComplete="email" value={email} onChange={(event) => setEmail(event.target.value)} className="w-full rounded-md border bg-background px-3 py-2 font-normal" />
            </label>
            <label className="space-y-1 text-sm font-medium">
              Mobile
              <input name="mobile" required type="tel" autoComplete="tel" value={mobile} onChange={(event) => setMobile(event.target.value)} className="w-full rounded-md border bg-background px-3 py-2 font-normal" />
            </label>
            <label className="space-y-1 text-sm font-medium">
              District
              <input name="district" required autoComplete="address-level2" value={district} onChange={(event) => setDistrict(event.target.value)} className="w-full rounded-md border bg-background px-3 py-2 font-normal" />
            </label>
            <label className="space-y-1 text-sm font-medium">
              State / Union Territory
              <select name="state" required autoComplete="address-level1" value={state} onChange={(event) => setState(event.target.value)} className="w-full rounded-md border bg-background px-3 py-2 font-normal">
                <option value="">Choose state</option>
                {INDIAN_STATES.map((stateName) => <option key={stateName} value={stateName}>{stateName}</option>)}
              </select>
            </label>
            <label className="space-y-1 text-sm font-medium sm:col-span-2">
              Address
              <input name="address" required autoComplete="street-address" value={address} onChange={(event) => setAddress(event.target.value)} className="w-full rounded-md border bg-background px-3 py-2 font-normal" />
            </label>
            <label className="space-y-1 text-sm font-medium">
              Pincode
              <input name="pincode" required inputMode="numeric" autoComplete="postal-code" value={pincode} onChange={(event) => setPincode(event.target.value)} className="w-full rounded-md border bg-background px-3 py-2 font-normal" />
            </label>
          </div>

          <fieldset className="space-y-2 border-t pt-4">
            <legend className="text-sm font-semibold">Shipping method</legend>
            {(["India Post", "Professional Courier"] as const).map((method) => (
              <label key={method} className="flex items-center gap-3 py-1 text-sm">
                <input
                  type="radio"
                  name="shippingMethod"
                  value={method}
                  checked={shippingMethod === method}
                  onChange={() => setShippingMethod(method)}
                  className="accent-primary"
                />
                <span>{method}<span className="block text-xs text-muted-foreground">₹60 TN/Puducherry · ₹120 other states (up to 1 kg)</span></span>
              </label>
            ))}
            <p className="max-w-xl text-xs leading-5 text-muted-foreground">
              For other states, ₹120 is an estimate up to 1 kg. Final India Post charges may change based on actual parcel weight and destination. See <a href="/terms" className="underline underline-offset-2">Terms &amp; Conditions</a>.
            </p>
          </fieldset>

          <label className="flex items-start gap-2 text-xs leading-5 text-muted-foreground">
            <input name="marketingConsent" type="checkbox" checked={marketingConsent} onChange={(event) => setMarketingConsent(event.target.checked)} className="mt-0.5 h-4 w-4 shrink-0 accent-primary" />
            <span>Email me about new books and special offers. You can opt out at any time.</span>
          </label>

          {error && <p role="alert" className="text-sm text-destructive">{error}</p>}

          <button
            type="submit"
            disabled={!items.length || isPaying || isQuoting || !quote || hasMixedPurchaseTypes}
            className="rounded-md bg-primary px-6 py-3 font-semibold text-white disabled:opacity-50"
          >
            {isPaying ? "Waiting for payment…" : `Pay ${formatCurrency(displayedTotal)}`}
          </button>
        </form>

        <aside className="h-fit border-t-2 border-foreground pt-5">
          <h2 className="text-xl font-semibold">Order summary</h2>
          <div className="mt-4 divide-y">
            {items.map((item) => (
              <div key={item.id} className="flex justify-between gap-4 py-3 text-sm">
                <span>{item.title} × {item.quantity}</span>
                <span className="shrink-0">{formatCurrency(item.price * item.quantity)}</span>
              </div>
            ))}
          </div>

          {!isPrebooking && <div className="mt-5 border-y py-4">
            <label htmlFor="discount-code" className="text-sm font-semibold">
              Membership number or coupon
            </label>
            <div className="mt-2 flex gap-2">
              <input
                id="discount-code"
                value={code}
                onChange={(event) => {
                  setCode(event.target.value.toUpperCase());
                  setQuote(null);
                }}
                placeholder="Enter code"
                className="min-w-0 flex-1 rounded-md border bg-background px-3 py-2 text-sm"
              />
              <button type="button" onClick={applyCode} disabled={!code.trim() || isQuoting} className="rounded-md border px-3 text-sm font-medium disabled:opacity-50">
                {isQuoting ? "Checking…" : quote?.code === code ? "Applied" : "Apply"}
              </button>
            </div>
            {quote?.code && (
              <div className="mt-2 flex items-center justify-between gap-2 text-sm text-primary">
                <span>{quote.description} · {quote.percentage}% off</span>
                <button type="button" onClick={() => { setCode(""); void loadQuote(); }} className="underline">Remove</button>
              </div>
            )}
          </div>}

          <dl className="mt-4 space-y-2 text-sm">
            <div className="flex justify-between"><dt>{isPrebooking ? "Pre-booking subtotal" : "Books subtotal"}</dt><dd>{formatCurrency(quote?.subtotal ?? subtotal)}</dd></div>
            <div className="flex justify-between"><dt>Courier charge</dt><dd>{formatCurrency(quote?.courierCharge ?? 0)}</dd></div>
            {!!quote?.bookDiscountAmount && <div className="flex justify-between text-primary"><dt>Book discount</dt><dd>-{formatCurrency(quote.bookDiscountAmount)}</dd></div>}
            {!!quote?.courierDiscount && <div className="flex justify-between text-primary"><dt>Member courier offer</dt><dd>-{formatCurrency(quote.courierDiscount)}</dd></div>}
            <div className="flex justify-between border-t pt-3 text-base font-bold"><dt>Total</dt><dd>{formatCurrency(displayedTotal)}</dd></div>
          </dl>
          {isPrebooking ? (
            <p className="mt-3 text-xs text-muted-foreground">Pre-booking prices are special prices and cannot be combined with membership or coupon discounts.</p>
          ) : (
            <p className="mt-3 text-xs text-muted-foreground">Only one membership or coupon discount can be used per order.</p>
          )}
        </aside>
      </div>
    </MainLayout>
  );
}