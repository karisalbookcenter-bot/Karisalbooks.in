import { Skeleton } from "@/components/ui/skeleton";
import { TableSkeleton } from "@/features/admin/components/skeletons";
import type { CategorySkeletonProps } from "@/features/admin/types/category-management.types";

/**
 * CategorySkeleton — Sprint 08 (Task 11).
 *
 * `view="table"` reuses Sprint 06's existing `TableSkeleton` directly —
 * per this sprint's "do not recreate existing components" instruction,
 * a category table's loading state is the same generic table shape
 * `TableSkeleton` already provides, just with column count tuned to
 * match `CategoryTable` (checkbox, name, slug, parent, status, updated,
 * actions = 7).
 *
 * `view="tree"` is new — `TableSkeleton`'s flat grid doesn't represent a
 * hierarchy, so this renders a small set of indented pulsing bars
 * (varying left-margin per row) to preview the tree's nesting shape
 * before real data loads.
 */
export function CategorySkeleton({ view = "table", className }: CategorySkeletonProps) {
  if (view === "tree") {
    const rows = [0, 0, 1, 1, 2, 0, 1];
    return (
      <div className={className} role="status" aria-label="Loading category tree">
        <div className="space-y-2 rounded-lg border border-border p-4">
          {rows.map((depth, i) => (
            <div key={i} className="flex items-center gap-2" style={{ marginLeft: depth * 24 }}>
              <Skeleton className="h-4 w-4 shrink-0 rounded" />
              <Skeleton className="h-4 w-40" />
              <Skeleton className="h-4 w-14 rounded-full" />
            </div>
          ))}
        </div>
      </div>
    );
  }

  return <TableSkeleton rows={6} columns={7} />;
}
