import type { Publisher } from "@/types/publisher.types";
import type { RecordStatus } from "@/types/common.types";
import type { PublisherViewMode } from "@/config/publisherManagement";

/**
 * Publisher management component prop types — Sprint 11. Mirrors
 * `author-management.types.ts` exactly, with `websiteUrl` in place of
 * `photoUrl`/`bio` (see `PublisherFormValues`, Sprint 11).
 */

export interface PublisherSelectionProps {
  selectedIds?: string[];
  onToggleSelect?: (id: string) => void;
}

export interface PublisherTableProps extends PublisherSelectionProps {
  publishers: Publisher[];
  /** Book count per publisher, keyed by publisher id — resolved by the
   *  caller via `getBookCountForPublisher` (Sprint 11's Book ↔ Publisher
   *  relationship support). */
  bookCounts?: Record<string, number>;
  loading?: boolean;
  onClearFilters?: () => void;
  onEdit?: (publisher: Publisher) => void;
  onDelete?: (publisher: Publisher) => void;
  className?: string;
}

export interface PublisherCardProps {
  publisher: Publisher;
  bookCount?: number;
  selected?: boolean;
  onToggleSelect?: () => void;
  onEdit?: () => void;
  onDelete?: () => void;
  className?: string;
}

export interface PublisherFormValuesShape {
  name: string;
  slug: string;
  description: string;
  websiteUrl: string;
  status: RecordStatus;
}

export interface PublisherFormLayoutProps {
  defaultValues?: Partial<PublisherFormValuesShape>;
  mode?: "create" | "edit";
  onCancel?: () => void;
  className?: string;
}

export interface PublisherFiltersValue {
  statuses: RecordStatus[];
}

export interface PublisherFiltersProps {
  value?: PublisherFiltersValue;
  onChange?: (value: PublisherFiltersValue) => void;
  className?: string;
}

export interface PublisherToolbarProps {
  searchValue?: string;
  onSearchChange?: (value: string) => void;
  filtersValue?: PublisherFiltersValue;
  onFiltersChange?: (value: PublisherFiltersValue) => void;
  view: PublisherViewMode;
  onViewChange?: (view: PublisherViewMode) => void;
  onAddPublisher?: () => void;
  className?: string;
}

export interface PublisherEmptyStateProps {
  variant?: "no-data" | "no-results";
  onClearFilters?: () => void;
  className?: string;
}

export interface PublisherSkeletonProps {
  view?: PublisherViewMode;
  className?: string;
}

export interface PublisherManagementOverviewProps {
  publishers?: Publisher[];
  bookCounts?: Record<string, number>;
  loading?: boolean;
  className?: string;
}
