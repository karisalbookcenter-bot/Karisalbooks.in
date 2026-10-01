import Link from "next/link";
import { formatCurrency } from "@/lib/helpers/format.helpers";
import type { Book } from "@/types/book.types";

interface BookCardProps {
  book: Book;
  authorName?: string;
  publisherName?: string;
}

/**
 * BookCard — Sprint 18 (recreated). Storefront-only; not reused from the
 * admin `BookCard.tsx` (admin-specific props: selection, edit/delete —
 * reusing it would couple the public site to the admin feature folder).
 */
export function BookCard({ book, authorName, publisherName }: BookCardProps) {
  const inStock = book.stock_quantity > 0;

  return (
    <Link
      href={`/books/${book.slug}`}
      className="group flex min-w-0 flex-col overflow-hidden rounded-md border border-border/80 bg-card transition duration-200 hover:-translate-y-0.5 hover:border-primary/30 hover:shadow-lg"
    >
      <div className="relative flex aspect-[3/4] items-center justify-center overflow-hidden bg-white p-2 sm:p-3">
        {book.cover_image_url ? (
          // eslint-disable-next-line @next/next/no-img-element
          <img src={book.cover_image_url} alt={book.title} loading="lazy" className="h-full w-full object-contain transition-transform duration-300 group-hover:scale-[1.025]" />
        ) : (
          <span className="flex h-full w-full items-center justify-center bg-secondary px-4 text-center text-xs text-muted-foreground">Cover coming soon</span>
        )}
      </div>
      <div className="flex flex-1 flex-col px-3 pb-3 pt-3 sm:px-4">
        {publisherName && <p className="mb-1 line-clamp-1 text-[10px] font-semibold uppercase text-primary/80">{publisherName}</p>}
        <h3 className="line-clamp-2 min-h-10 text-sm font-medium leading-5 text-foreground">{book.title}</h3>
        {authorName && <p className="mt-1 line-clamp-1 text-xs text-muted-foreground">{authorName}</p>}
        <div className="mt-auto flex flex-wrap items-baseline justify-between gap-x-2 gap-y-1 border-t border-border/70 pt-3">
          <span className="text-sm font-semibold tabular-nums text-foreground">{formatCurrency(book.price)}</span>
          <span className={`text-[10px] font-medium ${inStock ? "text-emerald-700" : "text-destructive"}`}>
            {inStock ? "In stock" : "Unavailable"}
          </span>
        </div>
      </div>
    </Link>
  );
}
