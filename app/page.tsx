"use client";

import { useEffect, useState } from "react";
import Link from "next/link";
import { MainLayout } from "@/components/layout/MainLayout";
import { BookGrid } from "@/features/storefront/components/BookGrid";
import { buildNameMap } from "@/features/storefront/utils";
import { listPublicBooks } from "@/features/storefront/services/book.storefront";
import { listPublicCategories } from "@/features/storefront/services/category.storefront";
import { listPublicAuthorNames, listPublicPublisherNames } from "@/features/storefront/services/author-publisher.storefront";
import type { Book } from "@/types/book.types";
import type { Category } from "@/types/category.types";

export default function HomePage() {
  const [recentBooks, setRecentBooks] = useState<Book[]>([]);
  const [categories, setCategories] = useState<Category[]>([]);
  const [authorNamesById, setAuthorNamesById] = useState<Record<string, string>>({});
  const [publisherNamesById, setPublisherNamesById] = useState<Record<string, string>>({});
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    async function load() {
      setLoading(true);
      try {
        const [booksResult, categoriesResult, authors, publishers] = await Promise.all([
          listPublicBooks({ pageSize: 8 }),
          listPublicCategories(),
          listPublicAuthorNames(),
          listPublicPublisherNames(),
        ]);
        setRecentBooks(booksResult.items);
        setCategories(categoriesResult.filter((c) => c.parent_id === null));
        setAuthorNamesById(buildNameMap(authors));
        setPublisherNamesById(buildNameMap(publishers));
      } finally {
        setLoading(false);
      }
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
          <BookGrid books={recentBooks} authorNamesById={authorNamesById} publisherNamesById={publisherNamesById} />
        )}
      </section>
    </MainLayout>
  );
}
