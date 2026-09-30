"use client";

import Script from "next/script";
import { useEffect, useState } from "react";

import { MainLayout } from "@/components/layout/MainLayout";
import type { MembershipPlan } from "@/types/membership.types";

interface ApplicantDetails {
  name: string;
  email: string;
  mobile: string;
  address: string;
  district: string;
  pincode: string;
}

interface PaymentOrderResponse {
  error?: string;
  keyId: string;
  order: { id: string; amount: number; currency: string };
  total: number;
}

interface MembershipPaymentResult {
  error?: string;
  membershipId?: string;
  expiryDate?: string;
  planName?: string;
}

const INITIAL_APPLICANT: ApplicantDetails = {
  name: "",
  email: "",
  mobile: "",
  address: "",
  district: "",
  pincode: "",
};

export default function MembershipApplyPage() {
  const [plans, setPlans] = useState<MembershipPlan[]>([]);
  const [planId, setPlanId] = useState("");
  const [applicant, setApplicant] = useState(INITIAL_APPLICANT);
  const [loadingPlans, setLoadingPlans] = useState(true);
  const [isPaying, setIsPaying] = useState(false);
  const [error, setError] = useState("");
  const [membership, setMembership] = useState<MembershipPaymentResult | null>(null);

  useEffect(() => {
    let current = true;
    fetch("/api/membership/plans")
      .then(async (response) => {
        const result = (await response.json()) as { plans?: MembershipPlan[]; error?: string };
        if (!response.ok) throw new Error(result.error ?? "Unable to load membership plans.");
        if (!current) return;
        setPlans(result.plans ?? []);
        setPlanId(result.plans?.[0]?.id ?? "");
      })
      .catch((loadError: unknown) => {
        if (current) setError(loadError instanceof Error ? loadError.message : "Unable to load membership plans.");
      })
      .finally(() => {
        if (current) setLoadingPlans(false);
      });
    return () => {
      current = false;
    };
  }, []);

  const selectedPlan = plans.find((plan) => plan.id === planId);

  function updateApplicant(field: keyof ApplicantDetails, value: string) {
    setApplicant((previous) => ({ ...previous, [field]: value }));
  }

  async function handleSubmit(event: React.FormEvent<HTMLFormElement>) {
    event.preventDefault();
    setError("");
    setIsPaying(true);

    try {
      const orderResponse = await fetch("/api/payment/create-order", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ purchase: { flow: "membership", planId } }),
      });
      const orderData = (await orderResponse.json()) as PaymentOrderResponse;
      if (!orderResponse.ok) throw new Error(orderData.error ?? "Unable to start payment.");
      if (!window.Razorpay) throw new Error("Payment window is still loading. Please try again.");

      const checkout = new window.Razorpay({
        key: orderData.keyId,
        amount: orderData.order.amount,
        currency: orderData.order.currency,
        name: "Bookery",
        description: `${selectedPlan?.name ?? "Membership"} membership`,
        order_id: orderData.order.id,
        prefill: {
          name: applicant.name,
          email: applicant.email,
          contact: applicant.mobile,
        },
        theme: { color: "#1f6b54" },
        modal: { ondismiss: () => setIsPaying(false) },
        handler: async (payment) => {
          try {
            const verifyResponse = await fetch("/api/payment/verify", {
              method: "POST",
              headers: { "Content-Type": "application/json" },
              body: JSON.stringify({
                purchase: { flow: "membership", planId },
                customer: applicant,
                ...payment,
              }),
            });
            const result = (await verifyResponse.json()) as MembershipPaymentResult;
            if (!verifyResponse.ok) throw new Error(result.error ?? "Payment verification failed.");
            setMembership(result);
          } catch (verificationError) {
            setError(
              verificationError instanceof Error
                ? verificationError.message
                : "Payment succeeded, but membership confirmation failed. Contact support with your payment receipt."
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
      <section className="container max-w-3xl py-10">
        {membership?.membershipId ? (
          <div className="mx-auto max-w-xl space-y-4 border-t-4 border-primary py-8">
            <p className="text-sm font-semibold uppercase text-primary">Payment complete</p>
            <h1 className="text-3xl font-bold">Your membership is active</h1>
            <p>{membership.planName} plan, valid through {membership.expiryDate}.</p>
            <div className="border-y py-5">
              <p className="text-sm text-muted-foreground">Your membership number</p>
              <p className="mt-1 text-2xl font-bold tracking-wide">{membership.membershipId}</p>
            </div>
            <p className="text-sm text-muted-foreground">
              Use this number at checkout to apply your member book discount.
            </p>
          </div>
        ) : (
          <div className="mx-auto max-w-xl">
            <h1 className="text-3xl font-bold">Join Bookery Membership</h1>
            <p className="mt-2 text-muted-foreground">Choose a plan and pay securely to receive your membership number.</p>

            <form onSubmit={handleSubmit} className="mt-8 space-y-5">
              <fieldset disabled={loadingPlans || isPaying || plans.length === 0}>
                <legend className="mb-3 text-sm font-semibold">Choose a plan</legend>
                <div className="divide-y border-y">
                  {plans.map((plan) => (
                    <label key={plan.id} className="flex cursor-pointer items-start gap-3 py-4">
                      <input
                        type="radio"
                        name="membership-plan"
                        value={plan.id}
                        checked={planId === plan.id}
                        onChange={() => setPlanId(plan.id)}
                        className="mt-1 accent-primary"
                      />
                      <span className="flex flex-1 items-center justify-between gap-4">
                        <span>
                          <span className="block font-semibold">{plan.name}</span>
                          <span className="text-sm text-muted-foreground">
                            {plan.discount_percentage}% book discount · {plan.validity_days} days
                          </span>
                        </span>
                        <span className="font-semibold">₹{plan.price}</span>
                      </span>
                    </label>
                  ))}
                </div>
              </fieldset>

              {loadingPlans && <p className="text-sm text-muted-foreground">Loading plans…</p>}
              {!loadingPlans && plans.length === 0 && (
                <p className="text-sm text-muted-foreground">Membership plans are not available right now.</p>
              )}

              <div className="grid gap-4 sm:grid-cols-2">
                <label className="space-y-1 text-sm font-medium">
                  Full name
                  <input required autoComplete="name" value={applicant.name} onChange={(event) => updateApplicant("name", event.target.value)} className="w-full rounded-md border bg-background px-3 py-2 font-normal" />
                </label>
                <label className="space-y-1 text-sm font-medium">
                  Email
                  <input required type="email" autoComplete="email" value={applicant.email} onChange={(event) => updateApplicant("email", event.target.value)} className="w-full rounded-md border bg-background px-3 py-2 font-normal" />
                </label>
                <label className="space-y-1 text-sm font-medium">
                  Mobile
                  <input required type="tel" autoComplete="tel" value={applicant.mobile} onChange={(event) => updateApplicant("mobile", event.target.value)} className="w-full rounded-md border bg-background px-3 py-2 font-normal" />
                </label>
                <label className="space-y-1 text-sm font-medium">
                  District
                  <input required value={applicant.district} onChange={(event) => updateApplicant("district", event.target.value)} className="w-full rounded-md border bg-background px-3 py-2 font-normal" />
                </label>
                <label className="space-y-1 text-sm font-medium sm:col-span-2">
                  Address
                  <input required autoComplete="street-address" value={applicant.address} onChange={(event) => updateApplicant("address", event.target.value)} className="w-full rounded-md border bg-background px-3 py-2 font-normal" />
                </label>
                <label className="space-y-1 text-sm font-medium">
                  Pincode
                  <input required inputMode="numeric" autoComplete="postal-code" value={applicant.pincode} onChange={(event) => updateApplicant("pincode", event.target.value)} className="w-full rounded-md border bg-background px-3 py-2 font-normal" />
                </label>
              </div>

              {error && <p role="alert" className="text-sm text-destructive">{error}</p>}

              <div className="flex flex-wrap items-center justify-between gap-4 border-t pt-5">
                <p className="text-lg font-semibold">
                  {selectedPlan ? `Pay ₹${selectedPlan.price}` : "Select a plan"}
                </p>
                <button
                  type="submit"
                  disabled={loadingPlans || isPaying || !selectedPlan}
                  className="rounded-md bg-primary px-5 py-3 font-semibold text-white disabled:opacity-50"
                >
                  {isPaying ? "Opening payment…" : "Pay and activate membership"}
                </button>
              </div>
            </form>
          </div>
        )}
      </section>
    </MainLayout>
  );
}