"use client";

import Link from "next/link";
import { Heart, ShoppingCart, Trash2 } from "lucide-react";
import { MainLayout } from "@/components/layout/MainLayout";
import { useCart } from "@/features/cart/hooks/useCart";
import { formatCurrency } from "@/lib/helpers/format.helpers";

export default function WishlistPage() {
  const { wishlistItems, removeWishlistItem, addItem } = useCart();

  return (
    <MainLayout>
      <div className="container py-8 sm:py-10">
        <header className="mb-6 border-b border-border pb-4">
          <p className="text-xs font-semibold uppercase text-primary">Saved books</p>
          <h1 className="mt-1 text-2xl font-semibold">Wishlist</h1>
        </header>

        {wishlistItems.length === 0 ? (
          <div className="flex flex-col items-center gap-3 py-14 text-center">
            <Heart size={28} className="text-primary" aria-hidden="true" />
            <p className="text-sm text-muted-foreground">Your wishlist is empty.</p>
            <Link href="/books" className="inline-flex min-h-10 items-center rounded-md bg-primary px-4 text-sm font-semibold text-primary-foreground">
              Browse books
            </Link>
          </div>
        ) : (
          <div className="divide-y divide-border">
            {wishlistItems.map((item) => (
              <article key={item.id} className="flex gap-3 py-4 first:pt-0 sm:gap-5">
                <Link href={`/books/${item.slug}`} className="flex h-28 w-20 shrink-0 items-center justify-center bg-secondary sm:h-36 sm:w-24">
                  {item.coverImageUrl ? (
                    // eslint-disable-next-line @next/next/no-img-element
                    <img src={item.coverImageUrl} alt="" className="h-full w-full object-contain" />
                  ) : <span className="px-1 text-center text-[10px] text-muted-foreground">Cover coming soon</span>}
                </Link>
                <div className="flex min-w-0 flex-1 flex-col">
                  {item.publisherName && <p className="line-clamp-1 text-[10px] font-semibold uppercase text-primary/80">{item.publisherName}</p>}
                  <Link href={`/books/${item.slug}`} className="mt-1 line-clamp-2 text-sm font-semibold hover:text-primary">{item.title}</Link>
                  {item.authorName && <p className="mt-1 line-clamp-1 text-xs text-muted-foreground">{item.authorName}</p>}
                  <div className="mt-2 flex flex-wrap items-baseline gap-x-2 gap-y-1">
                    <span className="text-sm font-semibold text-primary">{formatCurrency(item.price)}</span>
                    {!!item.discountAmount && <span className="text-xs text-muted-foreground line-through">{formatCurrency(item.originalPrice ?? item.price + item.discountAmount)}</span>}
                    {!!item.discountAmount && <span className="text-xs font-medium text-emerald-700">Save {formatCurrency(item.discountAmount)}</span>}
                  </div>
                  <div className="mt-auto flex flex-wrap items-center gap-2 pt-3">
                    <button
                      type="button"
                      onClick={() => addItem({ ...item, quantity: 1 })}
                      className="inline-flex min-h-10 items-center gap-2 rounded-md bg-primary px-3 text-xs font-semibold text-primary-foreground sm:text-sm"
                    >
                      <ShoppingCart size={15} aria-hidden="true" /> Add to cart
                    </button>
                    <button
                      type="button"
                      aria-label={`Remove ${item.title} from wishlist`}
                      onClick={() => removeWishlistItem(item.id)}
                      className="grid h-10 w-10 place-items-center rounded-md border border-border text-muted-foreground hover:text-destructive"
                    >
                      <Trash2 size={16} aria-hidden="true" />
                    </button>
                  </div>
                </div>
              </article>
            ))}
          </div>
        )}
      </div>
    </MainLayout>
  );
}