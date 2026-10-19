"use client";

import Link from "next/link";
import Image from "next/image";
import {
  ArrowUpRight,
  BookOpen,
  BookOpenCheck,
  CalendarClock,
  Crown,
  Heart,
  LogIn,
  MapPin,
  MoreHorizontal,
  PackageSearch,
  ShoppingCart,
  Sparkles,
  Tag,
} from "lucide-react";
import { useEffect, useState, type MouseEvent } from "react";
import { StorefrontSearch } from "@/features/storefront/components/StorefrontSearch";
import { subscribeToSiteSettingsUpdates } from "@/features/site-settings/site-settings.events";

const exploreLinks = [
  { href: "/recommendations", label: "Handpicked recommendations", icon: Sparkles },
  { href: "/competitive-exams", label: "Competitive exam books", icon: BookOpen },
  { href: "/pre-booking", label: "Pre-booking", icon: CalendarClock },
  { href: "/pre-booking?mode=bulk", label: "Bulk book orders", icon: PackageSearch },
  { href: "/publication-services", label: "Publish your book", icon: BookOpenCheck },
  { href: "/track-order", label: "Track an order", icon: PackageSearch },
  { href: "/wishlist", label: "My wishlist", icon: Heart },
  { href: "/login", label: "Sign in / My account", icon: LogIn },
  { href: "/about", label: "About Karisal Books", icon: MapPin },
];

function closeExploreMenu(event: MouseEvent<HTMLAnchorElement>) {
  const menu = event.currentTarget.closest("details");
  if (menu) menu.open = false;
}

export function Header() {
  const [logoUrl, setLogoUrl] = useState("");

  useEffect(() => {
    let active = true;
    const loadLogo = () =>
      fetch("/api/site-settings", { cache: "no-store" })
        .then(async (response) => {
          if (!response.ok) return;
          const result = (await response.json()) as {
            site?: { logoUrl?: string };
          };
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
    <header className="sticky top-0 z-50 w-full border-b border-border bg-background/95 shadow-sm backdrop-blur supports-[backdrop-filter]:bg-background/90">
      <div className="container flex h-16 items-center justify-between gap-2">
        <Link
          href="/"
          aria-label="Karisal Books home"
          className="flex min-w-0 shrink-0 items-center gap-2 font-semibold"
        >
          {logoUrl ? (
            // eslint-disable-next-line @next/next/no-img-element
            <img
              src={logoUrl}
              alt="Karisal Books"
              width={120}
              height={40}
              className="h-10 w-[120px] shrink-0 object-contain"
            />
          ) : (
            <>
              <Image
                src="/karisalbooks-mark.svg"
                alt=""
                width={36}
                height={36}
                priority
                className="h-9 w-9 shrink-0"
              />
              <span className="hidden text-sm min-[360px]:inline sm:hidden">Karisal</span>
              <span className="hidden text-lg sm:inline">Karisal Books</span>
            </>
          )}
        </Link>

        <nav
          aria-label="Quick actions"
          className="flex shrink-0 items-center gap-1 text-sm"
        >
          <StorefrontSearch />
          <Link
            href="/membership/apply"
            className="group inline-flex min-h-11 items-center gap-2 rounded-full border border-amber-400/70 bg-gradient-to-r from-amber-50 to-yellow-100 px-3 font-semibold text-amber-950 shadow-sm transition-all hover:-translate-y-0.5 hover:shadow-md dark:from-amber-950 dark:to-yellow-950 dark:text-amber-100 sm:px-4"
          >
            <span className="grid h-7 w-7 place-items-center rounded-full bg-amber-400 text-amber-950 shadow-sm">
              <Crown size={15} aria-hidden="true" />
            </span>
            <span className="hidden sm:inline">Membership</span>
            <ArrowUpRight
              size={14}
              className="hidden transition-transform group-hover:-translate-y-0.5 group-hover:translate-x-0.5 sm:block"
              aria-hidden="true"
            />
          </Link>
          <Link
            href="/cart"
            aria-label="Shopping cart"
            title="Shopping cart"
            className="inline-flex min-h-11 min-w-11 items-center justify-center gap-2 rounded-full border border-border bg-card px-2 text-foreground transition-colors hover:border-primary/40 hover:bg-secondary sm:px-3"
          >
            <ShoppingCart size={18} aria-hidden="true" />
            <span className="hidden lg:inline">Cart</span>
          </Link>
          <details className="group relative">
            <summary
              aria-label="Explore more links"
              className="grid min-h-11 min-w-11 cursor-pointer list-none place-items-center rounded-full border border-border bg-card transition-colors hover:border-primary/40 hover:bg-secondary focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-primary [&::-webkit-details-marker]:hidden"
            >
              <MoreHorizontal size={20} aria-hidden="true" />
            </summary>
            <div className="absolute right-0 top-full z-[60] mt-2 w-[min(88vw,20rem)] rounded-2xl border border-border bg-background p-2 text-sm shadow-xl">
              <p className="px-3 pb-2 pt-2 text-xs font-semibold uppercase tracking-[0.14em] text-muted-foreground">
                Explore Karisal Books
              </p>
              {exploreLinks.map(({ href, label, icon: Icon }) => (
                <Link
                  key={href}
                  href={href}
                  onClick={closeExploreMenu}
                  className="flex min-h-11 items-center gap-3 rounded-xl px-3 py-2 font-medium text-foreground transition-colors hover:bg-secondary hover:text-primary"
                >
                  <span className="grid h-8 w-8 shrink-0 place-items-center rounded-lg bg-primary/10 text-primary">
                    <Icon size={16} aria-hidden="true" />
                  </span>
                  {label}
                </Link>
              ))}
              <Link
                href="/contact"
                onClick={closeExploreMenu}
                className="mt-1 flex min-h-11 items-center gap-3 rounded-xl border-t border-border px-3 pt-2 font-medium text-primary"
              >
                <MapPin size={16} aria-hidden="true" />
                Contact &amp; store location
              </Link>
            </div>
          </details>
        </nav>
      </div>

      <nav
        aria-label="Shop and services"
        className="hidden border-t border-border/80 bg-background/90 lg:block"
      >
        <div className="container flex h-11 items-center justify-center gap-1 text-sm font-medium">
          <Link href="/books" className="rounded-full px-4 py-2 transition-colors hover:bg-secondary hover:text-primary">
            Browse books
          </Link>
          <Link href="/competitive-exams" className="rounded-full px-4 py-2 transition-colors hover:bg-secondary hover:text-primary">
            Exam books
          </Link>
          <Link href="/recommendations" className="rounded-full px-4 py-2 transition-colors hover:bg-secondary hover:text-primary">
            Recommendations
          </Link>
          <Link href="/offer-zone" className="inline-flex items-center gap-1.5 rounded-full px-4 py-2 transition-colors hover:bg-secondary hover:text-primary">
            <Tag size={14} aria-hidden="true" />
            Offers
          </Link>
          <Link href="/pre-booking" className="inline-flex items-center gap-1.5 rounded-full px-4 py-2 transition-colors hover:bg-secondary hover:text-primary">
            <CalendarClock size={14} aria-hidden="true" />
            Pre-book
          </Link>
          <Link href="/publication-services" className="rounded-full px-4 py-2 transition-colors hover:bg-secondary hover:text-primary">
            Publish a book
          </Link>
        </div>
      </nav>
    </header>
  );
}
