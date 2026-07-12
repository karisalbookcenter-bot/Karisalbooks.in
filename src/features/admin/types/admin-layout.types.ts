import type { ReactNode } from "react";

/**
 * Admin layout types — Sprint 06.
 * Shared shapes used across the sidebar, header, and shell components.
 */

/** Desktop sidebar's expanded/collapsed state. */
export type SidebarCollapseState = "expanded" | "collapsed";

/** Return shape of `useSidebarState` — one hook backing both the desktop
 *  collapsible sidebar and the mobile nav drawer, since they represent the
 *  same underlying "is navigation visible, and how" concern. */
export interface SidebarState {
  /** Desktop collapse state (icon-only vs. full width). */
  collapseState: SidebarCollapseState;
  isCollapsed: boolean;
  toggleCollapse: () => void;
  /** Mobile drawer open/closed. Separate from `collapseState` because a
   *  screen can be mobile-drawer-open and desktop-collapsed independently
   *  (they apply at different breakpoints and never both render at once). */
  isMobileNavOpen: boolean;
  openMobileNav: () => void;
  closeMobileNav: () => void;
  toggleMobileNav: () => void;
}

/** Minimal, presentational shape for the User Profile Dropdown — UI only,
 *  no auth actions wired up this sprint (see component doc comment). A
 *  future sprint replaces this with the real `AuthUser` shape from
 *  `@/features/auth/types/auth.types`. */
export interface AdminUserSummary {
  name: string;
  email: string;
  avatarUrl?: string;
}

export interface AdminShellProps {
  children: ReactNode;
  /** Rendered in the header's center/left area — typically a
   *  `<Breadcrumb>` for the current admin page. Optional so the shell
   *  works before any admin page supplies one. */
  breadcrumb?: ReactNode;
}
