import { CATEGORY_STATUS_FILTER_OPTIONS, type CategoryBulkActionDefinition } from "@/config/categoryManagement";
import type { IconName } from "@/lib/icons";

/**
 * Author management configuration — Sprint 11.
 *
 * Same "data lives in config" philosophy as `categoryManagement.ts`
 * (Sprint 08). Status filter options reused directly (see that file's own
 * note on `RecordStatus` options not being category-specific), same as
 * Sprint 09's `subcategoryManagement.ts` already does. Kept as a
 * standalone small file rather than a generic "simple catalog config"
 * factory — unlike the repository/service layers, a config object this
 * small (three short arrays) has little duplication to eliminate; see
 * `docs/AUTHOR_PUBLISHER_MANAGEMENT.md` for the full reasoning on what
 * was/wasn't generalized this sprint.
 */

export const AUTHOR_STATUS_FILTER_OPTIONS = CATEGORY_STATUS_FILTER_OPTIONS;

/** No dedicated `MANAGE_AUTHORS` permission exists (Sprint 05 never
 *  defined one). Day 4's CMS foundation docs already flagged
 *  Author/Publisher/Coupon permissions as a named future follow-up for
 *  exactly this situation — reusing `MANAGE_CATEGORIES` here would be
 *  inaccurate (authors aren't categories), so these actions are left
 *  unpermissioned (`permission: undefined`) rather than mapped to the
 *  wrong permission, consistent with how `DASHBOARD_QUICK_ACTIONS`
 *  (Sprint 07) left "Add Author"/"Add Publisher" unmapped for the same
 *  reason. */
export const AUTHOR_BULK_ACTIONS: CategoryBulkActionDefinition[] = [
  { id: "activate", label: "Activate", icon: "check-circle" },
  { id: "deactivate", label: "Deactivate", icon: "x-circle" },
  { id: "archive", label: "Archive", icon: "inbox" },
  { id: "delete", label: "Delete", icon: "close", destructive: true },
];

export type AuthorViewMode = "table" | "card";

export interface AuthorViewOption {
  value: AuthorViewMode;
  label: string;
  icon: IconName;
}

export const AUTHOR_VIEW_OPTIONS: AuthorViewOption[] = [
  { value: "table", label: "Table view", icon: "table" },
  { value: "card", label: "Card view", icon: "grid" },
];

export const authorManagementConfig = {
  statusFilterOptions: AUTHOR_STATUS_FILTER_OPTIONS,
  bulkActions: AUTHOR_BULK_ACTIONS,
  viewOptions: AUTHOR_VIEW_OPTIONS,
} as const;

export type AuthorManagementConfig = typeof authorManagementConfig;
