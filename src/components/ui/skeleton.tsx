import { cn } from "@/lib/utils";

/**
 * Base loading-skeleton primitive (shadcn/ui convention — same pattern as
 * `components/ui/button.tsx` from Day 1: a plain element plus `cn()` for
 * class merging, no extra runtime dependency). A pulsing, rounded block
 * that stands in for content that hasn't loaded yet.
 *
 * Composed skeletons for specific admin shapes (a table row, a stat card,
 * a list) live in `@/features/admin/components/skeletons` and are built
 * out of this primitive rather than duplicating the pulse animation.
 */
export function Skeleton({ className, ...props }: React.HTMLAttributes<HTMLDivElement>) {
  return (
    <div
      className={cn("animate-pulse rounded-md bg-muted", className)}
      {...props}
    />
  );
}
