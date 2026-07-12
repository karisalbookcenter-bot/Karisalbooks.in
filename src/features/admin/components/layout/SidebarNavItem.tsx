"use client";

import Link from "next/link";
import type { NavigationItemRecord } from "@/types/navigation.types";
import { getIcon } from "@/lib/icons";
import { cn } from "@/lib/utils";

export interface SidebarNavItemProps {
  item: NavigationItemRecord;
  /** Whether this item's route matches the current path. Purely
   *  presentational here — the caller determines the match (e.g. against
   *  `usePathname()`), since this component has no routing awareness of
   *  its own. */
  isActive?: boolean;
  /** When true, renders icon-only (desktop collapsed state) with the
   *  title available via a native tooltip (`title` attribute) rather than
   *  visible text — kept to a plain HTML tooltip rather than a custom
   *  popover to stay dependency-free and reliably accessible. */
  collapsed?: boolean;
  /** Fires on click — used by the mobile drawer to close itself after a
   *  navigation; unused by the desktop sidebar. */
  onNavigate?: () => void;
}

/**
 * SidebarNavItem — Sprint 06.
 *
 * The single row-rendering component shared by `AdminSidebar` (desktop)
 * and `MobileNavDrawer` (mobile), so both surfaces render navigation
 * identically instead of duplicating link/icon/active-state markup in
 * two places that could drift apart.
 */
export function SidebarNavItem({ item, isActive, collapsed, onNavigate }: SidebarNavItemProps) {
  const Icon = getIcon(item.icon);

  return (
    <Link
      href={item.slug}
      onClick={onNavigate}
      title={collapsed ? item.title : undefined}
      aria-current={isActive ? "page" : undefined}
      className={cn(
        "group flex items-center gap-3 rounded-md px-3 py-2 text-sm font-medium transition-colors",
        "focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2 focus-visible:ring-offset-background",
        isActive
          ? "bg-primary/10 text-primary"
          : "text-muted-foreground hover:bg-accent hover:text-accent-foreground",
        collapsed && "justify-center px-2"
      )}
    >
      <Icon
        className={cn("h-5 w-5 shrink-0", isActive && "text-primary")}
        aria-hidden="true"
      />
      {!collapsed && <span className="truncate">{item.title}</span>}
      {collapsed && <span className="sr-only">{item.title}</span>}
    </Link>
  );
}
