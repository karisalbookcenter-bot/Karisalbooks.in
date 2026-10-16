"use client";

import { useEffect, useState } from "react";
import Link from "next/link";
import {
  ArrowRight,
  BookOpen,
  CalendarClock,
  Crown,
} from "lucide-react";

import { MainLayout } from "@/components/layout/MainLayout";
import { BookGrid } from "@/features/storefront/components/BookGrid";
import { BookCarousel } from "@/features/storefront/components/BookCarousel";
import { buildNameMap } from "@/features/storefront/utils";

import {
  listPublicBooks,
  listPublicHighlightedBooks,
} from "@/features/storefront/services/book.storefront";

import { listPublicCategories } from "@/features/storefront/services/category.storefront";

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

export default function HomePage() {
  const [recentBooks, setRecentBooks] = useState<Book[]>([]);
  const [highlightedBooks, setHighlightedBooks] = useState<Book[]>([]);
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

  /*
   * Load categories
   */
  useEffect(() => {
    listPublicCategories()
      .then(setCategories)
      .catch((error: unknown) => {
        setCategoryError(
          error instanceof Error
            ? error.message
            : "Unable to load categories."
        );
      });
  }, []);

  /*
   * Load site settings
   */
  useEffect(() => {
    fetch("/api/site-settings")
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
  }, []);

  const arrivalsLoading = loading || siteSettingsLoading;

  return (
    <MainLayout>
      {/* =====================================================
          HERO
          ===================================================== */}

      <section className="bg-primary text-primary-foreground">
        <div className="container grid gap-4 py-5 sm:gap-8 sm:py-16 lg:grid-cols-[minmax(0,1fr)_300px] lg:items-end">
          <div className="max-w-2xl">
            <p className="mb-3 text-xs font-semibold uppercase text-amber-200">
              தமிழ் · புத்தகம் · பதிப்பகம்
            </p>

            <h1 className="text-3xl font-semibold sm:text-5xl">
              Karisal Books
            </h1>

            <p className="mt-4 max-w-xl text-sm leading-6 text-primary-foreground/80 sm:text-base">
              {site.description}
            </p>

            <div className="mt-4 grid grid-cols-2 gap-2 sm:mt-7 sm:flex sm:flex-wrap sm:gap-3">
              <Link
                href="/books"
                className="inline-flex min-h-10 items-center justify-center gap-1.5 rounded-md bg-white px-2.5 text-xs font-semibold text-primary transition-colors hover:bg-emerald-50 sm:min-h-11 sm:gap-2 sm:px-5 sm:text-sm"
              >
                <BookOpen
                  className="h-3.5 w-3.5 sm:h-4 sm:w-4"
                  aria-hidden="true"
                />

                Browse books

                <ArrowRight
                  className="h-3.5 w-3.5 sm:h-4 sm:w-4"
                  aria-hidden="true"
                />
              </Link>

              <Link
                href="/recommendations"
                className="inline-flex min-h-10 items-center justify-center gap-1.5 rounded-md border border-white/35 px-2.5 text-xs font-semibold text-white transition-colors hover:bg-white/10 sm:min-h-11 sm:gap-2 sm:px-5 sm:text-sm"
              >
                <BookOpen
                  className="h-3.5 w-3.5 sm:h-4 sm:w-4"
                  aria-hidden="true"
                />

                Recommendations
              </Link>

              <Link
                href="/membership/apply"
                className="inline-flex min-h-10 items-center justify-center gap-1.5 rounded-md border border-white/35 px-2.5 text-xs font-semibold text-white transition-colors hover:bg-white/10 sm:min-h-11 sm:gap-2 sm:px-5 sm:text-sm"
              >
                <Crown
                  className="h-3.5 w-3.5 sm:h-4 sm:w-4"
                  aria-hidden="true"
                />

                Membership
              </Link>

              <Link
                href="/pre-booking"
                className="inline-flex min-h-10 items-center justify-center gap-1.5 rounded-md border border-white/35 px-2.5 text-xs font-semibold text-white transition-colors hover:bg-white/10 sm:min-h-11 sm:gap-2 sm:px-5 sm:text-sm"
              >
                <CalendarClock
                  className="h-3.5 w-3.5 sm:h-4 sm:w-4"
                  aria-hidden="true"
                />

                Pre-book a title
              </Link>
            </div>
          </div>

          <div className="hidden border-l border-white/20 pl-6 text-sm leading-6 text-primary-foreground/75 lg:block">
            Curated titles from Tamil publishers, with delivery across India.
          </div>
        </div>
      </section>

      {/* =====================================================
          HOMEPAGE HIGHLIGHTS
          ===================================================== */}

      {!arrivalsLoading && highlightedBooks.length > 0 && (
        <section className="container py-6 sm:py-8">
          <div className="mb-3">
            <p className="text-xs font-semibold uppercase tracking-wide text-primary">
              Featured
            </p>

            <h2 className="mt-1 text-xl font-semibold">
              Homepage Highlights
            </h2>

            <p className="mt-1 text-sm text-muted-foreground">
              முக்கியமாக highlight செய்யப்பட்ட புத்தகங்கள்
            </p>
          </div>

          <BookGrid
            books={highlightedBooks}
            authorNamesById={authorNamesById}
            publisherNamesById={publisherNamesById}
            prioritizeFirstImage
            compact
          />
        </section>
      )}

      {/* =====================================================
          LATEST ARRIVALS
          ===================================================== */}

      <section className="container py-6 sm:py-8">
        <h2 className="mb-3 text-xl font-semibold">
          {site.arrivalsTitle}
        </h2>

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
                  <div className="aspect-[0.9] overflow-hidden rounded-lg border border-border bg-card">
                    <div className="h-[55%] bg-muted" />
                    <div className="h-[45%]" />
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
            compact
          />
        ) : (
          <BookGrid
            books={recentBooks}
            authorNamesById={authorNamesById}
            publisherNamesById={publisherNamesById}
            prioritizeFirstImage={highlightedBooks.length === 0}
            compact
          />
        )}
      </section>

      {/* =====================================================
          CATEGORIES
          ===================================================== */}

      {(categories.length > 0 || categoryError) && (
        <section className="container py-8">
          <h2 className="mb-4 text-xl font-semibold">
            Shop by category
          </h2>

          {categoryError ? (
            <p
              role="alert"
              className="text-sm text-destructive"
            >
              Unable to load categories: {categoryError}
            </p>
          ) : (
            <div className="flex flex-wrap gap-2">
              {categories.map((category) => (
                <Link
                  key={category.id}
                  href={`/categories/${category.id}`}
                  className="rounded-md border border-border bg-card px-4 py-2 text-sm font-medium transition-colors hover:border-primary/40 hover:bg-secondary"
                >
                  {category.name}
                </Link>
              ))}
            </div>
          )}
        </section>
      )}

      {/* =====================================================
          BOTTOM PROMOTIONAL SECTIONS
          ===================================================== */}

      <section className="border-y border-border bg-card">
        <div className="container grid grid-cols-2 gap-2 py-4 sm:grid-cols-4 sm:gap-3 sm:py-6">
          {[
            { href: "/recommendations", label: "For Readers" },
            { href: "/publication-services", label: "For New Writers" },
            { href: "/pre-booking?mode=bulk", label: "Bulk Booking" },
            { href: "/customize", label: "Customize" },
          ].map(({ href, label }) => (
            <Link
              key={label}
              href={href}
              className="inline-flex min-h-11 items-center justify-center gap-2 rounded-md border border-border bg-background px-3 text-center text-xs font-semibold text-foreground transition-colors hover:border-primary/50 hover:bg-secondary sm:text-sm"
            >
              {label}
              <ArrowRight size={14} aria-hidden="true" />
            </Link>
          ))}
        </div>
      </section>
    </MainLayout>
  );
}