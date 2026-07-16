import { PERMISSIONS } from "@/constants/permissions.constants";
import { PAGINATION_DEFAULTS } from "@/constants/app.constants";
import {
  CATEGORY_STATUS_FILTER_OPTIONS,
  type CategoryBulkActionDefinition,
} from "@/config/categoryManagement";
import type { IconName } from "@/lib/icons";
import type { Subcategory } from "@/types/subcategory.types";

/**
 * Subcategory management configuration — Sprint 09.
 *
 * Same "data lives in config, not in components" philosophy as
 * `config/categoryManagement.ts` (Sprint 08). Two things are reused
 * directly rather than redefined:
 *
 *  - **Status filter options** — `RecordStatus` (Day 3) is shared by
 *    every `BaseEntity`-derived table, so the "All statuses / Active /
 *    Inactive / Archived" option list isn't actually category-specific
 *    despite living in `categoryManagement.ts`. Re-exported here under a
 *    subcategory-scoped name rather than duplicated, per this sprint's
 *    "do not duplicate code" instruction. (A future cleanup could
 *    promote this list to `constants/app.constants.ts` alongside
 *    `RECORD_STATUS`; noted here rather than done now, to avoid an
 *    unnecessary edit to a Sprint 08 file.)
 *  - **Pagination defaults** — `PAGINATION_DEFAULTS` (Day 3) already
 *    defines `PAGE`/`PAGE_SIZE`/`MAX_PAGE_SIZE`; reused as-is for
 *    `Pagination`'s defaults rather than a new constant.
 */

export const SUBCATEGORY_STATUS_FILTER_OPTIONS = CATEGORY_STATUS_FILTER_OPTIONS;

/**
 * Bulk actions for `BulkActionBar` (Sprint 08, reused directly — see
 * task 8, "Bulk Action Bar integration," not "creation"). Same shape as
 * `CATEGORY_BULK_ACTIONS`, gated by the same `MANAGE_CATEGORIES`
 * permission — Day 2's migration groups `subcategories` under the same
 * "categories" domain as `categories` itself, and Sprint 05 never defined
 * a separate `MANAGE_SUBCATEGORIES` permission, so reusing
 * `MANAGE_CATEGORIES` here is the accurate mapping, not a shortcut. See
 * `docs/SUBCATEGORY_MANAGEMENT.md` §Future CRUD Integration for the
 * enforcement path.
 */
export const SUBCATEGORY_BULK_ACTIONS: CategoryBulkActionDefinition[] = [
  { id: "activate", label: "Activate", icon: "check-circle", permission: PERMISSIONS.MANAGE_CATEGORIES },
  { id: "deactivate", label: "Deactivate", icon: "x-circle", permission: PERMISSIONS.MANAGE_CATEGORIES },
  { id: "archive", label: "Archive", icon: "inbox", permission: PERMISSIONS.MANAGE_CATEGORIES },
  { id: "delete", label: "Delete", icon: "close", destructive: true, permission: PERMISSIONS.MANAGE_CATEGORIES },
];

export type SubcategoryViewMode = "table" | "card";

export interface SubcategoryViewOption {
  value: SubcategoryViewMode;
  label: string;
  icon: IconName;
}

/** Options for `SubcategoryToolbar`'s table/card view switcher — "card,"
 *  not "tree," since subcategories have no hierarchy to visualize (see
 *  `Subcategory`'s doc comment); `SubcategoryCard` is the alternate
 *  presentation instead. */
export const SUBCATEGORY_VIEW_OPTIONS: SubcategoryViewOption[] = [
  { value: "table", label: "Table view", icon: "table" },
  { value: "card", label: "Card view", icon: "grid" },
];

/** Sortable columns for `SubcategoryTable` — satisfies this sprint's
 *  "Sorting" future-ready requirement (not part of Sprint 08's scope).
 *  `key` is a `Subcategory` field name; `sortByKey`
 *  (`@/lib/helpers/array.helpers`, extended this sprint) sorts by it
 *  directly. */
export interface SubcategorySortOption {
  key: keyof Pick<Subcategory, "name" | "slug" | "updated_at">;
  label: string;
}

export const SUBCATEGORY_SORT_OPTIONS: SubcategorySortOption[] = [
  { key: "name", label: "Name" },
  { key: "slug", label: "Slug" },
  { key: "updated_at", label: "Last updated" },
];

export const subcategoryManagementConfig = {
  statusFilterOptions: SUBCATEGORY_STATUS_FILTER_OPTIONS,
  bulkActions: SUBCATEGORY_BULK_ACTIONS,
  viewOptions: SUBCATEGORY_VIEW_OPTIONS,
  sortOptions: SUBCATEGORY_SORT_OPTIONS,
  pagination: PAGINATION_DEFAULTS,
} as const;

export type SubcategoryManagementConfig = typeof subcategoryManagementConfig;
