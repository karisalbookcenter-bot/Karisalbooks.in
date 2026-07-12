import { WidgetContainer } from "@/components/common/WidgetContainer";
import { EmptyState } from "@/components/common/EmptyState";
import { ListSkeleton } from "@/features/admin/components/skeletons";
import { getIcon } from "@/lib/icons";
import type { RecentActivityProps } from "@/features/admin/types/dashboard.types";

/**
 * RecentActivity — Sprint 07 (Task 5 — placeholder only).
 *
 * No activity feed, event log, or database table exists yet, so this
 * shows Sprint 06's generic `EmptyState` ("No recent activity yet")
 * rather than inventing sample rows that would look like real data at a
 * glance. Passing `loading` swaps in Sprint 06's `ListSkeleton` instead,
 * previewing the shape a future real feed would take while its first
 * fetch resolves — the two states this widget will actually have once
 * real activity events exist (loading, and populated) are already
 * accounted for; only the populated state's row-rendering is left for
 * that future sprint to add.
 */
export function RecentActivity({ loading, className }: RecentActivityProps) {
  const ActivityIcon = getIcon("activity");

  return (
    <WidgetContainer title="Recent Activity" icon="activity" className={className}>
      {loading ? (
        <ListSkeleton items={4} />
      ) : (
        <EmptyState
          icon={<ActivityIcon className="h-6 w-6" aria-hidden="true" />}
          title="No recent activity yet"
          description="Actions like new orders and account updates will show up here."
          className="border-none py-10"
        />
      )}
    </WidgetContainer>
  );
}
