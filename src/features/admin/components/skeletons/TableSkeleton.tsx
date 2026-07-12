import { Skeleton } from "@/components/ui/skeleton";

export interface TableSkeletonProps {
  rows?: number;
  columns?: number;
}

/**
 * Placeholder for a future data table's loading state (e.g. Books,
 * Orders, Customers — none of which are built this sprint). Renders a
 * header row plus `rows` body rows of pulsing bars, so a future table
 * component can show this before its first real row of data arrives
 * without inventing its own skeleton markup.
 */
export function TableSkeleton({ rows = 5, columns = 4 }: TableSkeletonProps) {
  return (
    <div className="w-full overflow-hidden rounded-lg border border-border" role="status" aria-label="Loading table data">
      <div className="grid gap-4 border-b border-border bg-muted/50 p-4" style={{ gridTemplateColumns: `repeat(${columns}, minmax(0, 1fr))` }}>
        {Array.from({ length: columns }).map((_, i) => (
          <Skeleton key={`head-${i}`} className="h-4 w-2/3" />
        ))}
      </div>
      <div className="divide-y divide-border">
        {Array.from({ length: rows }).map((_, rowIndex) => (
          <div
            key={`row-${rowIndex}`}
            className="grid gap-4 p-4"
            style={{ gridTemplateColumns: `repeat(${columns}, minmax(0, 1fr))` }}
          >
            {Array.from({ length: columns }).map((_, colIndex) => (
              <Skeleton key={`cell-${rowIndex}-${colIndex}`} className="h-4 w-full" />
            ))}
          </div>
        ))}
      </div>
    </div>
  );
}
