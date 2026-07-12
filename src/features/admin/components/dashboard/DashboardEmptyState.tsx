import { EmptyState, type EmptyStateAction } from "@/components/common/EmptyState";
import { getIcon } from "@/lib/icons";

export interface DashboardEmptyStateProps {
  title?: string;
  description?: string;
  action?: EmptyStateAction;
  className?: string;
}

/**
 * DashboardEmptyState — Sprint 07 (Task 11).
 *
 * A dashboard-flavored wrapper around Sprint 06's generic `EmptyState`,
 * with defaults suited to "the whole dashboard has nothing to show yet"
 * (e.g. a brand-new store with zero books, zero orders) — as opposed to
 * `RecentActivity`'s narrower, section-level empty state. Composed from
 * the existing primitive rather than reimplementing empty-state markup,
 * per this sprint's "reuse existing architecture" instruction.
 */
export function DashboardEmptyState({
  title = "Your dashboard is ready",
  description = "Once you start adding books, categories, and orders, your store's activity will appear here.",
  action,
  className,
}: DashboardEmptyStateProps) {
  const DashboardIcon = getIcon("dashboard");

  return (
    <EmptyState
      icon={<DashboardIcon className="h-6 w-6" aria-hidden="true" />}
      title={title}
      description={description}
      action={action}
      className={className}
    />
  );
}
