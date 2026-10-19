"use client";

import { useEffect, useState } from "react";
import Link from "next/link";
import { ArrowRight } from "lucide-react";

import { MainLayout } from "@/components/layout/MainLayout";
import { StorefrontHero } from "@/components/layout/StorefrontHero";
import { BookGrid } from "@/features/storefront/components/BookGrid";
import { BookCarousel } from "@/features/storefront/components/BookCarousel";
import { buildNameMap } from "@/features/storefront/utils";
import { NO_DISCOUNT_CATEGORY_NAME } from "@/lib/helpers/book-pricing.helpers";

import {
  listPublicBooks,
  listPublicHighlightedBooks,
} from "@/features/storefront/services/book.storefront";

import { listPublicCategories } from "@/features/storefront/services/category.storefront";

import { createClient } from "@/lib/supabase/client";
import {
  listPublicAuthorNames,
  listPublicPublisherNames,
} from "@/features/storefront/services/author-publisher.storefront";

import type { Book } from "@/types/book.types";
import type { Category } from "@/types/category.types";

import {
  DEFAULT_SITE_SETTINGS,
  type PublicSiteSettings,
} from "@/features/site-settings/site-settings.types";
import { subscribeToSiteSettingsUpdates } from "@/features/site-settings/site-settings.events";

interface HomepageCampaignOffer {
  id: string;
  title: string;
  discountPercentage: number;
  endDate: string;
  posterUrl: string;
}

export default function HomePage() {
  const [recentBooks, setRecentBooks] = useState<Book[]>([]);
  const [highlightedBooks, setHighlightedBooks] = useState<Book[]>([]);
  const [makkalBooks, setMakkalBooks] = useState<Book[]>([]);
  const [campaignOffer, setCampaignOffer] = useState<HomepageCampaignOffer | null>(null);
  const [categories, setCategories] = useState<Category[]>([]);

  const [authorNamesById, setAuthorNamesById] = useState<
    Record<string, string>
  >({});

  const [publisherNamesById, setPublisherNamesById] = useState<
    Record<string, string>
  >({});

  const [loading, setLoading] = useState(true);
  const [siteSettingsLoading, setSiteSettingsLoading] = useState(true);
  const [categoryError, setCategoryError] = useState<string | null>(null);
  const [makkalBooksError, setMakkalBooksError] = useState<string | null>(null);

  const [site, setSite] =
    useState<PublicSiteSettings>(DEFAULT_SITE_SETTINGS);

  /*
   * Load homepage books
   *
   * Latest Arrivals and Homepage Highlights
   * are loaded separately so one does not affect
   * the other.
   */
  useEffect(() => {
    async function load() {
      setLoading(true);

      try {
        const [
          booksResult,
          highlightedBooksResult,
          authors,
          publishers,
        ] = await Promise.all([
          /*
           * Load enough arrivals to fill the compact tile layout.
           */
          listPublicBooks({
            pageSize: 12,
          }),

          /*
           * Homepage Highlights.
           * Admin-selected books only.
           */
          listPublicHighlightedBooks(),

          listPublicAuthorNames(),
          listPublicPublisherNames(),
        ]);

        setRecentBooks(booksResult.items);
        setHighlightedBooks(highlightedBooksResult);

        setAuthorNamesById(buildNameMap(authors));
        setPublisherNamesById(buildNameMap(publishers));
      } catch (error) {
        console.error("Unable to load homepage books:", error);
      } finally {
        setLoading(false);
      }
    }

    load();
  }, []);

  useEffect(() => {
    async function loadCategories() {
      try {
        const publicCategories = await listPublicCategories();
        setCategories(publicCategories);

        const makkalCategory = publicCategories.find(
          (category) => category.name.trim() === NO_DISCOUNT_CATEGORY_NAME
        );
        if (!makkalCategory) return;

        try {
          const result = await listPublicBooks({
            categoryId: makkalCategory.id,
            pageSize: 12,
          });
          setMakkalBooks(result.items);
        } catch (error) {
          console.error("Unable to load Makkal Pathippu books:", error);
          setMakkalBooksError("Unable to load books in this collection.");
        }
      } catch (error) {
        setCategoryError(
          error instanceof Error
            ? error.message
            : "Unable to load categories."
        );
      }
    }

    loadCategories();
  }, []);

  useEffect(() => {
    let active = true;

    async function loadCampaignOffer() {
      try {
        const supabase = createClient();
        const today = new Date().toISOString().slice(0, 10);
        const { data, error } = await supabase
          .from("offers")
          .select("*")
          .eq("status", "active")
          .lte("start_date", today)
          .gte("end_date", today)
          .order("end_date", { ascending: true })
          .limit(6);

        if (error) throw new Error(error.message);

        const offer = (data ?? []).find(
          (item) =>
            typeof item.campaign_poster_url === "string" &&
            item.campaign_poster_url.trim().length > 0 &&
            Number.isFinite(Number(item.discount_percentage))
        );
        if (!offer || !active) return;

        setCampaignOffer({
          id: offer.id,
          title: offer.title,
          discountPercentage: Number(offer.discount_percentage),
          endDate: offer.end_date,
          posterUrl: offer.campaign_poster_url,
        });
      } catch (error) {
        console.error("Unable to load homepage campaign banner:", error);
      }
    }

    void loadCampaignOffer();
    return () => {
      active = false;
    };
  }, []);

  /*
   * Load site settings
   */
  useEffect(() => {
    fetch("/api/site-settings", { cache: "no-store" })
      .then(async (response) => {
        if (!response.ok) {
          return;
        }

        const result = (await response.json()) as {
          site?: PublicSiteSettings;
        };

        if (result.site) {
          setSite({
            ...DEFAULT_SITE_SETTINGS,
            ...result.site,
          });
        }
      })
      .catch(() => undefined)
      .finally(() => setSiteSettingsLoading(false));

    return subscribeToSiteSettingsUpdates(({ site }) => {
      setSite({ ...DEFAULT_SITE_SETTINGS, ...site });
      setSiteSettingsLoading(false);
    });
  }, []);

  const arrivalsLoading = loading || siteSettingsLoading;

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
        loading={loading}
      />

      {/* =====================================================
          HOMEPAGE HIGHLIGHTS
          ===================================================== */}

      {!arrivalsLoading && highlightedBooks.length > 0 && (
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

        {arrivalsLoading ? (
          <div
            role="status"
            aria-label="Loading latest arrivals"
            className={
              site.arrivalsSliderEnabled
                ? "flex gap-3 overflow-hidden pb-3 sm:gap-4"
                : "grid grid-cols-2 items-stretch gap-2 sm:grid-cols-3 sm:gap-3 lg:grid-cols-4 xl:grid-cols-5"
            }
          >
            {Array.from(
              { length: site.arrivalsSliderEnabled ? 4 : 12 },
              (_, index) => (
                <div
                  key={index}
                  aria-hidden="true"
                  className={
                    site.arrivalsSliderEnabled
                      ? "min-w-[46%] snap-start sm:min-w-[31%] lg:min-w-[23%]"
                      : "min-w-0"
                  }
                >
                  <div className="aspect-[0.75] overflow-hidden rounded-lg border border-border bg-card">
                    <div className="h-[62%] bg-muted" />
                    <div className="h-[38%]" />
                  </div>
                </div>
              )
            )}
          </div>
        ) : site.arrivalsSliderEnabled ? (
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
                className="inline-flex min-h-10 shrink-0 items-center rounded-full border border-[#dddde6] bg-white px-4 text-sm font-medium text-[#202044] transition-colors hover:border-[#202044] hover:bg-[#fff2cf]"
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