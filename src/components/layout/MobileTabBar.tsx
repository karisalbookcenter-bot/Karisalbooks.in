"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";
import { BookOpen, Crown, House, ShoppingCart, Tag } from "lucide-react";

const tabs = [
  { href: "/", label: "Home", icon: House },
  { href: "/books", label: "Books", icon: BookOpen },
  { href: "/offer-zone", label: "Offers", icon: Tag },
  { href: "/membership/apply", label: "Member", icon: Crown },
  { href: "/cart", label: "Cart", icon: ShoppingCart },
];

export function MobileTabBar() {
  const pathname = usePathname();

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
                aria-label={label}
                aria-current={active ? "page" : undefined}
                className={`flex min-h-[3.75rem] flex-col items-center justify-center gap-1 px-1 text-[10px] font-semibold transition-colors ${
                  active ? "text-primary" : "text-muted-foreground hover:text-foreground"
                }`}
              >
                <span
                  className={`grid h-7 w-10 place-items-center rounded-full transition-colors ${
                    active ? "bg-primary/10" : ""
                  }`}
                >
                  <Icon
                    size={19}
                    strokeWidth={active ? 2.5 : 1.8}
                    aria-hidden="true"
                  />
                </span>
                {label}
              </Link>
            </li>
          );
        })}
      </ul>
    </nav>
  );
}
