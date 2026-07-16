"use client";

import { getIcon } from "@/lib/icons";
import { StatusBadge } from "@/components/common/StatusBadge";
import { Button } from "@/components/ui/button";
import { cn } from "@/lib/utils";
import type { SubcategoryCardProps } from "@/features/admin/types/subcategory-management.types";

/**
 * SubcategoryCard — Sprint 09 (Task 4).
 *
 * Mirrors `CategoryCard` (Sprint 08) closely — same layout, same
 * `StatusBadge` reuse — with one structural difference: there's no
 * "N subcategories" descendant count (subcategories don't nest, see
 * `Subcategory`'s doc comment), and `categoryName` is never `null` in
 * practice (a subcategory always has a category) whereas `CategoryCard`'s
 * `parentName` legitimately can be (a top-level category has none).
 */
export function SubcategoryCard({
  subcategory,
  categoryName,
  selected,
  onToggleSelect,
  onEdit,
  onDelete,
  className,
}: SubcategoryCardProps) {
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
              aria-label={`Select ${subcategory.name}`}
              className="mt-1 h-4 w-4 shrink-0 rounded border-input"
            />
          )}
          <span className="flex h-9 w-9 shrink-0 items-center justify-center rounded-md bg-primary/10 text-primary">
            <FolderIcon className="h-5 w-5" aria-hidden="true" />
          </span>
          <div>
            <p className="text-sm font-medium text-foreground">{subcategory.name}</p>
            <p className="text-xs text-muted-foreground">/{subcategory.slug}</p>
          </div>
        </div>
        <StatusBadge status={subcategory.status} />
      </div>

      {subcategory.description && (
        <p className="line-clamp-2 text-sm text-muted-foreground">{subcategory.description}</p>
      )}

      <div className="border-t border-border pt-3 text-xs text-muted-foreground">
        Category: <span className="font-medium text-foreground">{categoryName ?? "—"}</span>
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
