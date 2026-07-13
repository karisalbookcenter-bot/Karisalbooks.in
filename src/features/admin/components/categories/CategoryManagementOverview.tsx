"use client";

import { useMemo, useState } from "react";
import { PageContainer } from "@/components/common/PageContainer";
import { BulkActionBar } from "@/components/common/BulkActionBar";
import {
  buildCategoryTree,
  filterCategoriesByStatus,
  searchCategories,
} from "@/lib/helpers/category.helpers";
import { CATEGORY_BULK_ACTIONS } from "@/config/categoryManagement";
import type { CategoryViewMode } from "@/config/categoryManagement";
import type { CategoryFiltersValue } from "@/features/admin/types/category-management.types";
import { CategoryToolbar } from "./CategoryToolbar";
import { CategoryTable } from "./CategoryTable";
import { CategoryTreeView } from "./CategoryTreeView";
import { CategoryEmptyState } from "./CategoryEmptyState";
import type { CategoryManagementOverviewProps } from "@/features/admin/types/category-management.types";

const EMPTY_FILTERS: CategoryFiltersValue = { statuses: [] };

/**
 * CategoryManagementOverview — Sprint 08 (Task 1: Category Management
 * page architecture).
 *
 * The composed screen, following the exact shape Sprint 07's
 * `DashboardOverview` established: a component ready to be the default
 * export of a future `app/admin/categories/page.tsx`, with no route
 * wired up in this sprint.
 *
 *   // A future app/admin/categories/page.tsx
 *   import { AdminShell } from "@/features/admin/components/layout";
 *   import { CategoryManagementOverview } from "@/features/admin/components/categories";
 *
 *   export default function AdminCategoriesPage() {
 *     return (
 *       <AdminShell>
 *         <CategoryManagementOverview categories={realCategories} />
 *       </AdminShell>
 *     );
 *   }
 *
 * Owns exactly the UI state a category screen needs — search text,
 * status filter, table/tree view mode, and bulk selection — and derives
 * everything else from `categories` with this sprint's pure helpers
 * (`searchCategories`, `filterCategoriesByStatus`, `buildCategoryTree`).
 * No Supabase call, no service, no persistence — `categories` is a plain
 * prop, defaulting to `[]`.
 *
 * **Table view is searched/filtered; Tree view always shows the full,
 * unfiltered hierarchy.** Naively filtering a flat list before building a
 * tree can orphan a matching child whose non-matching parent got filtered
 * out (the parent id the child needs to nest under simply wouldn't be in
 * the list anymore). Building correct "keep ancestors of any match"
 * filtering is real business logic this sprint's "UI architecture only"
 * scope excludes — so search/filter apply only where they're
 * unambiguously correct (the flat table), and this limitation is
 * documented rather than papered over with an incorrect tree. See
 * `docs/CATEGORY_MANAGEMENT.md` §Expandable Hierarchy Strategy for the
 * full reasoning and the follow-up needed to filter tree view correctly.
 */
export function CategoryManagementOverview({
  categories = [],
  loading,
  className,
}: CategoryManagementOverviewProps) {
  const [view, setView] = useState<CategoryViewMode>("table");
  const [searchValue, setSearchValue] = useState("");
  const [filtersValue, setFiltersValue] = useState<CategoryFiltersValue>(EMPTY_FILTERS);
  const [selectedIds, setSelectedIds] = useState<string[]>([]);

  const filteredCategories = useMemo(() => {
    const searched = searchCategories(categories, searchValue);
    return filterCategoriesByStatus(searched, filtersValue.statuses);
  }, [categories, searchValue, filtersValue]);

  const tree = useMemo(() => buildCategoryTree(categories), [categories]);

  function toggleSelect(id: string) {
    setSelectedIds((prev) => (prev.includes(id) ? prev.filter((x) => x !== id) : [...prev, id]));
  }

  function clearFilters() {
    setSearchValue("");
    setFiltersValue(EMPTY_FILTERS);
  }

  const hasAnyCategories = categories.length > 0;

  return (
    <PageContainer
      title="Categories"
      description="Organize your catalog into an unlimited-depth category hierarchy."
      className={className}
    >
      {!loading && !hasAnyCategories ? (
        <CategoryEmptyState variant="no-data" />
      ) : (
        <div className="flex flex-col gap-4">
          <CategoryToolbar
            searchValue={searchValue}
            onSearchChange={setSearchValue}
            filtersValue={filtersValue}
            onFiltersChange={setFiltersValue}
            view={view}
            onViewChange={setView}
          />

          <BulkActionBar
            count={selectedIds.length}
            actions={CATEGORY_BULK_ACTIONS}
            onClear={() => setSelectedIds([])}
          />

          {view === "table" ? (
            <CategoryTable
              categories={filteredCategories}
              allCategories={categories}
              selectedIds={selectedIds}
              onToggleSelect={toggleSelect}
              onClearFilters={clearFilters}
              loading={loading}
            />
          ) : (
            <CategoryTreeView
              nodes={tree}
              selectedIds={selectedIds}
              onToggleSelect={toggleSelect}
              onClearFilters={clearFilters}
              loading={loading}
            />
          )}
        </div>
      )}
    </PageContainer>
  );
}
