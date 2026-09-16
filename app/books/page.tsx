"use client";

import { useEffect, useState, useCallback } from "react";
import { MainLayout } from "@/components/layout/MainLayout";
import { BookGrid } from "@/features/storefront/components/BookGrid";
import { buildNameMap } from "@/features/storefront/utils";
import { listPublicBooks } from "@/features/storefront/services/book.storefront";
import { listPublicCategories } from "@/features/storefront/services/category.storefront";
import { listPublicAuthorNames, listPublicPublisherNames } from "@/features/storefront/services/author-publisher.storefront";
import type { Book } from "@/types/book.types";
import type { Category } from "@/types/category.types";

const PAGE_SIZE = 12;

export default function BooksPage() {
  const [books, setBooks] = useState<Book[]>([]);
  const [total, setTotal] = useState(0);
  const [categories, setCategories] = useState<Category[]>([]);
  const [authorNamesById, setAuthorNamesById] = useState<Record<string, string>>({});
  const [publisherNamesById, setPublisherNamesById] = useState<Record<string, string>>({});
  const [search, setSearch] = useState("");
  const [categoryId, setCategoryId] = useState("");
  const [page, setPage] = useState(1);
  const [loading, setLoading] = useState(true);

  const loadBooks = useCallback(async () => {
    setLoading(true);
    try {
      const result = await listPublicBooks({
        search: search || undefined,
        categoryId: categoryId || undefined,
        page,
        pageSize: PAGE_SIZE,
      });
      setBooks(result.items);
      setTotal(result.total);
    } finally {
      setLoading(false);
    }
  }, [search, categoryId, page]);

  useEffect(() => {
    loadBooks();
  }, [loadBooks]);

  useEffect(() => {
    listPublicCategories().then(setCategories);
    listPublicAuthorNames().then((items) => setAuthorNamesById(buildNameMap(items)));
    listPublicPublisherNames().then((items) => setPublisherNamesById(buildNameMap(items)));
  }, []);

  const totalPages = Math.max(1, Math.ceil(total / PAGE_SIZE));

  return (
    <MainLayout>
      <div className="container flex flex-col gap-6 py-8">
        <h1 className="text-2xl font-semibold">All Books</h1>

        <div className="flex flex-wrap items-center gap-3">
          <input
            type="search"
            value={search}
            onChange={(e) => {
              setSearch(e.target.value);
              setPage(1);
            }}
            placeholder="Search by title…"
            className="w-64 rounded-md border border-border bg-background px-3 py-2 text-sm"
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
