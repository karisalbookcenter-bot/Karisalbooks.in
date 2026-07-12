"use client";

import { useCallback, useState } from "react";
import type { SidebarState } from "@/features/admin/types/admin-layout.types";

/**
 * useSidebarState — Sprint 06.
 *
 * One hook, two independent pieces of state:
 *  - `collapseState` — the desktop sidebar's icon-only vs. full-width mode
 *    (task 6, "Collapsible Sidebar" — implemented as a state/behavior of
 *    `AdminSidebar` rather than a separate component, since a collapsible
 *    sidebar is still one sidebar, just with a toggle; see
 *    `docs/ADMIN_LAYOUT.md` for the reasoning).
 *  - `isMobileNavOpen` — the mobile drawer's open/closed state (task 7).
 *
 * Kept in one hook because `AdminShell` is the natural single owner of
 * both — it renders the desktop sidebar OR the mobile drawer depending on
 * viewport, and both need to hide/show the same underlying nav content.
 *
 * In-memory only (`useState`), not persisted — Day 3's cross-feature
 * `useToggle` hook was considered, but this needs two named booleans plus
 * derived helpers (`toggleCollapse`, `openMobileNav`, ...) rather than one
 * generic toggle, so a small dedicated hook reads more clearly here.
 */
export function useSidebarState(): SidebarState {
  const [isCollapsed, setIsCollapsed] = useState(false);
  const [isMobileNavOpen, setIsMobileNavOpen] = useState(false);

  const toggleCollapse = useCallback(() => setIsCollapsed((prev) => !prev), []);
  const openMobileNav = useCallback(() => setIsMobileNavOpen(true), []);
  const closeMobileNav = useCallback(() => setIsMobileNavOpen(false), []);
  const toggleMobileNav = useCallback(() => setIsMobileNavOpen((prev) => !prev), []);

  return {
    collapseState: isCollapsed ? "collapsed" : "expanded",
    isCollapsed,
    toggleCollapse,
    isMobileNavOpen,
    openMobileNav,
    closeMobileNav,
    toggleMobileNav,
  };
}
