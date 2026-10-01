"use client";

import { useEffect, useState } from "react";
import Link from "next/link";
import { ArrowRight, BookOpen, Crown } from "lucide-react";
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
      <section className="bg-primary text-primary-foreground">
        <div className="container grid gap-8 py-12 sm:py-16 lg:grid-cols-[minmax(0,1fr)_300px] lg:items-end">
          <div className="max-w-2xl">
            <p className="mb-3 text-xs font-semibold uppercase text-amber-200">தமிழ் · புத்தகம் · பதிப்பகம்</p>
            <h1 className="text-3xl font-semibold sm:text-5xl">Karisal Books</h1>
            <p className="mt-4 max-w-xl text-sm leading-6 text-primary-foreground/80 sm:text-base">
              Tamil literature, independent publishers and competitive exam books, gathered in one place.
            </p>
            <div className="mt-7 flex flex-wrap gap-3">
              <Link
                href="/books"
                className="inline-flex min-h-11 items-center gap-2 rounded-md bg-white px-5 text-sm font-semibold text-primary transition-colors hover:bg-emerald-50"
              >
                <BookOpen className="h-4 w-4" aria-hidden="true" />
                Browse books
                <ArrowRight className="h-4 w-4" aria-hidden="true" />
              </Link>
              <Link
                href="/membership/apply"
                className="inline-flex min-h-11 items-center gap-2 rounded-md border border-white/35 px-5 text-sm font-semibold text-white transition-colors hover:bg-white/10"
              >
                <Crown className="h-4 w-4" aria-hidden="true" />
                Membership
              </Link>
            </div>
          </div>
          <div className="hidden border-l border-white/20 pl-6 text-sm leading-6 text-primary-foreground/75 lg:block">
            Curated titles from Tamil publishers, with delivery across India.
          </div>
        </div>
      </section>

      {categories.length > 0 && (
        <section className="container py-8">
          <h2 className="mb-4 text-xl font-semibold">Shop by category</h2>
          <div className="flex flex-wrap gap-2">
            {categories.map((category) => (
              <Link
                key={category.id}
                href={`/categories/${category.slug}`}
                className="rounded-md border border-border bg-card px-4 py-2 text-sm font-medium transition-colors hover:border-primary/40 hover:bg-secondary"
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
