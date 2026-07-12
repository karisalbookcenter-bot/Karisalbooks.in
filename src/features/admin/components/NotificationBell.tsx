"use client";

import { useState } from "react";
import { Bell } from "lucide-react";
import { cn } from "@/lib/utils";
import { EmptyState } from "@/components/common/EmptyState";

export interface NotificationBellProps {
  /** Static count for now — no real notification system exists yet.
   *  Defaults to 0 (no badge shown). A future sprint replaces this with
   *  a live count from a notifications service. */
  count?: number;
  className?: string;
}

/**
 * NotificationBell — Sprint 06 (Task 9).
 *
 * A placeholder, not a feature: clicking it opens an empty panel using
 * this sprint's own `EmptyState` component rather than any real
 * notification data, since no notification system, table, or API exists
 * yet. Its purpose today is purely to reserve the header's layout slot
 * and establish the badge-count visual pattern a future sprint will wire
 * to real data.
 */
export function NotificationBell({ count = 0, className }: NotificationBellProps) {
  const [open, setOpen] = useState(false);
  const hasNotifications = count > 0;

  return (
    <div className={cn("relative", className)}>
      <button
        type="button"
        onClick={() => setOpen((prev) => !prev)}
        aria-haspopup="dialog"
        aria-expanded={open}
        aria-label={hasNotifications ? `Notifications, ${count} unread` : "Notifications"}
        className="relative rounded-full p-2 text-muted-foreground transition-colors hover:bg-accent hover:text-accent-foreground focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2 focus-visible:ring-offset-background"
      >
        <Bell className="h-5 w-5" aria-hidden="true" />
        {hasNotifications && (
          <span
            aria-hidden="true"
            className="absolute right-1 top-1 flex h-4 min-w-4 items-center justify-center rounded-full bg-destructive px-1 text-[10px] font-semibold leading-none text-destructive-foreground"
          >
            {count > 9 ? "9+" : count}
          </span>
        )}
      </button>

      {open && (
        <div
          role="dialog"
          aria-label="Notifications"
          className="absolute right-0 z-40 mt-2 w-80 max-w-[85vw] overflow-hidden rounded-md border border-border bg-popover text-popover-foreground shadow-lg animate-in fade-in zoom-in-95 duration-150"
        >
          <div className="border-b border-border px-4 py-3">
            <p className="text-sm font-medium">Notifications</p>
          </div>
          <div className="p-2">
            <EmptyState
              icon={<Bell className="h-6 w-6" aria-hidden="true" />}
              title="You're all caught up"
              description="No notifications yet."
              className="border-none py-8"
            />
          </div>
        </div>
      )}
    </div>
  );
}
