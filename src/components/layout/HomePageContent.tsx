"use client";

import { useEffect, useState } from "react";
import Link from "next/link";
import { ArrowRight } from "lucide-react";

import { MainLayout } from "@/components/layout/MainLayout";
import { StorefrontHero } from "@/components/layout/StorefrontHero";
import { BookGrid } from "@/features/storefront/components/BookGrid";
import { BookCarousel } from "@/features/storefront/components/BookCarousel";
import { NO_DISCOUNT_CATEGORY_NAME } from "@/lib/helpers/book-pricing.helpers";
import type { HomepageData } from "@/features/storefront/services/homepage-data.server";
import type { PublicSiteSettings } from "@/features/site-settings/site-settings.types";
import { subscribeToSiteSettingsUpdates } from "@/features/site-settings/site-settings.events";

interface HomePageContentProps {
  initialData: HomepageData;
}

export function HomePageContent({ initialData }: HomePageContentProps) {
  const {
    recentBooks,
    highlightedBooks,
    makkalBooks,
    campaignOffer,
    categories,
    authorNamesById,
    publisherNamesById,
    categoryError,
    makkalBooksError,
  } = initialData;
  const [site, setSite] = useState<PublicSiteSettings>(initialData.site);

  useEffect(() => {
    return subscribeToSiteSettingsUpdates(({ site }) => {
      setSite(site);
    });
  }, []);

  const availableFeaturedBooks = highlightedBooks.filter(
    (book) => book.stock_quantity > 0 || book.prebooking_enabled
  );
  const availableRecentBooks = recentBooks.filter(
    (book) => book.stock_quantity > 0 || book.prebooking_enabled
  );
  const heroBooks = availableFeaturedBooks.length > 0
    ? availableFeaturedBooks.slice(0, 5)
    : availableRecentBooks.slice(0, 5);

  return (
    <MainLayout>
      <StorefrontHero
        books={heroBooks}
        offer={campaignOffer}
        authorNamesById={authorNamesById}
        loading={false}
      />

      {/* =====================================================
          HOMEPAGE HIGHLIGHTS
          ===================================================== */}

      {highlightedBooks.length > 0 && (
        <section className="container py-5 sm:py-7">
          <div className="mb-3 flex items-end justify-between gap-3">
            <div>
              <p className="text-xs font-semibold uppercase tracking-[0.16em] text-primary">
                Editor&apos;s picks
              </p>
              <h2 className="mt-1 text-xl font-semibold sm:text-2xl">Featured books</h2>
            </div>
            <Link href="/recommendations" className="shrink-0 text-sm font-semibold text-primary hover:underline">
              See picks <ArrowRight className="ml-1 inline h-4 w-4" aria-hidden="true" />
            </Link>
          </div>

          <BookCarousel
            books={highlightedBooks}
            authorNamesById={authorNamesById}
            publisherNamesById={publisherNamesById}
            intervalSeconds={site.arrivalsSliderIntervalSeconds}
            prioritizeFirstImage
          />
        </section>
      )}

      {/* =====================================================
          LATEST ARRIVALS
          ===================================================== */}

      <section className="container py-5 sm:py-7">
        <div className="mb-3 flex items-end justify-between gap-3">
          <div>
            <p className="text-xs font-semibold uppercase tracking-[0.16em] text-primary">
              Just added
            </p>
            <h2 className="mt-1 text-xl font-semibold sm:text-2xl">
              {site.arrivalsTitle}
            </h2>
          </div>
          <Link href="/books" className="shrink-0 text-sm font-semibold text-primary hover:underline">
            All books <ArrowRight className="ml-1 inline h-4 w-4" aria-hidden="true" />
          </Link>
        </div>

        {site.arrivalsSliderEnabled ? (
          <BookCarousel
            books={recentBooks}
            authorNamesById={authorNamesById}
            publisherNamesById={publisherNamesById}
            intervalSeconds={site.arrivalsSliderIntervalSeconds}
            prioritizeFirstImage={highlightedBooks.length === 0}
          />
        ) : (
          <BookGrid
            books={recentBooks}
            authorNamesById={authorNamesById}
            publisherNamesById={publisherNamesById}
            prioritizeFirstImage={highlightedBooks.length === 0}
          />
        )}
      </section>

      {categoryError ? (
        <section className="container py-5 sm:py-7">
          <p role="alert" className="text-sm text-destructive">
            Unable to load categories: {categoryError}
          </p>
        </section>
      ) : categories.length > 0 ? (
        <section className="container py-5 sm:py-7" aria-labelledby="shop-categories">
          <div className="mb-3 flex items-center justify-between gap-3">
            <h2 id="shop-categories" className="text-lg font-semibold sm:text-xl">
              Shop by category
            </h2>
            <Link href="/books" className="shrink-0 text-sm font-semibold text-primary hover:underline">
              All books <ArrowRight className="ml-1 inline h-4 w-4" aria-hidden="true" />
            </Link>
          </div>
          <div className="flex gap-2 overflow-x-auto pb-2 [scrollbar-width:thin]">
            {categories.map((category) => (
              <Link
                key={category.id}
                href={`/categories/${encodeURIComponent(category.slug)}`}
                className="inline-flex min-h-10 shrink-0 items-center rounded-full border border-[#d9e3dc] bg-[#fffefa] px-4 text-sm font-medium text-[#17382b] transition-colors hover:border-[#2f7658] hover:bg-[#e3efe7]"
              >
                {category.name}
              </Link>
            ))}
          </div>
        </section>
      ) : null}

      {makkalBooks.length > 0 || makkalBooksError ? (
        <section className="container py-5 sm:py-7">
          <h2 className="mb-3 text-xl font-semibold sm:text-2xl">
            {NO_DISCOUNT_CATEGORY_NAME}
          </h2>
          {makkalBooksError ? (
            <p role="alert" className="text-sm text-destructive">
              {makkalBooksError}
            </p>
          ) : (
            <BookCarousel
              books={makkalBooks}
              authorNamesById={authorNamesById}
              publisherNamesById={publisherNamesById}
              intervalSeconds={site.arrivalsSliderIntervalSeconds}
            />
          )}
        </section>
      ) : null}

      <section className="container pb-8 pt-4 sm:pb-12" aria-label="More from Karisal Books">
        <details className="group rounded-xl border border-border bg-secondary/30">
          <summary className="flex min-h-14 cursor-pointer list-none items-center justify-between gap-4 px-4 text-sm font-semibold text-foreground [&::-webkit-details-marker]:hidden">
            <span>Membership · Pre-booking · Bulk orders · More</span>
            <span className="shrink-0 text-primary underline underline-offset-4 group-open:hidden">Explore</span>
            <span className="hidden shrink-0 text-primary underline underline-offset-4 group-open:inline">Close</span>
          </summary>
          <nav aria-label="Reader and publishing services" className="grid gap-x-6 border-t border-border px-4 py-3 text-sm sm:grid-cols-2 lg:grid-cols-3">
            <Link href="/membership/apply" className="py-2 font-medium text-primary hover:underline">Membership benefits</Link>
            <Link href="/pre-booking" className="py-2 font-medium text-primary hover:underline">Pre-book a title</Link>
            <Link href="/pre-booking?mode=bulk" className="py-2 font-medium text-primary hover:underline">Bulk book orders</Link>
            <Link href="/publication-services" className="py-2 font-medium text-primary hover:underline">Publishing services</Link>
            <Link href="/customize" className="py-2 font-medium text-primary hover:underline">Custom book orders</Link>
            <Link href="/track-order" className="py-2 font-medium text-primary hover:underline">Track an order</Link>
          </nav>
        </details>
      </section>

    </MainLayout>
  );
}