import { EmptyState } from "@/components/common/EmptyState";
import { getIcon } from "@/lib/icons";
import type { CategoryEmptyStateProps } from "@/features/admin/types/category-management.types";

const COPY = {
  "no-data": {
    title: "No categories yet",
    description: "Create your first category to start organizing your catalog.",
  },
  "no-results": {
    title: "No categories match your filters",
    description: "Try adjusting your search or filters to find what you're looking for.",
  },
} as const;

/**
 * CategoryEmptyState — Sprint 08 (Task 10).
 *
 * Wraps Sprint 06's generic `EmptyState` with two category-specific
 * variants, the same "no-data" vs. "no-results" distinction Sprint 07's
 * dashboard drew (`RecentActivity` vs. `DashboardEmptyState`) — a brand
 * new store with zero categories reads differently from an existing list
 * that a search/filter combination happens to match nothing in.
 * `"no-results"` renders a "Clear filters" action when `onClearFilters` is
 * supplied; `"no-data"` does not, since there's nothing to clear.
 */
export function CategoryEmptyState({ variant = "no-data", onClearFilters, className }: CategoryEmptyStateProps) {
  const FolderIcon = getIcon("folder-tree");
  const copy = COPY[variant];

  return (
    <EmptyState
      icon={<FolderIcon className="h-6 w-6" aria-hidden="true" />}
      title={copy.title}
      description={copy.description}
      className={className}
      action={
        variant === "no-results" && onClearFilters
          ? { label: "Clear filters", onClick: onClearFilters }
          : undefined
      }
    />
  );
}
