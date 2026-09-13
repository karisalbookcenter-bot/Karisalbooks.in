import Link from "next/link";
import { formatCurrency } from "@/lib/helpers/format.helpers";
import type { Book } from "@/types/book.types";

interface BookCardProps {
  book: Book;
  authorName?: string;
  publisherName?: string;
}

/**
 * BookCard — Sprint 18. Storefront-only, deliberately not reused from
 * `@/features/admin/components/books/BookCard.tsx` — that component's
 * props/styling are admin-specific (selection checkboxes, edit/delete
 * actions), and pulling it into the public site would couple the
 * storefront to the admin feature folder, the opposite of what a "clean
 * foundation" for future Cart/Checkout should do.
 */
export function BookCard({ book, authorName, publisherName }: BookCardProps) {
  const inStock = book.stock_quantity > 0;

  return (
    <Link
      href={`/books/${book.slug}`}
      className="flex flex-col overflow-hidden rounded-md border border-border bg-card transition hover:shadow-md"
    >
      <div className="flex aspect-[2/3] items-center justify-center bg-muted">
        {book.cover_image_url ? (
          // eslint-disable-next-line @next/next/no-img-element
          <img src={book.cover_image_url} alt={book.title} className="h-full w-full object-cover" />
        ) : (
          <span className="text-xs text-muted-foreground">No cover</span>
        )}
      </div>
      <div className="flex flex-1 flex-col gap-1 p-3">
        <h3 className="line-clamp-2 text-sm font-medium text-foreground">{book.title}</h3>
        {authorName && <p className="text-xs text-muted-foreground">{authorName}</p>}
        {publisherName && <p className="text-xs text-muted-foreground">{publisherName}</p>}
        <div className="mt-auto flex items-center justify-between pt-2">
          <span className="text-sm font-semibold text-foreground">
            {formatCurrency(book.price)}
          </span>
          <span className={`text-xs ${inStock ? "text-muted-foreground" : "text-destructive"}`}>
            {inStock ? "In stock" : "Out of stock"}
          </span>
        </div>
      </div>
    </Link>
  );
}
