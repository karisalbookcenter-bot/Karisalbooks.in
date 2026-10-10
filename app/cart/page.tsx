"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import {
  ArrowLeft,
  Minus,
  Plus,
  ShoppingCart,
  Trash2,
} from "lucide-react";

import { MainLayout } from "@/components/layout/MainLayout";
import { useCart } from "@/features/cart/hooks/useCart";
import { formatCurrency } from "@/lib/helpers/format.helpers";

const CUSTOMIZE_MINIMUM_QUANTITY = 200;

export default function CartPage() {
  const router = useRouter();

  const {
    items,
    removeItem,
    updateQuantity,
    totalPrice,
  } = useCart();

  const [checkoutError, setCheckoutError] = useState("");

  const hasCustomizeItems = items.some(
    (item) => item.purchaseType === "customize",
  );

  const hasNonCustomizeItems = items.some(
    (item) => item.purchaseType !== "customize",
  );

  function handleQuantityChange(
    itemId: string,
    quantity: number,
    purchaseType?: string,
  ) {
    if (purchaseType === "customize") {
      updateQuantity(
        itemId,
        Math.max(CUSTOMIZE_MINIMUM_QUANTITY, quantity),
      );
      return;
    }

    updateQuantity(itemId, Math.max(1, quantity));
  }

  function handleRemove(itemId: string) {
    removeItem(itemId);
    setCheckoutError("");
  }

  function handleCheckout() {
    setCheckoutError("");

    if (items.length === 0) {
      setCheckoutError("Your cart is empty. Please add a book first.");
      return;
    }

    if (hasCustomizeItems && hasNonCustomizeItems) {
      setCheckoutError(
        "Customize orders cannot be combined with regular books or pre-booking items. Please complete them separately.",
      );
      return;
    }

    const invalidCustomizeItem = items.find(
      (item) =>
        item.purchaseType === "customize" &&
        item.quantity < CUSTOMIZE_MINIMUM_QUANTITY,
    );

    if (invalidCustomizeItem) {
      setCheckoutError(
        `"${invalidCustomizeItem.title}" requires a minimum of ${CUSTOMIZE_MINIMUM_QUANTITY} copies.`,
      );
      return;
    }

    router.push("/checkout");
  }

  return (
    <MainLayout>
      <main className="container mx-auto max-w-6xl px-4 py-6 sm:py-10">
        <div className="mb-6 flex flex-wrap items-center justify-between gap-3">
          <div>
            <h1 className="text-2xl font-bold text-foreground sm:text-3xl">
              Shopping Cart
            </h1>

            <p className="mt-2 text-base text-muted-foreground">
              {items.length === 0
                ? "Your cart is currently empty."
                : `${items.length} ${items.length === 1 ? "item" : "items"} in your cart`}
            </p>
          </div>

          {items.length > 0 && (
            <button
              type="button"
              onClick={() => router.push("/books")}
              className="inline-flex min-h-11 items-center gap-2 rounded-lg border px-4 py-2 text-sm font-semibold transition-colors hover:bg-muted focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-primary"
            >
              <ArrowLeft size={18} aria-hidden="true" />
              Continue Shopping
            </button>
          )}
        </div>

        {items.length === 0 ? (
          <section className="flex min-h-72 flex-col items-center justify-center rounded-xl border border-dashed px-5 py-12 text-center">
            <div className="mb-4 grid h-16 w-16 place-items-center rounded-full bg-muted">
              <ShoppingCart
                size={30}
                className="text-muted-foreground"
                aria-hidden="true"
              />
            </div>

            <h2 className="text-xl font-semibold">
              Your cart is empty
            </h2>

            <p className="mt-2 max-w-md text-base leading-7 text-muted-foreground">
              Browse our books, choose the titles you want, and add them
              to your cart.
            </p>

            <button
              type="button"
              onClick={() => router.push("/books")}
              className="mt-6 inline-flex min-h-12 items-center justify-center rounded-lg bg-primary px-6 py-3 text-base font-semibold text-primary-foreground transition-opacity hover:opacity-90 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-primary focus-visible:ring-offset-2"
            >
              Browse Books
            </button>
          </section>
        ) : (
          <div className="grid grid-cols-1 items-start gap-6 lg:grid-cols-[1fr_320px]">
            <section
              className="space-y-4"
              aria-label="Items in your shopping cart"
            >
              {items.map((item) => {
                const isCustomize =
                  item.purchaseType === "customize";

                const isPrebooking =
                  item.purchaseType === "prebooking";

                const originalPrice =
                  item.originalPrice ??
                  item.price + (item.discountAmount ?? 0);

                return (
                  <article
                    key={item.id}
                    className="rounded-xl border border-border bg-card p-4 sm:p-5"
                  >
                    <div className="flex flex-col gap-4 sm:flex-row sm:items-start sm:justify-between">
                      <div className="min-w-0 flex-1">
                        <div className="flex flex-wrap items-center gap-2">
                          <h2 className="break-words text-base font-semibold leading-6 sm:text-lg">
                            {item.title}
                          </h2>

                          {isCustomize && (
                            <span className="rounded-full bg-primary/10 px-3 py-1 text-xs font-semibold text-primary">
                              Customize
                            </span>
                          )}

                          {isPrebooking && (
                            <span className="rounded-full bg-amber-100 px-3 py-1 text-xs font-semibold text-amber-800">
                              Pre-booking
                            </span>
                          )}
                        </div>

                        {item.authorName && (
                          <p className="mt-1 text-sm text-muted-foreground">
                            {item.authorName}
                          </p>
                        )}

                        <div className="mt-3 flex flex-wrap items-baseline gap-x-3 gap-y-1">
                          <span className="text-lg font-bold tabular-nums text-primary">
                            {formatCurrency(item.price)}
                          </span>

                          {!isCustomize &&
                            (item.discountAmount ?? 0) > 0 && (
                              <span className="text-sm tabular-nums text-muted-foreground line-through">
                                {formatCurrency(originalPrice)}
                              </span>
                            )}

                          {isCustomize && (
                            <span className="text-sm text-muted-foreground">
                              per copy
                            </span>
                          )}
                        </div>

                        {!isCustomize &&
                          (item.discountAmount ?? 0) > 0 && (
                            <p className="mt-1 text-sm font-medium text-emerald-700">
                              You save{" "}
                              {formatCurrency(item.discountAmount ?? 0)}{" "}
                              per copy
                            </p>
                          )}

                        {isCustomize && (
                          <div className="mt-4 rounded-lg bg-muted/50 p-3">
                            <p className="text-sm font-semibold">
                              Function / Event Details
                            </p>

                            <p className="mt-2 whitespace-pre-wrap text-sm leading-6 text-muted-foreground">
                              {item.customizationDetails ||
                                "No details provided."}
                            </p>

                            <p className="mt-3 text-sm font-medium text-primary">
                              Minimum order: {CUSTOMIZE_MINIMUM_QUANTITY} copies
                              of this title
                            </p>
                          </div>
                        )}

                        <div className="mt-4 flex flex-wrap items-center gap-3">
                          <span className="text-sm font-medium">
                            Quantity
                          </span>

                          <div className="inline-flex items-center rounded-lg border border-border">
                            <button
                              type="button"
                              aria-label={`Decrease quantity of ${item.title}`}
                              disabled={
                                isCustomize &&
                                item.quantity <=
                                  CUSTOMIZE_MINIMUM_QUANTITY
                              }
                              onClick={() =>
                                handleQuantityChange(
                                  item.id,
                                  item.quantity - 1,
                                  item.purchaseType,
                                )
                              }
                              className="grid h-11 w-11 place-items-center rounded-l-lg transition-colors hover:bg-muted focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-primary disabled:cursor-not-allowed disabled:opacity-40"
                            >
                              <Minus size={18} aria-hidden="true" />
                            </button>

                            <span
                              className="min-w-12 px-2 text-center text-base font-semibold tabular-nums"
                              aria-label={`Quantity: ${item.quantity}`}
                            >
                              {item.quantity}
                            </span>

                            <button
                              type="button"
                              aria-label={`Increase quantity of ${item.title}`}
                              onClick={() =>
                                handleQuantityChange(
                                  item.id,
                                  item.quantity + 1,
                                  item.purchaseType,
                                )
                              }
                              className="grid h-11 w-11 place-items-center rounded-r-lg transition-colors hover:bg-muted focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-primary"
                            >
                              <Plus size={18} aria-hidden="true" />
                            </button>
                          </div>
                        </div>
                      </div>

                      <div className="flex items-center justify-between gap-4 border-t pt-3 sm:min-w-36 sm:flex-col sm:items-end sm:border-t-0 sm:pt-0">
                        <div className="sm:text-right">
                          <p className="text-xs text-muted-foreground">
                            Item total
                          </p>

                          <p className="mt-1 text-lg font-bold tabular-nums">
                            {formatCurrency(item.price * item.quantity)}
                          </p>
                        </div>

                        <button
                          type="button"
                          onClick={() => handleRemove(item.id)}
                          aria-label={`Remove ${item.title} from cart`}
                          className="inline-flex min-h-11 items-center justify-center gap-2 rounded-lg px-3 text-sm font-medium text-destructive transition-colors hover:bg-destructive/5 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-destructive"
                        >
                          <Trash2 size={17} aria-hidden="true" />
                          Remove
                        </button>
                      </div>
                    </div>
                  </article>
                );
              })}
            </section>

            <aside className="rounded-xl border border-border bg-card p-5 lg:sticky lg:top-6">
              <h2 className="text-xl font-bold">
                Order Summary
              </h2>

              <div className="mt-5 space-y-3 border-b pb-4">
                <div className="flex items-start justify-between gap-4 text-sm">
                  <span className="text-muted-foreground">
                    Items
                  </span>

                  <span className="text-right font-medium tabular-nums">
                    {items.reduce(
                      (quantity, item) => quantity + item.quantity,
                      0,
                    )}
                  </span>
                </div>

                <div className="flex items-start justify-between gap-4 text-sm">
                  <span className="text-muted-foreground">
                    Subtotal
                  </span>

                  <span className="text-right font-semibold tabular-nums">
                    {formatCurrency(totalPrice)}
                  </span>
                </div>
              </div>

              <div className="flex items-start justify-between gap-4 py-4">
                <span className="text-base font-bold">
                  Total
                </span>

                <span className="text-right text-xl font-bold tabular-nums text-primary">
                  {formatCurrency(totalPrice)}
                </span>
              </div>

              <p className="mb-4 text-xs leading-5 text-muted-foreground">
                Shipping charges, if applicable, will be calculated during
                checkout.
              </p>

              {hasCustomizeItems && hasNonCustomizeItems && (
                <div
                  className="mb-4 rounded-lg border border-amber-300 bg-amber-50 p-3 text-sm leading-6 text-amber-900"
                  role="alert"
                >
                  Customize orders must be checked out separately from
                  regular books and pre-booking orders. Remove one order
                  type to continue.
                </div>
              )}

              {checkoutError && (
                <div
                  className="mb-4 rounded-lg border border-destructive/30 bg-destructive/5 p-3 text-sm leading-6 text-destructive"
                  role="alert"
                >
                  {checkoutError}
                </div>
              )}

              <button
                type="button"
                className="inline-flex min-h-12 w-full items-center justify-center rounded-lg bg-primary px-5 py-3 text-base font-semibold text-primary-foreground transition-opacity hover:opacity-90 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-primary focus-visible:ring-offset-2"
                onClick={handleCheckout}
              >
                Proceed to Checkout
              </button>

              <button
                type="button"
                onClick={() => router.push("/books")}
                className="mt-3 inline-flex min-h-11 w-full items-center justify-center rounded-lg border border-border px-4 py-2 text-sm font-semibold transition-colors hover:bg-muted focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-primary"
              >
                Continue Shopping
              </button>
            </aside>
          </div>
        )}
      </main>
    </MainLayout>
  );
}
