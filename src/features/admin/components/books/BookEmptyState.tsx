"use client";

import { EmptyState } from "@/components/common";

interface BookEmptyStateProps {
  variant?: "no-books" | "no-results";
  onAddBook?: () => void;
}

export function BookEmptyState({ variant = "no-books", onAddBook }: BookEmptyStateProps) {
  if (variant === "no-results") {
    return (
      <EmptyState
        icon="search"
        title="No books match your filters"
        description="Try a different search term or clear the current filters."
      />
    );
  }

  return (
    <EmptyState
      icon="book-open"
      title="No books yet"
      description="Add your first book to start building the catalog."
      action={onAddBook ? { label: "Add Book", onClick: onAddBook } : undefined}
    />
  );
}
