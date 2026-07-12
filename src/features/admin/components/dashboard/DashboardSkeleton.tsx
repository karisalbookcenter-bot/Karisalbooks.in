import { Skeleton } from "@/components/ui/skeleton";
import { CardSkeleton, ListSkeleton } from "@/features/admin/components/skeletons";

/**
 * DashboardSkeleton — Sprint 07 (Task 10).
 *
 * The full dashboard's loading state, composed entirely from Sprint 06's
 * existing skeleton primitives (`CardSkeleton`, `ListSkeleton`,
 * `Skeleton`) rather than new markup — per this sprint's "do not recreate
 * existing components" instruction. `CardSkeleton` stands in for the stat
 * card grid (6 cards, matching `DASHBOARD_STAT_CARDS`'s length), a plain
 * `Skeleton` block stands in for the Quick Actions/System Status panels
 * (both simple bordered boxes), and `ListSkeleton` stands in for Recent
 * Activity.
 *
 * A future page renders `<DashboardSkeleton />` while its first real
 * fetch is in flight, then swaps to `<DashboardOverview />` once data
 * arrives — no such fetch exists yet in this sprint.
 */
export function DashboardSkeleton() {
  return (
    <div className="flex flex-col gap-6" role="status" aria-label="Loading dashboard">
      <Skeleton className="h-24 w-full rounded-lg" />
      <CardSkeleton count={6} />
      <div className="grid grid-cols-1 gap-4 lg:grid-cols-2">
        <Skeleton className="h-64 w-full rounded-lg" />
        <div className="rounded-lg border border-border p-5">
          <ListSkeleton items={4} />
        </div>
      </div>
    </div>
  );
}
