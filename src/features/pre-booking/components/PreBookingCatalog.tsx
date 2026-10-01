"use client";

import { useEffect, useState } from "react";
import Link from "next/link";
import { ArrowRight, CalendarDays, Clock3, ShoppingCart } from "lucide-react";
import { useCart } from "@/features/cart/hooks/useCart";
import { listOpenPreBookings } from "@/features/pre-booking/services/pre-booking.storefront";
import { formatCurrency } from "@/lib/helpers/format.helpers";
import type { Book } from "@/types/book.types";

function salePrice(book: Book) {
  const now = Date.now();
  const offerStart = book.prebooking_offer_start_at ? new Date(book.prebooking_offer_start_at).getTime() : 0;
  const offerEnd = book.prebooking_offer_end_at ? new Date(book.prebooking_offer_end_at).getTime() : 0;
  const active = book.prebooking_offer_price !== null && book.prebooking_offer_price !== undefined && offerStart <= now && offerEnd >= now;
  return { price: active ? Number(book.prebooking_offer_price) : Number(book.prebooking_price), hasOffer: active };
}

function dateLabel(value?: string | null) {
  return value ? new Intl.DateTimeFormat("en-IN", { dateStyle: "medium" }).format(new Date(value)) : "Date to be announced";
}

export function PreBookingCatalog() {
  const { items, addItem } = useCart();
  const [books, setBooks] = useState<Book[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");
  const [addedId, setAddedId] = useState<string | null>(null);
  const hasRegularItems = items.some((item) => item.purchaseType !== "prebooking");

  useEffect(() => {
    listOpenPreBookings()
      .then(setBooks)
      .catch((loadError) => {
        const message = loadError instanceof Error ? loadError.message : "Unable to load pre-booking titles.";
        setError(message.includes("prebooking_") ? "Pre-booking setup is not complete yet. Please check back soon." : message);
      })
      .finally(() => setLoading(false));
  }, []);

  function addPrebooking(book: Book) {
    if (hasRegularItems) {
      setError("Your cart contains regular books. Complete that order or remove those books before starting a pre-booking order.");
      return;
    }

    const { price } = salePrice(book);
    addItem({
      id: book.id,
      title: book.title,
      slug: book.slug,
      price,
      quantity: 1,
      purchaseType: "prebooking",
      coverImageUrl: book.cover_image_url,
    });
    setError("");
    setAddedId(book.id);
  }

  return (
    <>
      <section className="border-b border-border bg-secondary/50">
        <div className="container py-10 sm:py-14">
          <p className="mb-3 text-xs font-semibold uppercase tracking-wide text-primary">Karisal Books · Early access</p>
          <h1 className="max-w-3xl text-3xl font-semibold leading-tight sm:text-4xl">Be among the first to read what’s coming next.</h1>
          <p className="mt-4 max-w-2xl text-sm leading-6 text-muted-foreground sm:text-base">
            Reserve forthcoming titles during their booking period. Your pre-booking ID is emailed after payment, and we’ll let you know when the book is ready to ship.
          </p>
          <div className="mt-6 flex flex-wrap gap-x-6 gap-y-3 text-xs text-muted-foreground">
            <span className="inline-flex items-center gap-2"><CalendarDays size={15} /> Fixed booking dates</span>
            <span className="inline-flex items-center gap-2"><Clock3 size={15} /> Limited-time offers on selected titles</span>
          </div>
        </div>
      </section>

      <section className="container py-8 sm:py-10">
        <div className="mb-5 flex flex-wrap items-end justify-between gap-3 border-b border-border pb-3">
          <div>
            <h2 className="text-xl font-semibold">Open for pre-booking</h2>
            <p className="mt-1 text-xs text-muted-foreground">Pre-booking prices cannot be combined with membership or coupon discounts.</p>
          </div>
          <Link href="/books" className="inline-flex items-center gap-1 text-sm font-medium text-primary hover:underline">Browse published books <ArrowRight size={15} /></Link>
        </div>

        {error && <p role="alert" className="mb-4 rounded-md border border-destructive/30 bg-destructive/5 p-3 text-sm text-destructive">{error}</p>}
        {loading ? (
          <p className="py-10 text-center text-sm text-muted-foreground">Loading available titles…</p>
        ) : error ? (
          <p className="border-y border-border py-10 text-center text-sm text-muted-foreground">Pre-booking setup is being completed. Please check back soon.</p>
        ) : books.length === 0 ? (
          <div className="border-y border-border py-12 text-center">
            <h3 className="text-lg font-semibold">No titles are open just now</h3>
            <p className="mt-2 text-sm text-muted-foreground">New pre-booking titles will appear here during their reservation period.</p>
            <Link href="/books" className="mt-4 inline-flex items-center gap-2 text-sm font-semibold text-primary hover:underline">Explore the current collection <ArrowRight size={15} /></Link>
          </div>
        ) : (
          <div className="grid gap-5 sm:grid-cols-2 xl:grid-cols-3">
            {books.map((book) => {
              const { price, hasOffer } = salePrice(book);
              return (
                <article key={book.id} className="grid grid-cols-[112px_minmax(0,1fr)] gap-4 border-b border-border pb-5 sm:grid-cols-[140px_minmax(0,1fr)] sm:gap-5">
                  <div className="flex aspect-[3/4] items-center justify-center bg-white p-2">
                    {book.cover_image_url ? (
                      // eslint-disable-next-line @next/next/no-img-element
                      <img src={book.cover_image_url} alt={book.title} className="h-full w-full object-contain" />
                    ) : <span className="text-center text-xs text-muted-foreground">Cover coming soon</span>}
                  </div>
                  <div className="flex min-w-0 flex-col">
                    {hasOffer && <span className="mb-2 w-fit bg-amber-100 px-2 py-1 text-[10px] font-semibold uppercase text-amber-900">Limited-time price</span>}
                    <h3 className="text-base font-semibold leading-6">{book.title}</h3>
                    <p className="mt-1 line-clamp-2 text-xs text-muted-foreground">{book.description || "A forthcoming title from Karisal Books."}</p>
                    <div className="mt-3 text-xs text-muted-foreground">
                      <p>Booking period: {dateLabel(book.prebooking_start_at)} – {dateLabel(book.prebooking_end_at)}</p>
                      <p>Distribution update: sent by email when ready</p>
                    </div>
                    <div className="mt-auto pt-4">
                      <p className="text-lg font-semibold tabular-nums text-primary">{formatCurrency(price)}</p>
                      {hasOffer && <p className="text-xs text-muted-foreground line-through">Regular pre-booking {formatCurrency(Number(book.prebooking_price))}</p>}
                      <button type="button" onClick={() => addPrebooking(book)} className="mt-3 inline-flex min-h-10 w-full items-center justify-center gap-2 rounded-md bg-primary px-4 text-sm font-semibold text-primary-foreground hover:opacity-90">
                        <ShoppingCart size={16} />
                        {addedId === book.id ? "Added · add another" : "Add to cart"}
                      </button>
                      {addedId === book.id && <Link href="/cart" className="mt-2 block text-center text-xs font-medium text-primary hover:underline">View cart and checkout</Link>}
                    </div>
                  </div>
                </article>
              );
            })}
          </div>
        )}
      </section>
    </>
  );
}