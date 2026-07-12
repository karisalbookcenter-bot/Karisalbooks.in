"use client";

import { useEffect } from "react";
import { usePathname } from "next/navigation";
import Link from "next/link";

import { ADMIN_NAVIGATION_ITEMS } from "@/config/adminNavigation";
import { ROUTES } from "@/constants/routes.constants";
import { getVisibleItems, sortByOrder } from "@/lib/helpers/menu.helpers";
import { getIcon } from "@/lib/icons";
import { cn } from "@/lib/utils";
import type { NavigationItemRecord } from "@/types/navigation.types";
import { SidebarNavItem } from "./SidebarNavItem";

export interface MobileNavDrawerProps {
  items?: NavigationItemRecord[];
  open: boolean;
  onClose: () => void;
}

/**
 * MobileNavDrawer — Sprint 06 (Task 7).
 *
 * The same admin navigation as `AdminSidebar`, presented as a full-height
 * off-canvas panel for viewports below the `lg` breakpoint, where a
 * persistent sidebar would consume too much of a small screen.
 *
 * Built with plain Tailwind + React state rather than a Radix/shadcn
 * `Sheet` primitive, consistent with this project's existing
 * dependency-light approach (`components/ui/button.tsx` from Day 1 is
 * hand-written, not a wrapped Radix primitive either). Accessibility is
 * handled explicitly instead of inherited from a library:
 *  - `role="dialog"` + `aria-modal="true"` + `aria-label`
 *  - Escape key closes the drawer
 *  - Body scroll is locked while open
 *  - The scrim (background overlay) is a real button, so it's reachable
 *    and operable by keyboard/screen reader, not just a click target
 *  - Navigating (via `SidebarNavItem`'s `onNavigate`) closes the drawer
 *
 * A focus trap (keeping Tab cycling inside the panel) is intentionally
 * not implemented — this is layout architecture, not a full dialog
 * component library; flagged in `docs/ADMIN_LAYOUT.md` as a follow-up
 * once a real modal/dialog primitive is introduced project-wide.
 */
export function MobileNavDrawer({ items = ADMIN_NAVIGATION_ITEMS, open, onClose }: MobileNavDrawerProps) {
  const pathname = usePathname();
  const visibleItems = getVisibleItems(items).sort(sortByOrder);

  useEffect(() => {
    if (!open) return;

    function handleKeyDown(event: KeyboardEvent) {
      if (event.key === "Escape") onClose();
    }

    document.addEventListener("keydown", handleKeyDown);
    document.body.style.overflow = "hidden";

    return () => {
      document.removeEventListener("keydown", handleKeyDown);
      document.body.style.overflow = "";
    };
  }, [open, onClose]);

  if (!open) return null;

  return (
    <div className="fixed inset-0 z-50 lg:hidden">
      {/* Scrim */}
      <button
        type="button"
        onClick={onClose}
        aria-label="Close navigation menu"
        className="absolute inset-0 h-full w-full bg-foreground/40 backdrop-blur-sm"
      />

      {/* Panel */}
      <div
        role="dialog"
        aria-modal="true"
        aria-label="Admin navigation menu"
        className={cn(
          "absolute inset-y-0 left-0 flex w-72 max-w-[85vw] flex-col bg-card shadow-xl",
          "animate-in slide-in-from-left duration-200"
        )}
      >
        <div className="flex h-16 items-center justify-between border-b border-border px-4">
          <Link
            href={ROUTES.ADMIN_DASHBOARD}
            onClick={onClose}
            className="flex items-center gap-2 rounded-sm focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2"
          >
            <span className="flex h-8 w-8 items-center justify-center rounded-md bg-primary text-sm font-bold text-primary-foreground">
              K
            </span>
            <span className="text-sm font-semibold text-foreground">KarisalBooks Admin</span>
          </Link>
          <button
            type="button"
            onClick={onClose}
            aria-label="Close navigation menu"
            className="rounded-md p-2 text-muted-foreground transition-colors hover:bg-accent hover:text-accent-foreground focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2"
          >
            {(() => {
              const CloseIcon = getIcon("close");
              return <CloseIcon className="h-5 w-5" aria-hidden="true" />;
            })()}
          </button>
        </div>

        <nav className="flex-1 space-y-1 overflow-y-auto p-3" aria-label="Admin navigation">
          {visibleItems.map((item) => (
            <SidebarNavItem
              key={item.id}
              item={item}
              isActive={pathname === item.slug || pathname?.startsWith(`${item.slug}/`)}
              onNavigate={onClose}
            />
          ))}
        </nav>
      </div>
    </div>
  );
}
