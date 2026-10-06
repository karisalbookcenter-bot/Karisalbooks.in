"use client";

import { useEffect, useState } from "react";
import Link from "next/link";
import { ShoppingCart, ArrowRight } from "lucide-react";

import { useCart } from "@/features/cart/hooks/useCart";
import { listPublicCustomizeBooks } from "@/features/storefront/services/book.storefront";
import { formatCurrency } from "@/lib/helpers/format.helpers";
import type { Book } from "@/types/book.types";

type CustomizeBook = Book & {
  customize_price: number | null;
};

export function CustomizeCatalog() {
  const { items, addItem } = useCart();

  const [books, setBooks] = useState<CustomizeBook[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");
  const [addedId, setAddedId] = useState<string | null>(null);

  const [quantities, setQuantities] = useState<
    Record<string, number>
  >({});

  const [details, setDetails] = useState<
    Record<string, string>
  >({});

  const hasNonCustomizeItems = items.some(
    (item) => item.purchaseType !== "customize",
  );

  useEffect(() => {
    listPublicCustomizeBooks()
      .then((result) => {
        setBooks(
          result as CustomizeBook[],
        );
      })
      .catch((loadError) => {
        setError(
          loadError instanceof Error
            ? loadError.message
            : "Unable to load Customize books.",
        );
      })
      .finally(() => {
        setLoading(false);
      });
  }, []);

  function updateQuantity(
    bookId: string,
    value: string,
  ) {
    const quantity = Number(value);

    setQuantities((current) => ({
      ...current,
      [bookId]:
        Number.isFinite(quantity) && quantity > 0
          ? Math.floor(quantity)
          : 0,
    }));

    setError("");
  }

  function updateDetails(
    bookId: string,
    value: string,
  ) {
    setDetails((current) => ({
      ...current,
      [bookId]: value,
    }));

    setError("");
  }

  function addCustomizeBook(book: CustomizeBook) {
    if (hasNonCustomizeItems) {
      setError(
        "Your cart contains another type of order. Complete that order or clear the cart before starting a Customize order.",
      );
      return;
    }

    const quantity = quantities[book.id] ?? 0;
    const customizationDetails =
      details[book.id]?.trim() ?? "";

    if (!Number.isInteger(quantity) || quantity < 200) {
      setError(
        `"${book.title}" requires a minimum of 200 copies. Please enter 200 or more.`,
      );
      return;
    }

    if (!customizationDetails) {
      setError(
        `Please enter the function / event details for "${book.title}".`,
      );
      return;
    }

    if (
      book.customize_price === null ||
      book.customize_price === undefined
    ) {
      setError(
        "Customize price is not available for this title.",
      );
      return;
    }

    addItem({
      id: book.id,
      title: book.title,
      slug: book.slug,
      price: Number(book.customize_price),
      quantity,
      purchaseType: "customize",
      coverImageUrl: book.cover_image_url,
      customizationDetails,
    });

    setError("");
    setAddedId(book.id);
  }

  return (
    <>
      <section className="border-b border-border bg-secondary/50">
        <div className="container py-10 sm:py-14">
          <p className="mb-3 text-xs font-semibold uppercase tracking-wide text-primary">
            Karisal Books · Customize
          </p>

          <h1 className="max-w-3xl text-3xl font-semibold leading-tight sm:text-4xl">
            Create customized books for your function or event.
          </h1>

          <p className="mt-4 max-w-2xl text-sm leading-6 text-muted-foreground sm:text-base">
            Choose a title selected for Customize printing,
            enter the quantity and provide the function or
            event details to be printed.
          </p>

          <div className="mt-5 rounded-md border border-border bg-card p-4 text-sm">
            <strong>Minimum order: 200 copies for one title.</strong>

            <p className="mt-1 text-xs text-muted-foreground">
              Quantities from different titles cannot be
              combined to meet the 200-copy minimum.
            </p>
          </div>
        </div>
      </section>

      <section className="container py-8 sm:py-10">
        {loading ? (
          <p className="py-12 text-center text-sm text-muted-foreground">
            Loading Customize titles…
          </p>
        ) : error && books.length === 0 ? (
          <div className="border-y border-border py-12 text-center">
            <h2 className="text-lg font-semibold">
              Unable to load Customize titles
            </h2>

            <p className="mt-2 text-sm text-muted-foreground">
              Please try again later.
            </p>
          </div>
        ) : books.length === 0 ? (
          <div className="border-y border-border py-12 text-center">
            <h2 className="text-lg font-semibold">
              No Customize titles available
            </h2>

            <p className="mt-2 text-sm text-muted-foreground">
              Customize titles selected by the administrator
              will appear here.
            </p>

            <Link
              href="/books"
              className="mt-4 inline-flex items-center gap-2 text-sm font-semibold text-primary hover:underline"
            >
              Browse books
              <ArrowRight size={15} />
            </Link>
          </div>
        ) : (
          <>
            {error && (
              <p
                role="alert"
                className="mb-6 rounded-md border border-destructive/30 bg-destructive/5 p-3 text-sm text-destructive"
              >
                {error}
              </p>
            )}

            <div className="grid gap-6 lg:grid-cols-2">
              {books.map((book) => {
                const quantity =
                  quantities[book.id] ?? 0;

                const bookDetails =
                  details[book.id] ?? "";

                const price =
                  Number(book.customize_price ?? 0);

                return (
                  <article
                    key={book.id}
                    className="rounded-lg border border-border bg-card p-5"
                  >
                    <div className="flex gap-5">
                      <div className="flex h-36 w-24 shrink-0 items-center justify-center bg-white p-2">
                        {book.cover_image_url ? (
                          // eslint-disable-next-line @next/next/no-img-element
                          <img
                            src={book.cover_image_url}
                            alt={book.title}
                            className="h-full w-full object-contain"
                          />
                        ) : (
                          <span className="text-center text-xs text-muted-foreground">
                            No cover
                          </span>
                        )}
                      </div>

                      <div className="min-w-0">
                        <h2 className="text-lg font-semibold">
                          {book.title}
                        </h2>

                        {book.author_id && (
                          <p className="mt-1 text-xs text-muted-foreground">
                            Customize edition
                          </p>
                        )}

                        <p className="mt-3 text-lg font-semibold text-primary">
                          {formatCurrency(price)}
                          <span className="ml-1 text-xs font-normal text-muted-foreground">
                            / copy
                          </span>
                        </p>

                        <p className="mt-2 text-xs text-muted-foreground">
                          Minimum 200 copies for this title.
                        </p>
                      </div>
                    </div>

                    <div className="mt-5 space-y-4">
                      <div>
                        <label
                          htmlFor={`quantity-${book.id}`}
                          className="mb-1.5 block text-sm font-medium"
                        >
                          Quantity
                        </label>

                        <input
                          id={`quantity-${book.id}`}
                          type="number"
                          min="200"
                          step="1"
                          value={
                            quantity === 0
                              ? ""
                              : quantity
                          }
                          onChange={(event) =>
                            updateQuantity(
                              book.id,
                              event.target.value,
                            )
                          }
                          placeholder="Minimum 200"
                          className="w-full rounded-md border bg-background px-3 py-2 text-sm outline-none focus:ring-2 focus:ring-ring"
                        />
                      </div>

                      <div>
                        <label
                          htmlFor={`details-${book.id}`}
                          className="mb-1.5 block text-sm font-medium"
                        >
                          Function / Event Details
                        </label>

                        <textarea
                          id={`details-${book.id}`}
                          value={bookDetails}
                          onChange={(event) =>
                            updateDetails(
                              book.id,
                              event.target.value,
                            )
                          }
                          placeholder="Example: This book is being distributed at our annual function on 15 December 2026. Please print the following dedication / event details..."
                          rows={5}
                          className="w-full resize-y rounded-md border bg-background px-3 py-2 text-sm outline-none focus:ring-2 focus:ring-ring"
                        />

                        <p className="mt-1 text-xs text-muted-foreground">
                          These details will be reviewed before
                          the customized printing is sent to the
                          press.
                        </p>
                      </div>

                      {quantity >= 200 && (
                        <div className="rounded-md bg-secondary p-3 text-sm">
                          Estimated total:{" "}
                          <strong>
                            {formatCurrency(
                              price * quantity,
                            )}
                          </strong>
                        </div>
                      )}

                      <button
                        type="button"
                        onClick={() =>
                          addCustomizeBook(book)
                        }
                        className="inline-flex min-h-10 w-full items-center justify-center gap-2 rounded-md bg-primary px-4 text-sm font-semibold text-primary-foreground hover:opacity-90"
                      >
                        <ShoppingCart size={16} />

                        {addedId === book.id
                          ? "Added · View Cart"
                          : "Add Customize Order"}
                      </button>

                      {addedId === book.id && (
                        <Link
                          href="/cart"
                          className="block text-center text-xs font-semibold text-primary hover:underline"
                        >
                          View cart and checkout
                        </Link>
                      )}
                    </div>
                  </article>
                );
              })}
            </div>
          </>
        )}
      </section>
    </>
  );
}