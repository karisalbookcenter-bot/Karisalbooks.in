"use client";

import Link from "next/link";
import { useRouter } from "next/navigation";
import { useState } from "react";
import { Heart, ShoppingCart, Zap } from "lucide-react";

import { formatCurrency } from "@/lib/helpers/format.helpers";
import {
  calculateBookPrice,
  isBookDiscountEligible,
} from "@/lib/helpers/book-pricing.helpers";
import { useCart } from "@/features/cart/hooks/useCart";
import type { Book } from "@/types/book.types";

interface BookCardProps {
  book: Book;
  authorName?: string;
  publisherName?: string;
}

export function BookCard({
  book,
  authorName,
  publisherName,
}: BookCardProps) {
  const router = useRouter();
  const { addItem, toggleWishlist, isWishlisted } = useCart();

  const [added, setAdded] = useState(false);

  // --------------------------------------------------
  // PRE-BOOKING PERIOD CHECK
  // --------------------------------------------------

  const now = Date.now();

  const bookingStart = book.prebooking_start_at
    ? new Date(book.prebooking_start_at).getTime()
    : Number.POSITIVE_INFINITY;

  const bookingEnd = book.prebooking_end_at
    ? new Date(book.prebooking_end_at).getTime()
    : 0;

  const isPrebooking =
    book.prebooking_enabled === true &&
    Number.isFinite(bookingStart) &&
    Number.isFinite(bookingEnd) &&
    bookingStart <= now &&
    bookingEnd >= now &&
    book.prebooking_price != null &&
    Number.isFinite(Number(book.prebooking_price)) &&
    Number(book.prebooking_price) >= 0;

  // --------------------------------------------------
  // PRE-BOOKING OFFER CHECK
  // --------------------------------------------------

  const offerStart = book.prebooking_offer_start_at
    ? new Date(book.prebooking_offer_start_at).getTime()
    : Number.POSITIVE_INFINITY;

  const offerEnd = book.prebooking_offer_end_at
    ? new Date(book.prebooking_offer_end_at).getTime()
    : 0;

  const hasActiveOffer =
    isPrebooking &&
    book.prebooking_offer_price != null &&
    Number.isFinite(offerStart) &&
    Number.isFinite(offerEnd) &&
    offerStart <= now &&
    offerEnd >= now &&
    Number.isFinite(Number(book.prebooking_offer_price)) &&
    Number(book.prebooking_offer_price) >= 0 &&
    Number(book.prebooking_offer_price) <= Number(book.prebooking_price);

  // --------------------------------------------------
  // PRICE CALCULATION
  // Regular books retain the existing discount logic.
  // --------------------------------------------------

  const regularPrice = calculateBookPrice(
    book.price,
    isBookDiscountEligible(book.category_name)
  );

  const price = isPrebooking
    ? {
        originalPrice: Number(book.prebooking_price),
        discountedPrice: Number(
          hasActiveOffer
            ? book.prebooking_offer_price
            : book.prebooking_price
        ),
        discountAmount: hasActiveOffer
          ? Number(book.prebooking_price) -
            Number(book.prebooking_offer_price)
          : 0,
      }
    : regularPrice;

  // An active pre-booking does not require stock_quantity > 0.
  const inStock = isPrebooking || book.stock_quantity > 0;

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
      purchaseType: isPrebooking
        ? ("prebooking" as const)
        : ("books" as const),
      coverImageUrl: book.cover_image_url,
      authorName,
      publisherName,
      categoryName: book.category_name,
    };
  }

  function handleAddToCart() {
    if (!inStock) return;

    addItem(makeCartItem());
    setAdded(true);
  }

  function handleBuyNow() {
    if (!inStock) return;

    addItem(makeCartItem());
    router.push("/cart");
  }

  return (
    <article className="group flex h-full min-w-0 flex-col overflow-hidden rounded-xl border border-border bg-card transition-colors duration-200 hover:border-primary/40">
      {/* Book cover and wishlist */}
      <div className="relative">
        <Link
          href={`/books/${book.slug}`}
          aria-label={`View details for ${book.title}`}
          className="block"
        >
          <div className="relative flex aspect-[3/4] items-center justify-center overflow-hidden bg-white p-2 sm:p-3">
            {book.cover_image_url ? (
              // eslint-disable-next-line @next/next/no-img-element
              <img
                src={book.cover_image_url}
                alt={`Cover of ${book.title}`}
                loading="lazy"
                className="h-full w-full object-contain transition-transform duration-300 group-hover:scale-[1.02]"
              />
            ) : (
              <span className="flex h-full w-full items-center justify-center bg-secondary px-3 text-center text-sm text-muted-foreground">
                Cover coming soon
              </span>
            )}
          </div>
        </Link>

        <button
          type="button"
          aria-label={
            wishlisted
              ? `Remove ${book.title} from wishlist`
              : `Add ${book.title} to wishlist`
          }
          aria-pressed={wishlisted}
          title={wishlisted ? "Remove from wishlist" : "Add to wishlist"}
          onClick={() => toggleWishlist(makeCartItem())}
          className="absolute right-2 top-2 grid h-11 w-11 place-items-center rounded-full border border-border bg-card shadow-sm transition-colors hover:bg-secondary focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-primary"
        >
          <Heart
            size={21}
            aria-hidden="true"
            fill={wishlisted ? "currentColor" : "none"}
            className={wishlisted ? "text-primary" : "text-foreground"}
          />
        </button>

        {isPrebooking && (
          <span className="absolute left-2 top-2 rounded-md bg-primary px-2 py-1 text-xs font-semibold text-primary-foreground">
            Pre-booking
          </span>
        )}

        {isPrebooking && hasActiveOffer && (
          <span className="absolute bottom-2 left-2 rounded-md bg-emerald-700 px-2 py-1 text-xs font-semibold text-white">
            Offer
          </span>
        )}
      </div>

      {/* Book information */}
      <div className="flex flex-1 flex-col p-3 sm:p-4">
        {publisherName && (
          <p className="mb-1 line-clamp-1 text-xs font-semibold text-primary">
            {publisherName}
          </p>
        )}

        <h3 className="min-h-12 text-sm font-semibold leading-6 text-foreground sm:text-base">
          <Link
            href={`/books/${book.slug}`}
            className="rounded-sm hover:text-primary focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-primary"
          >
            {book.title}
          </Link>
        </h3>

        {authorName && (
          <p className="mt-1 line-clamp-2 text-sm leading-5 text-muted-foreground">
            {authorName}
          </p>
        )}

        {/* Price and availability */}
        <div className="mt-auto border-t border-border/70 pt-3">
          <div className="flex flex-wrap items-baseline gap-x-2 gap-y-1">
            <span className="text-base font-bold tabular-nums text-primary sm:text-lg">
              {formatCurrency(price.discountedPrice)}
            </span>

            {price.originalPrice > price.discountedPrice && (
              <span className="text-sm tabular-nums text-muted-foreground line-through">
                {formatCurrency(price.originalPrice)}
              </span>
            )}
          </div>

          {isPrebooking && hasActiveOffer && (
            <p className="mt-1 text-xs font-medium text-emerald-700">
              Pre-booking offer · Save{" "}
              {formatCurrency(price.discountAmount)}
            </p>
          )}

          {!isPrebooking && price.discountAmount > 0 && (
            <p className="mt-1 text-xs font-medium text-emerald-700">
              7% off · Save {formatCurrency(price.discountAmount)}
            </p>
          )}

          <p
            className={`mt-2 text-sm font-medium ${
              inStock ? "text-emerald-700" : "text-destructive"
            }`}
          >
            {isPrebooking
              ? "Available for pre-booking"
              : inStock
                ? "In stock"
                : "Currently unavailable"}
          </p>
        </div>

        {/* Add to Cart and Buy Now */}
        <div className="mt-3 flex flex-col gap-2 sm:flex-row">
          <button
            type="button"
            disabled={!inStock}
            onClick={handleAddToCart}
            aria-label={
              added
                ? `${book.title} added to cart`
                : `Add ${book.title} to cart`
            }
            className="inline-flex min-h-12 min-w-0 flex-1 items-center justify-center gap-2 rounded-lg bg-primary px-2 py-2 text-sm font-semibold text-primary-foreground transition-opacity hover:opacity-90 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-primary focus-visible:ring-offset-2 disabled:cursor-not-allowed disabled:opacity-50 sm:px-3"
          >
            <ShoppingCart size={18} aria-hidden="true" />
            <span className="truncate">
              {added ? "Added ✓" : "Add to Cart"}
            </span>
          </button>

          <button
            type="button"
            disabled={!inStock}
            onClick={handleBuyNow}
            className="inline-flex min-h-12 min-w-0 flex-1 items-center justify-center gap-2 rounded-lg border border-primary bg-background px-2 py-2 text-sm font-semibold text-primary transition-colors hover:bg-primary hover:text-primary-foreground focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-primary focus-visible:ring-offset-2 disabled:cursor-not-allowed disabled:opacity-50 sm:px-3"
          >
            <Zap size={18} aria-hidden="true" />
            <span className="truncate">Buy Now</span>
          </button>
        </div>

        <p className="sr-only" aria-live="polite">
          {added ? `${book.title} added to cart.` : ""}
        </p>
      </div>
    </article>
  );
}

