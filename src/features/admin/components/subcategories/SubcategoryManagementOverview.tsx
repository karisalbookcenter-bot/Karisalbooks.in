"use client";

import { useMemo, useState } from "react";
import { PageContainer } from "@/components/common/PageContainer";
import { BulkActionBar } from "@/components/common/BulkActionBar";
import { Pagination } from "@/components/common/Pagination";
import {
  searchSubcategories,
  filterSubcategoriesByStatus,
  filterSubcategoriesByCategory,
  getSubcategoryCategoryName,
} from "@/lib/helpers/subcategory.helpers";
import { sortByKey, paginate } from "@/lib/helpers/array.helpers";
import { PAGINATION_DEFAULTS } from "@/constants/app.constants";
import { SUBCATEGORY_BULK_ACTIONS } from "@/config/subcategoryManagement";
import type { SubcategoryViewMode } from "@/config/subcategoryManagement";
import type {
  SubcategoryFiltersValue,
  SubcategorySortState,
  SubcategoryManagementOverviewProps,
} from "@/features/admin/types/subcategory-management.types";
import { SubcategoryToolbar } from "./SubcategoryToolbar";
import { SubcategoryTable } from "./SubcategoryTable";
import { SubcategoryCard } from "./SubcategoryCard";
import { SubcategoryEmptyState } from "./SubcategoryEmptyState";

const EMPTY_FILTERS: SubcategoryFiltersValue = { statuses: [], categoryId: null };
const DEFAULT_SORT: SubcategorySortState = { key: "name", direction: "asc" };

/**
 * SubcategoryManagementOverview — Sprint 09 (Task 1: Subcategory
 * Management page architecture).
 *
 * Follows the exact composed-page shape `CategoryManagementOverview`
 * (Sprint 08) and `DashboardOverview` (Sprint 07) established: a
 * component ready to be the default export of a future
 * `app/admin/subcategories/page.tsx`, with no route wired up this
 * sprint.
 *
 *   // A future app/admin/subcategories/page.tsx
 *   import { AdminShell } from "@/features/admin/components/layout";
 *   import { SubcategoryManagementOverview } from "@/features/admin/components/subcategories";
 *
 *   export default function AdminSubcategoriesPage() {
 *     return (
 *       <AdminShell>
 *         <SubcategoryManagementOverview
 *           subcategories={realSubcategories}
 *           categories={realCategories}
 *         />
 *       </AdminShell>
 *     );
 *   }
 *
 * Owns search, status+category filters, sort, pagination, view mode, and
 * bulk selection — one more piece of state than `CategoryManagementOverview`
 * (sort, pagination), matching this sprint's additional "Sorting" and
 * "Pagination" future-ready requirements. Every derivation is a pure
 * helper call: `searchSubcategories` → `filterSubcategoriesByStatus` →
 * `filterSubcategoriesByCategory` → `sortByKey` → `paginate`, each from
 * this project's existing helpers (the last two extended/reused from
 * Day 3, not new for this sprint).
 *
 * Unlike `CategoryManagementOverview`, both Table and Card view use the
 * *same* filtered/sorted/paginated result — subcategories have no tree to
 * worry about orphaning (see `docs/SUBCATEGORY_MANAGEMENT.md` for the
 * comparison with Category's Table-only-filtering caveat), so there's no
 * equivalent limitation to document here.
 *
 * Requires both `subcategories` and `categories` — see
 * `docs/SUBCATEGORY_MANAGEMENT.md` §Category Linkage Strategy for why a
 * subcategory screen always needs the full category list alongside its
 * own data.
 */
export function SubcategoryManagementOverview({
  subcategories = [],
  categories = [],
  loading,
  className,
}: SubcategoryManagementOverviewProps) {
  const [view, setView] = useState<SubcategoryViewMode>("table");
  const [searchValue, setSearchValue] = useState("");
  const [filtersValue, setFiltersValue] = useState<SubcategoryFiltersValue>(EMPTY_FILTERS);
  const [sort, setSort] = useState<SubcategorySortState>(DEFAULT_SORT);
  const [page, setPage] = useState(PAGINATION_DEFAULTS.PAGE);
  const [pageSize, setPageSize] = useState<number>(PAGINATION_DEFAULTS.PAGE_SIZE);
  const [selectedIds, setSelectedIds] = useState<string[]>([]);

  const filteredAndSorted = useMemo(() => {
    const searched = searchSubcategories(subcategories, searchValue);
    const byStatus = filterSubcategoriesByStatus(searched, filtersValue.statuses);
    const byCategory = filterSubcategoriesByCategory(byStatus, filtersValue.categoryId);
    return sortByKey(byCategory, sort.key, sort.direction);
  }, [subcategories, searchValue, filtersValue, sort]);

  const paginated = useMemo(
    () => paginate(filteredAndSorted, page, pageSize),
    [filteredAndSorted, page, pageSize]
  );

  function toggleSelect(id: string) {
    setSelectedIds((prev) => (prev.includes(id) ? prev.filter((x) => x !== id) : [...prev, id]));
  }

  function updateSearch(next: string) {
    setSearchValue(next);
    setPage(PAGINATION_DEFAULTS.PAGE);
  }

  function updateFilters(next: SubcategoryFiltersValue) {
    setFiltersValue(next);
    setPage(PAGINATION_DEFAULTS.PAGE);
  }

  function clearFilters() {
    setSearchValue("");
    setFiltersValue(EMPTY_FILTERS);
    setPage(PAGINATION_DEFAULTS.PAGE);
  }

  const hasAnySubcategories = subcategories.length > 0;

  return (
    <PageContainer
      title="Subcategories"
      description="Refine each category with subcategories customers can browse and filter by."
      className={className}
    >
      {!loading && !hasAnySubcategories ? (
        <SubcategoryEmptyState variant="no-data" />
      ) : (
        <div className="flex flex-col gap-4">
          <SubcategoryToolbar
            searchValue={searchValue}
            onSearchChange={updateSearch}
            filtersValue={filtersValue}
            onFiltersChange={updateFilters}
            categories={categories}
            view={view}
            onViewChange={setView}
          />

          <BulkActionBar
            count={selectedIds.length}
            actions={SUBCATEGORY_BULK_ACTIONS}
            onClear={() => setSelectedIds([])}
          />

          {view === "table" ? (
            <SubcategoryTable
              subcategories={paginated.items}
              categories={categories}
              selectedIds={selectedIds}
              onToggleSelect={toggleSelect}
              sort={sort}
              onSortChange={setSort}
              onClearFilters={clearFilters}
              loading={loading}
            />
          ) : loading ? (
            <SubcategoryEmptyState variant="no-results" />
          ) : paginated.items.length === 0 ? (
            <SubcategoryEmptyState variant="no-results" onClearFilters={clearFilters} />
          ) : (
            <div className="grid grid-cols-1 gap-4 sm:grid-cols-2 lg:grid-cols-3">
              {paginated.items.map((subcategory) => (
                <SubcategoryCard
                  key={subcategory.id}
                  subcategory={subcategory}
                  categoryName={getSubcategoryCategoryName(subcategory, categories)}
                  selected={selectedIds.includes(subcategory.id)}
                  onToggleSelect={() => toggleSelect(subcategory.id)}
                />
              ))}
            </div>
          )}

          {!loading && filteredAndSorted.length > 0 && (
            <Pagination
              result={paginated}
              onPageChange={setPage}
              onPageSizeChange={(size) => {
                setPageSize(size);
                setPage(PAGINATION_DEFAULTS.PAGE);
              }}
            />
          )}
        </div>
      )}
    </PageContainer>
  );
}
