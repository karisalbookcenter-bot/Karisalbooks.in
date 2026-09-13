"use client";

import { useEffect, useState, useCallback } from "react";
import { MainLayout } from "@/components/layout/MainLayout";
import { SearchBar } from "@/components/common";
import { BookGrid } from "@/features/storefront/components/BookGrid";
import { buildNameMap } from "@/features/storefront/utils";
import { PUBLIC_VISIBLE_STATUS } from "@/features/storefront/constants";
import * as bookService from "@/features/books/services/book.service";
import { authorService } from "@/features/authors/services/author.service";
import { publisherService } from "@/features/publishers/services/publisher.service";
import * as categoryService from "@/features/categories/services/category.service";
import type { Book } from "@/types/book.types";
import type { Category } from "@/types/category.types";

const PAGE_SIZE = 12;

/**
 * Book listing page — Sprint 18. `SearchBar` reused from
 * `@/components/common` — the same component `BookToolbar.tsx` (admin)
 * already uses, not a new search input. Pagination is a plain Prev/Next
 * pair rather than the shared `Pagination` component: that component's
 * prop contract was never independently verified (two different shapes
 * were guessed at across Sprint 15 and the real, uploaded
 * `SubcategoryManagementOverview.tsx`), so a third guess is avoided here
 * in favor of two buttons built directly on `listBooks`'s own
 * `page`/`total`/`pageSize` fields.
 */
export default function BooksPage() {
  const [books, setBooks] = useState<Book[]>([]);
  const [total, setTotal] = useState(0);
  const [categories, setCategories] = useState<Category[]>([]);
  const [authorNamesById, setAuthorNamesById] = useState<Record<string, string>>({});
  const [publisherNamesById, setPublisherNamesById] = useState<Record<string, string>>({});
  const [search, setSearch] = useState("");
  const [categoryId, setCategoryId] = useState<string>("");
  const [page, setPage] = useState(1);
  const [loading, setLoading] = useState(true);

  const loadBooks = useCallback(async () => {
    setLoading(true);
    const result = await bookService.listBooks({
      statuses: [PUBLIC_VISIBLE_STATUS],
      search: search || undefined,
      categoryId: categoryId || undefined,
      page,
      pageSize: PAGE_SIZE,
    });
    if (result.data) {
      setBooks(result.data.items);
      setTotal(result.data.total);
    }
    setLoading(false);
  }, [search, categoryId, page]);

  useEffect(() => {
    loadBooks();
  }, [loadBooks]);

  // Categories/authors/publishers fetched once — same "fetch once,
  // resolve/filter many" pattern as the home page.
  useEffect(() => {
    categoryService
      .listCategories({ status: PUBLIC_VISIBLE_STATUS, pageSize: 1000 })
      .then((r) => r.data && setCategories(r.data.items));
    authorService.list({ pageSize: 1000 }).then((r) => r.data && setAuthorNamesById(buildNameMap(r.data.items)));
    publisherService
      .list({ pageSize: 1000 })
      .then((r) => r.data && setPublisherNamesById(buildNameMap(r.data.items)));
  }, []);

  const totalPages = Math.max(1, Math.ceil(total / PAGE_SIZE));

  return (
    <MainLayout>
      <div className="container flex flex-col gap-6 py-8">
        <h1 className="text-2xl font-semibold">All Books</h1>

        <div className="flex flex-wrap items-center gap-3">
          <SearchBar
            value={search}
            onChange={(value) => {
              setSearch(value);
              setPage(1);
            }}
            placeholder="Search by title, ISBN, or description…"
          />
          <select
            value={categoryId}
            onChange={(e) => {
              setCategoryId(e.target.value);
              setPage(1);
            }}
            className="rounded-md border border-border bg-background px-3 py-2 text-sm"
          >
            <option value="">All categories</option>
            {categories.map((c) => (
              <option key={c.id} value={c.id}>
                {c.name}
              </option>
            ))}
          </select>
        </div>

        {loading ? (
          <p className="text-sm text-muted-foreground">Loading…</p>
        ) : (
          <BookGrid books={books} authorNamesById={authorNamesById} publisherNamesById={publisherNamesById} />
        )}

        {!loading && totalPages > 1 && (
          <div className="flex items-center justify-center gap-4 pt-4">
            <button
              type="button"
              disabled={page <= 1}
              onClick={() => setPage((p) => p - 1)}
              className="rounded-md border border-border px-4 py-2 text-sm disabled:opacity-40"
            >
              Previous
            </button>
            <span className="text-sm text-muted-foreground">
              Page {page} of {totalPages}
            </span>
            <button
              type="button"
              disabled={page >= totalPages}
              onClick={() => setPage((p) => p + 1)}
              className="rounded-md border border-border px-4 py-2 text-sm disabled:opacity-40"
            >
              Next
            </button>
          </div>
        )}
      </div>
    </MainLayout>
  );
}
