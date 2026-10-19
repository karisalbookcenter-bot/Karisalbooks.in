"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";
import { useRef } from "react";
import {
  BookOpen,
  BookOpenCheck,
  CalendarClock,
  Crown,
  Heart,
  House,
  LogIn,
  MapPin,
  MoreHorizontal,
  PackageSearch,
  ShoppingCart,
  Sparkles,
  Tag,
} from "lucide-react";
import { useCart } from "@/features/cart/hooks/useCart";

const tabs = [
  { href: "/", label: "Home", icon: House },
  { href: "/books", label: "Books", icon: BookOpen },
  { href: "/offer-zone", label: "Offers", icon: Tag },
  { href: "/cart", label: "Cart", icon: ShoppingCart },
];

export function MobileTabBar() {
  const pathname = usePathname();
  const moreMenu = useRef<HTMLDetailsElement>(null);
  const { totalItems } = useCart();

  return (
    <nav
      aria-label="Quick navigation"
      className="fixed inset-x-0 bottom-0 z-50 border-t border-border bg-background/95 pb-[env(safe-area-inset-bottom)] shadow-[0_-6px_24px_rgba(15,23,42,0.08)] backdrop-blur sm:hidden"
    >
      <ul className="mx-auto flex max-w-lg items-stretch">
        {tabs.map(({ href, label, icon: Icon }) => {
          const active =
            href === "/"
              ? pathname === "/"
              : pathname === href || pathname.startsWith(`${href}/`);

          return (
            <li key={href} className="min-w-0 flex-1">
              <Link
                href={href}
                aria-label={
                  href === "/cart" && totalItems > 0
                    ? `Cart, ${totalItems} items`
                    : label
                }
                aria-current={active ? "page" : undefined}
                className={`flex min-h-[3.75rem] flex-col items-center justify-center gap-1 px-1 text-[10px] font-semibold transition-colors ${
                  active ? "text-primary" : "text-muted-foreground hover:text-foreground"
                }`}
              >
                <span
                  className={`relative grid h-7 w-10 place-items-center rounded-full transition-colors ${
                    active ? "bg-primary/10" : ""
                  }`}
                >
                  <Icon
                    size={19}
                    strokeWidth={active ? 2.5 : 1.8}
                    aria-hidden="true"
                  />
                  {href === "/cart" && totalItems > 0 && (
                    <span aria-hidden="true" className="absolute right-1 top-0 grid h-4 min-w-4 place-items-center rounded-full bg-amber-300 px-1 text-[9px] font-bold leading-none text-[#12372a]">
                      {totalItems > 99 ? "99+" : totalItems}
                    </span>
                  )}
                </span>
                {label}
              </Link>
            </li>
          );
        })}
        <li className="min-w-0 flex-1">
          <details ref={moreMenu} className="group relative">
            <summary className="flex min-h-[3.75rem] cursor-pointer list-none flex-col items-center justify-center gap-1 px-1 text-[10px] font-semibold text-muted-foreground transition-colors hover:text-foreground [&::-webkit-details-marker]:hidden">
              <span className="grid h-7 w-10 place-items-center rounded-full">
                <MoreHorizontal size={19} strokeWidth={1.8} aria-hidden="true" />
              </span>
              More
            </summary>
            <nav
              aria-label="More services"
              className="absolute bottom-full right-1 mb-2 max-h-[min(70vh,32rem)] w-[min(88vw,21rem)] overflow-y-auto rounded-2xl border border-border bg-background p-2 text-sm shadow-xl"
            >
              {[
                { href: "/recommendations", label: "Handpicked recommendations", icon: Sparkles },
                { href: "/competitive-exams", label: "Competitive exam books", icon: BookOpen },
                { href: "/membership/apply", label: "Membership benefits", icon: Crown },
                { href: "/pre-booking", label: "Pre-book a title", icon: CalendarClock },
                { href: "/pre-booking?mode=bulk", label: "Bulk book orders", icon: PackageSearch },
                { href: "/publication-services", label: "Publishing services", icon: BookOpenCheck },
                { href: "/customize", label: "Custom book orders", icon: BookOpen },
                { href: "/wishlist", label: "My wishlist", icon: Heart },
                { href: "/account", label: "My account & orders", icon: House },
                { href: "/track-order", label: "Track an order", icon: PackageSearch },
                { href: "/contact", label: "Contact & store location", icon: MapPin },
                { href: "/login", label: "Sign in", icon: LogIn },
              ].map(({ href, label, icon: Icon }) => (
                <Link
                  key={href}
                  href={href}
                  onClick={() => {
                    if (moreMenu.current) moreMenu.current.open = false;
                  }}
                  className="flex min-h-11 items-center gap-3 rounded-xl px-3 py-2 font-medium text-foreground transition-colors hover:bg-secondary hover:text-primary"
                >
                  <Icon size={16} aria-hidden="true" />
                  {label}
                </Link>
              ))}
            </nav>
          </details>
        </li>
      </ul>
    </nav>
  );
}
