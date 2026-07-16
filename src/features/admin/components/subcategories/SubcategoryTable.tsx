"use client";

import { getSubcategoryCategoryName } from "@/lib/helpers/subcategory.helpers";
import { formatDate } from "@/lib/helpers/format.helpers";
import { StatusBadge } from "@/components/common/StatusBadge";
import { Button } from "@/components/ui/button";
import { getIcon } from "@/lib/icons";
import { SUBCATEGORY_SORT_OPTIONS } from "@/config/subcategoryManagement";
import { SubcategorySkeleton } from "./SubcategorySkeleton";
import { SubcategoryEmptyState } from "./SubcategoryEmptyState";
import type { SubcategoryTableProps } from "@/features/admin/types/subcategory-management.types";

/**
 * SubcategoryTable — Sprint 09 (Task 2).
 *
 * Structurally close to `CategoryTable` (Sprint 08) — same row shape,
 * same `StatusBadge`/`formatDate` reuse, same internal loading/empty
 * handling — with two differences: a "Category" column (via
 * `getSubcategoryCategoryName`) instead of "Parent Category" (a
 * subcategory's category is never "top-level," so there's no italic
 * fallback case to render), and **sortable column headers** — this
 * sprint's new "Sorting" requirement that Sprint 08 didn't need.
 *
 * Sorting is controlled: `sort`/`onSortChange` are supplied by the
 * caller (`SubcategoryManagementOverview`, which actually reorders the
 * array via `sortByKey`, `@/lib/helpers/array.helpers`, extended this
 * sprint) — this table only renders the current sort indicator and
 * reports clicks, the same "component reports, caller decides" boundary
 * `CategoryFilters` established for filtering.
 */
export function SubcategoryTable({
  subcategories,
  categories,
  selectedIds,
  onToggleSelect,
  loading,
  sort,
  onSortChange,
  onClearFilters,
  onEdit,
  onDelete,
  className,
}: SubcategoryTableProps) {
  if (loading) return <SubcategorySkeleton view="table" className={className} />;
  if (subcategories.length === 0) {
    return <SubcategoryEmptyState variant="no-results" onClearFilters={onClearFilters} className={className} />;
  }

  const showSelection = Boolean(onToggleSelect);

  function handleSortClick(key: (typeof SUBCATEGORY_SORT_OPTIONS)[number]["key"]) {
    if (!onSortChange) return;
    const direction = sort?.key === key && sort.direction === "asc" ? "desc" : "asc";
    onSortChange({ key, direction });
  }

  return (
    <div className={className}>
      <div className="overflow-x-auto rounded-lg border border-border">
        <table className="w-full text-sm">
          <thead>
            <tr className="border-b border-border bg-muted/50 text-left text-xs font-medium uppercase tracking-wide text-muted-foreground">
              {showSelection && <th className="w-10 px-4 py-3" />}
              {SUBCATEGORY_SORT_OPTIONS.map((option) => (
                <th key={option.key} className="px-4 py-3">
                  {onSortChange ? (
                    <SortableHeaderButton
                      label={option.label}
                      active={sort?.key === option.key}
                      direction={sort?.key === option.key ? sort.direction : undefined}
                      onClick={() => handleSortClick(option.key)}
                    />
                  ) : (
                    option.label
                  )}
                </th>
              ))}
              <th className="px-4 py-3">Category</th>
              <th className="px-4 py-3">Status</th>
              <th className="px-4 py-3 text-right">Actions</th>
            </tr>
          </thead>
          <tbody className="divide-y divide-border">
            {subcategories.map((subcategory) => {
              const isSelected = selectedIds?.includes(subcategory.id) ?? false;
              const categoryName = getSubcategoryCategoryName(subcategory, categories);

              return (
                <tr
                  key={subcategory.id}
                  aria-selected={showSelection ? isSelected : undefined}
                  className="transition-colors hover:bg-accent/50"
                >
                  {showSelection && (
                    <td className="px-4 py-3">
                      <input
                        type="checkbox"
                        checked={isSelected}
                        onChange={() => onToggleSelect?.(subcategory.id)}
                        aria-label={`Select ${subcategory.name}`}
                        className="h-4 w-4 rounded border-input"
                      />
                    </td>
                  )}
                  <td className="px-4 py-3 font-medium text-foreground">{subcategory.name}</td>
                  <td className="px-4 py-3 text-muted-foreground">/{subcategory.slug}</td>
                  <td className="px-4 py-3 text-muted-foreground">{formatDate(subcategory.updated_at)}</td>
                  <td className="px-4 py-3 text-muted-foreground">{categoryName ?? "—"}</td>
                  <td className="px-4 py-3">
                    <StatusBadge status={subcategory.status} />
                  </td>
                  <td className="px-4 py-3">
                    <div className="flex justify-end gap-2">
                      {onEdit && (
                        <Button type="button" size="sm" variant="ghost" onClick={() => onEdit(subcategory)}>
                          Edit
                        </Button>
                      )}
                      {onDelete && (
                        <Button type="button" size="sm" variant="ghost" onClick={() => onDelete(subcategory)}>
                          Delete
                        </Button>
                      )}
                    </div>
                  </td>
                </tr>
              );
            })}
          </tbody>
        </table>
      </div>
    </div>
  );
}

interface SortableHeaderButtonProps {
  label: string;
  active?: boolean;
  direction?: "asc" | "desc";
  onClick: () => void;
}

/** Small local header button — sort-arrow toggle, used only by
 *  `SubcategoryTable`. Not promoted to a shared component this sprint
 *  (only one table needs it so far); a future sort upgrade to
 *  `CategoryTable` would be the trigger to extract this into
 *  `components/common/`, per the "promote once reused twice" rule Day 3
 *  established. */
function SortableHeaderButton({ label, active, direction, onClick }: SortableHeaderButtonProps) {
  const Icon = getIcon(direction === "desc" ? "chevron-down" : "chevron-up");

  return (
    <button
      type="button"
      onClick={onClick}
      className="flex items-center gap-1 text-xs font-medium uppercase tracking-wide text-muted-foreground transition-colors hover:text-foreground focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring"
    >
      {label}
      {active ? (
        <Icon className="h-3.5 w-3.5" aria-hidden="true" />
      ) : (
        <span className="h-3.5 w-3.5" aria-hidden="true" />
      )}
    </button>
  );
}
