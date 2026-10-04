"use client";

import { useCallback, useEffect, useState } from "react";
import { Filter, Search } from "lucide-react";

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
  const selectClass = "mt-1 w-full rounded-md border border-border bg-background px-3 py-2.5 text-sm";
  const labelClass = "block text-xs font-semibold uppercase text-muted-foreground";

  return (
    <div className="space-y-5">
      <label className={labelClass}>
        Category
        <select value={categoryId} onChange={(event) => onChange("categoryId", event.target.value)} className={selectClass}>
          <option value="">All categories</option>
          {categories.map((category) => <option key={category.id} value={category.id}>{category.name}</option>)}
        </select>
        {categoryError && <span role="alert" className="mt-1 block normal-case text-destructive">Unable to load categories: {categoryError}</span>}
      </label>

      <label className={labelClass}>
        Author
        <select value={authorId} onChange={(event) => onChange("authorId", event.target.value)} className={selectClass}>
          <option value="">All authors</option>
          {authors.map((author) => <option key={author.id} value={author.id}>{author.name}</option>)}
        </select>
      </label>

      <label className={labelClass}>
        Publisher
        <select value={publisherId} onChange={(event) => onChange("publisherId", event.target.value)} className={selectClass}>
          <option value="">All publishers</option>
          {publishers.map((publisher) => <option key={publisher.id} value={publisher.id}>{publisher.name}</option>)}
        </select>
      </label>

      <label className={labelClass}>
        Availability
        <select value={availability} onChange={(event) => onChange("availability", event.target.value)} className={selectClass}>
          <option value="all">All books</option>
          <option value="in-stock">In stock</option>
          <option value="out-of-stock">Unavailable</option>
        </select>
      </label>

      <fieldset>
        <legend className={labelClass}>Price range</legend>
        <div className="mt-1 grid grid-cols-2 gap-2">
          <label className="sr-only" htmlFor="catalog-min-price">Minimum price</label>
          <input id="catalog-min-price" type="number" min="0" inputMode="numeric" placeholder="Min ₹" value={minPrice} onChange={(event) => onChange("minPrice", event.target.value)} className={selectClass.replace("mt-1 ", "")} />
          <label className="sr-only" htmlFor="catalog-max-price">Maximum price</label>
          <input id="catalog-max-price" type="number" min="0" inputMode="numeric" placeholder="Max ₹" value={maxPrice} onChange={(event) => onChange("maxPrice", event.target.value)} className={selectClass.replace("mt-1 ", "")} />
        </div>
      </fieldset>

      <button type="button" onClick={onClear} className="text-sm font-medium text-primary underline underline-offset-4">
        Clear filters
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
  const [authorNamesById, setAuthorNamesById] = useState<Record<string, string>>({});
  const [publisherNamesById, setPublisherNamesById] = useState<Record<string, string>>({});
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

  const loadBooks = useCallback(async () => {
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
      setBooks(result.items);
      setTotal(result.totalItems);
    } catch (loadError) {
      setError(loadError instanceof Error ? loadError.message : "Unable to load books.");
      setBooks([]);
      setTotal(0);
    } finally {
      setLoading(false);
    }
  }, [search, categoryId, authorId, publisherId, availability, minPrice, maxPrice, sortBy, page]);

  useEffect(() => {
    void loadBooks();
  }, [loadBooks]);

  useEffect(() => {
    listPublicCategories()
      .then(setCategories)
      .catch((loadError: unknown) => {
        setCategoryError(loadError instanceof Error ? loadError.message : "Unable to load categories.");
      });

    Promise.all([listPublicAuthorNames(), listPublicPublisherNames()])
      .then(([authorItems, publisherItems]) => {
        setAuthors(authorItems);
        setPublishers(publisherItems);
        setAuthorNamesById(buildNameMap(authorItems));
        setPublisherNamesById(buildNameMap(publisherItems));
      })
      .catch(() => undefined);
  }, []);

  function updateFilter(key: string, value: string) {
    if (key === "categoryId") setCategoryId(value);
    if (key === "authorId") setAuthorId(value);
    if (key === "publisherId") setPublisherId(value);
    if (key === "availability") setAvailability(value as Availability);
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
    setPage(1);
  }

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
      <div className="container py-7 sm:py-10">
        <header className="flex flex-col gap-4 border-b border-border pb-6 sm:flex-row sm:items-end sm:justify-between">
          <div>
            <p className="text-xs font-semibold uppercase text-primary">Karisal Books · Catalog</p>
            <h1 className="mt-2 text-3xl font-semibold">Books</h1>
            <p className="mt-1 text-sm text-muted-foreground">Find Tamil literature, publishers and exam books.</p>
          </div>
          <label className="relative block w-full sm:max-w-sm">
            <span className="sr-only">Search books</span>
            <Search className="pointer-events-none absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-muted-foreground" aria-hidden="true" />
            <input
              type="search"
              value={search}
              onChange={(event) => { setSearch(event.target.value); setPage(1); }}
              placeholder="Search by title"
              className="h-11 w-full rounded-md border border-border bg-background pl-10 pr-3 text-sm"
            />
          </label>
        </header>

        <div className="grid gap-7 pt-6 lg:grid-cols-[220px_minmax(0,1fr)]">
          <aside className="hidden border-r border-border pr-5 lg:block">
            <div className="mb-5 flex items-center gap-2 border-b border-border pb-3 text-sm font-semibold">
              <Filter className="h-4 w-4" aria-hidden="true" />
              Refine books
            </div>
            {filters}
          </aside>

          <div className="min-w-0">
            <details className="mb-5 border-b border-border pb-4 lg:hidden">
              <summary className="flex min-h-10 cursor-pointer list-none items-center gap-2 text-sm font-semibold">
                <Filter className="h-4 w-4" aria-hidden="true" />
                Filters
              </summary>
              <div className="grid gap-4 pt-4 sm:grid-cols-2">{filters}</div>
            </details>

            <div className="mb-5 flex flex-wrap items-center justify-between gap-3">
              <p className="text-sm text-muted-foreground" aria-live="polite">{loading ? "Loading books…" : `${total} ${total === 1 ? "book" : "books"}`}</p>
              <label className="flex items-center gap-2 text-xs font-medium text-muted-foreground">
                Sort
                <select value={sortBy} onChange={(event) => { setSortBy(event.target.value as CatalogSort); setPage(1); }} className="h-10 rounded-md border border-border bg-background px-3 text-sm text-foreground">
                  <option value="newest">Newest</option>
                  <option value="title">Title A–Z</option>
                  <option value="price-asc">Price: low to high</option>
                  <option value="price-desc">Price: high to low</option>
                </select>
              </label>
            </div>

            {error && <p role="alert" className="py-8 text-center text-sm text-destructive">{error}</p>}
            {loading ? (
              <p className="py-12 text-center text-sm text-muted-foreground">Loading catalog…</p>
            ) : !error ? (
              <BookGrid books={books} authorNamesById={authorNamesById} publisherNamesById={publisherNamesById} />
            ) : null}

            {!loading && totalPages > 1 && (
              <nav aria-label="Catalog pages" className="mt-8 flex items-center justify-center gap-4 border-t border-border pt-5">
                <button type="button" disabled={page <= 1} onClick={() => setPage((current) => current - 1)} className="min-h-10 rounded-md border border-border px-4 text-sm disabled:opacity-40">Previous</button>
                <span className="text-sm tabular-nums text-muted-foreground">{page} / {totalPages}</span>
                <button type="button" disabled={page >= totalPages} onClick={() => setPage((current) => current + 1)} className="min-h-10 rounded-md border border-border px-4 text-sm disabled:opacity-40">Next</button>
              </nav>
            )}
          </div>
        </div>
      </div>
    </MainLayout>
  );
}