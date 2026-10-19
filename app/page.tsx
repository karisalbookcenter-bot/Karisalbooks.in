"use client";

import { useEffect, useState } from "react";
import Link from "next/link";
import {
  ArrowRight,
  BookOpen,
  BookOpenCheck,
  Boxes,
  CalendarClock,
  Crown,
  Sparkles,
  Tag,
} from "lucide-react";

import { MainLayout } from "@/components/layout/MainLayout";
import { BookGrid } from "@/features/storefront/components/BookGrid";
import { BookCarousel } from "@/features/storefront/components/BookCarousel";
import { buildNameMap } from "@/features/storefront/utils";
import { NO_DISCOUNT_CATEGORY_NAME } from "@/lib/helpers/book-pricing.helpers";

import {
  listPublicBooks,
  listPublicHighlightedBooks,
} from "@/features/storefront/services/book.storefront";

import { listPublicCategories } from "@/features/storefront/services/category.storefront";
import { listPublicSubcategories } from "@/features/storefront/services/subcategory.storefront";

import {
  listPublicAuthorNames,
  listPublicPublisherNames,
} from "@/features/storefront/services/author-publisher.storefront";

import type { Book } from "@/types/book.types";
import type { Category } from "@/types/category.types";
import type { Subcategory } from "@/types/subcategory.types";

import {
  DEFAULT_SITE_SETTINGS,
  type PublicSiteSettings,
} from "@/features/site-settings/site-settings.types";
import { subscribeToSiteSettingsUpdates } from "@/features/site-settings/site-settings.events";

