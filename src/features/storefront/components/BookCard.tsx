"use client";

import Link from "next/link";
import { useState } from "react";
import { Heart, ShoppingCart } from "lucide-react";
import { formatCurrency } from "@/lib/helpers/format.helpers";
import { calculateBookPrice, isBookDiscountEligible } from "@/lib/helpers/book-pricing.helpers";
import { useCart } from "@/features/cart/hooks/useCart";
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
  const { addItem, toggleWishlist, isWishlisted } = useCart();
  const [added, setAdded] = useState(false);
  const price = calculateBookPrice(book.price, isBookDiscountEligible(book.category_name));
  const wishlisted = isWishlisted(book.id);

  function makeCartItem() {
    return {
      id: book.id,
      title: book.title,
      slug: book.slug,
      price: price.discountedPrice,
      originalPrice: price.originalPrice,
      discountAmount: price.discountAmount,
      quantity: 1,
      coverImageUrl: book.cover_image_url,
      authorName,
      publisherName,
      categoryName: book.category_name,
    };
  }

  return (
    <article className="group flex min-w-0 flex-col overflow-hidden rounded-md border border-border/80 bg-card transition duration-200 hover:-translate-y-0.5 hover:border-primary/30 hover:shadow-lg">
      <div className="relative">
        <Link href={`/books/${book.slug}`} aria-label={`View ${book.title}`}>
          <div className="relative flex aspect-[3/4] items-center justify-center overflow-hidden bg-white p-2 sm:p-3">
        {book.cover_image_url ? (
          // eslint-disable-next-line @next/next/no-img-element
          <img src={book.cover_image_url} alt={book.title} loading="lazy" className="h-full w-full object-contain transition-transform duration-300 group-hover:scale-[1.025]" />
        ) : (
          <span className="flex h-full w-full items-center justify-center bg-secondary px-4 text-center text-xs text-muted-foreground">Cover coming soon</span>
        )}
          </div>
        </Link>
        <button
          type="button"
          aria-label={wishlisted ? `Remove ${book.title} from wishlist` : `Add ${book.title} to wishlist`}
          aria-pressed={wishlisted}
          title={wishlisted ? "Remove from wishlist" : "Add to wishlist"}
          onClick={() => toggleWishlist(makeCartItem())}
          className="absolute right-2 top-2 grid h-10 w-10 place-items-center rounded-full border border-border bg-card/95 text-primary shadow-sm transition hover:bg-card"
        >
          <Heart size={18} fill={wishlisted ? "currentColor" : "none"} />
        </button>
      </div>
      <div className="flex flex-1 flex-col px-3 pb-3 pt-3 sm:px-4">
        {publisherName && <p className="mb-1 line-clamp-1 text-[10px] font-semibold uppercase text-primary/80">{publisherName}</p>}
        <h3 className="line-clamp-2 min-h-10 text-sm font-medium leading-5 text-foreground"><Link href={`/books/${book.slug}`} className="hover:text-primary">{book.title}</Link></h3>
        {authorName && <p className="mt-1 line-clamp-1 text-xs text-muted-foreground">{authorName}</p>}
        <div className="mt-auto border-t border-border/70 pt-3">
          <div className="flex flex-wrap items-baseline gap-x-2 gap-y-1">
            <span className="text-sm font-semibold tabular-nums text-primary">{formatCurrency(price.discountedPrice)}</span>
            {price.discountAmount > 0 && <span className="text-xs tabular-nums text-muted-foreground line-through">{formatCurrency(price.originalPrice)}</span>}
          </div>
          {price.discountAmount > 0 && <p className="mt-1 text-[11px] font-medium text-emerald-700">7% off · Save {formatCurrency(price.discountAmount)}</p>}
          <span className={`text-[10px] font-medium ${inStock ? "text-emerald-700" : "text-destructive"}`}>
            {inStock ? "In stock" : "Unavailable"}
          </span>
        </div>
        <button
          type="button"
          disabled={!inStock}
          onClick={() => {
            addItem(makeCartItem());
            setAdded(true);
          }}
          className="mt-3 inline-flex min-h-10 w-full items-center justify-center gap-2 rounded-md bg-primary px-3 text-xs font-semibold text-primary-foreground transition hover:opacity-90 disabled:cursor-not-allowed disabled:opacity-50 sm:text-sm"
        >
          <ShoppingCart size={15} aria-hidden="true" />
          {added ? "Added · add another" : "Add to cart"}
        </button>
      </div>
    </article>
  );
}
