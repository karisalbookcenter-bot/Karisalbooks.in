"use client";

import { getIcon } from "@/lib/icons";
import { StatusBadge } from "@/components/common/StatusBadge";
import { Button } from "@/components/ui/button";
import { cn } from "@/lib/utils";
import type { CategoryCardProps } from "@/features/admin/types/category-management.types";

/**
 * CategoryCard — Sprint 08 (Task 4).
 *
 * A single category as a card — an alternative row presentation to
 * `CategoryTable`'s table row, for a future grid/card view mode. Shows
 * every field the brief's "Requirements" list asks for on one card:
 * status badge, parent category display (or "Top-level category"), and
 * (via `childCount`) an at-a-glance sense of its place in the hierarchy.
 *
 * Pure display component — `parentName`/`childCount` are computed by the
 * caller (via `getParentCategoryName`/`countDescendants` from
 * `@/lib/helpers/category.helpers`) rather than by the card itself, so
 * `CategoryCard` never needs the full category list just to render one
 * card. `onEdit`/`onDelete` default to nothing — wiring them to a real
 * edit/delete flow is a future CRUD sprint's job.
 */
export function CategoryCard({
  category,
  parentName,
  childCount = 0,
  selected,
  onToggleSelect,
  onEdit,
  onDelete,
  className,
}: CategoryCardProps) {
  const FolderIcon = getIcon("folder-tree");

  return (
    <div
      className={cn(
        "flex flex-col gap-3 rounded-lg border bg-card p-4 transition-colors",
        selected ? "border-primary ring-1 ring-primary" : "border-border",
        className
      )}
    >
      <div className="flex items-start justify-between gap-2">
        <div className="flex items-start gap-2.5">
          {onToggleSelect && (
            <input
              type="checkbox"
              checked={selected ?? false}
              onChange={onToggleSelect}
              aria-label={`Select ${category.name}`}
              className="mt-1 h-4 w-4 shrink-0 rounded border-input"
            />
          )}
          <span className="flex h-9 w-9 shrink-0 items-center justify-center rounded-md bg-primary/10 text-primary">
            <FolderIcon className="h-5 w-5" aria-hidden="true" />
          </span>
          <div>
            <p className="text-sm font-medium text-foreground">{category.name}</p>
            <p className="text-xs text-muted-foreground">/{category.slug}</p>
          </div>
        </div>
        <StatusBadge status={category.status} />
      </div>

      {category.description && (
        <p className="line-clamp-2 text-sm text-muted-foreground">{category.description}</p>
      )}

      <div className="flex items-center justify-between border-t border-border pt-3 text-xs text-muted-foreground">
        <span>{parentName ? `Parent: ${parentName}` : "Top-level category"}</span>
        <span>{childCount} subcategor{childCount === 1 ? "y" : "ies"}</span>
      </div>

      {(onEdit || onDelete) && (
        <div className="flex gap-2">
          {onEdit && (
            <Button type="button" size="sm" variant="outline" className="flex-1" onClick={onEdit}>
              Edit
            </Button>
          )}
          {onDelete && (
            <Button type="button" size="sm" variant="ghost" className="flex-1" onClick={onDelete}>
              Delete
            </Button>
          )}
        </div>
      )}
    </div>
  );
}
