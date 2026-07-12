"use client";

import type { ReactNode } from "react";
import { Menu } from "lucide-react";
import { cn } from "@/lib/utils";
import { NotificationBell } from "@/features/admin/components/NotificationBell";
import { UserProfileDropdown } from "@/features/admin/components/UserProfileDropdown";

export interface AdminHeaderProps {
  /** Mobile-only hamburger button target — opens `MobileNavDrawer`. Not
   *  rendered at `lg` and above, where `AdminSidebar` is always visible. */
  onOpenMobileNav: () => void;
  /** Rendered in the header's left/center area, after the mobile menu
   *  button — typically a `<Breadcrumb>` for the current page. Optional
   *  so the header works standalone before any page supplies one. */
  breadcrumb?: ReactNode;
  className?: string;
}

/**
 * AdminHeader — Sprint 06 (Task 3).
 *
 * The persistent top bar of the admin shell: a mobile nav toggle (hidden
 * on desktop, where the sidebar is always visible), an optional
 * breadcrumb slot, and the right-aligned notification bell + user profile
 * dropdown. Purely presentational/composition — it owns no state itself
 * beyond what `NotificationBell` and `UserProfileDropdown` manage
 * internally; `onOpenMobileNav` is supplied by `AdminShell`, which owns
 * `useSidebarState`.
 */
export function AdminHeader({ onOpenMobileNav, breadcrumb, className }: AdminHeaderProps) {
  return (
    <header
      className={cn(
        "sticky top-0 z-30 flex h-16 items-center gap-4 border-b border-border bg-background/95 px-4 backdrop-blur supports-[backdrop-filter]:bg-background/60 sm:px-6",
        className
      )}
    >
      <button
        type="button"
        onClick={onOpenMobileNav}
        aria-label="Open navigation menu"
        className="rounded-md p-2 text-muted-foreground transition-colors hover:bg-accent hover:text-accent-foreground focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2 lg:hidden"
      >
        <Menu className="h-5 w-5" aria-hidden="true" />
      </button>

      <div className="min-w-0 flex-1">{breadcrumb}</div>

      <div className="flex shrink-0 items-center gap-1">
        <NotificationBell />
        <UserProfileDropdown />
      </div>
    </header>
  );
}
