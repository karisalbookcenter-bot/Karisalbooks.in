"use client";

import { usePathname } from "next/navigation";
import Link from "next/link";

import { ADMIN_NAVIGATION_ITEMS } from "@/config/adminNavigation";
import { ROUTES } from "@/constants/routes.constants";
import { getVisibleItems, sortByOrder } from "@/lib/helpers/menu.helpers";
import { getIcon } from "@/lib/icons";
import { cn } from "@/lib/utils";
import type { NavigationItemRecord } from "@/types/navigation.types";
import { SidebarNavItem } from "./SidebarNavItem";

export interface AdminSidebarProps {
  /** Config-driven by default (`ADMIN_NAVIGATION_ITEMS` from Day 4's
   *  navigation architecture) — overridable so the component stays
   *  reusable/testable rather than hardwired to one global import. */
  items?: NavigationItemRecord[];
  collapsed: boolean;
  onToggleCollapse: () => void;
  className?: string;
}

/**
 * AdminSidebar — Sprint 06 (Task 2, 5, 6).
 *
 * Desktop/tablet persistent navigation rail for the admin shell.
 * Config-driven: reads `ADMIN_NAVIGATION_ITEMS` (Sprint 06's admin menu,
 * built on Day 4's `NavigationItemRecord` model) and renders it through
 * the shared `getVisibleItems`/`sortByOrder` menu helpers from Day 4 —
 * the exact same functions the public site nav uses — rather than
 * re-filtering/re-sorting inline.
 *
 * Collapsible (task 6): `collapsed`/`onToggleCollapse` are owned by the
 * caller (`AdminShell`, via `useSidebarState`) and passed in as props, so
 * `AdminSidebar` stays a pure, reusable presentational component with no
 * hook of its own to worry about when reused or tested. Collapsed mode
 * shows icons only (via `SidebarNavItem`'s `collapsed` prop) at a fixed
 * narrow width; expanded mode shows icon + label.
 *
 * Hidden below the `lg` breakpoint — `MobileNavDrawer` takes over there.
 */
export function AdminSidebar({
  items = ADMIN_NAVIGATION_ITEMS,
  collapsed,
  onToggleCollapse,
  className,
}: AdminSidebarProps) {
  const pathname = usePathname();
  const ChevronIcon = getIcon(collapsed ? "chevron-right" : "chevron-left");
  const visibleItems = getVisibleItems(items).sort(sortByOrder);

  return (
    <aside
      className={cn(
        "hidden shrink-0 flex-col border-r border-border bg-card transition-[width] duration-200 lg:flex",
        collapsed ? "w-[72px]" : "w-64",
        className
      )}
      aria-label="Admin sidebar"
    >
      {/* Brand */}
      <div className={cn("flex h-16 items-center border-b border-border px-4", collapsed && "justify-center px-2")}>
        <Link
          href={ROUTES.ADMIN_DASHBOARD}
          className="flex items-center gap-2 overflow-hidden rounded-sm focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2"
        >
          <span className="flex h-8 w-8 shrink-0 items-center justify-center rounded-md bg-primary text-sm font-bold text-primary-foreground">
            K
          </span>
          {!collapsed && (
            <span className="truncate text-sm font-semibold text-foreground">
              KarisalBooks Admin
            </span>
          )}
        </Link>
      </div>

      {/* Nav */}
      <nav className="flex-1 space-y-1 overflow-y-auto p-3" aria-label="Admin navigation">
        {visibleItems.map((item) => (
          <SidebarNavItem
            key={item.id}
            item={item}
            collapsed={collapsed}
            isActive={pathname === item.slug || pathname?.startsWith(`${item.slug}/`)}
          />
        ))}
      </nav>

      {/* Collapse toggle */}
      <div className="border-t border-border p-3">
        <button
          type="button"
          onClick={onToggleCollapse}
          aria-label={collapsed ? "Expand sidebar" : "Collapse sidebar"}
          aria-pressed={collapsed}
          className={cn(
            "flex w-full items-center gap-2 rounded-md px-3 py-2 text-sm text-muted-foreground transition-colors hover:bg-accent hover:text-accent-foreground",
            "focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2 focus-visible:ring-offset-background",
            collapsed && "justify-center px-2"
          )}
        >
          <ChevronIcon className="h-4 w-4 shrink-0" aria-hidden="true" />
          {!collapsed && <span>Collapse</span>}
        </button>
      </div>
    </aside>
  );
}
