import type { Category, CategoryTreeNode } from "@/types/category.types";
import type { RecordStatus } from "@/types/common.types";
import type { CategoryViewMode } from "@/config/categoryManagement";

/**
 * Category management component prop types — Sprint 08.
 *
 * `config/categoryManagement.ts` owns the *data* shapes (bulk action
 * definitions, filter options); this file owns the *component* contracts
 * built on top of them and on the shared `Category`/`CategoryTreeNode`
 * entity types (`@/types/category.types`) — the same layering Sprint 07
 * used for the dashboard (`config/dashboard.ts` vs.
 * `features/admin/types/dashboard.types.ts`).
 */

export interface CategorySelectionProps {
  /** Ids of currently-selected rows/nodes. Omit entirely to render
   *  without any selection UI (no checkboxes) — bulk selection is opt-in
   *  per usage, not forced on every consumer. */
  selectedIds?: string[];
  onToggleSelect?: (id: string) => void;
}

export interface CategoryTableProps extends CategorySelectionProps {
  categories: Category[];
  /** All categories, used to resolve each row's parent name (see
   *  `getParentCategoryName`) — passed separately from `categories`
   *  because `categories` may already be a filtered/searched subset while
   *  parent lookups still need the full set to resolve correctly. */
  allCategories?: Category[];
  loading?: boolean;
  /** Shown as a "Clear filters" action on the internal no-results empty
   *  state when the caller's search/filter matched zero rows. */
  onClearFilters?: () => void;
  onEdit?: (category: Category) => void;
  onDelete?: (category: Category) => void;
  className?: string;
}

export interface CategoryTreeViewProps extends CategorySelectionProps {
  nodes: CategoryTreeNode[];
  /** Ids expanded by default on first render (uncontrolled thereafter —
   *  see `CategoryTreeView`'s own doc comment for why this component
   *  manages expand/collapse state internally rather than being fully
   *  controlled). */
  defaultExpandedIds?: string[];
  loading?: boolean;
  onClearFilters?: () => void;
  onEdit?: (category: CategoryTreeNode) => void;
  onDelete?: (category: CategoryTreeNode) => void;
  className?: string;
}

export interface CategoryCardProps {
  category: Category;
  /** Resolved parent name, or `null` for a top-level category — computed
   *  by the caller via `getParentCategoryName` rather than by the card
   *  itself, so `CategoryCard` stays a pure display component with no
   *  dependency on the full category list. */
  parentName?: string | null;
  childCount?: number;
  selected?: boolean;
  onToggleSelect?: () => void;
  onEdit?: () => void;
  onDelete?: () => void;
  className?: string;
}

export interface CategoryFormValues {
  name: string;
  slug: string;
  description: string;
  parentId: string | null;
  status: RecordStatus;
}

export interface CategoryFormLayoutProps {
  /** Existing values when editing, or a partial seed when creating.
   *  Uncontrolled — this is layout only, so no submit handler persists
   *  anything (see the component's own doc comment). */
  defaultValues?: Partial<CategoryFormValues>;
  /** Flat list used to populate the "Parent Category" select. Excludes
   *  nothing itself — the caller is responsible for omitting the category
   *  being edited (and its own descendants) to prevent a self-referential
   *  parent, a future-CRUD-sprint concern noted in
   *  `docs/CATEGORY_MANAGEMENT.md`. */
  parentOptions?: Category[];
  mode?: "create" | "edit";
  onCancel?: () => void;
  className?: string;
}

export interface CategoryFiltersValue {
  statuses: RecordStatus[];
}

export interface CategoryFiltersProps {
  value?: CategoryFiltersValue;
  onChange?: (value: CategoryFiltersValue) => void;
  className?: string;
}

export interface CategoryToolbarProps {
  searchValue?: string;
  onSearchChange?: (value: string) => void;
  filtersValue?: CategoryFiltersValue;
  onFiltersChange?: (value: CategoryFiltersValue) => void;
  view: CategoryViewMode;
  onViewChange?: (view: CategoryViewMode) => void;
  onAddCategory?: () => void;
  className?: string;
}

export interface CategoryEmptyStateProps {
  /** "no-data": nothing has been created yet. "no-results": categories
   *  exist but the current search/filter matched none — different copy
   *  for each, same distinction Sprint 07's `RecentActivity` vs.
   *  `DashboardEmptyState` drew between "nothing yet" and "nothing here
   *  right now." */
  variant?: "no-data" | "no-results";
  onClearFilters?: () => void;
  className?: string;
}

export interface CategorySkeletonProps {
  view?: CategoryViewMode;
  className?: string;
}

export interface CategoryManagementOverviewProps {
  categories?: Category[];
  loading?: boolean;
  className?: string;
}
