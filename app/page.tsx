npm run dev"use client";

import { useEffect, useState } from "react";
import Link from "next/link";
import { MainLayout } from "@/components/layout/MainLayout";
import { BookGrid } from "@/features/storefront/components/BookGrid";
import { buildNameMap } from "@/features/storefront/utils";
import { PUBLIC_VISIBLE_STATUS } from "@/features/storefront/constants";
import * as bookService from "@/features/books/services/book.service";
import { authorService } from "@/features/authors/services/author.service";
import { publisherService } from "@/features/publishers/services/publisher.service";
import * as categoryService from "@/features/categories/services/category.service";
import type { Book } from "@/types/book.types";
import type { Category } from "@/types/category.types";

/**
 * Home page — Sprint 18. Replaces the real Day-1 placeholder
 * (`MainLayout` wrapper reused exactly as it already was — nothing about
 * `MainLayout` itself changes). Shows recent books + top-level categories
 * to browse; no cart/login/checkout, per this sprint's explicit scope.
 */
export default function HomePage() {
  const [recentBooks, setRecentBooks] = useState<Book[]>([]);
  const [categories, setCategories] = useState<Category[]>([]);
  const [authorNamesById, setAuthorNamesById] = useState<Record<string, string>>({});
  const [publisherNamesById, setPublisherNamesById] = useState<Record<string, string>>({});
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    async function load() {
      setLoading(true);
      const [booksResult, categoriesResult, authorsResult, publishersResult] = await Promise.all([
        bookService.listBooks({
          statuses: [PUBLIC_VISIBLE_STATUS],
          sortBy: "created_at",
          sortDirection: "desc",
          pageSize: 8,
        }),
        categoryService.listCategories({ status: PUBLIC_VISIBLE_STATUS, pageSize: 100 }),
        authorService.list({ pageSize: 1000 }),
        publisherService.list({ pageSize: 1000 }),
      ]);

      if (booksResult.data) setRecentBooks(booksResult.data.items);
      if (categoriesResult.data) {
        // Top-level only (parent_id === null) — subcategory-level browsing
        // happens via chips on /categories/[slug], not here.
        setCategories(categoriesResult.data.items.filter((c) => c.parent_id === null));
      }
      if (authorsResult.data) setAuthorNamesById(buildNameMap(authorsResult.data.items));
      if (publishersResult.data) setPublisherNamesById(buildNameMap(publishersResult.data.items));
      setLoading(false);
    }
    load();
  }, []);

  return (
    <MainLayout>
      <section className="container flex flex-col items-center gap-4 py-16 text-center">
        <h1 className="text-4xl font-semibold tracking-tight sm:text-5xl">Bookery</h1>
        <p className="max-w-md text-muted-foreground">
          Browse our catalog and find your next great read.
        </p>
        <Link
          href="/books"
          className="mt-2 rounded-md bg-primary px-5 py-2 text-sm font-medium text-primary-foreground"
        >
          Browse all books
        </Link>
      </section>

      {categories.length > 0 && (
        <section className="container py-8">
          <h2 className="mb-4 text-xl font-semibold">Shop by category</h2>
          <div className="flex flex-wrap gap-2">
            {categories.map((category) => (
              <Link
                key={category.id}
                href={`/categories/${category.slug}`}
                className="rounded-full border border-border px-4 py-2 text-sm hover:bg-muted"
              >
                {category.name}
              </Link>
            ))}
          </div>
        </section>
      )}

      <section className="container py-8">
        <h2 className="mb-4 text-xl font-semibold">Recently added</h2>
        {loading ? (
          <p className="text-sm text-muted-foreground">Loading…</p>
        ) : (
          <BookGrid
            books={recentBooks}
            authorNamesById={authorNamesById}
            publisherNamesById={publisherNamesById}
          />
        )}
      </section>
    </MainLayout>
  );
}
npm run dev
