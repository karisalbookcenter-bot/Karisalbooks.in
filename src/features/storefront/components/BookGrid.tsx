import { BookCard } from "./BookCard";
import type { Book } from "@/types/book.types";

interface BookGridProps {
  books: Book[];
  authorNamesById: Record<string, string>;
  publisherNamesById: Record<string, string>;
  emptyMessage?: string;
}

export function BookGrid({ books, authorNamesById, publisherNamesById, emptyMessage }: BookGridProps) {
  if (books.length === 0) {
    return (
      <p className="py-12 text-center text-sm text-muted-foreground">{emptyMessage ?? "No books found."}</p>
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
