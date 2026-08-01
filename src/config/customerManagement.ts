import { CATEGORY_STATUS_FILTER_OPTIONS } from "@/config/categoryManagement";
import type { CategoryBulkActionDefinition } from "@/config/categoryManagement";
import type { IconName } from "@/lib/icons";

/**
 * Customer management configuration — Sprint 12.
 *
 * Same "data lives in config" philosophy as `authorManagement.ts`/
 * `publisherManagement.ts` (Sprint 11). Status filter options reused
 * directly from `categoryManagement.ts` (see that file's own note on
 * `RecordStatus` options not being category-specific).
 *
 * Bulk actions here are **account-moderation** actions (Activate/
 * Deactivate/Archive a customer account) rather than catalog-CRUD
 * actions — there is no "Delete" and no "Add Customer" anywhere in this
 * framework, matching this sprint's stricter "No CRUD implementation"
 * scope: an admin can moderate an existing account's status, but
 * customer accounts are neither created nor destroyed from this admin
 * UI. No dedicated `MANAGE_CUSTOMERS` permission exists yet (Sprint 05
 * never defined one), so these are left unpermissioned, the same
 * documented gap `authorManagement.ts`/`publisherManagement.ts` left for
 * their own bulk actions.
 */

export const CUSTOMER_STATUS_FILTER_OPTIONS = CATEGORY_STATUS_FILTER_OPTIONS;

export const CUSTOMER_BULK_ACTIONS: CategoryBulkActionDefinition[] = [
  { id: "activate", label: "Activate", icon: "check-circle" },
  { id: "deactivate", label: "Deactivate", icon: "x-circle" },
  { id: "archive", label: "Archive", icon: "inbox" },
];

export type CustomerViewMode = "table" | "card";

export interface CustomerViewOption {
  value: CustomerViewMode;
  label: string;
  icon: IconName;
}

export const CUSTOMER_VIEW_OPTIONS: CustomerViewOption[] = [
  { value: "table", label: "Table view", icon: "table" },
  { value: "card", label: "Card view", icon: "grid" },
];

export const customerManagementConfig = {
  statusFilterOptions: CUSTOMER_STATUS_FILTER_OPTIONS,
  bulkActions: CUSTOMER_BULK_ACTIONS,
  viewOptions: CUSTOMER_VIEW_OPTIONS,
} as const;

export type CustomerManagementConfig = typeof customerManagementConfig;
