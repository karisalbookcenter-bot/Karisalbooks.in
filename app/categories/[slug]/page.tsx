"use client";

import { useEffect, useState, useCallback } from "react";
import { useParams } from "next/navigation";
import Link from "next/link";
import { MainLayout } from "@/components/layout/MainLayout";
import { BookGrid } from "@/features/storefront/components/BookGrid";
import { SubcategoryChips } from "@/features/storefront/components/SubcategoryChips";
import { buildNameMap } from "@/features/storefront/utils";
import { listPublicBooks } from "@/features/storefront/services/book.storefront";
import { getPublicCategoryBySlug } from "@/features/storefront/services/category.storefront";
import { listPublicSubcategoriesByCategory } from "@/features/storefront/services/subcategory.storefront";
import { listPublicAuthorNames, listPublicPublisherNames } from "@/features/storefront/services/author-publisher.storefront";
import type { Book } from "@/types/book.types";
import type { Category } from "@/types/category.types";
import type { Subcategory } from "@/types/subcategory.types";

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

  useEffect(() => {
    async function load() {
      setLoadingCategory(true);
      setNotFound(false);
      setSubcategoryId(null);

      const match = await getPublicCategoryBySlug(params.slug);
      if (!match) {
        setNotFound(true);
        setLoadingCategory(false);
        return;
      }
      setCategory(match);

      const [subs, authors, publishers] = await Promise.all([
        listPublicSubcategoriesByCategory(match.id),
        listPublicAuthorNames(),
        listPublicPublisherNames(),
      ]);
      setSubcategories(subs);
      setAuthorNamesById(buildNameMap(authors));
      setPublisherNamesById(buildNameMap(publishers));
      setLoadingCategory(false);
    }
    load();
  }, [params.slug]);

  const loadBooks = useCallback(async () => {
    if (!category) return;
    setLoadingBooks(true);
    try {
      const result = await listPublicBooks({
        categoryId: category.id,
        subcategoryId: subcategoryId ?? undefined,
        pageSize: 100,
      });
      setBooks(result.items);
    } finally {
      setLoadingBooks(false);
    }
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

        <SubcategoryChips subcategories={subcategories} selectedId={subcategoryId} onSelect={setSubcategoryId} />

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
