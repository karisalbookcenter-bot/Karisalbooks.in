"use client";

import { useEffect, useState } from "react";
import Link from "next/link";
import { CalendarClock, Crown, Tag } from "lucide-react";
import { MainLayout } from "@/components/layout/MainLayout";
import { createClient } from "@/lib/supabase/client";

interface PublicOffer {
  id: string;
  title: string;
  description: string | null;
  discount_percentage: number;
  coupon_code: string | null;
  start_date: string;
  end_date: string;
  campaign_poster_url?: string | null;
  campaign_price_details?: string | null;
}

export default function OfferZonePage() {
  const [offers, setOffers] = useState<PublicOffer[]>([]);

  useEffect(() => {
    const today = new Date().toISOString().slice(0, 10);
    async function loadOffers() {
      const supabase = createClient();
      const result = await supabase
        .from("offers")
        .select("id, title, description, discount_percentage, coupon_code, start_date, end_date, campaign_poster_url, campaign_price_details")
        .eq("status", "active")
        .lte("start_date", today)
        .gte("end_date", today)
        .order("end_date", { ascending: true });
      if (result.error?.code === "42703") {
        const legacyResult = await supabase
          .from("offers")
          .select("id, title, description, discount_percentage, coupon_code, start_date, end_date")
          .eq("status", "active")
          .lte("start_date", today)
          .gte("end_date", today)
          .order("end_date", { ascending: true });
        setOffers((legacyResult.data ?? []) as PublicOffer[]);
        return;
      }
      setOffers((result.data ?? []) as PublicOffer[]);
    }
    void loadOffers();
  }, []);

  return (
    <MainLayout>
      <section className="border-b border-border bg-secondary/50">
        <div className="container py-10 sm:py-14">
          <p className="mb-3 text-xs font-semibold uppercase tracking-wide text-primary">Karisal Books · Reader benefits</p>
          <h1 className="text-3xl font-semibold sm:text-4xl">Offers for every kind of reader.</h1>
          <p className="mt-3 max-w-2xl text-sm leading-6 text-muted-foreground">Explore member benefits, limited-time coupons, and early access to forthcoming books in one place.</p>
        </div>
      </section>

      <section className="container grid gap-8 py-9 md:grid-cols-2 md:gap-12">
        <article className="flex flex-col border-t-2 border-primary pt-5">
          <Crown size={22} className="text-primary" aria-hidden="true" />
          <h2 className="mt-3 text-xl font-semibold">Membership benefits</h2>
          <p className="mt-2 text-sm leading-6 text-muted-foreground">Join Karisal Books to access member pricing on eligible titles and delivery benefits during your membership period.</p>
          <Link href="/membership/apply" className="mt-auto inline-flex min-h-10 items-center gap-2 pt-5 text-sm font-semibold text-primary hover:underline">View membership plans <Tag size={15} /></Link>
        </article>
        <article className="flex flex-col border-t-2 border-amber-600 pt-5">
          <CalendarClock size={22} className="text-amber-800" aria-hidden="true" />
          <h2 className="mt-3 text-xl font-semibold">Pre-booking offers</h2>
          <p className="mt-2 text-sm leading-6 text-muted-foreground">Reserve selected upcoming books during their booking window. Special pre-booking prices do not combine with membership discounts.</p>
          <Link href="/pre-booking" className="mt-auto inline-flex min-h-10 items-center gap-2 pt-5 text-sm font-semibold text-primary hover:underline">See books open for pre-booking <CalendarClock size={15} /></Link>
        </article>
      </section>

      <section className="border-t border-border bg-card">
        <div className="container py-8">
          <div className="mb-4 flex items-center justify-between border-b border-border pb-3">
            <h2 className="text-xl font-semibold">Current offers</h2>
            <p className="text-xs text-muted-foreground">Limited-time coupon offers</p>
          </div>
          {offers.length ? (
            <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-3">
              {offers.map((offer) => (
                <article key={offer.id} className="border border-border p-4">
                  {offer.campaign_poster_url && (
                    // eslint-disable-next-line @next/next/no-img-element
                    <img src={offer.campaign_poster_url} alt={`${offer.title} offer`} className="mb-4 max-h-56 w-full object-contain" />
                  )}
                  <p className="text-xs font-semibold uppercase text-primary">{offer.discount_percentage}% off</p>
                  <h3 className="mt-2 text-base font-semibold">{offer.title}</h3>
                  {offer.description && <p className="mt-2 text-sm text-muted-foreground">{offer.description}</p>}
                  {offer.campaign_price_details && <p className="mt-2 whitespace-pre-line text-sm text-muted-foreground">{offer.campaign_price_details}</p>}
                  {offer.coupon_code && <p className="mt-4 inline-block rounded-sm bg-secondary px-2 py-1 font-mono text-sm">{offer.coupon_code}</p>}
                  <p className="mt-3 text-xs text-muted-foreground">Valid through {new Date(`${offer.end_date}T00:00:00`).toLocaleDateString("en-IN", { dateStyle: "medium" })}</p>
                </article>
              ))}
            </div>
          ) : <p className="py-7 text-sm text-muted-foreground">No coupon offers are active right now. Check membership and pre-booking benefits above.</p>}
        </div>
      </section>
    </MainLayout>
  );
}