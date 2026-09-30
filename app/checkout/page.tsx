"use client";

import Script from "next/script";
import { useState } from "react";
import { useRouter } from "next/navigation";

import { MainLayout } from "@/components/layout/MainLayout";
import { useCart } from "@/features/cart/hooks/useCart";
import { formatCurrency } from "@/lib/helpers/format.helpers";

interface DiscountResult {
  code: string;
  kind: "membership" | "coupon";
  percentage: number;
  description: string;
}

interface CreateOrderResult {
  error?: string;
  keyId: string;
  order: { id: string; amount: number; currency: string };
  subtotal: number;
  discountAmount: number;
  discountPercentage: number;
  total: number;
}

interface VerificationResult {
  error?: string;
  orderId?: string;
}

export default function CheckoutPage() {
  const router = useRouter();
  const { items, clearCart } = useCart();
  const subtotal = items.reduce((sum, item) => sum + item.price * item.quantity, 0);

  const [name, setName] = useState("");
  const [mobile, setMobile] = useState("");
  const [address, setAddress] = useState("");
  const [district, setDistrict] = useState("");
  const [pincode, setPincode] = useState("");
  const [code, setCode] = useState("");
  const [discount, setDiscount] = useState<DiscountResult | null>(null);
  const [isApplying, setIsApplying] = useState(false);
  const [isPaying, setIsPaying] = useState(false);
  const [error, setError] = useState("");

  const displayedTotal = discount
    ? subtotal * (1 - discount.percentage / 100)
    : subtotal;

  async function applyCode() {
    setError("");
    setIsApplying(true);
    try {
      const response = await fetch("/api/discounts/validate", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ code }),
      });
      const result = (await response.json()) as DiscountResult & { error?: string };
      if (!response.ok) throw new Error(result.error ?? "This code could not be applied.");
      setDiscount(result);
      setCode(result.code);
    } catch (applyError) {
      setDiscount(null);
      setError(applyError instanceof Error ? applyError.message : "This code could not be applied.");
    } finally {
      setIsApplying(false);
    }
  }

  async function handleSubmit(event: React.FormEvent<HTMLFormElement>) {
    event.preventDefault();
    setError("");
    setIsPaying(true);

    const purchase = {
      flow: "books" as const,
      items: items.map((item) => ({ book_id: item.id, quantity: item.quantity })),
      discountCode: discount?.code,
    };
    const customer = { name, mobile, address, district, pincode };

    try {
      const orderResponse = await fetch("/api/payment/create-order", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ purchase }),
      });
      const orderData = (await orderResponse.json()) as CreateOrderResult;
      if (!orderResponse.ok) throw new Error(orderData.error ?? "Unable to start payment.");
      if (!window.Razorpay) throw new Error("Payment window is still loading. Please try again.");

      const checkout = new window.Razorpay({
        key: orderData.keyId,
        amount: orderData.order.amount,
        currency: orderData.order.currency,
        name: "Bookery",
        description: "Book order",
        order_id: orderData.order.id,
        prefill: { name, contact: mobile },
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
            router.push(`/order-success?orderId=${encodeURIComponent(result.orderId ?? "")}`);
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
              <input required autoComplete="name" value={name} onChange={(event) => setName(event.target.value)} className="w-full rounded-md border bg-background px-3 py-2 font-normal" />
            </label>
            <label className="space-y-1 text-sm font-medium">
              Mobile
              <input required type="tel" autoComplete="tel" value={mobile} onChange={(event) => setMobile(event.target.value)} className="w-full rounded-md border bg-background px-3 py-2 font-normal" />
            </label>
            <label className="space-y-1 text-sm font-medium">
              District
              <input required value={district} onChange={(event) => setDistrict(event.target.value)} className="w-full rounded-md border bg-background px-3 py-2 font-normal" />
            </label>
            <label className="space-y-1 text-sm font-medium sm:col-span-2">
              Address
              <input required autoComplete="street-address" value={address} onChange={(event) => setAddress(event.target.value)} className="w-full rounded-md border bg-background px-3 py-2 font-normal" />
            </label>
            <label className="space-y-1 text-sm font-medium">
              Pincode
              <input required inputMode="numeric" autoComplete="postal-code" value={pincode} onChange={(event) => setPincode(event.target.value)} className="w-full rounded-md border bg-background px-3 py-2 font-normal" />
            </label>
          </div>

          {error && <p role="alert" className="text-sm text-destructive">{error}</p>}

          <button
            type="submit"
            disabled={!items.length || isPaying}
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

          <div className="mt-5 border-y py-4">
            <label htmlFor="discount-code" className="text-sm font-semibold">
              Membership number or coupon
            </label>
            <div className="mt-2 flex gap-2">
              <input
                id="discount-code"
                value={code}
                onChange={(event) => {
                  setCode(event.target.value.toUpperCase());
                  setDiscount(null);
                }}
                placeholder="Enter code"
                className="min-w-0 flex-1 rounded-md border bg-background px-3 py-2 text-sm"
              />
              <button type="button" onClick={applyCode} disabled={!code.trim() || isApplying} className="rounded-md border px-3 text-sm font-medium disabled:opacity-50">
                {isApplying ? "Checking…" : discount ? "Applied" : "Apply"}
              </button>
            </div>
            {discount && (
              <div className="mt-2 flex items-center justify-between gap-2 text-sm text-primary">
                <span>{discount.description} · {discount.percentage}% off</span>
                <button type="button" onClick={() => setDiscount(null)} className="underline">Remove</button>
              </div>
            )}
          </div>

          <dl className="mt-4 space-y-2 text-sm">
            <div className="flex justify-between"><dt>Subtotal</dt><dd>{formatCurrency(subtotal)}</dd></div>
            {discount && <div className="flex justify-between text-primary"><dt>Discount</dt><dd>-{formatCurrency(subtotal - displayedTotal)}</dd></div>}
            <div className="flex justify-between border-t pt-3 text-base font-bold"><dt>Total</dt><dd>{formatCurrency(displayedTotal)}</dd></div>
          </dl>
          <p className="mt-3 text-xs text-muted-foreground">Only one membership or coupon discount can be used per order.</p>
        </aside>
      </div>
    </MainLayout>
  );
}