"use client";

import { useEffect, useState } from "react";
import { useParams } from "next/navigation";
import Link from "next/link";
import { Heart, Minus, Plus, ShoppingCart } from "lucide-react";

import { MainLayout } from "@/components/layout/MainLayout";
import { SocialLinks } from "@/components/layout/SocialLinks";

import { formatCurrency } from "@/lib/helpers/format.helpers";

import {
  getPublicBookBySlug,
  listPublicBooks,
} from "@/features/storefront/services/book.storefront";

import { BookCard } from "@/features/storefront/components/BookCard";

import {
  getPublicAuthorName,
  getPublicPublisherName,
} from "@/features/storefront/services/author-publisher.storefront";

import { useCart } from "@/features/cart/hooks/useCart";

import type { CartItem } from "@/features/cart/types/cart.types";

import {
  calculateBookPrice,
  isBookDiscountEligible,
} from "@/lib/helpers/book-pricing.helpers";

import type { Book } from "@/types/book.types";

export default function BookDetailPage() {
  const { addItem, toggleWishlist, isWishlisted } = useCart();
  const params = useParams<{ slug: string }>();

  const [book, setBook] = useState<Book | null>(null);
  const [authorName, setAuthorName] = useState<string | null>(null);
  const [publisherName, setPublisherName] = useState<string | null>(null);
  const [relatedBooks, setRelatedBooks] = useState<Book[]>([]);
  const [quantity, setQuantity] = useState(1);
  const [loading, setLoading] = useState(true);
  const [notFound, setNotFound] = useState(false);
  const [addedToCart, setAddedToCart] = useState(false);

  useEffect(() => {
    let active = true;

    async function load() {
      setLoading(true);
      setNotFound(false);
      setQuantity(1);
      setAddedToCart(false);
      setBook(null);

      try {
        const result = await getPublicBookBySlug(params.slug);

        if (!active) return;

        if (!result) {
          setNotFound(true);
          return;
        }

        setBook(result);

        const [author, publisher, related] = await Promise.all([
          getPublicAuthorName(result.author_id),
          result.publisher_id
            ? getPublicPublisherName(result.publisher_id)
            : Promise.resolve(null),
          listPublicBooks({
            categoryId: result.category_id,
            pageSize: 5,
          }).catch(() => null),
        ]);

        if (!active) return;

        setAuthorName(author);
        setPublisherName(publisher);

        setRelatedBooks(
          (related?.items ?? [])
            .filter((item) => item.id !== result.id)
            .slice(0, 4)
        );
      } catch {
        if (active) {
          setNotFound(true);
        }
      } finally {
        if (active) {
          setLoading(false);
        }
      }
    }

    void load();

    return () => {
      active = false;
    };
  }, [params.slug]);

  if (loading) {
    return (
      <MainLayout>
        <div className="container py-16 text-center text-sm text-muted-foreground">
          Loading book details...
        </div>
      </MainLayout>
    );
  }

  if (notFound || !book) {
    return (
      <MainLayout>
        <div className="container flex flex-col items-center gap-4 py-16 text-center">
          <h1 className="text-2xl font-semibold">Book not found</h1>

          <Link
            href="/books"
            className="text-sm text-primary underline"
          >
            Back to all books
          </Link>
        </div>
      </MainLayout>
    );
  }

  // Pre-booking eligibility
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

  // Active pre-booking offer
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

  // Preserve regular book pricing
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

  const inStock = isPrebooking || book.stock_quantity > 0;

  const maxQuantity = isPrebooking
    ? Number.POSITIVE_INFINITY
    : Math.max(0, book.stock_quantity);

  const wishlisted = isWishlisted(book.id);

function makeCartItem(itemQuantity: number): CartItem {
  const currentBook = book;

  if (!currentBook) {
    throw new Error("Book details are not available.");
  }

  return {
    id: currentBook.id,
    title: currentBook.title,
    slug: currentBook.slug,
    price: price.discountedPrice,
    originalPrice: price.originalPrice,
    discountAmount: price.discountAmount,
    quantity: itemQuantity,
    purchaseType: isPrebooking ? "prebooking" : "books",
    coverImageUrl: currentBook.cover_image_url,
    authorName: authorName ?? undefined,
    publisherName: publisherName ?? undefined,
    categoryName: currentBook.category_name,
  };
}


  function handleAddToCart() {
    if (!inStock) return;

    addItem(makeCartItem(quantity));
    setAddedToCart(true);
  }

  return (
    <MainLayout>
      <div className="mx-auto max-w-6xl px-4 py-6 sm:px-6 lg:px-8">
        <nav
          aria-label="Breadcrumb"
          className="mb-5 flex flex-wrap items-center gap-2 text-xs text-muted-foreground"
        >
          <Link href="/" className="hover:text-foreground">
            Home
          </Link>

          <span aria-hidden="true">/</span>

          <Link href="/books" className="hover:text-foreground">
            Books
          </Link>

          <span aria-hidden="true">/</span>

          <span className="max-w-[18rem] truncate text-foreground">
            {book.title}
          </span>
        </nav>

        <div className="grid items-start gap-6 lg:grid-cols-[minmax(0,1fr)_250px]">
          <div className="min-w-0 space-y-6">
            <section className="grid overflow-hidden rounded-lg border border-border bg-card md:grid-cols-[minmax(240px,0.9fr)_1.1fr]">
              <div className="flex min-h-[360px] items-center justify-center bg-white p-5 sm:min-h-[480px] sm:p-8">
                {book.cover_image_url ? (
                  // eslint-disable-next-line @next/next/no-img-element
                  <img
                    src={book.cover_image_url}
                    alt={book.title}
                    className="max-h-[560px] w-full object-contain"
                  />
                ) : (
                  <span className="text-sm text-muted-foreground">
                    Cover coming soon
                  </span>
                )}
              </div>

              <div className="flex flex-col p-5 sm:p-8">
                <span
                  className={`mb-3 w-fit rounded-sm px-2 py-1 text-[10px] font-semibold uppercase tracking-wide ${
                    inStock
                      ? "bg-emerald-50 text-emerald-800"
                      : "bg-red-50 text-red-700"
                  }`}
                >
                  {isPrebooking
                    ? "Pre-booking"
                    : inStock
                      ? "Available"
                      : "Out of stock"}
                </span>

                <h1 className="text-2xl font-semibold leading-tight sm:text-3xl">
                  {book.title}
                </h1>

                {authorName && (
                  <p className="mt-2 text-sm text-muted-foreground">
                    by <span className="text-foreground">{authorName}</span>
                  </p>
                )}

                {publisherName && (
                  <p className="mt-1 text-xs text-muted-foreground">
                    Published by {publisherName}
                  </p>
                )}

                <div className="my-5 border-y border-border py-4">
                  <div className="flex flex-wrap items-baseline gap-x-3 gap-y-1">
                    <p className="text-xl font-semibold tabular-nums text-primary">
                      {formatCurrency(price.discountedPrice)}
                    </p>

                    {price.originalPrice > price.discountedPrice && (
                      <p className="text-sm tabular-nums text-muted-foreground line-through">
                        {formatCurrency(price.originalPrice)}
                      </p>
                    )}

                    {isPrebooking && hasActiveOffer && (
                      <span className="text-xs font-semibold text-emerald-700">
                        Offer · Save {formatCurrency(price.discountAmount)}
                      </span>
                    )}

                    {!isPrebooking && price.discountAmount > 0 && (
                      <span className="text-xs font-semibold text-emerald-700">
                        7% off · Save {formatCurrency(price.discountAmount)}
                      </span>
                    )}
                  </div>

                  <p
                    className={`mt-1 text-xs ${
                      inStock ? "text-emerald-700" : "text-destructive"
                    }`}
                  >
                    {isPrebooking
                      ? "Available for pre-booking"
                      : inStock
                        ? `${book.stock_quantity} available`
                        : "Currently unavailable"}
                  </p>
                </div>

                {book.description && (
                  <p className="line-clamp-5 whitespace-pre-line text-sm leading-6 text-muted-foreground">
                    {book.description}
                  </p>
                )}

                {book.isbn && (
                  <p className="mt-4 text-xs text-muted-foreground">
                    ISBN <span className="ml-2 text-foreground">{book.isbn}</span>
                  </p>
                )}

                <div className="mt-auto flex flex-wrap items-center gap-3 pt-6">
                  {inStock && (
                    <div
                      className="flex h-10 items-center rounded-md border border-border"
                      aria-label="Quantity"
                    >
                      <button
                        type="button"
                        aria-label="Decrease quantity"
                        disabled={quantity <= 1}
                        onClick={() =>
                          setQuantity((value) => Math.max(1, value - 1))
                        }
                        className="grid h-10 w-10 place-items-center text-foreground disabled:opacity-40"
                      >
                        <Minus size={15} />
                      </button>

                      <span className="min-w-8 text-center text-sm tabular-nums">
                        {quantity}
                      </span>

                      <button
                        type="button"
                        aria-label="Increase quantity"
                        disabled={quantity >= maxQuantity}
                        onClick={() =>
                          setQuantity((value) =>
                            Math.min(maxQuantity, value + 1)
                          )
                        }
                        className="grid h-10 w-10 place-items-center text-foreground disabled:opacity-40"
                      >
                        <Plus size={15} />
                      </button>
                    </div>
                  )}

                  <button
                    type="button"
                    aria-label={
                      wishlisted ? "Remove from wishlist" : "Add to wishlist"
                    }
                    aria-pressed={wishlisted}
                    title={
                      wishlisted ? "Remove from wishlist" : "Add to wishlist"
                    }
                    onClick={() => toggleWishlist(makeCartItem(1))}
                    className="grid h-10 w-10 shrink-0 place-items-center rounded-md border border-border text-primary transition hover:bg-secondary"
                  >
                    <Heart
                      size={18}
                      fill={wishlisted ? "currentColor" : "none"}
                    />
                  </button>

                  <button
                    type="button"
                    disabled={!inStock}
                    onClick={handleAddToCart}
                    className="inline-flex h-10 flex-1 items-center justify-center gap-2 rounded-md bg-primary px-5 text-sm font-semibold text-primary-foreground transition hover:opacity-90 disabled:cursor-not-allowed disabled:opacity-50 sm:flex-none"
                  >
                    <ShoppingCart size={16} />

                    {addedToCart
                      ? "Added to cart · add another"
                      : "Add to cart"}
                  </button>
                </div>

                <div className="mt-4">
                  <SocialLinks />
                </div>
              </div>
            </section>

            <section className="grid overflow-hidden rounded-lg border border-border bg-card sm:grid-cols-[150px_minmax(0,1fr)]">
              <h2 className="border-b border-border p-4 text-sm font-semibold sm:border-b-0 sm:border-r">
                Description
              </h2>

              <div className="p-4 sm:p-5">
                {book.description ? (
                  <p className="whitespace-pre-line text-sm leading-7 text-muted-foreground">
                    {book.description}
                  </p>
                ) : (
                  <p className="text-sm text-muted-foreground">
                    No description is available for this book yet.
                  </p>
                )}
              </div>
            </section>

            {relatedBooks.length > 0 && (
              <section aria-labelledby="related-books-title">
                <div className="mb-4 flex items-center justify-between border-b border-border pb-2">
                  <h2 id="related-books-title" className="text-base font-semibold">
                    Related books
                  </h2>

                  <Link
                    href="/books"
                    className="text-xs font-medium text-primary hover:underline"
                  >
                    Browse all
                  </Link>
                </div>

                <div className="grid grid-cols-2 gap-3 sm:grid-cols-4 sm:gap-4">
                  {relatedBooks.map((relatedBook) => (
                    <BookCard key={relatedBook.id} book={relatedBook} />
                  ))}
                </div>
              </section>
            )}
          </div>

          <aside className="space-y-5 lg:sticky lg:top-6">
            {relatedBooks.length > 0 && (
              <section className="rounded-lg border border-border bg-card p-4">
                <h2 className="mb-3 border-b border-border pb-3 text-sm font-semibold">
                  Explore this category
                </h2>

                <ul className="divide-y divide-border">
                  {relatedBooks.slice(0, 3).map((relatedBook) => (
                    <li
                      key={relatedBook.id}
                      className="py-3 first:pt-0 last:pb-0"
                    >
                      <Link
                        href={`/books/${relatedBook.slug}`}
                        className="flex gap-3"
                      >
                        {relatedBook.cover_image_url ? (
                          // eslint-disable-next-line @next/next/no-img-element
                          <img
                            src={relatedBook.cover_image_url}
                            alt=""
                            className="h-16 w-12 rounded-sm object-contain"
                          />
                        ) : (
                          <span className="h-16 w-12 rounded-sm bg-muted" />
                        )}

                        <span className="min-w-0">
                          <span className="line-clamp-2 block text-xs font-medium leading-5">
                            {relatedBook.title}
                          </span>

                          <span className="mt-1 block text-xs font-semibold text-primary">
                            {formatCurrency(relatedBook.price)}
                          </span>
                        </span>
                      </Link>
                    </li>
                  ))}
                </ul>
              </section>
            )}

            <Link
              href="/books"
              className="block rounded-lg border border-border bg-secondary/50 p-4 text-sm font-medium hover:border-primary/40"
            >
              <span className="block">Looking for another book?</span>

              <span className="mt-1 block text-xs font-normal text-muted-foreground">
                Browse the complete collection
              </span>
            </Link>
          </aside>
        </div>
      </div>
    </MainLayout>
  );
}
