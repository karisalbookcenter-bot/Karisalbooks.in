import { DASHBOARD_STAT_CARDS } from "@/config/dashboard";
import { cn } from "@/lib/utils";
import type { StatCardGridProps } from "@/features/admin/types/dashboard.types";
import { StatCard } from "./StatCard";

export function StatCardGrid({
  cards = DASHBOARD_STAT_CARDS,
  stats,
  loading,
  className,
}: StatCardGridProps) {
  return (
    <div
      className={cn(
        "grid grid-cols-1 gap-4 sm:grid-cols-2 lg:grid-cols-3",
        className
      )}
    >
      {cards.map((card) => {
        let value = "—";

        if (stats) {
          switch (card.id) {
            case "total-books":
              value = stats.totalBooks.toString();
              break;

            case "orders":
              value = stats.totalOrders.toString();
              break;

            case "customers":
              value = stats.totalCustomers.toString();
              break;

            case "revenue":
              value = `₹${stats.totalRevenue.toLocaleString("en-IN")}`;
              break;

            case "low-stock":
              value = stats.pendingOrders.toString();
              break;

            default:
              value = "—";
          }
        }

        return (
          <StatCard
            key={card.id}
            {...card}
            value={value}
            loading={loading}
          />
        );
      })}
    </div>
  );
}