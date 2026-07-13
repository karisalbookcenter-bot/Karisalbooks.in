"use client";

import { getParentCategoryName } from "@/lib/helpers/category.helpers";
import { StatusBadge } from "@/components/common/StatusBadge";
import { Button } from "@/components/ui/button";
import { formatDate } from "@/lib/helpers/format.helpers";
import { CategorySkeleton } from "./CategorySkeleton";
import { CategoryEmptyState } from "./CategoryEmptyState";
import type { CategoryTableProps } from "@/features/admin/types/category-management.types";

/**
 * CategoryTable — Sprint 08 (Task 2).
 *
 * The flat, row-per-category view — includes a "Parent Category" column
 * (via `getParentCategoryName`, `@/lib/helpers/category.helpers`) and a
 * `StatusBadge` per row, satisfying the brief's "status badges" and
 * "parent category display" requirements without `CategoryTreeView`'s
 * nesting. Optional bulk-selection checkboxes render only when
 * `onToggleSelect` is supplied (see `CategorySelectionProps`'s doc
 * comment) — a caller not doing bulk actions gets a plain table.
 *
 * Handles its own loading (`CategorySkeleton`) and empty
 * (`CategoryEmptyState`) states internally, so a page using this
 * component doesn't need to branch on those itself.
 */
export function CategoryTable({
  categories,
  allCategories = categories,
  selectedIds,
  onToggleSelect,
  loading,
  onClearFilters,
  onEdit,
  onDelete,
  className,
}: CategoryTableProps) {
  if (loading) return <CategorySkeleton view="table" className={className} />;
  if (categories.length === 0) {
    return <CategoryEmptyState variant="no-results" onClearFilters={onClearFilters} className={className} />;
  }

  const showSelection = Boolean(onToggleSelect);

  return (
    <div className={className}>
      <div className="overflow-x-auto rounded-lg border border-border">
        <table className="w-full text-sm">
          <thead>
            <tr className="border-b border-border bg-muted/50 text-left text-xs font-medium uppercase tracking-wide text-muted-foreground">
              {showSelection && <th className="w-10 px-4 py-3" />}
              <th className="px-4 py-3">Name</th>
              <th className="px-4 py-3">Slug</th>
              <th className="px-4 py-3">Parent Category</th>
              <th className="px-4 py-3">Status</th>
              <th className="px-4 py-3">Updated</th>
              <th className="px-4 py-3 text-right">Actions</th>
            </tr>
          </thead>
          <tbody className="divide-y divide-border">
            {categories.map((category) => {
              const isSelected = selectedIds?.includes(category.id) ?? false;
              const parentName = getParentCategoryName(category, allCategories);

              return (
                <tr
                  key={category.id}
                  aria-selected={showSelection ? isSelected : undefined}
                  className="transition-colors hover:bg-accent/50"
                >
                  {showSelection && (
                    <td className="px-4 py-3">
                      <input
                        type="checkbox"
                        checked={isSelected}
                        onChange={() => onToggleSelect?.(category.id)}
                        aria-label={`Select ${category.name}`}
                        className="h-4 w-4 rounded border-input"
                      />
                    </td>
                  )}
                  <td className="px-4 py-3 font-medium text-foreground">{category.name}</td>
                  <td className="px-4 py-3 text-muted-foreground">/{category.slug}</td>
                  <td className="px-4 py-3 text-muted-foreground">
                    {parentName ?? <span className="italic">Top-level</span>}
                  </td>
                  <td className="px-4 py-3">
                    <StatusBadge status={category.status} />
                  </td>
                  <td className="px-4 py-3 text-muted-foreground">{formatDate(category.updated_at)}</td>
                  <td className="px-4 py-3">
                    <div className="flex justify-end gap-2">
                      {onEdit && (
                        <Button type="button" size="sm" variant="ghost" onClick={() => onEdit(category)}>
                          Edit
                        </Button>
                      )}
                      {onDelete && (
                        <Button type="button" size="sm" variant="ghost" onClick={() => onDelete(category)}>
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
