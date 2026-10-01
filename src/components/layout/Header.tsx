"use client";

import Link from "next/link";
import Image from "next/image";
import { CalendarClock, ShoppingCart, Tag } from "lucide-react";
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
      <div className="container flex h-16 items-center justify-between">
        <Link href="/" className="flex items-center gap-2 font-semibold">
          {logoUrl ? (
            // eslint-disable-next-line @next/next/no-img-element
            <img src={logoUrl} alt="" width={32} height={32} className="h-8 w-8 shrink-0 object-contain" />
          ) : (
            <Image src="/karisalbooks-mark.svg" alt="" width={32} height={32} priority className="h-8 w-8 shrink-0" />
          )}
          <span className="text-base sm:text-lg">Karisal Books</span>
        </Link>

        <nav aria-label="Main navigation" className="flex items-center gap-2 text-xs text-muted-foreground sm:gap-5 sm:text-sm">
          <Link href="/books" className="transition-colors hover:text-foreground">Books</Link>
          <Link href="/offer-zone" className="inline-flex items-center gap-1 transition-colors hover:text-foreground"><Tag size={15} aria-hidden="true" /> Offers</Link>
          <Link href="/publication-services" className="transition-colors hover:text-foreground">Publish</Link>
          <Link href="/pre-booking" aria-label="Pre-book a book" className="inline-flex items-center gap-1 transition-colors hover:text-foreground">
            <CalendarClock size={15} aria-hidden="true" /><span className="hidden sm:inline">Pre-book</span>
          </Link>
          <Link href="/cart" aria-label="Cart" className="inline-flex items-center gap-1 transition-colors hover:text-foreground">
            <ShoppingCart size={15} aria-hidden="true" /><span className="hidden sm:inline">Cart</span>
          </Link>
        </nav>
      </div>
    </header>
  );
}
