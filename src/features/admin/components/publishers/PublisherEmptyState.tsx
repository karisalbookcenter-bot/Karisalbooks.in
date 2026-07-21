import { EmptyState } from "@/components/common/EmptyState";
import { getIcon } from "@/lib/icons";
import type { PublisherEmptyStateProps } from "@/features/admin/types/publisher-management.types";

const COPY = {
  "no-data": {
    title: "No publishers yet",
    description: "Add your first publisher to start attributing books to them.",
  },
  "no-results": {
    title: "No publishers match your filters",
    description: "Try adjusting your search or status filter.",
  },
} as const;

/**
 * PublisherEmptyState — Sprint 11 (Task 15 support). Mirrors
 * `AuthorEmptyState` exactly.
 */
export function PublisherEmptyState({ variant = "no-data", onClearFilters, className }: PublisherEmptyStateProps) {
  const BuildingIcon = getIcon("building-2");
  const copy = COPY[variant];

  return (
    <EmptyState
      icon={<BuildingIcon className="h-6 w-6" aria-hidden="true" />}
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
