import type { ReactNode } from "react";
import { Inbox } from "lucide-react";
import { Button } from "@/components/ui/button";
import { cn } from "@/lib/utils";

export interface EmptyStateAction {
  label: string;
  onClick: () => void;
}

export interface EmptyStateProps {
  /** Defaults to a neutral inbox icon — pass any lucide icon for a
   *  context-specific one (e.g. an empty search icon for "no results"). */
  icon?: ReactNode;
  title: string;
  description?: string;
  action?: EmptyStateAction;
  className?: string;
}

/**
 * EmptyState — Sprint 06.
 *
 * A single, reusable "nothing here yet" pattern, so a future Books table
 * with zero rows, a future Orders list with no matches, and a future
 * Reports screen with no data in range all look and behave consistently
 * instead of each screen inventing its own empty message.
 *
 * Per the frontend-design guidance on emptiness: this is written as an
 * invitation to act (a title stating the situation plainly, an optional
 * action button), not an apology.
 */
export function EmptyState({ icon, title, description, action, className }: EmptyStateProps) {
  return (
    <div
      className={cn(
        "flex flex-col items-center justify-center gap-3 rounded-lg border border-dashed border-border px-6 py-16 text-center",
        className
      )}
    >
      <div className="flex h-12 w-12 items-center justify-center rounded-full bg-muted text-muted-foreground">
        {icon ?? <Inbox className="h-6 w-6" aria-hidden="true" />}
      </div>
      <div className="space-y-1">
        <p className="text-sm font-medium text-foreground">{title}</p>
        {description && (
          <p className="max-w-sm text-sm text-muted-foreground">{description}</p>
        )}
      </div>
      {action && (
        <Button size="sm" onClick={action.onClick} className="mt-2">
          {action.label}
        </Button>
      )}
    </div>
  );
}