export default function HomePage() {
  const [recentBooks, setRecentBooks] = useState<Book[]>([]);
  const [highlightedBooks, setHighlightedBooks] = useState<Book[]>([]);
  const [makkalBooks, setMakkalBooks] = useState<Book[]>([]);
  const [categories, setCategories] = useState<Category[]>([]);
  const [subcategoriesByCategoryId, setSubcategoriesByCategoryId] = useState<
    Record<string, Subcategory[]>
  >({});

  const [authorNamesById, setAuthorNamesById] = useState<
    Record<string, string>
  >({});

  const [publisherNamesById, setPublisherNamesById] = useState<
    Record<string, string>
  >({});

  const [loading, setLoading] = useState(true);
  const [siteSettingsLoading, setSiteSettingsLoading] = useState(true);
  const [categoryError, setCategoryError] = useState<string | null>(null);
  const [subcategoryError, setSubcategoryError] = useState<string | null>(null);
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

        try {
          const publicSubcategories = await listPublicSubcategories();
          setSubcategoriesByCategoryId(
            publicSubcategories.reduce<Record<string, Subcategory[]>>(
              (grouped, subcategory) => {
                (grouped[subcategory.category_id] ??= []).push(subcategory);
                return grouped;
              },
              {}
            )
          );
        } catch (error) {
          console.error("Unable to load homepage subcategories:", error);
          setSubcategoryError("Unable to load subcategories.");
        }

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
                className="group inline-flex min-h-11 items-center justify-center gap-1.5 rounded-full bg-white px-3 text-xs font-bold text-primary shadow-lg shadow-black/10 transition-all hover:-translate-y-0.5 hover:bg-emerald-50 hover:shadow-xl sm:gap-2 sm:px-5 sm:text-sm"
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
                className="inline-flex min-h-11 items-center justify-center gap-1.5 rounded-full border border-white/35 bg-white/5 px-3 text-xs font-semibold text-white transition-all hover:-translate-y-0.5 hover:bg-white/15 sm:gap-2 sm:px-5 sm:text-sm"
              >
                <BookOpen
                  className="h-3.5 w-3.5 sm:h-4 sm:w-4"
                  aria-hidden="true"
                />

                Recommendations
              </Link>

              <Link
                href="/membership/apply"
                className="inline-flex min-h-11 items-center justify-center gap-1.5 rounded-full border border-amber-300/80 bg-gradient-to-r from-amber-300 to-yellow-400 px-3 text-xs font-bold text-amber-950 shadow-md shadow-black/10 transition-all hover:-translate-y-0.5 hover:shadow-lg sm:gap-2 sm:px-5 sm:text-sm"
              >
                <Crown
                  className="h-4 w-4 sm:h-[18px] sm:w-[18px]"
                  aria-hidden="true"
                />

                Membership
              </Link>

              <Link
                href="/pre-booking"
                className="inline-flex min-h-11 items-center justify-center gap-1.5 rounded-full border border-sky-200/40 bg-sky-400/10 px-3 text-xs font-semibold text-white transition-all hover:-translate-y-0.5 hover:bg-sky-300/20 sm:gap-2 sm:px-5 sm:text-sm"
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

      <section className="container py-5 sm:py-7">
        <ul className="grid gap-2 sm:grid-cols-3 sm:gap-3">
          {[
            { icon: BookOpen, label: "Tamil books for every reader", style: "bg-primary/10 text-primary" },
            { icon: CalendarClock, label: "Delivery across India", style: "bg-sky-100 text-sky-800" },
            { icon: Crown, label: "Member benefits & offers", style: "bg-amber-100 text-amber-800" },
          ].map(({ icon: Icon, label, style }) => (
            <li key={label} className="flex items-center gap-3 rounded-xl border border-border/80 bg-card px-3 py-3 shadow-sm sm:px-4">
              <span className={`grid h-10 w-10 shrink-0 place-items-center rounded-full ${style}`}>
                <Icon size={18} aria-hidden="true" />
              </span>
              <span className="text-xs font-semibold text-foreground sm:text-sm">{label}</span>
            </li>
          ))}
        </ul>
      </section>

      {categoryError ? (
        <section className="container py-5 sm:py-7">
          <p role="alert" className="text-sm text-destructive">
            Unable to load categories: {categoryError}
          </p>
        </section>
      ) : categories.length > 0 ? (
        <section className="container py-6 sm:py-8" aria-labelledby="shop-categories">
          <div className="mb-4 flex flex-wrap items-end justify-between gap-3">
            <div>
              <p className="text-xs font-semibold uppercase tracking-[0.16em] text-primary">
                Find it faster
              </p>
              <h2 id="shop-categories" className="mt-1 text-xl font-semibold sm:text-2xl">
                Shop by category
              </h2>
            </div>
            <Link href="/books" className="text-sm font-semibold text-primary hover:underline">
              Browse all books <ArrowRight className="ml-1 inline h-4 w-4" aria-hidden="true" />
            </Link>
          </div>
          {subcategoryError && (
            <p role="alert" className="mb-3 text-sm text-destructive">
              {subcategoryError}
            </p>
          )}
          <div className="grid gap-3 sm:grid-cols-2 lg:grid-cols-3">
            {categories.map((category) => {
              const subcategories = subcategoriesByCategoryId[category.id] ?? [];
              return (
                <article
                  key={category.id}
                  className="group rounded-2xl border border-border bg-card p-4 shadow-sm transition-all hover:-translate-y-0.5 hover:border-primary/35 hover:shadow-md sm:p-5"
                >
                  <div className="flex items-start gap-3">
                    <span className="grid h-11 w-11 shrink-0 place-items-center rounded-2xl bg-primary/10 text-primary transition-colors group-hover:bg-primary group-hover:text-primary-foreground">
                      <BookOpen size={20} aria-hidden="true" />
                    </span>
                    <div className="min-w-0 pt-0.5">
                      <Link
                        href={`/categories/${encodeURIComponent(category.slug)}`}
                        className="text-base font-semibold text-foreground hover:text-primary"
                      >
                        {category.name}
                      </Link>
                      {category.description && (
                        <p className="mt-1 line-clamp-2 text-sm leading-6 text-muted-foreground">
                          {category.description}
                        </p>
                      )}
                    </div>
                  </div>
                  {subcategories.length > 0 && (
                    <ul className="mt-3 flex flex-wrap gap-2 border-t border-border pt-3">
                      {subcategories.map((subcategory) => (
                        <li key={subcategory.id}>
                          <Link
                            href={`/categories/${encodeURIComponent(category.slug)}?subcategoryId=${encodeURIComponent(subcategory.id)}`}
                            className="inline-flex min-h-9 items-center rounded-full border border-border/70 bg-secondary/70 px-3 text-xs font-medium text-secondary-foreground transition-colors hover:border-primary/30 hover:bg-primary hover:text-primary-foreground"
                          >
                            {subcategory.name}
                          </Link>
                        </li>
                      ))}
                    </ul>
                  )}
                </article>
              );
            })}
          </div>
        </section>
      ) : null}

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

      <section className="container py-7 sm:py-10" aria-labelledby="more-from-karisal">
        <div className="mb-5">
          <p className="text-xs font-semibold uppercase tracking-[0.16em] text-primary">
            More ways to read, order &amp; create
          </p>
          <h2 id="more-from-karisal" className="mt-1 text-xl font-semibold sm:text-2xl">
            Find the service you need
          </h2>
          <p className="mt-2 max-w-2xl text-sm leading-6 text-muted-foreground">
            Reader benefits, advance orders and publishing support — all easy to find.
          </p>
        </div>
        <div className="grid gap-3 sm:grid-cols-2 lg:grid-cols-3">
          {[
            {
              href: "/membership/apply",
              title: "Membership",
              description: "Explore member pricing on eligible books and membership benefits.",
              label: "READER PERKS",
              icon: Crown,
              tone: "border-amber-200 bg-amber-50 text-amber-800",
              iconTone: "bg-amber-200 text-amber-900",
            },
            {
              href: "/pre-booking",
              title: "Pre-booking",
              description: "Reserve selected upcoming titles during their booking window.",
              label: "EARLY ACCESS",
              icon: CalendarClock,
              tone: "border-sky-200 bg-sky-50 text-sky-800",
              iconTone: "bg-sky-200 text-sky-900",
            },
            {
              href: "/pre-booking?mode=bulk",
              title: "Bulk book orders",
              description: "Select titles and quantities for a larger book order.",
              label: "ORDER MORE",
              icon: Boxes,
              tone: "border-violet-200 bg-violet-50 text-violet-800",
              iconTone: "bg-violet-200 text-violet-900",
            },
            {
              href: "/publication-services",
              title: "Publish your book",
              description: "Plan your manuscript, printing and publishing with our team.",
              label: "FOR WRITERS",
              icon: BookOpenCheck,
              tone: "border-emerald-200 bg-emerald-50 text-emerald-800",
              iconTone: "bg-emerald-200 text-emerald-900",
            },
            {
              href: "/recommendations",
              title: "Book recommendations",
              description: "Discover handpicked titles for your next reading list.",
              label: "CURATED PICKS",
              icon: Sparkles,
              tone: "border-rose-200 bg-rose-50 text-rose-800",
              iconTone: "bg-rose-200 text-rose-900",
            },
            {
              href: "/customize",
              title: "Customize a book order",
              description: "Explore personalized book options for your special event.",
              label: "MAKE IT YOURS",
              icon: Tag,
              tone: "border-indigo-200 bg-indigo-50 text-indigo-800",
              iconTone: "bg-indigo-200 text-indigo-900",
            },
          ].map(({ href, title, description, label, icon: Icon, tone, iconTone }) => (
            <Link
              key={title}
              href={href}
              className="group flex min-h-44 flex-col rounded-2xl border border-border bg-card p-4 shadow-sm transition-all hover:-translate-y-1 hover:shadow-lg sm:p-5"
            >
              <span className="flex items-start justify-between gap-3">
                <span className={`grid h-12 w-12 place-items-center rounded-2xl ${iconTone}`}>
                  <Icon size={22} aria-hidden="true" />
                </span>
                <span className={`rounded-full border px-2.5 py-1 text-[10px] font-bold tracking-[0.08em] ${tone}`}>
                  {label}
                </span>
              </span>
              <span className="mt-4 text-base font-bold text-foreground">{title}</span>
              <span className="mt-1 flex-1 text-sm leading-6 text-muted-foreground">{description}</span>
              <span className="mt-4 inline-flex items-center gap-1 text-sm font-semibold text-primary">
                Explore
                <ArrowRight size={15} className="transition-transform group-hover:translate-x-1" aria-hidden="true" />
              </span>
            </Link>
          ))}
        </div>
      </section>

      {/* =====================================================
          CATEGORIES
          ===================================================== */}

    </MainLayout>
  );
}