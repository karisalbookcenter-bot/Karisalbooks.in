"use client";

import { useCallback, useEffect, useState } from "react";
import { CategoryManagementOverview } from "@/features/admin/components/categories";
import * as categoryService from "@/features/categories/services/category.service";
import type { Category } from "@/types/category.types";

/**
 * app/admin/categories/page.tsx — Sprint 17.
 *
 * This is a Client Component, not a Server Component like
 * `app/admin/books/page.tsx` — because `category.service.ts` calls
 * `@/lib/supabase/client` (the browser client, per Sprint 16's own
 * documented reasoning), a Server Component couldn't call it directly.
 * Owns the fetch + `onDataChange`-triggered refetch;
 * `CategoryManagementOverview` itself still does no fetching, exactly as
 * Sprint 08 documented it should stay.
 */
export default function AdminCategoriesPage() {
  const [categories, setCategories] = useState<Category[]>([]);
  const [loading, setLoading] = useState(true);
  const [loadError, setLoadError] = useState<string | null>(null);

  const load = useCallback(async () => {
    setLoading(true);
    setLoadError(null);
    const result = await categoryService.listCategories({ pageSize: 1000 });
    if (result.error) {
      setLoadError(result.error.message);
    } else if (result.data) {
      setCategories(result.data.items);
    }
    setLoading(false);
  }, []);

  useEffect(() => {
    load();
  }, [load]);

  return (
    <>
      {loadError && <p role="alert" className="container pt-4 text-sm text-destructive">Unable to load categories: {loadError}</p>}
      <CategoryManagementOverview categories={categories} loading={loading} onDataChange={load} />
    </>
  );
}
