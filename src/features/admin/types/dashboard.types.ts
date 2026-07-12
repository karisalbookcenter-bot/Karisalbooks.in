import type {
  StatCardDefinition,
  QuickActionDefinition,
  SystemStatusItemDefinition,
} from "@/config/dashboard";
import type { AdminUserSummary } from "@/features/admin/types/admin-layout.types";

/**
 * Dashboard component prop types — Sprint 07.
 *
 * `config/dashboard.ts` owns the *data* shapes (`StatCardDefinition` etc.);
 * this file owns the *component* contracts built on top of them — the
 * same layering Sprint 06 used (`admin-layout.types.ts` for component
 * props, config files for data).
 */

/** `StatCard` renders one `StatCardDefinition` plus a value to display.
 *  `value` defaults to an em dash (see `StatCard`'s own doc comment) and
 *  `loading` swaps the value for a skeleton bar. */
export interface StatCardProps extends StatCardDefinition {
  value?: string;
  loading?: boolean;
}

export interface StatCardGridProps {
  cards?: StatCardDefinition[];
  loading?: boolean;
  className?: string;
}

export interface QuickActionsProps {
  actions?: QuickActionDefinition[];
  /** Called with the action's `id` when clicked. Defaults to a no-op —
   *  see `QuickActions`'s own doc comment for why. */
  onAction?: (actionId: string) => void;
  className?: string;
}

export interface RecentActivityProps {
  /** When true, shows `ListSkeleton` instead of the empty state — the
   *  loading-state variant a future real implementation will drive from
   *  an actual fetch. */
  loading?: boolean;
  className?: string;
}

export interface SystemStatusProps {
  items?: SystemStatusItemDefinition[];
  className?: string;
}

export interface WelcomeBannerProps {
  /** Defaults to a placeholder identity, the same pattern
   *  `UserProfileDropdown` (Sprint 06) uses — a future sprint passes the
   *  real signed-in user once `AuthProvider` is wired to an admin route. */
  user?: AdminUserSummary;
  className?: string;
}

export interface DashboardOverviewProps {
  user?: AdminUserSummary;
  loading?: boolean;
  className?: string;
}
