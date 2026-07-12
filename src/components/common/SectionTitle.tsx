import type { ReactNode } from "react";
import { getIcon, type IconName } from "@/lib/icons";
import { cn } from "@/lib/utils";

export interface SectionTitleProps {
  title: string;
  description?: string;
  /** Resolved through the centralized icon registry, consistent with
   *  every other icon in the app (nav items, sidebar, widgets). */
  icon?: IconName;
  /** Right-aligned slot — typically a small link/button ("View all"). */
  action?: ReactNode;
  className?: string;
}

/**
 * SectionTitle — Sprint 07 (Task 9).
 *
 * A small, generic heading row (icon + title + description, optional
 * right-aligned action) reused across every dashboard section this sprint
 * (Quick Actions, Recent Activity, System Status) via `WidgetContainer`,
 * and equally usable by any future non-dashboard admin section — nothing
 * about it is dashboard-specific, so it lives in `components/common/`
 * alongside `Breadcrumb`, `EmptyState`, and `PageContainer` rather than
 * inside `features/admin/`.
 */
export function SectionTitle({ title, description, icon, action, className }: SectionTitleProps) {
  const Icon = icon ? getIcon(icon) : null;

  return (
    <div className={cn("flex items-start justify-between gap-4", className)}>
      <div className="flex items-start gap-2.5">
        {Icon && (
          <Icon className="mt-0.5 h-5 w-5 shrink-0 text-muted-foreground" aria-hidden="true" />
        )}
        <div>
          <h2 className="text-base font-semibold text-foreground">{title}</h2>
          {description && (
            <p className="text-sm text-muted-foreground">{description}</p>
          )}
        </div>
      </div>
      {action && <div className="shrink-0">{action}</div>}
    </div>
  );
}
