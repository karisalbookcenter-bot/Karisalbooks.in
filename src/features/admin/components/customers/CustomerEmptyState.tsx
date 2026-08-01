import { EmptyState } from "@/components/common/EmptyState";
import { getIcon } from "@/lib/icons";
import type { CustomerEmptyStateProps } from "@/features/admin/types/customer-management.types";

const COPY = {
  "no-data": {
    title: "No customers yet",
    description: "Once customers create accounts, they'll appear here.",
  },
  "no-results": {
    title: "No customers match your filters",
    description: "Try adjusting your search or status filter.",
  },
} as const;

/**
 * CustomerEmptyState — Sprint 12 (Task 11). Same "no-data" vs.
 * "no-results" distinction as every prior `*EmptyState` (Sprints 08–09,
 * 11), wrapping the same shared `EmptyState` (Sprint 06). "No customers
 * yet" reads passively ("once customers create accounts...") rather than
 * inviting the admin to add one — there is no "Add Customer" action
 * anywhere in this framework.
 */
export function CustomerEmptyState({ variant = "no-data", onClearFilters, className }: CustomerEmptyStateProps) {
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
