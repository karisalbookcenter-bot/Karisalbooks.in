"use client";

import Link from "next/link";
import Image from "next/image";
import {
  BookOpenCheck,
  CalendarClock,
  Crown,
  Heart,
  LogIn,
  MoreHorizontal,
  ShoppingCart,
  Tag,
} from "lucide-react";
import { useEffect, useState } from "react";
import { StorefrontSearch } from "@/features/storefront/components/StorefrontSearch";
import { subscribeToSiteSettingsUpdates } from "@/features/site-settings/site-settings.events";

export function Header() {
  const [logoUrl, setLogoUrl] = useState("");

  useEffect(() => {
    let active = true;
    const loadLogo = () => fetch("/api/site-settings", { cache: "no-store" })
      .then(async (response) => {
        if (!response.ok) return;
        const result = await response.json() as { site?: { logoUrl?: string } };
        if (active) setLogoUrl(result.site?.logoUrl ?? "");
      })
      .catch(() => undefined);

    void loadLogo();
    const unsubscribe = subscribeToSiteSettingsUpdates(({ site }) => {
      setLogoUrl(site.logoUrl);
    });

    return () => {
      active = false;
      unsubscribe();
    };
  }, []);

  return (
    <header className="sticky top-0 z-50 w-full border-b border-border bg-background/95 backdrop-blur supports-[backdrop-filter]:bg-background/60">
      <div className="container flex h-16 items-center justify-between gap-1">
        <Link
          href="/"
          aria-label="Karisal Books home"
          className="flex min-w-0 shrink-0 items-center gap-2 font-semibold"
        >
          {logoUrl ? (
            // eslint-disable-next-line @next/next/no-img-element
            <img src={logoUrl} alt="Karisal Books" width={120} height={40} className="h-10 w-[120px] shrink-0 object-contain" />
          ) : (
            <>
              <Image src="/karisalbooks-mark.svg" alt="" width={32} height={32} priority className="h-8 w-8 shrink-0" />
              <span className="hidden text-sm min-[360px]:inline sm:hidden">Karisal</span>
              <span className="hidden text-lg sm:inline">Karisal Books</span>
            </>
          )}
        </Link>

        <nav aria-label="Main navigation" className="flex shrink-0 items-center gap-0.5 text-xs text-muted-foreground sm:gap-2 sm:text-sm lg:gap-3">
          <StorefrontSearch />
          <Link href="/books" className="inline-flex min-h-10 items-center px-1 transition-colors hover:text-foreground">Books</Link>
          <Link href="/offer-zone" className="hidden min-h-10 items-center gap-1 px-1 transition-colors hover:text-foreground sm:inline-flex">
            <Tag size={15} aria-hidden="true" /><span>Offers</span>
          </Link>
          <Link href="/membership/apply" className="hidden min-h-10 items-center gap-1 px-1 transition-colors hover:text-foreground md:inline-flex">
            <Crown size={15} aria-hidden="true" /><span>Membership</span>
          </Link>
          <Link href="/cart" aria-label="Cart" title="Cart" className="inline-flex min-h-11 min-w-11 items-center justify-center gap-1 rounded-md px-1 transition-colors hover:bg-secondary hover:text-foreground">
            <ShoppingCart size={17} aria-hidden="true" /><span className="hidden sm:inline">Cart</span>
          </Link>
          <details className="relative">
            <summary
              aria-label="More navigation links"
              className="grid min-h-11 min-w-11 cursor-pointer list-none place-items-center rounded-md hover:bg-secondary focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-primary [&::-webkit-details-marker]:hidden"
            >
              <MoreHorizontal size={20} aria-hidden="true" />
            </summary>
            <div className="absolute right-0 top-full z-[60] mt-2 w-60 rounded-xl border border-border bg-background p-2 text-sm shadow-xl">
              <Link href="/recommendations" className="block rounded-lg px-3 py-3 hover:bg-secondary">Book recommendations</Link>
              <Link href="/competitive-exams" className="block rounded-lg px-3 py-3 hover:bg-secondary">Competitive exam books</Link>
              <Link href="/pre-booking" className="flex items-center gap-2 rounded-lg px-3 py-3 hover:bg-secondary">
                <CalendarClock size={16} aria-hidden="true" /> Pre-booking
              </Link>
              <Link href="/pre-booking?mode=bulk" className="block rounded-lg px-3 py-3 hover:bg-secondary">Bulk book orders</Link>
              <Link href="/publication-services" className="flex items-center gap-2 rounded-lg px-3 py-3 hover:bg-secondary">
                <BookOpenCheck size={16} aria-hidden="true" /> Publish your book
              </Link>
              <Link href="/track-order" className="block rounded-lg px-3 py-3 hover:bg-secondary">Track an order</Link>
              <Link href="/wishlist" className="flex items-center gap-2 rounded-lg px-3 py-3 hover:bg-secondary">
                <Heart size={16} aria-hidden="true" /> Wishlist
              </Link>
              <Link href="/login" className="flex items-center gap-2 rounded-lg px-3 py-3 hover:bg-secondary">
                <LogIn size={16} aria-hidden="true" /> Sign in / My account
              </Link>
              <Link href="/about" className="block rounded-lg px-3 py-3 hover:bg-secondary">About Karisal Books</Link>
              <Link href="/contact" className="block rounded-lg px-3 py-3 hover:bg-secondary">Contact &amp; location</Link>
            </div>
          </details>
        </nav>
      </div>
    </header>
  );
}
