import { EmptyState } from "@/components/common/EmptyState";
import { getIcon } from "@/lib/icons";
import type { AuthorEmptyStateProps } from "@/features/admin/types/author-management.types";

const COPY = {
  "no-data": {
    title: "No authors yet",
    description: "Add your first author to start attributing books to them.",
  },
  "no-results": {
    title: "No authors match your filters",
    description: "Try adjusting your search or status filter.",
  },
} as const;

/**
 * AuthorEmptyState — Sprint 11 (Task 14 support).
 *
 * Same "no-data" vs. "no-results" distinction as `CategoryEmptyState`/
 * `SubcategoryEmptyState` (Sprints 08–09), wrapping the same shared
 * `EmptyState` (Sprint 06).
 */
export function AuthorEmptyState({ variant = "no-data", onClearFilters, className }: AuthorEmptyStateProps) {
  const UsersIcon = getIcon("users");
  const copy = COPY[variant];

  return (
    <EmptyState
      icon={<UsersIcon className="h-6 w-6" aria-hidden="true" />}
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
