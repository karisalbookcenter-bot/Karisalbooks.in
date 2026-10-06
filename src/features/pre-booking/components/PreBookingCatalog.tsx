"use client";

import { useEffect, useMemo, useState } from "react";
import Link from "next/link";
import {
  ArrowRight,
  CalendarDays,
  Clock3,
  ShoppingCart,
} from "lucide-react";

import { useCart } from "@/features/cart/hooks/useCart";
import {
  listOpenPreBookings,
} from "@/features/pre-booking/services/pre-booking.storefront";
import {
  listPublicBooks,
} from "@/features/storefront/services/book.storefront";

import { formatCurrency } from "@/lib/helpers/format.helpers";
import type { Book } from "@/types/book.types";

type PreBookingBook = Book & {
  prebooking_customize_enabled?: boolean;
};

type BookingMode = "prebooking" | "bulk" | "customize";

function salePrice(book: Book) {
  const now = Date.now();

  const offerStart = book.prebooking_offer_start_at
    ? new Date(book.prebooking_offer_start_at).getTime()
    : 0;

  const offerEnd = book.prebooking_offer_end_at
    ? new Date(book.prebooking_offer_end_at).getTime()
    : 0;

  const active =
    book.prebooking_offer_price !== null &&
    book.prebooking_offer_price !== undefined &&
    offerStart <= now &&
    offerEnd >= now;

  return {
    price: active
      ? Number(book.prebooking_offer_price)
      : Number(book.prebooking_price),
    hasOffer: active,
  };
}

function dateLabel(value?: string | null) {
  return value
    ? new Intl.DateTimeFormat("en-IN", {
        dateStyle: "medium",
      }).format(new Date(value))
    : "Date to be announced";
}

