"use client";

import { CATEGORY_STATUS_FILTER_OPTIONS } from "@/config/categoryManagement";
import { Select } from "@/components/ui/select";
import { getIcon } from "@/lib/icons";
import { cn } from "@/lib/utils";
import type { RecordStatus } from "@/types/common.types";
import type { CategoryFiltersProps, CategoryFiltersValue } from "@/features/admin/types/category-management.types";

const EMPTY_VALUE: CategoryFiltersValue = { statuses: [] };

/**
 * CategoryFilters — Sprint 08 (Task 6).
 *
 * A single status filter today (config-driven via
 * `CATEGORY_STATUS_FILTER_OPTIONS`), modeled as `{ statuses: RecordStatus[] }`
 * rather than a single value so a future sprint can upgrade the status
 * filter to multi-select (or add a second filter dimension, e.g. "has
 * subcategories") by extending `CategoryFiltersValue` without changing
 * this component's basic contract. Uncontrolled if `value`/`onChange`
 * are omitted — same controlled/uncontrolled flexibility as `SearchBar`.
 *
 * Filtering itself (matching `filterCategoriesByStatus`,
 * `@/lib/helpers/category.helpers`) is left to the caller — this
 * component only reports *what* was selected, per this sprint's "no
 * business logic in components" boundary.
 */
export function CategoryFilters({ value = EMPTY_VALUE, onChange, className }: CategoryFiltersProps) {
  const FilterIcon = getIcon("filter");
  const selectedStatus = value.statuses[0] ?? "";

  function handleStatusChange(next: string) {
    const statuses: RecordStatus[] = next ? [next as RecordStatus] : [];
    onChange?.({ statuses });
  }

  return (
    <div className={cn("relative", className)}>
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
        {CATEGORY_STATUS_FILTER_OPTIONS.map((option) => (
          <option key={option.label} value={option.value ?? ""}>
            {option.label}
          </option>
        ))}
      </Select>
    </div>
  );
}
