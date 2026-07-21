"use client";

import { AUTHOR_STATUS_FILTER_OPTIONS } from "@/config/authorManagement";
import { Select } from "@/components/ui/select";
import { getIcon } from "@/lib/icons";
import { cn } from "@/lib/utils";
import type { RecordStatus } from "@/types/common.types";
import type { AuthorFiltersProps, AuthorFiltersValue } from "@/features/admin/types/author-management.types";

const EMPTY_VALUE: AuthorFiltersValue = { statuses: [] };

/**
 * AuthorFilters — Sprint 11 (Task 14). Single status dimension — unlike
 * `SubcategoryFilters`, there's no second entity to filter by (an author
 * doesn't belong to anything the way a subcategory belongs to a
 * category).
 */
export function AuthorFilters({ value = EMPTY_VALUE, onChange, className }: AuthorFiltersProps) {
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
        {AUTHOR_STATUS_FILTER_OPTIONS.map((option) => (
          <option key={option.label} value={option.value ?? ""}>
            {option.label}
          </option>
        ))}
      </Select>
    </div>
  );
}
