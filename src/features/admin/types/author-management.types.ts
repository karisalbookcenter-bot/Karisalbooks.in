import type { Author } from "@/types/author.types";
import type { RecordStatus } from "@/types/common.types";
import type { AuthorViewMode } from "@/config/authorManagement";

/**
 * Author management component prop types — Sprint 11.
 *
 * Same three-way layering established in Sprints 07–09:
 * `config/authorManagement.ts` (data), `types/author.types.ts` (entity),
 * this file (component contracts). Simpler than
 * `category-management.types.ts`/`subcategory-management.types.ts` —
 * `Author` has no parent/category-linkage dimension, so there's no
 * "Parent Category" column, no `allCategories` prop, no cross-entity
 * filter.
 */

export interface AuthorSelectionProps {
  selectedIds?: string[];
  onToggleSelect?: (id: string) => void;
}

export interface AuthorTableProps extends AuthorSelectionProps {
  authors: Author[];
  /** Book count per author, keyed by author id — resolved by the caller
   *  via `getBookCountForAuthor` (Sprint 11's Book ↔ Author relationship
   *  support) rather than by this component, keeping it a pure display
   *  component with no data-fetching of its own. Optional — a book count
   *  column only renders when supplied. */
  bookCounts?: Record<string, number>;
  loading?: boolean;
  onClearFilters?: () => void;
  onEdit?: (author: Author) => void;
  onDelete?: (author: Author) => void;
  className?: string;
}

export interface AuthorCardProps {
  author: Author;
  bookCount?: number;
  selected?: boolean;
  onToggleSelect?: () => void;
  onEdit?: () => void;
  onDelete?: () => void;
  className?: string;
}

export interface AuthorFormValuesShape {
  name: string;
  slug: string;
  bio: string;
  photoUrl: string;
  status: RecordStatus;
}

export interface AuthorFormLayoutProps {
  defaultValues?: Partial<AuthorFormValuesShape>;
  mode?: "create" | "edit";
  onCancel?: () => void;
  className?: string;
}

export interface AuthorFiltersValue {
  statuses: RecordStatus[];
}

export interface AuthorFiltersProps {
  value?: AuthorFiltersValue;
  onChange?: (value: AuthorFiltersValue) => void;
  className?: string;
}

export interface AuthorToolbarProps {
  searchValue?: string;
  onSearchChange?: (value: string) => void;
  filtersValue?: AuthorFiltersValue;
  onFiltersChange?: (value: AuthorFiltersValue) => void;
  view: AuthorViewMode;
  onViewChange?: (view: AuthorViewMode) => void;
  onAddAuthor?: () => void;
  className?: string;
}

export interface AuthorEmptyStateProps {
  variant?: "no-data" | "no-results";
  onClearFilters?: () => void;
  className?: string;
}

export interface AuthorSkeletonProps {
  view?: AuthorViewMode;
  className?: string;
}

export interface AuthorManagementOverviewProps {
  authors?: Author[];
  bookCounts?: Record<string, number>;
  loading?: boolean;
  className?: string;
}
