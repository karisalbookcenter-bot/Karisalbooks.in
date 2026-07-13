import { PERMISSIONS, type Permission } from "@/constants/permissions.constants";
import type { RecordStatus } from "@/types/common.types";
import type { IconName } from "@/lib/icons";

/**
 * Category management configuration — Sprint 08.
 *
 * Same "data lives in config, not in components" philosophy as
 * `config/dashboard.ts` (Sprint 07) and `config/adminNavigation.ts`
 * (Sprint 06): `CategoryFilters`, `BulkActionBar`, and
 * `CategoryToolbar`'s view switcher all map over the arrays below rather
 * than hardcoding options inline.
 */

export interface StatusFilterOption {
  /** `null` represents "All statuses" — not a `RecordStatus` value. */
  value: RecordStatus | null;
  label: string;
}

/** Options for `CategoryFilters`' status dropdown. */
export const CATEGORY_STATUS_FILTER_OPTIONS: StatusFilterOption[] = [
  { value: null, label: "All statuses" },
  { value: "active", label: "Active" },
  { value: "inactive", label: "Inactive" },
  { value: "archived", label: "Archived" },
];

export interface CategoryBulkActionDefinition {
  id: string;
  label: string;
  icon: IconName;
  /** `true` marks a destructive action (styled differently, e.g. "Delete") — 
   *  `BulkActionBar` uses this to apply destructive styling rather than
   *  each config entry repeating className details. */
  destructive?: boolean;
  /** Optional permission gating — see `docs/CATEGORY_MANAGEMENT.md`
   *  §Future CRUD Integration for how/when this gets enforced. Not
   *  enforced by any component today (no page wraps this framework in
   *  `<AuthProvider>` yet, same caveat as Sprint 07's dashboard config). */
  permission?: Permission;
}

/** Bulk actions shown by `BulkActionBar` once one or more rows are
 *  selected. UI only — every action's `onClick` is wired to a caller-
 *  supplied `onAction(actionId)` callback that defaults to a no-op. */
export const CATEGORY_BULK_ACTIONS: CategoryBulkActionDefinition[] = [
  { id: "activate", label: "Activate", icon: "check-circle", permission: PERMISSIONS.MANAGE_CATEGORIES },
  { id: "deactivate", label: "Deactivate", icon: "x-circle", permission: PERMISSIONS.MANAGE_CATEGORIES },
  { id: "archive", label: "Archive", icon: "inbox", permission: PERMISSIONS.MANAGE_CATEGORIES },
  { id: "delete", label: "Delete", icon: "close", destructive: true, permission: PERMISSIONS.MANAGE_CATEGORIES },
];

export type CategoryViewMode = "table" | "tree";

export interface CategoryViewOption {
  value: CategoryViewMode;
  label: string;
  icon: IconName;
}

/** Options for `CategoryToolbar`'s table/tree view switcher. */
export const CATEGORY_VIEW_OPTIONS: CategoryViewOption[] = [
  { value: "table", label: "Table view", icon: "table" },
  { value: "tree", label: "Tree view", icon: "folder-tree" },
];

export const categoryManagementConfig = {
  statusFilterOptions: CATEGORY_STATUS_FILTER_OPTIONS,
  bulkActions: CATEGORY_BULK_ACTIONS,
  viewOptions: CATEGORY_VIEW_OPTIONS,
} as const;

export type CategoryManagementConfig = typeof categoryManagementConfig;
