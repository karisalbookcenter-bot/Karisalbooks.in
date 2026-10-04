"use client";

import { useCallback, useEffect, useState } from "react";
import Link from "next/link";
import { ROUTES } from "@/constants/routes.constants";
import { SubcategoryManagementOverview } from "@/features/admin/components/subcategories";
import * as categoryService from "@/features/categories/services/category.service";
import * as subcategoryService from "@/features/subcategories/services/subcategory.service";
import type { Category } from "@/types/category.types";
import type { Subcategory } from "@/types/subcategory.types";

export default function AdminSubcategoriesPage() {
  const [categories, setCategories] = useState<Category[]>([]);
  const [subcategories, setSubcategories] = useState<Subcategory[]>([]);
  const [loading, setLoading] = useState(true);
  const [loadError, setLoadError] = useState<string | null>(null);

  const load = useCallback(async () => {
    setLoading(true);
    setLoadError(null);
    const [categoryResult, subcategoryResult] = await Promise.all([
      categoryService.listCategories({ pageSize: 1000 }),
      subcategoryService.listSubcategories({ pageSize: 1000 }),
    ]);

    const errors = [categoryResult.error, subcategoryResult.error]
      .filter((error): error is NonNullable<typeof error> => error !== null)
      .map((error) => error.message);
    if (errors.length > 0) {
      setLoadError(errors.join(" "));
    } else {
      setCategories(categoryResult.data?.items ?? []);
      setSubcategories(subcategoryResult.data?.items ?? []);
    }
    setLoading(false);
  }, []);

  useEffect(() => {
    void load();
  }, [load]);

  return (
    <>
      {loadError && <p role="alert" className="container pt-4 text-sm text-destructive">Unable to load subcategories: {loadError}</p>}
      {!loading && categories.length === 0 && !loadError && (
        <p className="container pt-4 text-sm text-muted-foreground">
          Create a category first in <Link href={ROUTES.ADMIN_CATEGORIES} className="text-primary underline">Categories</Link>, then add subcategories here.
        </p>
      )}
      <SubcategoryManagementOverview
        categories={categories}
        subcategories={subcategories}
        loading={loading}
        onDataChange={load}
      />
    </>
  );
}