"use client";

import Image from "next/image";
import { useEffect, useState } from "react";
import { ArrowRight, Check, Crown, ShieldCheck } from "lucide-react";

import { MainLayout } from "@/components/layout/MainLayout";
import type { MembershipPlan } from "@/types/membership.types";

interface MembershipPlanOption extends MembershipPlan {
  baseAmount: number;
  taxAmount: number;
  totalAmount: number;
}

interface ApplicantDetails {
  name: string;
  email: string;
  mobile: string;
  address: string;
  district: string;
  pincode: string;
}

interface MembershipApplicationResponse {
  error?: string;
  membershipId: string;
  planName: string;
  total: number;
  whatsappHref: string;
  qrPaymentEnabled: boolean;
  paymentQrUrl: string | null;
}

interface MembershipPaymentResult {
  membershipId: string;
  planName: string;
  total: number;
  whatsappHref: string;
  qrPaymentEnabled: boolean;
  paymentQrUrl: string | null;
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
  const [plans, setPlans] = useState<MembershipPlanOption[]>([]);
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
        const result = (await response.json()) as { plans?: MembershipPlanOption[]; error?: string };
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
      const orderResponse = await fetch("/api/membership/manual", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ planId, customer: applicant }),
      });
      const result = (await orderResponse.json()) as MembershipApplicationResponse;
      if (!orderResponse.ok) throw new Error(result.error ?? "Unable to submit membership application.");
      setMembership(result);
    } catch (paymentError) {
      setError(paymentError instanceof Error ? paymentError.message : "Unable to start payment.");
    } finally {
      setIsPaying(false);
    }
  }

  return (
    <MainLayout>
      <section className="container max-w-3xl py-10">
        {membership ? (
          <div className="mx-auto max-w-xl space-y-4 border-t-4 border-primary py-8">
            <p className="text-sm font-semibold uppercase text-primary">Application received</p>
            <h1 className="text-3xl font-bold">Complete payment in WhatsApp</h1>
            <p>
              {membership.planName} plan · ₹{membership.total.toFixed(2)}. Your membership will be usable after the store confirms your payment screenshot.
            </p>
            <div className="border-y py-5">
              <p className="text-sm text-muted-foreground">Membership reference</p>
              <p className="mt-1 text-2xl font-bold tracking-wide">{membership.membershipId}</p>
            </div>
            {membership.qrPaymentEnabled && membership.paymentQrUrl && (
              <div className="space-y-3 rounded-xl border p-4">
                <Image
                  src={membership.paymentQrUrl}
                  alt="Store payment QR code"
                  width={288}
                  height={288}
                  unoptimized
                  className="mx-auto max-h-72 w-full max-w-72 object-contain"
                />
                <p className="text-sm text-muted-foreground">
                  Scan the QR, then send the payment screenshot and membership reference in WhatsApp.
                </p>
              </div>
            )}
            <a
              href={membership.whatsappHref}
              target="_blank"
              rel="noreferrer"
              className="inline-flex min-h-12 items-center justify-center gap-2 rounded-full bg-[#25D366] px-6 py-3 font-bold text-white"
            >
              Continue in WhatsApp <ArrowRight size={17} aria-hidden="true" />
            </a>
          </div>
        ) : (
          <div className="mx-auto max-w-xl">
            <div className="mb-7 overflow-hidden rounded-3xl border border-amber-200 bg-gradient-to-br from-amber-50 via-white to-orange-50 p-5 shadow-sm sm:p-7">
              <span className="grid h-12 w-12 place-items-center rounded-2xl bg-amber-300 text-amber-950 shadow-sm">
                <Crown size={25} aria-hidden="true" />
              </span>
              <p className="mt-4 text-xs font-bold uppercase tracking-[0.16em] text-amber-800">
                A little extra for book lovers
              </p>
              <h1 className="mt-1 text-2xl font-bold sm:text-3xl">Join Karisal Books Membership</h1>
              <p className="mt-2 text-sm leading-6 text-muted-foreground">
                உங்கள் வாசிப்புப் பயணத்திற்கு ஏற்ற திட்டத்தைத் தேர்ந்தெடுத்து, உறுப்பினர் சலுகைகளைப் பெறுங்கள்.
              </p>
              <div className="mt-4 flex flex-wrap gap-2">
                <span className="inline-flex items-center gap-1.5 rounded-full border border-amber-200 bg-white/80 px-3 py-1.5 text-xs font-semibold text-amber-900">
                  <Check size={14} aria-hidden="true" /> Eligible book discounts
                </span>
                <span className="inline-flex items-center gap-1.5 rounded-full border border-amber-200 bg-white/80 px-3 py-1.5 text-xs font-semibold text-amber-900">
                  <Check size={14} aria-hidden="true" /> Plan details upfront
                </span>
              </div>
            </div>

            <form onSubmit={handleSubmit} className="mt-8 space-y-5">
              <fieldset disabled={loadingPlans || isPaying || plans.length === 0}>
                <legend className="mb-3 text-sm font-semibold">Choose a plan</legend>
                <div className="space-y-2">
                  {plans.map((plan) => (
                    <label
                      key={plan.id}
                      className={`flex cursor-pointer items-start gap-3 rounded-xl border p-4 transition-colors ${
                        planId === plan.id
                          ? "border-amber-400 bg-amber-50 shadow-sm"
                          : "border-border bg-card hover:border-amber-300 hover:bg-amber-50/50"
                      }`}
                    >
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
                        <span className="font-semibold">₹{plan.totalAmount.toFixed(2)}</span>
                      </span>
                    </label>
                  ))}
                </div>
              </fieldset>

              {loadingPlans && <p className="text-sm text-muted-foreground">Loading plans…</p>}
              {!loadingPlans && plans.length === 0 && (
                <p className="text-sm text-muted-foreground">Membership plans are not available right now.</p>
              )}

              {selectedPlan && (
                <dl className="space-y-2 border-y py-4 text-sm">
                  <div className="flex justify-between"><dt>Membership amount</dt><dd>₹{selectedPlan.baseAmount.toFixed(2)}</dd></div>
                  <div className="flex justify-between"><dt>Tax (8%)</dt><dd>₹{selectedPlan.taxAmount.toFixed(2)}</dd></div>
                  <div className="flex justify-between border-t pt-2 font-semibold"><dt>Total payable</dt><dd>₹{selectedPlan.totalAmount.toFixed(2)}</dd></div>
                  <div className="pt-1 text-muted-foreground">Membership benefits start after payment confirmation.</div>
                </dl>
              )}

              <div className="grid gap-4 sm:grid-cols-2">
                <label className="space-y-1 text-sm font-medium">
                  Full name
                  <input required autoComplete="name" value={applicant.name} onChange={(event) => updateApplicant("name", event.target.value)} className="mt-1 w-full rounded-xl border border-input bg-background px-3 py-3 font-normal focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-amber-500" />
                </label>
                <label className="space-y-1 text-sm font-medium">
                  Email
                  <input required type="email" autoComplete="email" value={applicant.email} onChange={(event) => updateApplicant("email", event.target.value)} className="mt-1 w-full rounded-xl border border-input bg-background px-3 py-3 font-normal focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-amber-500" />
                </label>
                <label className="space-y-1 text-sm font-medium">
                  Mobile
                  <input required type="tel" autoComplete="tel" value={applicant.mobile} onChange={(event) => updateApplicant("mobile", event.target.value)} className="mt-1 w-full rounded-xl border border-input bg-background px-3 py-3 font-normal focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-amber-500" />
                </label>
                <label className="space-y-1 text-sm font-medium">
                  District
                  <input required value={applicant.district} onChange={(event) => updateApplicant("district", event.target.value)} className="mt-1 w-full rounded-xl border border-input bg-background px-3 py-3 font-normal focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-amber-500" />
                </label>
                <label className="space-y-1 text-sm font-medium sm:col-span-2">
                  Address
                  <input required autoComplete="street-address" value={applicant.address} onChange={(event) => updateApplicant("address", event.target.value)} className="mt-1 w-full rounded-xl border border-input bg-background px-3 py-3 font-normal focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-amber-500" />
                </label>
                <label className="space-y-1 text-sm font-medium">
                  Pincode
                  <input required inputMode="numeric" autoComplete="postal-code" value={applicant.pincode} onChange={(event) => updateApplicant("pincode", event.target.value)} className="mt-1 w-full rounded-xl border border-input bg-background px-3 py-3 font-normal focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-amber-500" />
                </label>
              </div>

              {error && <p role="alert" className="text-sm text-destructive">{error}</p>}

              <div className="flex flex-wrap items-center justify-between gap-4 border-t pt-5">
                <p className="text-lg font-semibold">
                  {selectedPlan ? `Pay ₹${selectedPlan.totalAmount.toFixed(2)}` : "Select a plan"}
                </p>
                <button
                  type="submit"
                  disabled={loadingPlans || isPaying || !selectedPlan}
                  className="inline-flex min-h-12 items-center justify-center gap-2 rounded-full bg-gradient-to-r from-amber-400 to-yellow-300 px-6 py-3 font-bold text-amber-950 shadow-md transition-all hover:-translate-y-0.5 hover:shadow-lg disabled:cursor-not-allowed disabled:opacity-50"
                >
                  {isPaying ? "Submitting application…" : "Continue to WhatsApp"}
                  {isPaying ? <ShieldCheck size={17} aria-hidden="true" /> : <ArrowRight size={17} aria-hidden="true" />}
                </button>
              </div>
            </form>
          </div>
        )}
      </section>
    </MainLayout>
  );
}