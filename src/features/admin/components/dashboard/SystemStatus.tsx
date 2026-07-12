import { DASHBOARD_SYSTEM_STATUS, type SystemStatusValue } from "@/config/dashboard";
import { WidgetContainer } from "@/components/common/WidgetContainer";
import { getIcon, type IconName } from "@/lib/icons";
import { cn } from "@/lib/utils";
import type { SystemStatusProps } from "@/features/admin/types/dashboard.types";

const STATUS_STYLES: Record<SystemStatusValue, { icon: IconName; className: string; text: string }> = {
  operational: { icon: "check-circle", className: "text-green-600 dark:text-green-500", text: "Operational" },
  degraded: { icon: "alert-triangle", className: "text-yellow-600 dark:text-yellow-500", text: "Degraded" },
  down: { icon: "x-circle", className: "text-destructive", text: "Down" },
  unknown: { icon: "help-circle", className: "text-muted-foreground", text: "Not checked" },
};

/**
 * SystemStatus — Sprint 07 (Task 6).
 *
 * Renders `DASHBOARD_SYSTEM_STATUS` (config-driven, `@/config/dashboard`)
 * as a simple status list. Every row currently reports `"unknown"` ("Not
 * checked") because no component performs a real health check against
 * Supabase, storage, or a payments provider — this widget is the display
 * surface, ready for a future sprint to feed it real `operational` /
 * `degraded` / `down` values from an actual check, without changing this
 * component's rendering logic (all four states are already styled).
 */
export function SystemStatus({ items = DASHBOARD_SYSTEM_STATUS, className }: SystemStatusProps) {
  return (
    <WidgetContainer title="System Status" icon="database" className={className}>
      <ul className="divide-y divide-border">
        {items.map((item) => {
          const style = STATUS_STYLES[item.status];
          const StatusIcon = getIcon(style.icon);

          return (
            <li key={item.id} className="flex items-center justify-between gap-3 py-3 first:pt-0 last:pb-0">
              <div>
                <p className="text-sm font-medium text-foreground">{item.label}</p>
                <p className="text-xs text-muted-foreground">{item.description}</p>
              </div>
              <span className={cn("flex shrink-0 items-center gap-1.5 text-sm font-medium", style.className)}>
                <StatusIcon className="h-4 w-4" aria-hidden="true" />
                {style.text}
              </span>
            </li>
          );
        })}
      </ul>
    </WidgetContainer>
  );
}
