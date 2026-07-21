"use client";

import { getIcon } from "@/lib/icons";
import { StatusBadge } from "@/components/common/StatusBadge";
import { Button } from "@/components/ui/button";
import { cn } from "@/lib/utils";
import type { PublisherCardProps } from "@/features/admin/types/publisher-management.types";

/**
 * PublisherCard — Sprint 11 (Task 15). Mirrors `AuthorCard`, with a
 * building icon (no photo field for publishers) and a website link
 * instead of a bio.
 */
export function PublisherCard({
  publisher,
  bookCount,
  selected,
  onToggleSelect,
  onEdit,
  onDelete,
  className,
}: PublisherCardProps) {
  const BuildingIcon = getIcon("building-2");

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
              aria-label={`Select ${publisher.name}`}
              className="mt-1 h-4 w-4 shrink-0 rounded border-input"
            />
          )}
          <span className="flex h-9 w-9 shrink-0 items-center justify-center rounded-md bg-primary/10 text-primary">
            <BuildingIcon className="h-5 w-5" aria-hidden="true" />
          </span>
          <div>
            <p className="text-sm font-medium text-foreground">{publisher.name}</p>
            <p className="text-xs text-muted-foreground">/{publisher.slug}</p>
          </div>
        </div>
        <StatusBadge status={publisher.status} />
      </div>

      {publisher.description && (
        <p className="line-clamp-2 text-sm text-muted-foreground">{publisher.description}</p>
      )}

      {publisher.website_url && (
        <a
          href={publisher.website_url}
          target="_blank"
          rel="noreferrer"
          className="truncate text-xs text-primary underline-offset-2 hover:underline"
        >
          {publisher.website_url}
        </a>
      )}

      {bookCount !== undefined && (
        <div className="border-t border-border pt-3 text-xs text-muted-foreground">
          {bookCount} book{bookCount === 1 ? "" : "s"}
        </div>
      )}

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
