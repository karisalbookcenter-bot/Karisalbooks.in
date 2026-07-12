import { DASHBOARD_STAT_CARDS } from "@/config/dashboard";
import { cn } from "@/lib/utils";
import type { StatCardGridProps } from "@/features/admin/types/dashboard.types";
import { StatCard } from "./StatCard";

/**
 * StatCardGrid — Sprint 07 (Task 3, continued).
 *
 * Maps `DASHBOARD_STAT_CARDS` (config-driven, `@/config/dashboard`) to a
 * responsive grid of `StatCard`s — 1 column on mobile, 2 on tablet, 3 on
 * desktop, so all six cards read comfortably at every breakpoint required
 * (desktop/tablet/mobile) without ever needing 6 fixed columns to
 * squeeze onto a phone screen. Accepts a `cards` override for reuse with a
 * different metric set later without duplicating this component.
 */
export function StatCardGrid({ cards = DASHBOARD_STAT_CARDS, loading, className }: StatCardGridProps) {
  return (
    <div className={cn("grid grid-cols-1 gap-4 sm:grid-cols-2 lg:grid-cols-3", className)}>
      {cards.map((card) => (
        <StatCard key={card.id} {...card} loading={loading} />
      ))}
    </div>
  );
}
