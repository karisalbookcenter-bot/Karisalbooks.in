"use client";

import { useCallback, useEffect, useState } from "react";
import { SubcategoryManagementOverview } from "@/features/admin/components/subcategories";
import * as categoryService from "@/features/categories/services/category.service";
import * as subcategoryService from "@/features/subcategories/services/subcategory.service";
import type { Category } from "@/types/category.types";
import type { Subcategory } from "@/types/subcategory.types";

/**
 * app/admin/subcategories/page.tsx — Sprint 17. Same reasoning as
 * app/admin/categories/page.tsx (Client Component — both services use the
 * browser Supabase client). Fetches both `subcategories` and `categories`
 * — `SubcategoryManagementOverviewProps` requires both, per Sprint 09's
 * own documented "Category Linkage Strategy."
 */
export default function AdminSubcategoriesPage() {
  const [subcategories, setSubcategories] = useState<Subcategory[]>([]);
  const [categories, setCategories] = useState<Category[]>([]);
  const [loading, setLoading] = useState(true);

  const load = useCallback(async () => {
    setLoading(true);
    const [subcategoryResult, categoryResult] = await Promise.all([
      subcategoryService.listSubcategories({ pageSize: 1000 }),
      categoryService.listCategories({ pageSize: 1000 }),
    ]);
    if (subcategoryResult.data) setSubcategories(subcategoryResult.data.items);
    if (categoryResult.data) setCategories(categoryResult.data.items);
    setLoading(false);
  }, []);

  useEffect(() => {
    load();
  }, [load]);

  return (
    <SubcategoryManagementOverview
      subcategories={subcategories}
      categories={categories}
      loading={loading}
      onDataChange={load}
    />
  );
}
