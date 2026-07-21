import { TableSkeleton, CardSkeleton } from "@/features/admin/components/skeletons";
import type { AuthorSkeletonProps } from "@/features/admin/types/author-management.types";

/**
 * AuthorSkeleton — Sprint 11 (Task 14 support). Reuses Sprint 06/07's
 * existing skeletons directly, the same "do not recreate existing
 * components" pattern `SubcategorySkeleton` (Sprint 09) already
 * established. `view="table"` → `TableSkeleton` (6 columns: checkbox,
 * name, slug, books, status, actions). `view="card"` → `CardSkeleton`.
 */
export function AuthorSkeleton({ view = "table", className }: AuthorSkeletonProps) {
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
