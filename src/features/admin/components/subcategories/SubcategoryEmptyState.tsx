import { EmptyState } from "@/components/common/EmptyState";
import { getIcon } from "@/lib/icons";
import type { SubcategoryEmptyStateProps } from "@/features/admin/types/subcategory-management.types";

const COPY = {
  "no-data": {
    title: "No subcategories yet",
    description: "Create your first subcategory under a category to refine your catalog further.",
  },
  "no-results": {
    title: "No subcategories match your filters",
    description: "Try adjusting your search, category, or status filter.",
  },
} as const;

/**
 * SubcategoryEmptyState — Sprint 09 (Task 9).
 *
 * Mirrors `CategoryEmptyState` (Sprint 08) exactly — same "no-data" vs.
 * "no-results" distinction, wrapping the same shared `EmptyState`
 * (Sprint 06) — with copy specific to subcategories.
 */
export function SubcategoryEmptyState({ variant = "no-data", onClearFilters, className }: SubcategoryEmptyStateProps) {
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
