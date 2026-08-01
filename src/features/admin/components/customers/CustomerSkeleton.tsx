import { TableSkeleton, CardSkeleton } from "@/features/admin/components/skeletons";
import type { CustomerSkeletonProps } from "@/features/admin/types/customer-management.types";

/**
 * CustomerSkeleton — Sprint 12 (Task 12). Reuses Sprint 06/07's existing
 * skeletons directly, the same pattern `AuthorSkeleton`/`PublisherSkeleton`
 * (Sprint 11) established. `view="table"` -> `TableSkeleton` (5 columns:
 * checkbox, customer, contact, status, joined). `view="card"` ->
 * `CardSkeleton`.
 */
export function CustomerSkeleton({ view = "table", className }: CustomerSkeletonProps) {
  if (view === "card") {
    return (
      <div className={className}>
        <CardSkeleton count={6} />
      </div>
    );
  }

  return (
    <div className={className}>
      <TableSkeleton rows={6} columns={5} />
    </div>
  );
}
