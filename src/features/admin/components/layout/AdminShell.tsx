"use client";

import type { AdminShellProps } from "@/features/admin/types/admin-layout.types";
import { useSidebarState } from "@/features/admin/hooks/useSidebarState";
import { AdminSidebar } from "./AdminSidebar";
import { AdminHeader } from "./AdminHeader";
import { MobileNavDrawer } from "./MobileNavDrawer";

/**
 * AdminShell — Sprint 06 (Task 1: reusable Admin Layout architecture).
 *
 * The single composition root every future admin page renders inside:
 *
 *   <AdminShell breadcrumb={<Breadcrumb items={...} />}>
 *     <PageContainer title="Books">...</PageContainer>
 *   </AdminShell>
 *
 * Owns exactly one piece of state — `useSidebarState` (Sprint 06's hook
 * for desktop collapse + mobile drawer open/closed) — and passes it down
 * as props to three purely presentational children:
 *
 *   - `AdminSidebar`     (desktop/tablet, `lg` and above)
 *   - `MobileNavDrawer`  (below `lg`, off-canvas)
 *   - `AdminHeader`      (always visible; shows the mobile toggle only
 *                         below `lg`, via its own internal breakpoint)
 *
 * Responsive behavior is breakpoint-driven entirely through Tailwind's
 * `lg:` prefix (matching this project's existing Tailwind config from
 * Day 1) rather than a JS media-query check — `AdminSidebar` is
 * `hidden lg:flex` and `MobileNavDrawer` renders only when `open` and is
 * itself marked `lg:hidden`, so exactly one of the two is ever visible at
 * a given viewport width, with no layout flash between them.
 *
 * Dark mode: every color in every child component uses the semantic
 * Tailwind tokens already defined in Day 1's `globals.css`
 * (`bg-background`, `text-foreground`, `bg-card`, `border-border`, etc.),
 * which already have `.dark` overrides — so the shell requires no
 * additional dark-mode-specific styling here.
 *
 * No `<html>`/root layout currently renders `<AdminShell>` — that one-line
 * wiring (and the `<AuthProvider>` wrapping it, from Sprint 05) happens
 * once a real admin page/route is built, which is out of scope this
 * sprint.
 */
export function AdminShell({ children, breadcrumb }: AdminShellProps) {
  const sidebar = useSidebarState();

  return (
    <div className="flex min-h-screen bg-background">
      <AdminSidebar collapsed={sidebar.isCollapsed} onToggleCollapse={sidebar.toggleCollapse} />

      <MobileNavDrawer open={sidebar.isMobileNavOpen} onClose={sidebar.closeMobileNav} />

      <div className="flex min-w-0 flex-1 flex-col">
        <AdminHeader onOpenMobileNav={sidebar.openMobileNav} breadcrumb={breadcrumb} />
        <main className="flex-1 overflow-x-hidden p-4 sm:p-6 lg:p-8">{children}</main>
      </div>
    </div>
  );
}
