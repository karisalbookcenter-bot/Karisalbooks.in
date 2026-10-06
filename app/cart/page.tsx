"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";

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

  function handleCheckout() {
    setCheckoutError("");

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
      <div className="container py-10">
        <h1 className="mb-6 text-3xl font-bold">
          Shopping Cart
        </h1>

        {items.length === 0 ? (
          <p className="text-muted-foreground">
            Your cart is empty.
          </p>
        ) : (
          <div className="space-y-4">
            {items.map((item) => {
              const isCustomize =
                item.purchaseType === "customize";

              return (
                <div
                  key={item.id}
                  className="flex items-center justify-between rounded-md border p-4"
                >
                  <div className="min-w-0">
                    <div className="flex flex-wrap items-center gap-2">
                      <h2 className="font-semibold">
                        {item.title}
                      </h2>

                      {isCustomize && (
                        <span className="rounded-full bg-primary/10 px-2.5 py-1 text-xs font-semibold text-primary">
                          Customize
                        </span>
                      )}

                      {item.purchaseType === "prebooking" && (
                        <span className="rounded-full bg-amber-100 px-2.5 py-1 text-xs font-semibold text-amber-800">
                          Pre-booking
                        </span>
                      )}
                    </div>

                    <p className="mt-1 text-sm text-muted-foreground">
                      {isCustomize ? (
                        <>
                          <span className="font-semibold text-primary">
                            {formatCurrency(item.price)}
                          </span>
                          <span className="ml-1">
                            per copy
                          </span>
                        </>
                      ) : item.discountAmount ? (
                        <>
                          <span className="mr-2 font-semibold text-primary">
                            {formatCurrency(item.price)}
                          </span>

                          <span className="line-through">
                            {formatCurrency(
                              item.originalPrice ??
                                item.price +
                                  item.discountAmount,
                            )}
                          </span>

                          <span className="mt-1 block text-xs font-medium text-emerald-700">
                            7% off · Save{" "}
                            {formatCurrency(
                              item.discountAmount,
                            )}
                          </span>
                        </>
                      ) : (
                        formatCurrency(item.price)
                      )}
                    </p>

                    {isCustomize && (
                      <div className="mt-3 rounded-md bg-muted/50 p-3">
                        <p className="text-xs font-semibold uppercase tracking-wide text-muted-foreground">
                          Function / Event Details
                        </p>

                        <p className="mt-1 whitespace-pre-wrap text-sm">
                          {item.customizationDetails ||
                            "No details provided."}
                        </p>

                        <p className="mt-2 text-xs font-medium text-muted-foreground">
                          Minimum:{" "}
                          {CUSTOMIZE_MINIMUM_QUANTITY} copies
                          for this title
                        </p>
                      </div>
                    )}

                    <div className="mt-3 flex items-center gap-3">
                      <button
                        type="button"
                        className="rounded border px-2 py-1 disabled:cursor-not-allowed disabled:opacity-50"
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
                      >
                        -
                      </button>

                      <span className="min-w-10 text-center font-medium">
                        {item.quantity}
                      </span>

                      <button
                        type="button"
                        className="rounded border px-2 py-1"
                        onClick={() =>
                          handleQuantityChange(
                            item.id,
                            item.quantity + 1,
                            item.purchaseType,
                          )
                        }
                      >
                        +
                      </button>
                    </div>
                  </div>

                  <div className="ml-4 shrink-0 text-right">
                    <p className="font-semibold">
                      {formatCurrency(
                        item.price * item.quantity,
                      )}
                    </p>

                    <button
                      type="button"
                      className="mt-2 text-sm text-destructive"
                      onClick={() => removeItem(item.id)}
                    >
                      Remove
                    </button>
                  </div>
                </div>
              );
            })}

            {hasCustomizeItems && hasNonCustomizeItems && (
              <div className="rounded-md border border-amber-300 bg-amber-50 p-4 text-sm text-amber-800">
                Customize orders must be placed separately from
                regular books and pre-booking orders.
              </div>
            )}

            {checkoutError && (
              <div className="rounded-md border border-destructive/30 bg-destructive/5 p-4 text-sm text-destructive">
                {checkoutError}
              </div>
            )}

            <div className="mt-8 border-t pt-4 text-right">
              <h2 className="text-xl font-bold">
                Total: {formatCurrency(totalPrice)}
              </h2>

              <button
                type="button"
                className="mt-4 rounded-md bg-primary px-6 py-3 text-sm font-semibold text-white disabled:cursor-not-allowed disabled:opacity-50"
                onClick={handleCheckout}
              >
                Proceed to Checkout
              </button>
            </div>
          </div>
        )}
      </div>
    </MainLayout>
  );
}