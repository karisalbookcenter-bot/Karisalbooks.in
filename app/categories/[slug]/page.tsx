"use client";

import { useEffect, useState, useCallback } from "react";
import { useParams } from "next/navigation";
import Link from "next/link";
import { MainLayout } from "@/components/layout/MainLayout";
import { BookGrid } from "@/features/storefront/components/BookGrid";
import { SubcategoryChips } from "@/features/storefront/components/SubcategoryChips";
import { buildNameMap } from "@/features/storefront/utils";
import { PUBLIC_VISIBLE_STATUS } from "@/features/storefront/constants";
import * as bookService from "@/features/books/services/book.service";
import { authorService } from "@/features/authors/services/author.service";
import { publisherService } from "@/features/publishers/services/publisher.service";
import * as categoryService from "@/features/categories/services/category.service";
import * as subcategoryService from "@/features/subcategories/services/subcategory.service";
import type { Book } from "@/types/book.types";
import type { Category } from "@/types/category.types";
import type { Subcategory } from "@/types/subcategory.types";

/**
 * Category browsing page — Sprint 18. `/categories/[slug]` ONLY, per
 * requirement 2 — no `/categories/[slug]/[subcategorySlug]` nested route.
 * Subcategory selection is local component state (`subcategoryId`) that
 * refetches books filtered on the same page; it never navigates.
 *
 * No `getCategoryBySlug` method exists on `category.service.ts` (only
 * `listCategories`) — rather than add one (touching a Sprint 16 file
 * unnecessarily), the full category list is fetched once and matched by
 * slug client-side. Fine at this project's scale; worth a real
 * `getCategoryBySlug` later if the category list grows large.
 */
export default function CategoryPage() {
  const params = useParams<{ slug: string }>();

  const [category, setCategory] = useState<Category | null>(null);
  const [subcategories, setSubcategories] = useState<Subcategory[]>([]);
  const [books, setBooks] = useState<Book[]>([]);
  const [authorNamesById, setAuthorNamesById] = useState<Record<string, string>>({});
  const [publisherNamesById, setPublisherNamesById] = useState<Record<string, string>>({});
  const [subcategoryId, setSubcategoryId] = useState<string | null>(null);
  const [loadingCategory, setLoadingCategory] = useState(true);
  const [loadingBooks, setLoadingBooks] = useState(true);
  const [notFound, setNotFound] = useState(false);

  // Resolve the category by slug, then its subcategories — once per slug.
  useEffect(() => {
    async function load() {
      setLoadingCategory(true);
      setNotFound(false);
      setSubcategoryId(null);

      const result = await categoryService.listCategories({ status: PUBLIC_VISIBLE_STATUS, pageSize: 1000 });
      const match = result.data?.items.find((c) => c.slug === params.slug) ?? null;

      if (!match) {
        setNotFound(true);
        setLoadingCategory(false);
        return;
      }

      setCategory(match);

      const [subcategoryResult, authorsResult, publishersResult] = await Promise.all([
        subcategoryService.listSubcategories({
          categoryId: match.id,
          status: PUBLIC_VISIBLE_STATUS,
          pageSize: 100,
        }),
        authorService.list({ pageSize: 1000 }),
        publisherService.list({ pageSize: 1000 }),
      ]);
      if (subcategoryResult.data) setSubcategories(subcategoryResult.data.items);
      if (authorsResult.data) setAuthorNamesById(buildNameMap(authorsResult.data.items));
      if (publishersResult.data) setPublisherNamesById(buildNameMap(publishersResult.data.items));
      setLoadingCategory(false);
    }
    load();
  }, [params.slug]);

  // Books refetch whenever the category resolves or the subcategory chip
  // filter changes — this is the "chips as in-page filters" behavior
  // requirement 2 asked for.
  const loadBooks = useCallback(async () => {
    if (!category) return;
    setLoadingBooks(true);
    const result = await bookService.listBooks({
      statuses: [PUBLIC_VISIBLE_STATUS],
      categoryId: category.id,
      subcategoryId: subcategoryId ?? undefined,
      pageSize: 100,
    });
    if (result.data) setBooks(result.data.items);
    setLoadingBooks(false);
  }, [category, subcategoryId]);

  useEffect(() => {
    loadBooks();
  }, [loadBooks]);

  if (loadingCategory) {
    return (
      <MainLayout>
        <div className="container py-16 text-center text-sm text-muted-foreground">Loading…</div>
      </MainLayout>
    );
  }

  if (notFound || !category) {
    return (
      <MainLayout>
        <div className="container flex flex-col items-center gap-4 py-16 text-center">
          <h1 className="text-2xl font-semibold">Category not found</h1>
          <Link href="/books" className="text-sm text-primary underline">
            Browse all books
          </Link>
        </div>
      </MainLayout>
    );
  }

  return (
    <MainLayout>
      <div className="container flex flex-col gap-6 py-8">
        <div>
          <h1 className="text-2xl font-semibold">{category.name}</h1>
          {category.description && <p className="mt-1 text-sm text-muted-foreground">{category.description}</p>}
        </div>

        <SubcategoryChips
          subcategories={subcategories}
          selectedId={subcategoryId}
          onSelect={setSubcategoryId}
        />

        {loadingBooks ? (
          <p className="text-sm text-muted-foreground">Loading…</p>
        ) : (
          <BookGrid
            books={books}
            authorNamesById={authorNamesById}
            publisherNamesById={publisherNamesById}
            emptyMessage="No books in this category yet."
          />
        )}
      </div>
    </MainLayout>
  );
}
