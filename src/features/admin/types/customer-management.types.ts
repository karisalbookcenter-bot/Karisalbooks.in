import type { Customer } from "@/types/customer.types";
import type { RecordStatus } from "@/types/common.types";
import type { CustomerViewMode } from "@/config/customerManagement";

/**
 * Customer management component prop types — Sprint 12.
 *
 * Same three-way layering as every prior admin framework
 * (`config/customerManagement.ts` = data, `types/customer.types.ts` =
 * entity, this file = component contracts). Notably absent compared to
 * `AuthorTableProps`/`PublisherTableProps` (Sprint 11): no
 * `onEdit`/`onDelete` — this framework has no CRUD. In their place,
 * `onViewDetails` opens `CustomerDetailsPanel`, the one action this
 * read-only framework supports.
 */

export interface CustomerSelectionProps {
  selectedIds?: string[];
  onToggleSelect?: (id: string) => void;
}

export interface CustomerTableProps extends CustomerSelectionProps {
  customers: Customer[];
  loading?: boolean;
  onClearFilters?: () => void;
  onViewDetails?: (customer: Customer) => void;
  className?: string;
}

export interface CustomerCardProps {
  customer: Customer;
  selected?: boolean;
  onToggleSelect?: () => void;
  onViewDetails?: () => void;
  className?: string;
}

export interface CustomerDetailsPanelProps {
  customer: Customer | null;
  open: boolean;
  onClose: () => void;
  className?: string;
}

export interface CustomerFiltersValue {
  statuses: RecordStatus[];
}

export interface CustomerFiltersProps {
  value?: CustomerFiltersValue;
  onChange?: (value: CustomerFiltersValue) => void;
  className?: string;
}

export interface CustomerToolbarProps {
  searchValue?: string;
  onSearchChange?: (value: string) => void;
  filtersValue?: CustomerFiltersValue;
  onFiltersChange?: (value: CustomerFiltersValue) => void;
  view: CustomerViewMode;
  onViewChange?: (view: CustomerViewMode) => void;
  className?: string;
}

export interface CustomerEmptyStateProps {
  variant?: "no-data" | "no-results";
  onClearFilters?: () => void;
  className?: string;
}

export interface CustomerSkeletonProps {
  view?: CustomerViewMode;
  className?: string;
}

export interface CustomerManagementOverviewProps {
  customers?: Customer[];
  loading?: boolean;
  className?: string;
}
