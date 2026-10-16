"use client";

import Link from "next/link";
import Image from "next/image";
import {
  CalendarClock,
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

        <nav aria-label="Main navigation" className="flex shrink-0 items-center gap-0.5 text-xs text-muted-foreground sm:gap-4 sm:text-sm">
          <StorefrontSearch />
          <Link href="/books" className="inline-flex min-h-10 items-center px-1 transition-colors hover:text-foreground">Books</Link>
          <Link href="/cart" aria-label="Cart" title="Cart" className="inline-flex min-h-11 min-w-11 items-center justify-center gap-1 rounded-md px-1 transition-colors hover:bg-secondary hover:text-foreground">
            <ShoppingCart size={17} aria-hidden="true" /><span className="hidden sm:inline">Cart</span>
          </Link>
          <div className="hidden items-center gap-4 sm:flex">
          <Link href="/offer-zone" aria-label="Offers" title="Offers" className="inline-flex min-h-10 items-center gap-1 px-1 transition-colors hover:text-foreground"><Tag size={15} aria-hidden="true" /><span>Offers</span></Link>
          <Link href="/publication-services" className="inline-flex min-h-10 items-center transition-colors hover:text-foreground">Publish</Link>
          <Link href="/pre-booking" aria-label="Pre-book a book" title="Pre-book" className="inline-flex min-h-10 items-center gap-1 px-1 transition-colors hover:text-foreground">
            <CalendarClock size={15} aria-hidden="true" /><span className="hidden sm:inline">Pre-book</span>
          </Link>
          <Link href="/wishlist" aria-label="Wishlist" title="Wishlist" className="inline-flex min-h-10 min-w-10 items-center justify-center gap-1 px-1 transition-colors hover:text-foreground">
            <Heart size={17} aria-hidden="true" /><span className="hidden sm:inline">Wishlist</span>
          </Link>
          <Link href="/login" aria-label="Login" title="Login" className="inline-flex min-h-10 min-w-10 items-center justify-center gap-1 px-1 transition-colors hover:text-foreground">
            <LogIn size={17} aria-hidden="true" /><span className="hidden sm:inline">Login</span>
          </Link>
          </div>
          <details className="relative sm:hidden">
            <summary
              aria-label="More navigation links"
              className="grid min-h-11 min-w-11 cursor-pointer list-none place-items-center rounded-md hover:bg-secondary focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-primary"
            >
              <MoreHorizontal size={20} aria-hidden="true" />
            </summary>
            <div className="absolute right-0 top-full z-[60] mt-2 w-52 rounded-xl border border-border bg-background p-2 text-sm shadow-xl">
              <Link href="/offer-zone" className="block rounded-lg px-3 py-3 hover:bg-secondary">Offers</Link>
              <Link href="/publication-services" className="block rounded-lg px-3 py-3 hover:bg-secondary">Publish</Link>
              <Link href="/pre-booking" className="block rounded-lg px-3 py-3 hover:bg-secondary">Pre-book</Link>
              <Link href="/wishlist" className="block rounded-lg px-3 py-3 hover:bg-secondary">Wishlist</Link>
              <Link href="/login" className="block rounded-lg px-3 py-3 hover:bg-secondary">Login</Link>
            </div>
          </details>
        </nav>
      </div>
    </header>
  );
}
