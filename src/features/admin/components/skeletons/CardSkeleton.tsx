import { Skeleton } from "@/components/ui/skeleton";

export interface CardSkeletonProps {
  count?: number;
}

/**
 * Placeholder for a future grid of stat/summary cards (e.g. a future
 * dashboard's "Total Orders" / "Revenue" cards — not built this sprint).
 * Renders `count` card-shaped skeletons in a responsive grid.
 */
export function CardSkeleton({ count = 4 }: CardSkeletonProps) {
  return (
    <div
      className="grid grid-cols-1 gap-4 sm:grid-cols-2 lg:grid-cols-4"
      role="status"
      aria-label="Loading summary cards"
    >
      {Array.from({ length: count }).map((_, i) => (
        <div key={i} className="space-y-3 rounded-lg border border-border p-4">
          <Skeleton className="h-4 w-1/2" />
          <Skeleton className="h-7 w-1/3" />
          <Skeleton className="h-3 w-2/3" />
        </div>
      ))}
    </div>
  );
}