export function PreBookingCatalog() {
  const { items, addItem } = useCart();

  const [books, setBooks] = useState<PreBookingBook[]>([]);
  const [catalogueBooks, setCatalogueBooks] = useState<Book[]>([]);

  const [loading, setLoading] = useState(true);
  const [catalogueLoading, setCatalogueLoading] = useState(true);

  const [error, setError] = useState("");
  const [addedId, setAddedId] = useState<string | null>(null);

  const [bookingMode, setBookingMode] =
    useState<BookingMode>("prebooking");

  const [bulkBookId, setBulkBookId] = useState("");
  const [bulkQuantity, setBulkQuantity] = useState("1");

  const [customizeQuantities, setCustomizeQuantities] =
    useState<Record<string, number>>({});

  const hasRegularItems = items.some(
    (item) => item.purchaseType !== "prebooking",
  );

  /*
   * Open pre-booking titles
   */
  useEffect(() => {
    listOpenPreBookings()
      .then((result) => {
        setBooks(result as PreBookingBook[]);
      })
      .catch((loadError) => {
        const message =
          loadError instanceof Error
            ? loadError.message
            : "Unable to load pre-booking titles.";

        setError(
          message.includes("prebooking_")
            ? "Pre-booking setup is not complete yet. Please check back soon."
            : message,
        );
      })
      .finally(() => {
        setLoading(false);
      });
  }, []);

  /*
   * Full published catalogue
   *
   * Bulk Booking can use any catalogue book.
   */
  useEffect(() => {
    listPublicBooks({
      pageSize: 100,
    })
      .then((result) => {
        setCatalogueBooks(result.items);
      })
      .catch((loadError) => {
        console.error(
          "Unable to load catalogue for bulk booking:",
          loadError,
        );
      })
      .finally(() => {
        setCatalogueLoading(false);
      });
  }, []);

  /*
   * Only books explicitly enabled by admin
   * are available for Customize.
   */
  const customizeBooks = useMemo(
    () =>
      books.filter(
        (book) =>
          book.prebooking_customize_enabled === true,
      ),
    [books],
  );

  const customizeTotalCopies = useMemo(
    () =>
      Object.values(customizeQuantities).reduce(
        (total, quantity) => total + quantity,
        0,
      ),
    [customizeQuantities],
  );

  function ensurePrebookingCart() {
    if (hasRegularItems) {
      setError(
        "Your cart contains regular books. Complete that order or remove those books before starting a pre-booking order.",
      );

      return false;
    }

    return true;
  }

  function addPrebooking(book: Book, quantity = 1) {
    if (!ensurePrebookingCart()) {
      return;
    }

    if (!Number.isInteger(quantity) || quantity < 1) {
      setError("Enter a valid quantity.");
      return;
    }

    const { price } = salePrice(book);

    addItem({
      id: book.id,
      title: book.title,
      slug: book.slug,
      price,
      quantity,
      purchaseType: "prebooking",
      coverImageUrl: book.cover_image_url,
    });

    setError("");
    setAddedId(book.id);
  }

  function handleBulkAdd() {
    if (!bulkBookId) {
      setError("Select a book for Bulk Booking.");
      return;
    }

    const quantity = Number(bulkQuantity);

    if (
      !Number.isInteger(quantity) ||
      quantity < 1
    ) {
      setError("Enter a valid Bulk Booking quantity.");
      return;
    }

    const selectedBook = catalogueBooks.find(
      (book) => book.id === bulkBookId,
    );

    if (!selectedBook) {
      setError("The selected book is no longer available.");
      return;
    }

    /*
     * Bulk Booking accepts any catalogue book.
     *
     * If this book is not currently a pre-booking title,
     * the current checkout pricing flow cannot treat it
     * as a pre-booking item yet.
     */
    if (!selectedBook.prebooking_enabled) {
      setError(
        "This catalogue book is not currently open for pre-booking. Manual Bulk Booking for non-pre-booking titles will be handled through the Book Enquiry flow.",
      );
      return;
    }

    addPrebooking(selectedBook, quantity);
  }

  function updateCustomizeQuantity(
    bookId: string,
    quantity: number,
  ) {
    setCustomizeQuantities((current) => {
      const next = { ...current };

      if (quantity <= 0) {
        delete next[bookId];
      } else {
        next[bookId] = quantity;
      }

      return next;
    });

    setError("");
  }

  function addCustomizeBooks() {
    if (!ensurePrebookingCart()) {
      return;
    }

    if (customizeTotalCopies < 200) {
      setError(
        `Customize orders require a minimum of 200 copies. Current total: ${customizeTotalCopies}.`,
      );
      return;
    }

    const selectedBooks = customizeBooks.filter(
      (book) =>
        (customizeQuantities[book.id] ?? 0) > 0,
    );

    if (selectedBooks.length === 0) {
      setError(
        "Select at least one book for the Customize order.",
      );
      return;
    }

    for (const book of selectedBooks) {
      const quantity =
        customizeQuantities[book.id] ?? 0;

      const { price } = salePrice(book);

      addItem({
        id: book.id,
        title: book.title,
        slug: book.slug,
        price,
        quantity,
        purchaseType: "prebooking",
        coverImageUrl: book.cover_image_url,
      });
    }

    setError("");
    setAddedId("customize");
  }

  return (
    <>
      {/* =====================================================
          HERO
          ===================================================== */}

      <section className="border-b border-border bg-secondary/50">
        <div className="container py-10 sm:py-14">
          <p className="mb-3 text-xs font-semibold uppercase tracking-wide text-primary">
            Karisal Books · Early access
          </p>

          <h1 className="max-w-3xl text-3xl font-semibold leading-tight sm:text-4xl">
            Be among the first to read what’s coming next.
          </h1>

          <p className="mt-4 max-w-2xl text-sm leading-6 text-muted-foreground sm:text-base">
            Reserve forthcoming titles during their booking
            period. Your pre-booking ID is emailed after
            payment, and we’ll let you know when the book is
            ready to ship.
          </p>

          <div className="mt-6 flex flex-wrap gap-x-6 gap-y-3 text-xs text-muted-foreground">
            <span className="inline-flex items-center gap-2">
              <CalendarDays size={15} />
              Fixed booking dates
            </span>

            <span className="inline-flex items-center gap-2">
              <Clock3 size={15} />
              Limited-time offers on selected titles
            </span>
          </div>
        </div>
      </section>

      {/* =====================================================
          BOOKING MODE
          ===================================================== */}

      <section className="container pt-8 sm:pt-10">
        <div className="rounded-lg border border-border bg-card p-4 sm:p-5">
          <div>
            <h2 className="text-lg font-semibold">
              Choose your booking type
            </h2>

            <p className="mt-1 text-xs leading-5 text-muted-foreground">
              Choose regular Pre-booking, Bulk Booking, or
              Customize according to your requirement.
            </p>
          </div>

          <div
            className="mt-5 grid gap-3 md:grid-cols-3"
            role="radiogroup"
            aria-label="Booking type"
          >
            <label
              className={`cursor-pointer rounded-md border p-4 transition-colors ${
                bookingMode === "prebooking"
                  ? "border-primary bg-primary/5"
                  : "border-border hover:bg-secondary"
              }`}
            >
              <div className="flex items-start gap-3">
                <input
                  type="radio"
                  name="bookingMode"
                  value="prebooking"
                  checked={bookingMode === "prebooking"}
                  onChange={() =>
                    setBookingMode("prebooking")
                  }
                  className="mt-1 h-4 w-4 accent-primary"
                />

                <span>
                  <span className="block text-sm font-semibold">
                    Pre-booking
                  </span>

                  <span className="mt-1 block text-xs leading-5 text-muted-foreground">
                    Reserve individual forthcoming titles
                    during their booking period.
                  </span>
                </span>
              </div>
            </label>

            <label
              className={`cursor-pointer rounded-md border p-4 transition-colors ${
                bookingMode === "bulk"
                  ? "border-primary bg-primary/5"
                  : "border-border hover:bg-secondary"
              }`}
            >
              <div className="flex items-start gap-3">
                <input
                  type="radio"
                  name="bookingMode"
                  value="bulk"
                  checked={bookingMode === "bulk"}
                  onChange={() =>
                    setBookingMode("bulk")
                  }
                  className="mt-1 h-4 w-4 accent-primary"
                />

                <span>
                  <span className="block text-sm font-semibold">
                    Bulk Booking
                  </span>

                  <span className="mt-1 block text-xs leading-5 text-muted-foreground">
                    Choose from the catalogue and order
                    the quantity you need. No minimum quantity.
                  </span>
                </span>
              </div>
            </label>

            <label
              className={`cursor-pointer rounded-md border p-4 transition-colors ${
                bookingMode === "customize"
                  ? "border-primary bg-primary/5"
                  : "border-border hover:bg-secondary"
              }`}
            >
              <div className="flex items-start gap-3">
                <input
                  type="radio"
                  name="bookingMode"
                  value="customize"
                  checked={bookingMode === "customize"}
                  onChange={() =>
                    setBookingMode("customize")
                  }
                  className="mt-1 h-4 w-4 accent-primary"
                />

                <span>
                  <span className="block text-sm font-semibold">
                    Customize
                  </span>

                  <span className="mt-1 block text-xs leading-5 text-muted-foreground">
                    Choose admin-selected titles and
                    specify quantities. Minimum 200 copies
                    in total.
                  </span>
                </span>
              </div>
            </label>
          </div>
        </div>
      </section>

      {/* =====================================================
          BULK BOOKING
          ===================================================== */}

      {bookingMode === "bulk" && (
        <section className="container pt-6">
          <div className="rounded-lg border border-border bg-card p-5">
            <h2 className="text-lg font-semibold">
              Bulk Booking
            </h2>

            <p className="mt-1 text-xs leading-5 text-muted-foreground">
              Select a book from the catalogue and enter the
              quantity. There is no minimum quantity.
            </p>

            {catalogueLoading ? (
              <p className="mt-5 text-sm text-muted-foreground">
                Loading catalogue…
              </p>
            ) : (
              <div className="mt-5 grid gap-4 sm:grid-cols-[minmax(0,1fr)_180px_auto] sm:items-end">
                <label className="space-y-1 text-sm font-medium">
                  Select book

                  <select
                    value={bulkBookId}
                    onChange={(event) =>
                      setBulkBookId(event.target.value)
                    }
                    className="w-full rounded-md border bg-background px-3 py-2 font-normal"
                  >
                    <option value="">
                      Choose a book
                    </option>

                    {catalogueBooks.map((book) => (
                      <option
                        key={book.id}
                        value={book.id}
                      >
                        {book.title}
                      </option>
                    ))}
                  </select>
                </label>

                <label className="space-y-1 text-sm font-medium">
                  Quantity

                  <input
                    type="number"
                    min="1"
                    step="1"
                    value={bulkQuantity}
                    onChange={(event) =>
                      setBulkQuantity(
                        event.target.value,
                      )
                    }
                    className="w-full rounded-md border bg-background px-3 py-2 font-normal"
                  />
                </label>

                <button
                  type="button"
                  onClick={handleBulkAdd}
                  className="inline-flex min-h-10 items-center justify-center gap-2 rounded-md bg-primary px-5 text-sm font-semibold text-primary-foreground hover:opacity-90"
                >
                  <ShoppingCart size={16} />
                  Add Bulk Order
                </button>
              </div>
            )}

            <p className="mt-4 text-xs text-muted-foreground">
              Need a book that is not listed in the catalogue?
              Use the Book Enquiry option once it is available.
            </p>
          </div>
        </section>
      )}

      {/* =====================================================
          CUSTOMIZE
          ===================================================== */}

      {bookingMode === "customize" && (
        <section className="container pt-6">
          <div className="rounded-lg border border-border bg-card p-5">
            <div className="flex flex-wrap items-end justify-between gap-3">
              <div>
                <h2 className="text-lg font-semibold">
                  Customize
                </h2>

                <p className="mt-1 text-xs leading-5 text-muted-foreground">
                  Only books specifically enabled by Karisal
                  Books are shown here.
                </p>
              </div>

              <div className="rounded-md bg-secondary px-3 py-2 text-sm">
                Total copies:{" "}
                <strong>{customizeTotalCopies}</strong>
                <span className="text-muted-foreground">
                  {" "}
                  / 200 minimum
                </span>
              </div>
            </div>

            {customizeBooks.length === 0 ? (
              <div className="mt-5 border-y border-border py-8 text-center">
                <h3 className="font-semibold">
                  No Customize titles available
                </h3>

                <p className="mt-2 text-sm text-muted-foreground">
                  Customize titles will appear here when they
                  are selected by the administrator.
                </p>
              </div>
            ) : (
              <>
                <div className="mt-5 divide-y divide-border border-y border-border">
                  {customizeBooks.map((book) => {
                    const quantity =
                      customizeQuantities[book.id] ?? 0;

                    const { price } = salePrice(book);

                    return (
                      <div
                        key={book.id}
                        className="flex flex-col gap-4 py-4 sm:flex-row sm:items-center sm:justify-between"
                      >
                        <div className="flex min-w-0 items-center gap-4">
                          <div className="flex h-20 w-14 shrink-0 items-center justify-center bg-white p-1">
                            {book.cover_image_url ? (
                              // eslint-disable-next-line @next/next/no-img-element
                              <img
                                src={book.cover_image_url}
                                alt={book.title}
                                className="h-full w-full object-contain"
                              />
                            ) : (
                              <span className="text-center text-[9px] text-muted-foreground">
                                No cover
                              </span>
                            )}
                          </div>

                          <div className="min-w-0">
                            <h3 className="font-semibold">
                              {book.title}
                            </h3>

                            <p className="mt-1 text-xs text-muted-foreground">
                              {formatCurrency(price)} per copy
                            </p>
                          </div>
                        </div>

                        <div className="flex items-center gap-3">
                          <label className="text-xs font-medium">
                            Quantity

                            <input
                              type="number"
                              min="0"
                              step="1"
                              value={quantity}
                              onChange={(event) =>
                                updateCustomizeQuantity(
                                  book.id,
                                  Number(
                                    event.target.value,
                                  ),
                                )
                              }
                              className="ml-2 w-24 rounded-md border bg-background px-3 py-2 text-sm font-normal"
                            />
                          </label>
                        </div>
                      </div>
                    );
                  })}
                </div>

                <div className="mt-5 flex flex-wrap items-center justify-between gap-3">
                  <p className="text-xs text-muted-foreground">
                    Customize orders are sent for printing.
                    The combined quantity must be at least
                    200 copies.
                  </p>

                  <button
                    type="button"
                    onClick={addCustomizeBooks}
                    disabled={
                      customizeTotalCopies < 200
                    }
                    className="inline-flex min-h-10 items-center justify-center gap-2 rounded-md bg-primary px-5 text-sm font-semibold text-primary-foreground disabled:cursor-not-allowed disabled:opacity-50"
                  >
                    <ShoppingCart size={16} />
                    {addedId === "customize"
                      ? "Added · view cart"
                      : "Add Customize Order"}
                  </button>
                </div>

                {addedId === "customize" && (
                  <Link
                    href="/cart"
                    className="mt-3 block text-right text-xs font-medium text-primary hover:underline"
                  >
                    View cart and checkout
                  </Link>
                )}
              </>
            )}
          </div>
        </section>
      )}

      {/* =====================================================
          ERROR
          ===================================================== */}

      <section className="container pt-6">
        {error && (
          <p
            role="alert"
            className="rounded-md border border-destructive/30 bg-destructive/5 p-3 text-sm text-destructive"
          >
            {error}
          </p>
        )}
      </section>

      {/* =====================================================
          NORMAL PRE-BOOKING
          ===================================================== */}

      {bookingMode === "prebooking" && (
        <section className="container py-8 sm:py-10">
          <div className="mb-5 flex flex-wrap items-end justify-between gap-3 border-b border-border pb-3">
            <div>
              <h2 className="text-xl font-semibold">
                Open for pre-booking
              </h2>

              <p className="mt-1 text-xs text-muted-foreground">
                Pre-booking prices cannot be combined with
                membership or coupon discounts.
              </p>
            </div>

            <Link
              href="/books"
              className="inline-flex items-center gap-1 text-sm font-medium text-primary hover:underline"
            >
              Browse published books
              <ArrowRight size={15} />
            </Link>
          </div>

          {loading ? (
            <p className="py-10 text-center text-sm text-muted-foreground">
              Loading available titles…
            </p>
          ) : error && books.length === 0 ? (
            <p className="border-y border-border py-10 text-center text-sm text-muted-foreground">
              Pre-booking setup is being completed. Please
              check back soon.
            </p>
          ) : books.length === 0 ? (
            <div className="border-y border-border py-12 text-center">
              <h3 className="text-lg font-semibold">
                No titles are open just now
              </h3>

              <p className="mt-2 text-sm text-muted-foreground">
                New pre-booking titles will appear here
                during their reservation period.
              </p>

              <Link
                href="/books"
                className="mt-4 inline-flex items-center gap-2 text-sm font-semibold text-primary hover:underline"
              >
                Explore the current collection
                <ArrowRight size={15} />
              </Link>
            </div>
          ) : (
            <div className="grid gap-5 sm:grid-cols-2 xl:grid-cols-3">
              {books.map((book) => {
                const { price, hasOffer } =
                  salePrice(book);

                return (
                  <article
                    key={book.id}
                    className="grid grid-cols-[112px_minmax(0,1fr)] gap-4 border-b border-border pb-5 sm:grid-cols-[140px_minmax(0,1fr)] sm:gap-5"
                  >
                    <div className="flex aspect-[3/4] items-center justify-center bg-white p-2">
                      {book.cover_image_url ? (
                        // eslint-disable-next-line @next/next/no-img-element
                        <img
                          src={book.cover_image_url}
                          alt={book.title}
                          className="h-full w-full object-contain"
                        />
                      ) : (
                        <span className="text-center text-xs text-muted-foreground">
                          Cover coming soon
                        </span>
                      )}
                    </div>

                    <div className="flex min-w-0 flex-col">
                      {hasOffer && (
                        <span className="mb-2 w-fit bg-amber-100 px-2 py-1 text-[10px] font-semibold uppercase text-amber-900">
                          Limited-time price
                        </span>
                      )}

                      <h3 className="text-base font-semibold leading-6">
                        {book.title}
                      </h3>

                      <p className="mt-1 line-clamp-2 text-xs text-muted-foreground">
                        {book.description ||
                          "A forthcoming title from Karisal Books."}
                      </p>

                      <div className="mt-3 text-xs text-muted-foreground">
                        <p>
                          Booking period:{" "}
                          {dateLabel(
                            book.prebooking_start_at,
                          )}{" "}
                          –{" "}
                          {dateLabel(
                            book.prebooking_end_at,
                          )}
                        </p>

                        <p>
                          Distribution update: sent by
                          email when ready
                        </p>

                        <p>
                          Delivery per copy: Professional
                          Courier{" "}
                          {formatCurrency(
                            Number(
                              book.prebooking_professional_courier_charge ??
                                0,
                            ),
                          )}{" "}
                          · India Post{" "}
                          {formatCurrency(
                            Number(
                              book.prebooking_postal_charge ??
                                0,
                            ),
                          )}
                        </p>
                      </div>

                      <div className="mt-auto pt-4">
                        <p className="text-lg font-semibold tabular-nums text-primary">
                          {formatCurrency(price)}
                        </p>

                        {hasOffer && (
                          <p className="text-xs text-muted-foreground line-through">
                            Regular pre-booking{" "}
                            {formatCurrency(
                              Number(
                                book.prebooking_price,
                              ),
                            )}
                          </p>
                        )}

                        <button
                          type="button"
                          onClick={() =>
                            addPrebooking(book)
                          }
                          className="mt-3 inline-flex min-h-10 w-full items-center justify-center gap-2 rounded-md bg-primary px-4 text-sm font-semibold text-primary-foreground hover:opacity-90"
                        >
                          <ShoppingCart size={16} />

                          {addedId === book.id
                            ? "Added · add another"
                            : "Add to cart"}
                        </button>

                        {addedId === book.id && (
                          <Link
                            href="/cart"
                            className="mt-2 block text-center text-xs font-medium text-primary hover:underline"
                          >
                            View cart and checkout
                          </Link>
                        )}
                      </div>
                    </div>
                  </article>
                );
              })}
            </div>
          )}
        </section>
      )}
    </>
  );
}