import { BookCard } from "./BookCard";
import type { Book } from "@/types/book.types";

interface BookGridProps {
  books: Book[];
  authorNamesById: Record<string, string>;
  publisherNamesById: Record<string, string>;
  emptyMessage?: string;
}

export function BookGrid({
  books,
  authorNamesById,
  publisherNamesById,
  emptyMessage,
}: BookGridProps) {
  if (books.length === 0) {
    return (
      <div
        className="flex min-h-48 flex-col items-center justify-center rounded-xl border border-dashed p-6 text-center"
        role="status"
        aria-live="polite"
      >
        <p className="text-base font-semibold text-foreground">
          {emptyMessage ?? "புத்தகங்கள் எதுவும் கிடைக்கவில்லை."}
        </p>

        <p className="mt-2 max-w-md text-sm leading-6 text-muted-foreground">
          தேடல் சொல் அல்லது தேர்ந்தெடுத்த வடிகட்டிகளை மாற்றிப் பார்த்து
          மீண்டும் முயற்சி செய்யுங்கள்.
        </p>
      </div>
    );
  }

  return (
    <div
      className="grid grid-cols-2 items-stretch gap-3 sm:gap-4 md:grid-cols-3 lg:grid-cols-4 xl:gap-5"
      aria-label="புத்தகங்கள்"
    >
      {books.map((book) => (
        <div key={book.id} className="min-w-0">
          <BookCard
            book={book}
            authorName={authorNamesById[book.author_id]}
            publisherName={
              book.publisher_id
                ? publisherNamesById[book.publisher_id]
                : undefined
            }
          />
        </div>
      ))}
    </div>
  );
}

