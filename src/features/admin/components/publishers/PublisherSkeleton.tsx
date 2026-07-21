import { TableSkeleton, CardSkeleton } from "@/features/admin/components/skeletons";
import type { PublisherSkeletonProps } from "@/features/admin/types/publisher-management.types";

/**
 * PublisherSkeleton — Sprint 11 (Task 15 support). Mirrors
 * `AuthorSkeleton` exactly, reusing Sprint 06/07's existing skeletons.
 */
export function PublisherSkeleton({ view = "table", className }: PublisherSkeletonProps) {
  if (view === "card") {
    return (
      <div className={className}>
        <CardSkeleton count={6} />
      </div>
    );
  }

  return (
    <div className={className}>
      <TableSkeleton rows={6} columns={6} />
    </div>
  );
}
