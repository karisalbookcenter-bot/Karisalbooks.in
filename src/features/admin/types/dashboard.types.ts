import type {
  StatCardDefinition,
  QuickActionDefinition,
  SystemStatusItemDefinition,
} from "@/config/dashboard";

import type { AdminUserSummary } from "@/features/admin/types/admin-layout.types";


export interface DashboardStats {
  totalBooks: number;
  totalOrders: number;
  totalCustomers: number;
  totalRevenue: number;
  pendingOrders: number;
}


export interface StatCardProps extends StatCardDefinition {
  value?: string;
  loading?: boolean;
}


export interface StatCardGridProps {
  cards?: StatCardDefinition[];
  stats?: DashboardStats;
  loading?: boolean;
  className?: string;
}


export interface QuickActionsProps {
  actions?: QuickActionDefinition[];
  onAction?: (actionId: string) => void;
  className?: string;
}


export interface RecentActivityProps {
  loading?: boolean;
  className?: string;
}


export interface SystemStatusProps {
  items?: SystemStatusItemDefinition[];
  className?: string;
}


export interface WelcomeBannerProps {
  user?: AdminUserSummary;
  className?: string;
}


export interface DashboardOverviewProps {
  user?: AdminUserSummary;
  loading?: boolean;
  className?: string;
}