import { PageContainer } from "@/components/common/PageContainer";
import { WelcomeBanner } from "./WelcomeBanner";
import { StatCardGrid } from "./StatCardGrid";
import { QuickActions } from "./QuickActions";
import { RecentActivity } from "./RecentActivity";
import { SystemStatus } from "./SystemStatus";
import { DashboardSkeleton } from "./DashboardSkeleton";
import type { DashboardOverviewProps } from "@/features/admin/types/dashboard.types";

/**
 * DashboardOverview — Sprint 07 (Tasks 1 & 2: Dashboard page architecture
 * and reusable Dashboard Layout).
 *
 * The composed dashboard screen, assembled entirely from this sprint's
 * widgets plus Sprint 06's `PageContainer`. This is the "page
 * architecture" deliverable — a component ready to be the default export
 * of a future `app/admin/page.tsx` — without this sprint creating that
 * route file itself (no route is wired up, per this sprint's "reusable
 * framework only" scope).
 *
 * Intended future usage:
 *
 *   // app/admin/page.tsx (a future sprint)
 *   import { AdminShell } from "@/features/admin/components/layout";
 *   import { DashboardOverview } from "@/features/admin/components/dashboard";
 *
 *   export default function AdminDashboardPage() {
 *     return (
 *       <AdminShell>
 *         <DashboardOverview />
 *       </AdminShell>
 *     );
 *   }
 *
 * Layout: a `WelcomeBanner`, then the stat card grid, then a two-column
 * responsive row (Quick Actions + System Status side by side on large
 * screens, stacked on mobile/tablet) with `RecentActivity` spanning full
 * width below — chosen so the two static/reference panels (actions,
 * status) sit together and the eventually-dynamic activity feed gets full
 * width to grow into.
 *
 * `loading` renders `DashboardSkeleton` instead of the real widgets —
 * the toggle a future page flips based on an actual fetch's status; no
 * fetch exists yet, so nothing calls this with `loading` on its own.
 */
export function DashboardOverview({ user, loading, className }: DashboardOverviewProps) {
  if (loading) {
    return (
      <PageContainer title="Dashboard" description="Overview of your store." className={className}>
        <DashboardSkeleton />
      </PageContainer>
    );
  }

  return (
    <PageContainer title="Dashboard" description="Overview of your store." className={className}>
      <div className="flex flex-col gap-6">
        <WelcomeBanner user={user} />
        <StatCardGrid />
        <div className="grid grid-cols-1 gap-6 lg:grid-cols-2">
          <QuickActions />
          <SystemStatus />
        </div>
        <RecentActivity />
      </div>
    </PageContainer>
  );
}
