"use client";

import { DASHBOARD_QUICK_ACTIONS } from "@/config/dashboard";
import { getIcon } from "@/lib/icons";
import { Button } from "@/components/ui/button";
import { WidgetContainer } from "@/components/common/WidgetContainer";
import type { QuickActionsProps } from "@/features/admin/types/dashboard.types";

/**
 * QuickActions — Sprint 07 (Task 4 — UI only).
 *
 * Renders `DASHBOARD_QUICK_ACTIONS` (config-driven) as a responsive grid.
 * The dashboard wires category actions to their management pages.
 */
export function QuickActions({ actions = DASHBOARD_QUICK_ACTIONS, onAction, className }: QuickActionsProps) {
  return (
    <WidgetContainer title="Quick Actions" icon="plus" className={className}>
      <div className="grid grid-cols-2 gap-3 sm:grid-cols-3">
        {actions.map((action) => {
          const Icon = getIcon(action.icon);
          return (
            <Button
              key={action.id}
              type="button"
              variant="outline"
              onClick={() => onAction?.(action.id)}
              className="h-auto flex-col gap-2 py-4"
            >
              <Icon className="h-5 w-5" aria-hidden="true" />
              <span className="text-xs font-medium">{action.label}</span>
            </Button>
          );
        })}
      </div>
    </WidgetContainer>
  );
}
