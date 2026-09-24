"use client";

import { MainLayout } from "@/components/layout/MainLayout";
import { useCart } from "@/features/cart/hooks/useCart";
import { formatCurrency } from "@/lib/helpers/format.helpers";

export default function CartPage() {
  const { items, removeItem, updateQuantity } = useCart();

  const total = items.reduce(
    (sum, item) => sum + item.price * item.quantity,
    0
  );

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

            {items.map((item) => (
              <div
                key={item.id}
                className="flex items-center justify-between rounded-md border p-4"
              >

                <div>
                  <h2 className="font-semibold">
                    {item.title}
                  </h2>

                  <p className="text-sm text-muted-foreground">
                    {formatCurrency(item.price)}
                  </p>

                  <div className="mt-2 flex items-center gap-3">

                    <button
                      className="rounded border px-2"
                      onClick={() =>
                        updateQuantity(
                          item.id,
                          Math.max(1, item.quantity - 1)
                        )
                      }
                    >
                      -
                    </button>

                    <span>
                      {item.quantity}
                    </span>

                    <button
                      className="rounded border px-2"
                      onClick={() =>
                        updateQuantity(
                          item.id,
                          item.quantity + 1
                        )
                      }
                    >
                      +
                    </button>

                  </div>
                </div>


                <div className="text-right">

                  <p className="font-semibold">
                    {formatCurrency(
                      item.price * item.quantity
                    )}
                  </p>


                  <button
                    className="mt-2 text-sm text-destructive"
                    onClick={() =>
                      removeItem(item.id)
                    }
                  >
                    Remove
                  </button>

                </div>

              </div>
            ))}


            <div className="mt-8 border-t pt-4 text-right">

              <h2 className="text-xl font-bold">
                Total: {formatCurrency(total)}
              </h2>
              <button
  className="mt-4 rounded-md bg-primary px-6 py-3 text-sm font-semibold text-white"
  onClick={() => {
    window.location.href = "/checkout";
  }}
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