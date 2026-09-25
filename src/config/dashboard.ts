import { PERMISSIONS, type Permission } from "@/constants/permissions.constants";
import type { IconName } from "@/lib/icons";

export interface StatCardDefinition {
  id: string;
  label: string;
  icon: IconName;
  permission?: Permission;
}

export interface QuickActionDefinition {
  id: string;
  label: string;
  icon: IconName;
  permission?: Permission;
}

export type SystemStatusValue =
  | "operational"
  | "degraded"
  | "down"
  | "unknown";

export interface SystemStatusItemDefinition {
  id: string;
  label: string;
  status: SystemStatusValue;
  description: string;
}


export const DASHBOARD_STAT_CARDS: StatCardDefinition[] = [
  {
    id: "total-books",
    label: "Total Books",
    icon: "book-open",
  },
  {
    id: "categories",
    label: "Categories",
    icon: "folder-tree",
  },
  {
    id: "orders",
    label: "Orders",
    icon: "shopping-cart",
    permission: PERMISSIONS.VIEW_ORDERS,
  },
  {
    id: "customers",
    label: "Customers",
    icon: "user-circle",
  },
  {
    id: "revenue",
    label: "Revenue",
    icon: "indian-rupee",
  },
  {
    id: "low-stock",
    label: "Low Stock",
    icon: "alert-triangle",
  },
];


export const DASHBOARD_QUICK_ACTIONS: QuickActionDefinition[] = [
  {
    id: "add-book",
    label: "Add Book",
    icon: "book-open",
    permission: PERMISSIONS.MANAGE_PRODUCTS,
  },
  {
    id: "add-category",
    label: "Add Category",
    icon: "folder-tree",
    permission: PERMISSIONS.MANAGE_CATEGORIES,
  },
  {
    id: "add-author",
    label: "Add Author",
    icon: "users",
  },
  {
    id: "add-publisher",
    label: "Add Publisher",
    icon: "building-2",
  },
  {
    id: "create-coupon",
    label: "Create Coupon",
    icon: "tag",
  },
  {
    id: "view-orders",
    label: "View Orders",
    icon: "shopping-cart",
    permission: PERMISSIONS.VIEW_ORDERS,
  },
];


export const DASHBOARD_SYSTEM_STATUS: SystemStatusItemDefinition[] = [
  {
    id: "database",
    label: "Database",
    status: "unknown",
    description: "Live health check not wired yet.",
  },
  {
    id: "authentication",
    label: "Authentication",
    status: "unknown",
    description: "Live health check not wired yet.",
  },
  {
    id: "storage",
    label: "Storage",
    status: "unknown",
    description: "Live health check not wired yet.",
  },
  {
    id: "payments",
    label: "Payments",
    status: "unknown",
    description: "Payments module not started.",
  },
];


export const dashboardConfig = {
  statCards: DASHBOARD_STAT_CARDS,
  quickActions: DASHBOARD_QUICK_ACTIONS,
  systemStatus: DASHBOARD_SYSTEM_STATUS,
} as const;


export type DashboardConfig = typeof dashboardConfig;