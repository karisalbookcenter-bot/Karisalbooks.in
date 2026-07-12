import { getIcon } from "@/lib/icons";
import { Skeleton } from "@/components/ui/skeleton";
import { cn } from "@/lib/utils";
import type { StatCardProps } from "@/features/admin/types/dashboard.types";

/**
 * StatCard — Sprint 07 (Task 3).
 *
 * One placeholder metric card (icon, label, value). Defaults `value` to
 * an em dash ("—") rather than a fake number like "0" or "128" — a zero
 * reads as a real, verified count ("we checked, there are none"), which
 * would misrepresent a metric nothing has actually queried yet. The dash
 * is the honest "not available" placeholder; `loading` swaps it for a
 * skeleton bar (Sprint 06's `Skeleton` primitive) to preview the
 * eventual loading state.
 *
 * Rendered in a grid by `StatCardGrid` below, one per entry in
 * `DASHBOARD_STAT_CARDS` (`@/config/dashboard`) — this component itself
 * takes props and has no config import, so it's independently reusable
 * for any future single-metric card outside the dashboard too.
 */
export function StatCard({ label, icon, value = "—", loading, className }: StatCardProps & { className?: string }) {
  const Icon = getIcon(icon);

  return (
    <div className={cn("flex items-start justify-between gap-3 rounded-lg border border-border bg-card p-4", className)}>
      <div className="space-y-1.5">
        <p className="text-sm text-muted-foreground">{label}</p>
        {loading ? (
          <Skeleton className="h-7 w-16" />
        ) : (
          <p className="text-2xl font-semibold tracking-tight text-foreground">{value}</p>
        )}
      </div>
      <span className="flex h-9 w-9 shrink-0 items-center justify-center rounded-md bg-primary/10 text-primary">
        <Icon className="h-5 w-5" aria-hidden="true" />
      </span>
    </div>
  );
}
