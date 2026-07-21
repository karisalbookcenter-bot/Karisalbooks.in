"use client";

import { getIcon } from "@/lib/icons";
import { StatusBadge } from "@/components/common/StatusBadge";
import { Button } from "@/components/ui/button";
import { cn } from "@/lib/utils";
import type { AuthorCardProps } from "@/features/admin/types/author-management.types";

/**
 * AuthorCard — Sprint 11 (Task 14).
 *
 * Mirrors `CategoryCard`/`SubcategoryCard` (Sprints 08–09) closely.
 * Shows a photo (via `author.photo_url`, falling back to the same
 * icon-in-a-tinted-circle placeholder every other card in this app
 * uses when no image exists) and, when supplied, a book count — the
 * Book ↔ Author relationship surfaced in the UI (Task 12's repository
 * support, `getBookCountForAuthor`, consumed here as a plain prop).
 */
export function AuthorCard({ author, bookCount, selected, onToggleSelect, onEdit, onDelete, className }: AuthorCardProps) {
  const UserIcon = getIcon("user-circle");

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
              aria-label={`Select ${author.name}`}
              className="mt-1 h-4 w-4 shrink-0 rounded border-input"
            />
          )}
          {author.photo_url ? (
            // eslint-disable-next-line @next/next/no-img-element
            <img
              src={author.photo_url}
              alt={author.name}
              className="h-9 w-9 shrink-0 rounded-full object-cover"
            />
          ) : (
            <span className="flex h-9 w-9 shrink-0 items-center justify-center rounded-full bg-primary/10 text-primary">
              <UserIcon className="h-5 w-5" aria-hidden="true" />
            </span>
          )}
          <div>
            <p className="text-sm font-medium text-foreground">{author.name}</p>
            <p className="text-xs text-muted-foreground">/{author.slug}</p>
          </div>
        </div>
        <StatusBadge status={author.status} />
      </div>

      {author.bio && <p className="line-clamp-2 text-sm text-muted-foreground">{author.bio}</p>}

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
