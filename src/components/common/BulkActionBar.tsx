"use client";

import { getIcon } from "@/lib/icons";
import { Button } from "@/components/ui/button";
import { cn } from "@/lib/utils";

export interface BulkAction {
  id: string;
  label: string;
  icon: string;
  destructive?: boolean;
}

export interface BulkActionBarProps {
  /** Number of currently-selected rows. The bar renders nothing when 0 —
   *  callers don't need to conditionally mount/unmount it themselves. */
  count: number;
  actions: BulkAction[];
  /** Called with the action's `id`. Defaults to a no-op — see this
   *  component's own note below, same pattern as `QuickActions`
   *  (Sprint 07). */
  onAction?: (actionId: string) => void;
  onClear?: () => void;
  className?: string;
}

/**
 * BulkActionBar — Sprint 08 (Task 9 — UI only).
 *
 * A sticky bar that appears once `count > 0`, showing "N selected" plus a
 * row of actions. Generic (`actions`/`onAction` are plain props, no
 * category import), so it lives in `components/common/` — `CategoryTable`/
 * `CategoryTreeView` are its first consumers via
 * `CATEGORY_BULK_ACTIONS`, but any future selectable table (Products,
 * Orders) reuses this same bar with its own action list.
 *
 * **UI only, as required — no bulk mutation is wired up.** Clicking an
 * action calls `onAction?.(id)`, which is `undefined` by default; a
 * future sprint passes real handlers once bulk update/delete logic and a
 * data layer exist for whichever entity uses this bar.
 */
export function BulkActionBar({ count, actions, onAction, onClear, className }: BulkActionBarProps) {
  if (count === 0) return null;

  return (
    <div
      role="toolbar"
      aria-label="Bulk actions"
      className={cn(
        "flex flex-wrap items-center gap-3 rounded-lg border border-border bg-card px-4 py-3 shadow-sm",
        className
      )}
    >
      <span className="text-sm font-medium text-foreground">
        {count} selected
      </span>

      <div className="flex flex-1 flex-wrap items-center gap-2">
        {actions.map((action) => {
          const Icon = getIcon(action.icon);
          return (
            <Button
              key={action.id}
              type="button"
              size="sm"
              variant={action.destructive ? "destructive" : "outline"}
              onClick={() => onAction?.(action.id)}
            >
              <Icon className="mr-1.5 h-4 w-4" aria-hidden="true" />
              {action.label}
            </Button>
          );
        })}
      </div>

      <Button type="button" size="sm" variant="ghost" onClick={onClear}>
        Clear selection
      </Button>
    </div>
  );
}
