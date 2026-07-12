import Link from "next/link";
import { ICONS } from "@/lib/icons";
import { cn } from "@/lib/utils";

export interface BreadcrumbItem {
  /** Text shown for this crumb. */
  label: string;
  /** Link target. Omitted (or matching the current page) renders as
   *  plain text instead of a link — a breadcrumb's last item never links
   *  to itself. */
  href?: string;
}

export interface BreadcrumbProps {
  items: BreadcrumbItem[];
  className?: string;
}

/**
 * Breadcrumb — Sprint 06.
 *
 * Deliberately generic (a plain `items` prop, no admin-specific import)
 * so it's reusable anywhere a page needs a trail — an admin page today,
 * potentially a future customer-facing category page tomorrow. Admin
 * pages are simply its first consumer.
 *
 * Accessible by construction: a `<nav aria-label="Breadcrumb">` wrapping
 * an ordered list, with the current page marked `aria-current="page"`
 * and rendered as text (not a link) rather than relying on styling alone
 * to convey "you are here."
 */
export function Breadcrumb({ items, className }: BreadcrumbProps) {
  const ChevronIcon = ICONS["chevron-right"];

  return (
    <nav aria-label="Breadcrumb" className={className}>
      <ol className="flex flex-wrap items-center gap-1.5 text-sm text-muted-foreground">
        {items.map((item, index) => {
          const isLast = index === items.length - 1;

          return (
            <li key={`${item.label}-${index}`} className="flex items-center gap-1.5">
              {index > 0 && (
                <ChevronIcon className="h-3.5 w-3.5 shrink-0" aria-hidden="true" />
              )}
              {item.href && !isLast ? (
                <Link
                  href={item.href}
                  className="transition-colors hover:text-foreground focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2 rounded-sm"
                >
                  {item.label}
                </Link>
              ) : (
                <span
                  className={cn(isLast && "font-medium text-foreground")}
                  aria-current={isLast ? "page" : undefined}
                >
                  {item.label}
                </span>
              )}
            </li>
          );
        })}
      </ol>
    </nav>
  );
}
