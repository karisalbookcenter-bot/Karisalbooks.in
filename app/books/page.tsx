
"use client";

import { useCallback, useEffect, useRef, useState } from "react";
import { Filter, Search, RotateCcw } from "lucide-react";

import { MainLayout } from "@/components/layout/MainLayout";
import { BookGrid } from "@/features/storefront/components/BookGrid";
import {
  listPublicBooks,
  type ListPublicBooksParams,
} from "@/features/storefront/services/book.storefront";
import { listPublicCategories } from "@/features/storefront/services/category.storefront";
import {
  listPublicAuthorNames,
  listPublicPublisherNames,
  type PublicNameRecord,
} from "@/features/storefront/services/author-publisher.storefront";
import { buildNameMap } from "@/features/storefront/utils";

import type { Book } from "@/types/book.types";
import type { Category } from "@/types/category.types";

const PAGE_SIZE = 12;

type CatalogSort = NonNullable<ListPublicBooksParams["sortBy"]>;
type Availability = NonNullable<ListPublicBooksParams["availability"]>;

interface FilterFieldsProps {
  categories: Category[];
  categoryError: string | null;
  authors: PublicNameRecord[];
  publishers: PublicNameRecord[];
  categoryId: string;
  authorId: string;
  publisherId: string;
  availability: Availability;
  minPrice: string;
  maxPrice: string;
  onChange: (key: string, value: string) => void;
  onClear: () => void;
}

const controlClass =
  "mt-1.5 min-h-12 w-full rounded-lg border border-border bg-background px-3 text-base text-foreground " +
  "focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-primary focus-visible:ring-offset-2";

const labelClass = "block text-sm font-medium text-foreground";

function FilterFields({
  categories,
  categoryError,
  authors,
  publishers,
  categoryId,
  authorId,
  publisherId,
  availability,
  minPrice,
  maxPrice,
  onChange,
  onClear,
}: FilterFieldsProps) {
  return (
    <div className="space-y-5">
      <label className={labelClass}>
        Category
        <select
          value={categoryId}
          onChange={(event) => onChange("categoryId", event.target.value)}
          className={controlClass}
        >
          <option value="">All categories</option>
          {categories.map((category) => (
            <option key={category.id} value={category.id}>
              {category.name}
            </option>
          ))}
        </select>

        {categoryError && (
          <span role="alert" className="mt-2 block text-sm text-destructive">
            Categories could not be loaded. Please try refreshing the page.
          </span>
        )}
      </label>

      <label className={labelClass}>
        Author
        <select
          value={authorId}
          onChange={(event) => onChange("authorId", event.target.value)}
          className={controlClass}
        >
          <option value="">All authors</option>
          {authors.map((author) => (
            <option key={author.id} value={author.id}>
              {author.name}
            </option>
          ))}
        </select>
      </label>

      <label className={labelClass}>
        Publisher
        <select
          value={publisherId}
          onChange={(event) => onChange("publisherId", event.target.value)}
          className={controlClass}
        >
          <option value="">All publishers</option>
          {publishers.map((publisher) => (
            <option key={publisher.id} value={publisher.id}>
              {publisher.name}
            </option>
          ))}
        </select>
      </label>

      <label className={labelClass}>
        Availability
        <select
          value={availability}
          onChange={(event) => onChange("availability", event.target.value)}
          className={controlClass}
        >
          <option value="all">All books</option>
          <option value="in-stock">In stock</option>
          <option value="out-of-stock">Out of stock</option>
        </select>
      </label>

      <fieldset>
        <legend className={labelClass}>Price range (₹)</legend>
        <div className="mt-1.5 grid grid-cols-2 gap-3">
          <label className="block text-sm text-muted-foreground">
            Minimum
            <input
              type="number"
              min="0"
              step="1"
              inputMode="numeric"
              placeholder="₹ Min"
              value={minPrice}
              onChange={(event) => onChange("minPrice", event.target.value)}
              className={controlClass}
            />
          </label>

          <label className="block text-sm text-muted-foreground">
            Maximum
            <input
              type="number"
              min="0"
              step="1"
              inputMode="numeric"
              placeholder="₹ Max"
              value={maxPrice}
              onChange={(event) => onChange("maxPrice", event.target.value)}
              className={controlClass}
            />
          </label>
        </div>
      </fieldset>

      <button
        type="button"
        onClick={onClear}
        className="inline-flex min-h-11 items-center gap-2 rounded-lg text-sm font-semibold text-primary underline-offset-4 hover:underline focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-primary"
      >
        <RotateCcw className="h-4 w-4" aria-hidden="true" />
        Clear all filters
      </button>
    </div>
  );
}

