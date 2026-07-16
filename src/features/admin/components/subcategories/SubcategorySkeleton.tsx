import { TableSkeleton, CardSkeleton } from "@/features/admin/components/skeletons";
import type { SubcategorySkeletonProps } from "@/features/admin/types/subcategory-management.types";

/**
 * SubcategorySkeleton — Sprint 09 (Task 10).
 *
 * Reuses Sprint 06's existing skeletons directly, no new markup — per
 * this sprint's "do not duplicate code" instruction, and simpler than
 * `CategorySkeleton` (Sprint 08) since there's no tree shape to preview.
 * `view="table"` → `TableSkeleton` (7 columns: checkbox, name, slug,
 * category, status, updated, actions). `view="card"` → `CardSkeleton`,
 * the same grid-of-cards placeholder the dashboard's stat cards use.
 */
export function SubcategorySkeleton({ view = "table", className }: SubcategorySkeletonProps) {
  if (view === "card") {
    return (
      <div className={className}>
        <CardSkeleton count={6} />
      </div>
    );
  }

  return (
    <div className={className}>
      <TableSkeleton rows={6} columns={7} />
    </div>
  );
}
