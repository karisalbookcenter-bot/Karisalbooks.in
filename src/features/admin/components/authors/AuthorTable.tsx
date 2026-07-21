"use client";

import { formatDate } from "@/lib/helpers/format.helpers";
import { StatusBadge } from "@/components/common/StatusBadge";
import { Button } from "@/components/ui/button";
import { AuthorSkeleton } from "./AuthorSkeleton";
import { AuthorEmptyState } from "./AuthorEmptyState";
import type { AuthorTableProps } from "@/features/admin/types/author-management.types";

/**
 * AuthorTable — Sprint 11 (Task 14).
 *
 * Structurally close to `CategoryTable`/`SubcategoryTable` (Sprints
 * 08–09) — same `StatusBadge`/`formatDate` reuse, same internal loading/
 * empty handling — simpler than both: no "Parent Category" column (no
 * such relationship for an author), and no sortable-header complexity
 * (`SubcategoryTable`'s addition) since this sprint's task list doesn't
 * call for it here. A "Books" column renders when `bookCounts` is
 * supplied, surfacing the Book ↔ Author relationship (Task 12).
 */
export function AuthorTable({
  authors,
  bookCounts,
  selectedIds,
  onToggleSelect,
  loading,
  onClearFilters,
  onEdit,
  onDelete,
  className,
}: AuthorTableProps) {
  if (loading) return <AuthorSkeleton view="table" className={className} />;
  if (authors.length === 0) {
    return <AuthorEmptyState variant="no-results" onClearFilters={onClearFilters} className={className} />;
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
              {bookCounts && <th className="px-4 py-3">Books</th>}
              <th className="px-4 py-3">Status</th>
              <th className="px-4 py-3">Updated</th>
              <th className="px-4 py-3 text-right">Actions</th>
            </tr>
          </thead>
          <tbody className="divide-y divide-border">
            {authors.map((author) => {
              const isSelected = selectedIds?.includes(author.id) ?? false;

              return (
                <tr
                  key={author.id}
                  aria-selected={showSelection ? isSelected : undefined}
                  className="transition-colors hover:bg-accent/50"
                >
                  {showSelection && (
                    <td className="px-4 py-3">
                      <input
                        type="checkbox"
                        checked={isSelected}
                        onChange={() => onToggleSelect?.(author.id)}
                        aria-label={`Select ${author.name}`}
                        className="h-4 w-4 rounded border-input"
                      />
                    </td>
                  )}
                  <td className="px-4 py-3 font-medium text-foreground">{author.name}</td>
                  <td className="px-4 py-3 text-muted-foreground">/{author.slug}</td>
                  {bookCounts && (
                    <td className="px-4 py-3 text-muted-foreground">{bookCounts[author.id] ?? 0}</td>
                  )}
                  <td className="px-4 py-3">
                    <StatusBadge status={author.status} />
                  </td>
                  <td className="px-4 py-3 text-muted-foreground">{formatDate(author.updated_at)}</td>
                  <td className="px-4 py-3">
                    <div className="flex justify-end gap-2">
                      {onEdit && (
                        <Button type="button" size="sm" variant="ghost" onClick={() => onEdit(author)}>
                          Edit
                        </Button>
                      )}
                      {onDelete && (
                        <Button type="button" size="sm" variant="ghost" onClick={() => onDelete(author)}>
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
