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
import * as subcategoryService from "@/features/subcategories/services/subcategory.service";
import { SubcategoryToolbar } from "./SubcategoryToolbar";
import { SubcategoryTable } from "./SubcategoryTable";
import { SubcategoryCard } from "./SubcategoryCard";
import { SubcategoryEmptyState } from "./SubcategoryEmptyState";
import { SubcategoryFormLayout } from "./SubcategoryFormLayout";
import type { Subcategory } from "@/types/subcategory.types";

const EMPTY_FILTERS: SubcategoryFiltersValue = { statuses: [], categoryId: null };
const DEFAULT_SORT: SubcategorySortState = { key: "name", direction: "asc" };

type Panel = { mode: "create" } | { mode: "edit"; subcategory: Subcategory };

/**
 * SubcategoryManagementOverview — Sprint 09 architecture, Sprint 17 write
 * path. Same treatment as `CategoryManagementOverview`: `panel` state,
 * `onEdit`/`onDelete` wired to Table/Card (already-existing prop
 * contracts, simply never passed), `onAction` wired to `BulkActionBar`,
 * `SubcategoryFormLayout` actually mounted. `subcategories`/`categories`
 * remain plain props; `onDataChange` signals the owning page to refetch.
 *
 * The `!hasAnySubcategories` → `<SubcategoryEmptyState/>` gate is
 * intentionally UNCHANGED from Sprint 09, same reasoning and same known
 * consequence as `CategoryManagementOverview`'s — see that file's comment
 * and docs/CATEGORY_SUBCATEGORY_ADMIN_CRUD.md.
 */
export function SubcategoryManagementOverview({
  subcategories = [],
  categories = [],
  loading,
  onDataChange,
  className,
}: SubcategoryManagementOverviewProps) {
  const [view, setView] = useState<SubcategoryViewMode>("table");
  const [searchValue, setSearchValue] = useState("");
  const [filtersValue, setFiltersValue] = useState<SubcategoryFiltersValue>(EMPTY_FILTERS);
  const [sort, setSort] = useState<SubcategorySortState>(DEFAULT_SORT);
  const [page, setPage] = useState(PAGINATION_DEFAULTS.PAGE);
  const [pageSize, setPageSize] = useState<number>(PAGINATION_DEFAULTS.PAGE_SIZE);
  const [selectedIds, setSelectedIds] = useState<string[]>([]);
  const [panel, setPanel] = useState<Panel | null>(null);

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

  async function handleDelete(subcategory: Subcategory) {
    await subcategoryService.deleteSubcategory(subcategory.id);
    onDataChange?.();
  }

  async function handleBulkAction(actionId: string) {
    if (actionId === "delete") {
      await subcategoryService.deleteSubcategories(selectedIds);
    } else {
      const status = actionId === "activate" ? "active" : actionId === "deactivate" ? "inactive" : "archived";
      await subcategoryService.updateSubcategoriesStatus(selectedIds, status as Subcategory["status"]);
    }
    setSelectedIds([]);
    onDataChange?.();
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
            onAddSubcategory={() => setPanel({ mode: "create" })}
          />

          {panel && (
            <div className="rounded-md border border-border bg-card p-4">
              <SubcategoryFormLayout
                mode={panel.mode}
                subcategoryId={panel.mode === "edit" ? panel.subcategory.id : undefined}
                defaultValues={
                  panel.mode === "edit"
                    ? {
                        name: panel.subcategory.name,
                        slug: panel.subcategory.slug,
                        description: panel.subcategory.description ?? "",
                        categoryId: panel.subcategory.category_id,
                        status: panel.subcategory.status,
                      }
                    : undefined
                }
                categories={categories}
                onCancel={() => setPanel(null)}
                onSuccess={() => {
                  setPanel(null);
                  onDataChange?.();
                }}
              />
            </div>
          )}

          <BulkActionBar
            count={selectedIds.length}
            actions={SUBCATEGORY_BULK_ACTIONS}
            onAction={handleBulkAction}
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
              onEdit={(subcategory) => setPanel({ mode: "edit", subcategory })}
              onDelete={handleDelete}
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
                  onEdit={() => setPanel({ mode: "edit", subcategory })}
                  onDelete={() => handleDelete(subcategory)}
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
