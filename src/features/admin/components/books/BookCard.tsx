"use client";

import { StatusBadge } from "@/components/common";
import { formatCurrency } from "@/lib/helpers/format.helpers";
import type { BookCardProps } from "@/features/admin/types/book-management.types";

export function BookCard({ book, categoryName, authorName, onEdit, onDelete }: BookCardProps) {
  return (
    <div className="flex flex-col overflow-hidden rounded-md border border-border bg-card">
      <div className="flex h-40 items-center justify-center bg-muted">
        {book.cover_image_url ? (
          // eslint-disable-next-line @next/next/no-img-element
          <img src={book.cover_image_url} alt={book.title} className="h-full w-full object-cover" />
        ) : (
          <span className="text-xs text-muted-foreground">No cover</span>
        )}
      </div>
      <div className="flex flex-1 flex-col gap-1 p-4">
        <div className="flex items-start justify-between gap-2">
          <h3 className="text-sm font-medium text-foreground">{book.title}</h3>
          <StatusBadge status={book.status} />
        </div>
        <p className="text-xs text-muted-foreground">
          {categoryName ?? "—"} · {authorName ?? "—"}
        </p>
        <p className="mt-1 text-sm font-medium text-foreground">{formatCurrency(book.price)}</p>
        <p className="text-xs text-muted-foreground">Stock: {book.stock_quantity}</p>
        <div className="mt-3 flex gap-3 border-t border-border pt-3 text-sm">
          <button className="text-muted-foreground hover:text-foreground" onClick={() => onEdit?.(book)}>
            Edit
          </button>
          <button className="text-destructive hover:opacity-80" onClick={() => onDelete?.(book)}>
            Delete
          </button>
        </div>
      </div>
    </div>
  );
}
