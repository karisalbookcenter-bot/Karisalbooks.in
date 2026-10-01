"use client";

import Link from "next/link";
import Image from "next/image";
import { CalendarClock, Heart, LogIn, ShoppingCart, Tag } from "lucide-react";
import { useEffect, useState } from "react";

export function Header() {
  const [logoUrl, setLogoUrl] = useState("");

  useEffect(() => {
    fetch("/api/site-settings")
      .then(async (response) => {
        if (!response.ok) return;
        const result = await response.json() as { site?: { logoUrl?: string } };
        if (result.site?.logoUrl) setLogoUrl(result.site.logoUrl);
      })
      .catch(() => undefined);
  }, []);

  return (
    <header className="sticky top-0 z-50 w-full border-b border-border bg-background/95 backdrop-blur supports-[backdrop-filter]:bg-background/60">
      <div className="container flex h-16 items-center justify-between gap-1">
        <Link href="/" className="flex shrink-0 items-center gap-2 font-semibold">
          {logoUrl ? (
            // eslint-disable-next-line @next/next/no-img-element
            <img src={logoUrl} alt="" width={32} height={32} className="h-8 w-8 shrink-0 object-contain" />
          ) : (
            <Image src="/karisalbooks-mark.svg" alt="" width={32} height={32} priority className="h-8 w-8 shrink-0" />
          )}
          <span className="text-sm sm:hidden">Karisal</span>
          <span className="hidden text-lg sm:inline">Karisal Books</span>
        </Link>

        <nav aria-label="Main navigation" className="flex shrink-0 items-center gap-0.5 text-xs text-muted-foreground sm:gap-4 sm:text-sm">
          <Link href="/books" className="inline-flex min-h-10 items-center px-1 transition-colors hover:text-foreground">Books</Link>
          <Link href="/offer-zone" aria-label="Offers" title="Offers" className="inline-flex min-h-10 items-center gap-1 px-1 transition-colors hover:text-foreground"><Tag size={15} aria-hidden="true" /><span className="hidden sm:inline">Offers</span></Link>
          <Link href="/publication-services" className="hidden min-h-10 items-center transition-colors hover:text-foreground sm:inline-flex">Publish</Link>
          <Link href="/pre-booking" aria-label="Pre-book a book" title="Pre-book" className="inline-flex min-h-10 items-center gap-1 px-1 transition-colors hover:text-foreground">
            <CalendarClock size={15} aria-hidden="true" /><span className="hidden sm:inline">Pre-book</span>
          </Link>
          <Link href="/cart" aria-label="Cart" title="Cart" className="inline-flex min-h-10 min-w-10 items-center justify-center gap-1 px-1 transition-colors hover:text-foreground">
            <ShoppingCart size={17} aria-hidden="true" /><span className="hidden sm:inline">Cart</span>
          </Link>
          <Link href="/wishlist" aria-label="Wishlist" title="Wishlist" className="inline-flex min-h-10 min-w-10 items-center justify-center gap-1 px-1 transition-colors hover:text-foreground">
            <Heart size={17} aria-hidden="true" /><span className="hidden sm:inline">Wishlist</span>
          </Link>
          <Link href="/login" aria-label="Login" title="Login" className="inline-flex min-h-10 min-w-10 items-center justify-center gap-1 px-1 transition-colors hover:text-foreground">
            <LogIn size={17} aria-hidden="true" /><span className="hidden sm:inline">Login</span>
          </Link>
        </nav>
      </div>
    </header>
  );
}
