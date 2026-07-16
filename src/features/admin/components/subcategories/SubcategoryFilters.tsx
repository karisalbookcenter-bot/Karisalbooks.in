"use client";

import { SUBCATEGORY_STATUS_FILTER_OPTIONS } from "@/config/subcategoryManagement";
import { Select } from "@/components/ui/select";
import { getIcon } from "@/lib/icons";
import { cn } from "@/lib/utils";
import { ParentCategorySelector } from "./ParentCategorySelector";
import type { RecordStatus } from "@/types/common.types";
import type { SubcategoryFiltersProps, SubcategoryFiltersValue } from "@/features/admin/types/subcategory-management.types";

const EMPTY_VALUE: SubcategoryFiltersValue = { statuses: [], categoryId: null };

/**
 * SubcategoryFilters — Sprint 09 (Task 6).
 *
 * Two filter dimensions: status (via `SUBCATEGORY_STATUS_FILTER_OPTIONS`,
 * re-exported from Sprint 08's `CATEGORY_STATUS_FILTER_OPTIONS`) and
 * category (via `ParentCategorySelector` with `allowAll`, this sprint's
 * own component — reused here rather than a second category dropdown
 * implementation). This is the "Category linkage" filter dimension
 * `CategoryFilters` (Sprint 08) has no equivalent of, since categories
 * don't belong to another category the same restrictive way.
 *
 * Same controlled/uncontrolled-friendly, "reports don't filter" contract
 * as `CategoryFilters` — actual filtering happens via
 * `filterSubcategoriesByStatus`/`filterSubcategoriesByCategory`
 * (`@/lib/helpers/subcategory.helpers`) at the call site.
 */
export function SubcategoryFilters({ value = EMPTY_VALUE, onChange, categories, className }: SubcategoryFiltersProps) {
  const FilterIcon = getIcon("filter");
  const selectedStatus = value.statuses[0] ?? "";

  function handleStatusChange(next: string) {
    const statuses: RecordStatus[] = next ? [next as RecordStatus] : [];
    onChange?.({ ...value, statuses });
  }

  function handleCategoryChange(categoryId: string | null) {
    onChange?.({ ...value, categoryId });
  }

  return (
    <div className={cn("flex flex-wrap items-center gap-2", className)}>
      <div className="relative">
        <FilterIcon
          className="pointer-events-none absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-muted-foreground"
          aria-hidden="true"
        />
        <Select
          aria-label="Filter by status"
          value={selectedStatus}
          onChange={(e) => handleStatusChange(e.target.value)}
          className="w-44 pl-9"
        >
          {SUBCATEGORY_STATUS_FILTER_OPTIONS.map((option) => (
            <option key={option.label} value={option.value ?? ""}>
              {option.label}
            </option>
          ))}
        </Select>
      </div>

      <ParentCategorySelector
        categories={categories}
        value={value.categoryId}
        onChange={handleCategoryChange}
        allowAll
        className="w-48"
      />
    </div>
  );
}
