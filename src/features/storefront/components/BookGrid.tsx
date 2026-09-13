import { BookCard } from "./BookCard";
import type { Book } from "@/types/book.types";

interface BookGridProps {
  books: Book[];
  authorNamesById: Record<string, string>;
  publisherNamesById: Record<string, string>;
  emptyMessage?: string;
}

/**
 * BookGrid — Sprint 18. Name resolution is passed in as plain lookup
 * objects built once per page (via `.list({ pageSize: 1000 })` on
 * `authorService`/`publisherService`) rather than fetched per-card — the
 * same "fetch once, resolve many" shape `BookManagementOverview.tsx`
 * already established for its own author/publisher dropdowns.
 */
export function BookGrid({ books, authorNamesById, publisherNamesById, emptyMessage }: BookGridProps) {
  if (books.length === 0) {
    return (
      <p className="py-12 text-center text-sm text-muted-foreground">
        {emptyMessage ?? "No books found."}
      </p>
    );
  }

  return (
    <div className="grid grid-cols-2 gap-4 sm:grid-cols-3 lg:grid-cols-4">
      {books.map((book) => (
        <BookCard
          key={book.id}
          book={book}
          authorName={authorNamesById[book.author_id]}
          publisherName={book.publisher_id ? publisherNamesById[book.publisher_id] : undefined}
        />
      ))}
    </div>
  );
}
