"use client";

import { formatDate } from "@/lib/helpers/format.helpers";
import { StatusBadge } from "@/components/common/StatusBadge";
import { Button } from "@/components/ui/button";
import { PublisherSkeleton } from "./PublisherSkeleton";
import { PublisherEmptyState } from "./PublisherEmptyState";
import type { PublisherTableProps } from "@/features/admin/types/publisher-management.types";

/**
 * PublisherTable — Sprint 11 (Task 15). Mirrors `AuthorTable` exactly.
 */
export function PublisherTable({
  publishers,
  bookCounts,
  selectedIds,
  onToggleSelect,
  loading,
  onClearFilters,
  onEdit,
  onDelete,
  className,
}: PublisherTableProps) {
  if (loading) return <PublisherSkeleton view="table" className={className} />;
  if (publishers.length === 0) {
    return <PublisherEmptyState variant="no-results" onClearFilters={onClearFilters} className={className} />;
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
            {publishers.map((publisher) => {
              const isSelected = selectedIds?.includes(publisher.id) ?? false;

              return (
                <tr
                  key={publisher.id}
                  aria-selected={showSelection ? isSelected : undefined}
                  className="transition-colors hover:bg-accent/50"
                >
                  {showSelection && (
                    <td className="px-4 py-3">
                      <input
                        type="checkbox"
                        checked={isSelected}
                        onChange={() => onToggleSelect?.(publisher.id)}
                        aria-label={`Select ${publisher.name}`}
                        className="h-4 w-4 rounded border-input"
                      />
                    </td>
                  )}
                  <td className="px-4 py-3 font-medium text-foreground">{publisher.name}</td>
                  <td className="px-4 py-3 text-muted-foreground">/{publisher.slug}</td>
                  {bookCounts && (
                    <td className="px-4 py-3 text-muted-foreground">{bookCounts[publisher.id] ?? 0}</td>
                  )}
                  <td className="px-4 py-3">
                    <StatusBadge status={publisher.status} />
                  </td>
                  <td className="px-4 py-3 text-muted-foreground">{formatDate(publisher.updated_at)}</td>
                  <td className="px-4 py-3">
                    <div className="flex justify-end gap-2">
                      {onEdit && (
                        <Button type="button" size="sm" variant="ghost" onClick={() => onEdit(publisher)}>
                          Edit
                        </Button>
                      )}
                      {onDelete && (
                        <Button type="button" size="sm" variant="ghost" onClick={() => onDelete(publisher)}>
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
