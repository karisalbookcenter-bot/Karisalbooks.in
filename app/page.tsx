"use client";

import { useEffect, useState } from "react";
import Link from "next/link";
import { ArrowRight, BookOpen, CalendarClock, Crown } from "lucide-react";
import { MainLayout } from "@/components/layout/MainLayout";
import { BookGrid } from "@/features/storefront/components/BookGrid";
import { BookCarousel } from "@/features/storefront/components/BookCarousel";
import { buildNameMap } from "@/features/storefront/utils";
import { listPublicBooks } from "@/features/storefront/services/book.storefront";
import { listPublicCategories } from "@/features/storefront/services/category.storefront";
import { listPublicAuthorNames, listPublicPublisherNames } from "@/features/storefront/services/author-publisher.storefront";
import type { Book } from "@/types/book.types";
import type { Category } from "@/types/category.types";
import { DEFAULT_SITE_SETTINGS, type PublicSiteSettings } from "@/features/site-settings/site-settings.types";

export default function HomePage() {
  const [recentBooks, setRecentBooks] = useState<Book[]>([]);
  const [categories, setCategories] = useState<Category[]>([]);
  const [authorNamesById, setAuthorNamesById] = useState<Record<string, string>>({});
  const [publisherNamesById, setPublisherNamesById] = useState<Record<string, string>>({});
  const [loading, setLoading] = useState(true);
  const [categoryError, setCategoryError] = useState<string | null>(null);
  const [site, setSite] = useState<PublicSiteSettings>(DEFAULT_SITE_SETTINGS);

  useEffect(() => {
    async function load() {
      setLoading(true);
      try {
        const [booksResult, authors, publishers] = await Promise.all([
          listPublicBooks({ pageSize: 8 }),
          listPublicAuthorNames(),
          listPublicPublisherNames(),
        ]);
        setRecentBooks(booksResult.items);
        setAuthorNamesById(buildNameMap(authors));
        setPublisherNamesById(buildNameMap(publishers));
      } finally {
        setLoading(false);
      }
    }
    load();
  }, []);

  useEffect(() => {
    listPublicCategories()
      .then(setCategories)
      .catch((error: unknown) => {
        setCategoryError(error instanceof Error ? error.message : "Unable to load categories.");
      });
  }, []);

  useEffect(() => {
    fetch("/api/site-settings")
      .then(async (response) => {
        if (!response.ok) return;
        const result = await response.json() as { site?: PublicSiteSettings };
        if (result.site) setSite({ ...DEFAULT_SITE_SETTINGS, ...result.site });
      })
      .catch(() => undefined);
  }, []);

  return (
    <MainLayout>
      <section className="bg-primary text-primary-foreground">
        <div className="container grid gap-5 py-7 sm:gap-8 sm:py-16 lg:grid-cols-[minmax(0,1fr)_300px] lg:items-end">
          <div className="max-w-2xl">
            <p className="mb-3 text-xs font-semibold uppercase text-amber-200">தமிழ் · புத்தகம் · பதிப்பகம்</p>
            <h1 className="text-3xl font-semibold sm:text-5xl">Karisal Books</h1>
            <p className="mt-4 max-w-xl text-sm leading-6 text-primary-foreground/80 sm:text-base">
              {site.description}
            </p>
            <div className="mt-5 flex flex-wrap gap-2 sm:mt-7 sm:gap-3">
              <Link
                href="/books"
                className="inline-flex min-h-11 items-center gap-2 rounded-md bg-white px-5 text-sm font-semibold text-primary transition-colors hover:bg-emerald-50"
              >
                <BookOpen className="h-4 w-4" aria-hidden="true" />
                Browse books
                <ArrowRight className="h-4 w-4" aria-hidden="true" />
              </Link>
              <Link
                href="/recommendations"
                className="inline-flex min-h-11 items-center gap-2 rounded-md border border-white/35 px-5 text-sm font-semibold text-white transition-colors hover:bg-white/10"
              >
                <BookOpen className="h-4 w-4" aria-hidden="true" />
                Recommendations
              </Link>
              <Link
                href="/membership/apply"
                className="inline-flex min-h-11 items-center gap-2 rounded-md border border-white/35 px-5 text-sm font-semibold text-white transition-colors hover:bg-white/10"
              >
                <Crown className="h-4 w-4" aria-hidden="true" />
                Membership
              </Link>
              <Link
                href="/pre-booking"
                className="inline-flex min-h-11 items-center gap-2 rounded-md border border-white/35 px-5 text-sm font-semibold text-white transition-colors hover:bg-white/10"
              >
                <CalendarClock className="h-4 w-4" aria-hidden="true" />
                Pre-book a title
              </Link>
            </div>
          </div>
          <div className="hidden border-l border-white/20 pl-6 text-sm leading-6 text-primary-foreground/75 lg:block">
            Curated titles from Tamil publishers, with delivery across India.
          </div>
        </div>
      </section>

      <section className="container py-6 sm:py-8">
        <h2 className="mb-3 text-xl font-semibold">{site.arrivalsTitle}</h2>
        {loading ? (
          <p className="text-sm text-muted-foreground">Loading…</p>
        ) : site.arrivalsSliderEnabled ? (
          <BookCarousel books={recentBooks} authorNamesById={authorNamesById} publisherNamesById={publisherNamesById} intervalSeconds={site.arrivalsSliderIntervalSeconds} />
        ) : (
          <BookGrid books={recentBooks} authorNamesById={authorNamesById} publisherNamesById={publisherNamesById} />
        )}
      </section>

      {(categories.length > 0 || categoryError) && (
        <section className="container py-8">
          <h2 className="mb-4 text-xl font-semibold">Shop by category</h2>
          {categoryError ? (
            <p role="alert" className="text-sm text-destructive">Unable to load categories: {categoryError}</p>
          ) : (
            <div className="flex flex-wrap gap-2">
              {categories.map((category) => (
                <Link
                  key={category.id}
                  href={`/categories/${category.slug}`}
                  className="rounded-md border border-border bg-card px-4 py-2 text-sm font-medium transition-colors hover:border-primary/40 hover:bg-secondary"
                >
                  {category.name}
                </Link>
              ))}
            </div>
          )}
        </section>
      )}

      <section className="border-y border-border bg-card">
        <div className="container grid gap-4 py-5 sm:grid-cols-2 sm:gap-8 sm:py-8">
          <div className="border-l-2 border-primary pl-4">
            <p className="text-[10px] font-semibold uppercase tracking-wide text-primary sm:text-xs">For readers</p>
            <h2 className="mt-1 text-base font-semibold sm:mt-2 sm:text-lg">Get early access to forthcoming titles.</h2>
            <p className="mt-2 hidden max-w-lg text-sm leading-6 text-muted-foreground sm:block">Reserve selected books during their pre-booking window and receive a personal reference by email.</p>
            <Link href="/pre-booking" className="mt-2 inline-flex min-h-11 items-center gap-2 text-sm font-semibold text-primary hover:underline sm:mt-3">See open pre-bookings <ArrowRight size={15} /></Link>
          </div>
          <div className="border-l-2 border-amber-600 pl-4">
            <p className="text-[10px] font-semibold uppercase tracking-wide text-amber-800 sm:text-xs">For writers</p>
            <h2 className="mt-1 text-base font-semibold sm:mt-2 sm:text-lg">Your manuscript deserves a thoughtful print edition.</h2>
            <p className="mt-2 hidden max-w-lg text-sm leading-6 text-muted-foreground sm:block">Share your files and production goals. Our publishing team will review them and prepare a tailored quotation.</p>
            <Link href="/publication-services" className="mt-2 inline-flex min-h-11 items-center gap-2 text-sm font-semibold text-primary hover:underline sm:mt-3">Explore publishing services <ArrowRight size={15} /></Link>
          </div>
        </div>
      </section>
    </MainLayout>
  );
}
