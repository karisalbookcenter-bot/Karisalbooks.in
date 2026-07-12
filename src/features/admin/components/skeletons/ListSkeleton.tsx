import { Skeleton } from "@/components/ui/skeleton";

export interface ListSkeletonProps {
  items?: number;
}

/**
 * Placeholder for a future simple list's loading state (e.g. a future
 * notifications panel, a future activity feed — not built this sprint).
 * Renders `items` rows, each a small avatar/icon circle plus two lines
 * of text, the shape most simple list rows share.
 */
export function ListSkeleton({ items = 5 }: ListSkeletonProps) {
  return (
    <div className="divide-y divide-border" role="status" aria-label="Loading list">
      {Array.from({ length: items }).map((_, i) => (
        <div key={i} className="flex items-center gap-3 py-3">
          <Skeleton className="h-9 w-9 shrink-0 rounded-full" />
          <div className="flex-1 space-y-2">
            <Skeleton className="h-3.5 w-1/3" />
            <Skeleton className="h-3 w-2/3" />
          </div>
        </div>
      ))}
    </div>
  );
}