export default function BooksPage() {
  const [books, setBooks] = useState<Book[]>([]);
  const [total, setTotal] = useState(0);

  const [categories, setCategories] = useState<Category[]>([]);
  const [authors, setAuthors] = useState<PublicNameRecord[]>([]);
  const [publishers, setPublishers] = useState<PublicNameRecord[]>([]);

  const [authorNamesById, setAuthorNamesById] = useState<
    Record<string, string>
  >({});
  const [publisherNamesById, setPublisherNamesById] = useState<
    Record<string, string>
  >({});

  const [search, setSearch] = useState("");
  const [categoryId, setCategoryId] = useState("");
  const [authorId, setAuthorId] = useState("");
  const [publisherId, setPublisherId] = useState("");
  const [availability, setAvailability] = useState<Availability>("all");
  const [minPrice, setMinPrice] = useState("");
  const [maxPrice, setMaxPrice] = useState("");
  const [sortBy, setSortBy] = useState<CatalogSort>("newest");
  const [page, setPage] = useState(1);

  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");
  const [categoryError, setCategoryError] = useState<string | null>(null);

  const requestIdRef = useRef(0);

  const loadBooks = useCallback(async () => {
    const requestId = ++requestIdRef.current;

    setLoading(true);
    setError("");

    try {
      const result = await listPublicBooks({
        search: search.trim() || undefined,
        categoryId: categoryId || undefined,
        authorId: authorId || undefined,
        publisherId: publisherId || undefined,
        availability,
        minPrice: minPrice ? Number(minPrice) : undefined,
        maxPrice: maxPrice ? Number(maxPrice) : undefined,
        sortBy,
        page,
        pageSize: PAGE_SIZE,
      });

      // Ignore outdated results if the user changes filters quickly.
      if (requestId !== requestIdRef.current) return;

      setBooks(result.items);
      setTotal(result.totalItems);
    } catch (loadError) {
      if (requestId !== requestIdRef.current) return;

      setError(
        loadError instanceof Error
          ? loadError.message
          : "Unable to load books. Please try again."
      );
      setBooks([]);
      setTotal(0);
    } finally {
      if (requestId === requestIdRef.current) {
        setLoading(false);
      }
    }
  }, [
    search,
    categoryId,
    authorId,
    publisherId,
    availability,
    minPrice,
    maxPrice,
    sortBy,
    page,
  ]);

  useEffect(() => {
    void loadBooks();
  }, [loadBooks]);

  useEffect(() => {
    let active = true;

    listPublicCategories()
      .then((items) => {
        if (active) {
          setCategories(items);
          setCategoryError(null);
        }
      })
      .catch(() => {
        if (active) {
          setCategoryError("Unable to load categories.");
        }
      });

    Promise.all([listPublicAuthorNames(), listPublicPublisherNames()])
      .then(([authorItems, publisherItems]) => {
        if (!active) return;

        setAuthors(authorItems);
        setPublishers(publisherItems);
        setAuthorNamesById(buildNameMap(authorItems));
        setPublisherNamesById(buildNameMap(publisherItems));
      })
      .catch(() => {
        // Keep the catalogue usable if optional filter data fails.
      });

    return () => {
      active = false;
    };
  }, []);

  function updateFilter(key: string, value: string) {
    if (key === "categoryId") setCategoryId(value);
    if (key === "authorId") setAuthorId(value);
    if (key === "publisherId") setPublisherId(value);

    if (key === "availability") {
      setAvailability(value as Availability);
    }

    if (key === "minPrice") setMinPrice(value);
    if (key === "maxPrice") setMaxPrice(value);

    setPage(1);
  }

  function clearFilters() {
    setCategoryId("");
    setAuthorId("");
    setPublisherId("");
    setAvailability("all");
    setMinPrice("");
    setMaxPrice("");
    setSearch("");
    setSortBy("newest");
    setPage(1);
  }

  const activeFilterCount = [
    categoryId,
    authorId,
    publisherId,
    availability !== "all" ? availability : "",
    minPrice,
    maxPrice,
  ].filter(Boolean).length;

  const filters = (
    <FilterFields
      categories={categories}
      categoryError={categoryError}
      authors={authors}
      publishers={publishers}
      categoryId={categoryId}
      authorId={authorId}
      publisherId={publisherId}
      availability={availability}
      minPrice={minPrice}
      maxPrice={maxPrice}
      onChange={updateFilter}
      onClear={clearFilters}
    />
  );

  const totalPages = Math.max(1, Math.ceil(total / PAGE_SIZE));

  return (
    <MainLayout>
      <main className="container py-6 sm:py-10">
        <header className="border-b border-border pb-6">
          <p className="text-sm font-semibold text-primary">
            Karisal Books
          </p>

          <h1 className="mt-2 text-3xl font-bold tracking-tight sm:text-4xl">
            Books
          </h1>

          <p className="mt-2 max-w-2xl text-base leading-7 text-muted-foreground">
            Find Tamil literature, publishers and exam books.
          </p>

          <label className="relative mt-5 block w-full">
            <span className="sr-only">Search books by title</span>

            <Search
              className="pointer-events-none absolute left-4 top-1/2 h-5 w-5 -translate-y-1/2 text-muted-foreground"
              aria-hidden="true"
            />

            <input
              type="search"
              value={search}
              onChange={(event) => {
                setSearch(event.target.value);
                setPage(1);
              }}
              placeholder="Search by book title..."
              autoComplete="off"
              className="min-h-14 w-full rounded-xl border border-border bg-background pl-12 pr-4 text-base text-foreground placeholder:text-muted-foreground focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-primary focus-visible:ring-offset-2"
            />
          </label>
        </header>

        <div className="grid gap-7 pt-6 lg:grid-cols-[250px_minmax(0,1fr)]">
          <aside className="hidden border-r border-border pr-6 lg:block">
            <div className="mb-5 flex items-center gap-2 border-b border-border pb-4">
              <Filter className="h-5 w-5" aria-hidden="true" />
              <h2 className="text-lg font-semibold">Filter books</h2>
            </div>

            {filters}
          </aside>

          <div className="min-w-0">
            <details className="mb-5 rounded-xl border border-border lg:hidden">
              <summary className="flex min-h-14 cursor-pointer list-none items-center justify-between gap-3 rounded-xl px-4 text-base font-semibold focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-primary">
                <span className="flex items-center gap-3">
                  <Filter className="h-5 w-5" aria-hidden="true" />
                  Filter books
                  {activeFilterCount > 0 && (
                    <span className="rounded-full bg-primary px-2.5 py-1 text-sm text-primary-foreground">
                      {activeFilterCount}
                    </span>
                  )}
                </span>

                <span className="text-sm font-medium text-primary">
                  Show
                </span>
              </summary>

              <div className="border-t border-border p-4">
                {filters}
              </div>
            </details>

            <div className="mb-5 flex flex-col gap-3 border-b border-border pb-4 sm:flex-row sm:items-center sm:justify-between">
              <p
                className="text-base text-muted-foreground"
                aria-live="polite"
                aria-atomic="true"
              >
                {loading
                  ? "Loading books..."
                  : error
                    ? "Books could not be loaded"
                    : `${total} ${total === 1 ? "book" : "books"} found`}
              </p>

              <label className="flex flex-col gap-1.5 text-sm font-medium sm:flex-row sm:items-center sm:gap-3">
                Sort by
                <select
                  value={sortBy}
                  onChange={(event) => {
                    setSortBy(event.target.value as CatalogSort);
                    setPage(1);
                  }}
                  className="min-h-12 rounded-lg border border-border bg-background px-3 text-base text-foreground focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-primary"
                >
                  <option value="newest">Newest first</option>
                  <option value="title">Title A–Z</option>
                  <option value="price-asc">Price: low to high</option>
                  <option value="price-desc">Price: high to low</option>
                </select>
              </label>
            </div>

            {error ? (
              <section
                role="alert"
                className="rounded-xl border border-border px-5 py-10 text-center"
              >
                <h2 className="text-xl font-semibold">
                  We couldn&apos;t load the books
                </h2>

                <p className="mt-2 text-base leading-7 text-muted-foreground">
                  Please check your connection and try again.
                </p>

                <button
                  type="button"
                  onClick={() => void loadBooks()}
                  className="mt-5 inline-flex min-h-12 items-center justify-center gap-2 rounded-lg bg-primary px-6 text-base font-semibold text-primary-foreground focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-primary focus-visible:ring-offset-2"
                >
                  <RotateCcw className="h-4 w-4" aria-hidden="true" />
                  Try again
                </button>
              </section>
            ) : loading ? (
              <section
                aria-label="Loading books"
                aria-busy="true"
                className="py-12 text-center"
              >
                <div
                  className="mx-auto h-8 w-8 animate-spin rounded-full border-4 border-border border-t-primary"
                  aria-hidden="true"
                />
                <p className="mt-4 text-base text-muted-foreground">
                  Loading books. Please wait...
                </p>
              </section>
            ) : books.length === 0 ? (
              <section className="rounded-xl border border-border px-5 py-12 text-center">
                <Search
                  className="mx-auto h-9 w-9 text-muted-foreground"
                  aria-hidden="true"
                />

                <h2 className="mt-4 text-xl font-semibold">
                  No books found
                </h2>

                <p className="mt-2 text-base leading-7 text-muted-foreground">
                  Try a different title or clear the filters to see more books.
                </p>

                <button
                  type="button"
                  onClick={clearFilters}
                  className="mt-5 inline-flex min-h-12 items-center justify-center gap-2 rounded-lg border border-border px-5 text-base font-semibold hover:bg-muted focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-primary"
                >
                  <RotateCcw className="h-4 w-4" aria-hidden="true" />
                  Show all books
                </button>
              </section>
            ) : (
              <div aria-busy={loading}>
                <BookGrid
                  books={books}
                  authorNamesById={authorNamesById}
                  publisherNamesById={publisherNamesById}
                />
              </div>
            )}

            {!loading && !error && totalPages > 1 && (
              <nav
                aria-label="Catalog pages"
                className="mt-8 flex flex-wrap items-center justify-center gap-4 border-t border-border pt-5"
              >
                <button
                  type="button"
                  disabled={page <= 1}
                  onClick={() => setPage((current) => current - 1)}
                  className="min-h-12 rounded-lg border border-border px-5 text-base font-medium disabled:cursor-not-allowed disabled:opacity-40 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-primary"
                >
                  Previous
                </button>

                <span
                  className="text-base tabular-nums"
                  aria-current="page"
                >
                  Page {page} of {totalPages}
                </span>

                <button
                  type="button"
                  disabled={page >= totalPages}
                  onClick={() => setPage((current) => current + 1)}
                  className="min-h-12 rounded-lg border border-border px-5 text-base font-medium disabled:cursor-not-allowed disabled:opacity-40 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-primary"
                >
                  Next
                </button>
              </nav>
            )}
          </div>
        </div>
      </main>
    </MainLayout>
  );
}