import { PERMISSIONS, type Permission } from "@/constants/permissions.constants";
import type { IconName } from "@/lib/icons";

/**
 * Dashboard configuration — Sprint 07 (Admin Dashboard Framework).
 *
 * Same philosophy as `config/adminNavigation.ts` (Sprint 06) and
 * `config/navigation.ts` (Day 4): the dashboard's content is data, not
 * markup. `DashboardOverview` (and the smaller widgets it composes) map
 * over the arrays below rather than hardcoding six `<StatCard>` JSX
 * elements or six `<Button>` elements inline — adding a seventh stat card
 * later is a one-line addition here, not a component edit.
 *
 * Every value below is a label/definition only. No number, count, or
 * status here comes from a query — see each component's own doc comment
 * for how a future sprint replaces the placeholder with real data.
 */

export interface StatCardDefinition {
  id: string;
  label: string;
  icon: IconName;
  /** Optional permission gating for a future role-aware dashboard (see
   *  `docs/DASHBOARD_FRAMEWORK.md` §Future Extension). Not enforced by any
   *  component today — no page currently wraps this framework in
   *  `<AuthProvider>`, so no widget calls `usePermission()` yet. */
  permission?: Permission;
}

export interface QuickActionDefinition {
  id: string;
  label: string;
  icon: IconName;
  permission?: Permission;
}

export type SystemStatusValue = "operational" | "degraded" | "down" | "unknown";

export interface SystemStatusItemDefinition {
  id: string;
  label: string;
  status: SystemStatusValue;
  description: string;
}

/**
 * Stat cards, in the exact order requested: Total Books, Categories,
 * Orders, Customers, Revenue, Low Stock. Each renders through `StatCard`
 * with a placeholder value (an em dash) — see `StatCard`'s own doc
 * comment for why a dash, not a fake number.
 */
export const DASHBOARD_STAT_CARDS: StatCardDefinition[] = [
  { id: "total-books", label: "Total Books", icon: "book-open" },
  { id: "categories", label: "Categories", icon: "folder-tree" },
  { id: "orders", label: "Orders", icon: "shopping-cart", permission: PERMISSIONS.VIEW_ORDERS },
  { id: "customers", label: "Customers", icon: "user-circle" },
  { id: "revenue", label: "Revenue", icon: "indian-rupee" },
  { id: "low-stock", label: "Low Stock", icon: "alert-triangle" },
];

/**
 * Quick action buttons, in the exact order requested. Three of the six
 * (Add Author, Add Publisher, Create Coupon) have no `permission` set —
 * `permissions.constants.ts` (Sprint 05) doesn't define a
 * MANAGE_AUTHORS/MANAGE_PUBLISHERS/MANAGE_COUPONS permission yet, since
 * those features don't exist. Left unmapped rather than guessed at; see
 * `docs/DASHBOARD_FRAMEWORK.md` §Future Extension for the exact follow-up.
 */
export const DASHBOARD_QUICK_ACTIONS: QuickActionDefinition[] = [
  { id: "add-book", label: "Add Book", icon: "book-open", permission: PERMISSIONS.MANAGE_PRODUCTS },
  { id: "add-category", label: "Add Category", icon: "folder-tree", permission: PERMISSIONS.MANAGE_CATEGORIES },
  { id: "add-author", label: "Add Author", icon: "users" },
  { id: "add-publisher", label: "Add Publisher", icon: "building-2" },
  { id: "create-coupon", label: "Create Coupon", icon: "tag" },
  { id: "view-orders", label: "View Orders", icon: "shopping-cart", permission: PERMISSIONS.VIEW_ORDERS },
];

/**
 * System status rows. Every status below is `"unknown"` — a fourth,
 * deliberately-added state beyond the three real ones — because no
 * component in this sprint performs an actual health check. `"unknown"`
 * is the honest placeholder; defaulting to `"operational"` would be a
 * fabricated claim about systems no code has actually verified.
 */
export const DASHBOARD_SYSTEM_STATUS: SystemStatusItemDefinition[] = [
  {
    id: "database",
    label: "Database",
    status: "unknown",
    description: "Live health check not wired up yet.",
  },
  {
    id: "authentication",
    label: "Authentication",
    status: "unknown",
    description: "Live health check not wired up yet.",
  },
  {
    id: "storage",
    label: "Storage",
    status: "unknown",
    description: "Live health check not wired up yet.",
  },
  {
    id: "payments",
    label: "Payments",
    status: "unknown",
    description: "Payments milestone not started.",
  },
];

export const dashboardConfig = {
  statCards: DASHBOARD_STAT_CARDS,
  quickActions: DASHBOARD_QUICK_ACTIONS,
  systemStatus: DASHBOARD_SYSTEM_STATUS,
} as const;

export type DashboardConfig = typeof dashboardConfig;
