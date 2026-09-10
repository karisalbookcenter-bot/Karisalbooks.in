"use client";

import { Select } from "@/components/ui/select";
import { BOOK_STATUS_FILTER_OPTIONS } from "@/config/bookManagement";
import { ParentCategorySelector } from "@/features/admin/components/subcategories";
import type { RecordStatus } from "@/types/common.types";
import type { BookFiltersProps } from "@/features/admin/types/book-management.types";

export function BookFilters({ categories, authors, value, onChange }: BookFiltersProps) {
  return (
    <div className="flex flex-wrap items-center gap-3">
      <Select
        aria-label="Filter by status"
        value={value.statuses[0] ?? ""}
        onChange={(e) =>
          onChange({ ...value, statuses: e.target.value ? [e.target.value as RecordStatus] : [] })
        }
      >
        {BOOK_STATUS_FILTER_OPTIONS.map((opt) => (
          <option key={opt.value} value={opt.value}>
            {opt.label}
          </option>
        ))}
      </Select>

      <ParentCategorySelector
        categories={categories}
        value={value.categoryId}
        onChange={(id) => onChange({ ...value, categoryId: id })}
        allowAll
      />

      <Select
        aria-label="Filter by author"
        value={value.authorId ?? ""}
        onChange={(e) => onChange({ ...value, authorId: e.target.value || null })}
      >
        <option value="">All authors</option>
        {authors.map((a) => (
          <option key={a.id} value={a.id}>
            {a.name}
          </option>
        ))}
      </Select>
    </div>
  );
}
