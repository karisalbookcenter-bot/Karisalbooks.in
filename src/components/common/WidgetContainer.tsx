import type { ReactNode } from "react";
import { SectionTitle } from "@/components/common/SectionTitle";
import type { IconName } from "@/lib/icons";
import { cn } from "@/lib/utils";

export interface WidgetContainerProps {
  title?: string;
  description?: string;
  icon?: IconName;
  action?: ReactNode;
  children: ReactNode;
  className?: string;
}

/**
 * WidgetContainer — Sprint 07 (Task 8: "Dashboard Widget Container").
 *
 * The bordered card shell every dashboard widget (Quick Actions, Recent
 * Activity, System Status) renders inside — a header built from
 * `SectionTitle` when `title` is given, plus a body. Promoted to
 * `components/common/` rather than kept inside `features/admin/`, the
 * same reasoning as `PageContainer` (Sprint 06): "a bordered panel with a
 * title and a body" has no admin-specific logic and is equally useful for
 * a future customer account dashboard or any other panel-based screen.
 *
 * Distinct from `PageContainer` (Sprint 06), which frames an entire
 * *page*; `WidgetContainer` frames one *section* of a page — a dashboard
 * built with `PageContainer` as its outer frame and several
 * `WidgetContainer`s as its sections is the intended composition (see
 * `DashboardOverview`).
 */
export function WidgetContainer({
  title,
  description,
  icon,
  action,
  children,
  className,
}: WidgetContainerProps) {
  return (
    <section className={cn("rounded-lg border border-border bg-card p-5", className)}>
      {title && (
        <SectionTitle
          title={title}
          description={description}
          icon={icon}
          action={action}
          className="mb-4"
        />
      )}
      {children}
    </section>
  );
}
