import type { Category } from "@/types/category.types";
import type { Subcategory } from "@/types/subcategory.types";
import type { RecordStatus, SortDirection } from "@/types/common.types";
import type { SubcategoryViewMode, SubcategorySortOption } from "@/config/subcategoryManagement";

/**
 * Subcategory management component prop types — Sprint 09.
 *
 * Same three-way layering Sprint 08 established: `config/subcategoryManagement.ts`
 * owns data shapes, `types/subcategory.types.ts` owns the entity, this
 * file owns component contracts built on both.
 */

export interface SubcategorySelectionProps {
  selectedIds?: string[];
  onToggleSelect?: (id: string) => void;
}

export interface SubcategorySortState {
  key: SubcategorySortOption["key"];
  direction: SortDirection;
}

export interface SubcategoryTableProps extends SubcategorySelectionProps {
  subcategories: Subcategory[];
  /** Needed to resolve each row's category name via
   *  `getSubcategoryCategoryName` — see `CategoryTableProps.allCategories`
   *  (Sprint 08) for the identical reasoning. */
  categories: Category[];
  loading?: boolean;
  sort?: SubcategorySortState;
  onSortChange?: (sort: SubcategorySortState) => void;
  onClearFilters?: () => void;
  onEdit?: (subcategory: Subcategory) => void;
  onDelete?: (subcategory: Subcategory) => void;
  className?: string;
}

export interface SubcategoryCardProps {
  subcategory: Subcategory;
  /** Resolved category name — computed by the caller (via
   *  `getSubcategoryCategoryName`), same pattern as `CategoryCardProps.parentName`. */
  categoryName?: string | null;
  selected?: boolean;
  onToggleSelect?: () => void;
  onEdit?: () => void;
  onDelete?: () => void;
  className?: string;
}

export interface SubcategoryFormValues {
  name: string;
  slug: string;
  description: string;
  categoryId: string;
  status: RecordStatus;
}

export interface SubcategoryFormLayoutProps {
  defaultValues?: Partial<SubcategoryFormValues>;
  /** Populates `ParentCategorySelector` — every category, since a
   *  subcategory's category is unrestricted (unlike `CategoryFormLayout`'s
   *  parent-category picker, which must exclude the category being
   *  edited and its own descendants to prevent a cycle; a subcategory
   *  can never itself be a category, so no such exclusion applies here). */
  categories: Category[];
  mode?: "create" | "edit";
  onCancel?: () => void;
  className?: string;
}

export interface SubcategoryFiltersValue {
  statuses: RecordStatus[];
  categoryId: string | null;
}

export interface SubcategoryFiltersProps {
  value?: SubcategoryFiltersValue;
  onChange?: (value: SubcategoryFiltersValue) => void;
  categories: Category[];
  className?: string;
}

export interface SubcategoryToolbarProps {
  searchValue?: string;
  onSearchChange?: (value: string) => void;
  filtersValue?: SubcategoryFiltersValue;
  onFiltersChange?: (value: SubcategoryFiltersValue) => void;
  categories: Category[];
  view: SubcategoryViewMode;
  onViewChange?: (view: SubcategoryViewMode) => void;
  onAddSubcategory?: () => void;
  className?: string;
}

export interface SubcategoryEmptyStateProps {
  variant?: "no-data" | "no-results";
  onClearFilters?: () => void;
  className?: string;
}

export interface SubcategorySkeletonProps {
  view?: SubcategoryViewMode;
  className?: string;
}

export interface SubcategoryManagementOverviewProps {
  subcategories?: Subcategory[];
  categories?: Category[];
  loading?: boolean;
  className?: string;
}

export interface ParentCategorySelectorProps {
  categories: Category[];
  value?: string | null;
  onChange?: (categoryId: string | null) => void;
  /** When true, prepends an "All categories" option with value `null` —
   *  used by `SubcategoryFilters`. `SubcategoryFormLayout` sets this
   *  `false` (a subcategory must have a real category, never "all"). */
  allowAll?: boolean;
  placeholder?: string;
  id?: string;
  className?: string;
}
