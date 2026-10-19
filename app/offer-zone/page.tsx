"use client";

import { useEffect, useState } from "react";
import Link from "next/link";
import Image from "next/image";
import { ArrowRight, CalendarClock, Crown, Sparkles, Tag } from "lucide-react";
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
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");

  useEffect(() => {
    const today = new Date().toISOString().slice(0, 10);
    async function loadOffers() {
      try {
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
            .select("*")
            .eq("status", "active")
            .lte("start_date", today)
            .gte("end_date", today)
            .order("end_date", { ascending: true });
          if (legacyResult.error) throw legacyResult.error;
          setOffers((legacyResult.data ?? []).map((offer): PublicOffer => ({
            id: offer.id,
            title: offer.title,
            description: typeof offer.description === "string" ? offer.description : null,
            discount_percentage: Number(offer.discount_percentage),
            coupon_code: typeof offer.coupon_code === "string" ? offer.coupon_code : null,
            start_date: offer.start_date,
            end_date: offer.end_date,
            campaign_poster_url: typeof offer.campaign_poster_url === "string" ? offer.campaign_poster_url : null,
            campaign_price_details: typeof offer.campaign_price_details === "string" ? offer.campaign_price_details : null,
          })));
          return;
        }
        if (result.error) throw result.error;
        setOffers((result.data ?? []) as PublicOffer[]);
      } catch (loadError) {
        console.error("Unable to load current offers:", loadError);
        setError("Current offers could not be loaded. Please try again shortly.");
      } finally {
        setLoading(false);
      }
    }
    void loadOffers();
  }, []);

  return (
    <MainLayout>
      <section className="overflow-hidden border-b border-amber-200 bg-gradient-to-br from-amber-50 via-background to-rose-50">
        <div className="container relative py-10 sm:py-14">
          <span className="absolute -right-12 -top-12 h-48 w-48 rounded-full bg-amber-200/30 blur-3xl" aria-hidden="true" />
          <p className="relative mb-3 inline-flex items-center gap-2 rounded-full border border-amber-300 bg-white/80 px-3 py-1.5 text-xs font-bold uppercase tracking-wide text-amber-900">
            <Sparkles size={14} aria-hidden="true" /> Reader benefits
          </p>
          <h1 className="relative text-3xl font-semibold sm:text-4xl">A little more value in every read.</h1>
          <p className="relative mt-3 max-w-2xl text-sm leading-6 text-muted-foreground">Explore membership benefits, limited-time coupons, and early access to forthcoming books in one place.</p>
        </div>
      </section>

      <section className="container grid gap-4 py-8 sm:py-10 md:grid-cols-2">
        <article className="group flex flex-col rounded-2xl border border-amber-200 bg-gradient-to-br from-amber-50 to-white p-5 shadow-sm transition-all hover:-translate-y-1 hover:shadow-lg sm:p-6">
          <span className="grid h-12 w-12 place-items-center rounded-2xl bg-amber-200 text-amber-900">
            <Crown size={23} aria-hidden="true" />
          </span>
          <h2 className="mt-3 text-xl font-semibold">Membership benefits</h2>
          <p className="mt-2 text-sm leading-6 text-muted-foreground">Join Karisal Books to access member pricing on eligible titles and delivery benefits during your membership period.</p>
          <Link href="/membership/apply" className="mt-5 inline-flex min-h-11 items-center justify-center gap-2 rounded-full bg-amber-400 px-5 text-sm font-bold text-amber-950 shadow-sm transition-all hover:bg-amber-300 group-hover:shadow-md">
            Explore membership <ArrowRight size={16} aria-hidden="true" />
          </Link>
        </article>
        <article className="group flex flex-col rounded-2xl border border-sky-200 bg-gradient-to-br from-sky-50 to-white p-5 shadow-sm transition-all hover:-translate-y-1 hover:shadow-lg sm:p-6">
          <span className="grid h-12 w-12 place-items-center rounded-2xl bg-sky-200 text-sky-900">
            <CalendarClock size={23} aria-hidden="true" />
          </span>
          <h2 className="mt-3 text-xl font-semibold">Pre-booking offers</h2>
          <p className="mt-2 text-sm leading-6 text-muted-foreground">Reserve selected upcoming books during their booking window. Special pre-booking prices do not combine with membership discounts.</p>
          <Link href="/pre-booking" className="mt-5 inline-flex min-h-11 items-center justify-center gap-2 rounded-full bg-sky-700 px-5 text-sm font-bold text-white shadow-sm transition-all hover:bg-sky-800 group-hover:shadow-md">
            See books to pre-book <ArrowRight size={16} aria-hidden="true" />
          </Link>
        </article>
      </section>

      <section className="border-t border-border bg-card">
        <div className="container py-8">
          <div className="mb-4 flex flex-wrap items-end justify-between gap-3 border-b border-border pb-3">
            <div>
              <p className="text-xs font-semibold uppercase tracking-[0.14em] text-primary">Limited time</p>
              <h2 className="mt-1 text-xl font-semibold">Current offers</h2>
            </div>
            <p className="text-xs text-muted-foreground">Limited-time coupon offers</p>
          </div>
          {loading ? (
            <p role="status" className="py-7 text-sm text-muted-foreground">Checking current offers…</p>
          ) : error ? (
            <p role="alert" className="py-7 text-sm text-destructive">{error}</p>
          ) : offers.length ? (
            <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-3">
              {offers.map((offer) => (
                <article key={offer.id} className="overflow-hidden rounded-2xl border border-border bg-background shadow-sm transition-shadow hover:shadow-md">
                  {offer.campaign_poster_url && (
                    <div className="relative h-56 w-full bg-secondary/40 p-2">
                      <Image
                        src={offer.campaign_poster_url}
                        alt={`${offer.title} offer`}
                        fill
                        sizes="(max-width: 640px) 100vw, (max-width: 1024px) 50vw, 33vw"
                        className="object-contain"
                      />
                    </div>
                  )}
                  <div className="p-5">
                    <p className="inline-flex rounded-full bg-rose-100 px-3 py-1 text-xs font-bold uppercase text-rose-800">{offer.discount_percentage}% off</p>
                    <h3 className="mt-3 text-base font-semibold">{offer.title}</h3>
                    {offer.description && <p className="mt-2 text-sm leading-6 text-muted-foreground">{offer.description}</p>}
                    {offer.campaign_price_details && <p className="mt-2 whitespace-pre-line text-sm leading-6 text-muted-foreground">{offer.campaign_price_details}</p>}
                    {offer.coupon_code && <p className="mt-4 flex items-center gap-2 rounded-xl border border-dashed border-primary/30 bg-primary/5 px-3 py-2 font-mono text-sm font-bold text-primary"><Tag size={15} aria-hidden="true" />{offer.coupon_code}</p>}
                    <p className="mt-3 text-xs text-muted-foreground">Valid through {new Date(`${offer.end_date}T00:00:00`).toLocaleDateString("en-IN", { dateStyle: "medium" })}</p>
                  </div>
                </article>
              ))}
            </div>
          ) : <p className="py-7 text-sm text-muted-foreground">No coupon offers are active right now. Check membership and pre-booking benefits above.</p>}
        </div>
      </section>
    </MainLayout>
  );
}