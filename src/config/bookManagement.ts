import { CATEGORY_STATUS_FILTER_OPTIONS } from "@/config/categoryManagement";
import { PERMISSIONS } from "@/constants/permissions.constants";

// Local, self-contained shapes — not imported from category-management.types.ts.
// That file's exact exports weren't independently verified, and a config
// file having its own minimal literal-array type is consistent with how
// this project already declares BOOK_SORT_OPTIONS below (inferred `as const`,
// no imported type either).
interface BookViewOption {
  id: "table" | "card";
  label: string;
  icon: string;
}

interface BookBulkAction {
  id: string;
  label: string;
  icon: string;
  permission: string;
  destructive?: boolean;
}

// Reused directly — RecordStatus options aren't category-specific.
// Same reasoning subcategoryManagement.ts / authorManagement.ts already used.
export const BOOK_STATUS_FILTER_OPTIONS = CATEGORY_STATUS_FILTER_OPTIONS;

export const BOOK_VIEW_OPTIONS: BookViewOption[] = [
  { id: "table", label: "Table", icon: "table" },
  { id: "card", label: "Card", icon: "grid" },
];

export const BOOK_BULK_ACTIONS: BookBulkAction[] = [
  { id: "activate", label: "Activate", icon: "check-circle", permission: PERMISSIONS.MANAGE_PRODUCTS },
  { id: "deactivate", label: "Deactivate", icon: "x-circle", permission: PERMISSIONS.MANAGE_PRODUCTS },
  { id: "archive", label: "Archive", icon: "inbox", permission: PERMISSIONS.MANAGE_PRODUCTS },
  { id: "delete", label: "Delete", icon: "close", permission: PERMISSIONS.MANAGE_PRODUCTS, destructive: true },
];

export const BOOK_SORT_OPTIONS = [
  { id: "title", label: "Title" },
  { id: "price", label: "Price" },
  { id: "stock_quantity", label: "Stock" },
  { id: "created_at", label: "Date added" },
] as const;

export const BOOK_PAGE_SIZE_DEFAULT = 20;
