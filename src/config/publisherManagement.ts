import { CATEGORY_STATUS_FILTER_OPTIONS, type CategoryBulkActionDefinition } from "@/config/categoryManagement";
import type { IconName } from "@/lib/icons";

/**
 * Publisher management configuration — Sprint 11. Mirrors
 * `authorManagement.ts` exactly — see that file's doc comment for the
 * reasoning (status options reused, bulk actions left unpermissioned
 * pending a future `MANAGE_PUBLISHERS` permission).
 */

export const PUBLISHER_STATUS_FILTER_OPTIONS = CATEGORY_STATUS_FILTER_OPTIONS;

export const PUBLISHER_BULK_ACTIONS: CategoryBulkActionDefinition[] = [
  { id: "activate", label: "Activate", icon: "check-circle" },
  { id: "deactivate", label: "Deactivate", icon: "x-circle" },
  { id: "archive", label: "Archive", icon: "inbox" },
  { id: "delete", label: "Delete", icon: "close", destructive: true },
];

export type PublisherViewMode = "table" | "card";

export interface PublisherViewOption {
  value: PublisherViewMode;
  label: string;
  icon: IconName;
}

export const PUBLISHER_VIEW_OPTIONS: PublisherViewOption[] = [
  { value: "table", label: "Table view", icon: "table" },
  { value: "card", label: "Card view", icon: "grid" },
];

export const publisherManagementConfig = {
  statusFilterOptions: PUBLISHER_STATUS_FILTER_OPTIONS,
  bulkActions: PUBLISHER_BULK_ACTIONS,
  viewOptions: PUBLISHER_VIEW_OPTIONS,
} as const;

export type PublisherManagementConfig = typeof publisherManagementConfig;
