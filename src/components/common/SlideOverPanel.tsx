"use client";

import { useEffect, type ReactNode } from "react";
import { getIcon } from "@/lib/icons";
import { cn } from "@/lib/utils";

export interface SlideOverPanelProps {
  open: boolean;
  onClose: () => void;
  title: string;
  description?: string;
  children: ReactNode;
  /** Rendered in a footer row, below a border — typically action
   *  buttons. Optional; omit for a panel with no actions. */
  footer?: ReactNode;
  className?: string;
}

/**
 * SlideOverPanel — Sprint 12.
 *
 * A right-anchored off-canvas panel — the "view details without leaving
 * the list" pattern (list on the left/behind, a panel slides in from the
 * right showing one record's full detail). This is a **new UI pattern**
 * for the project: every previous off-canvas surface
 * (`MobileNavDrawer`, Sprint 06) opens from the *left* and shows
 * *navigation*; this one opens from the *right* and shows *content*
 * (one record's details) — a different purpose, so it's a new,
 * generically-named component rather than a copy-pasted variant of
 * `MobileNavDrawer`.
 *
 * Promoted to `components/common/` (not kept inside
 * `features/admin/components/customers/`) because "show one record's
 * details in a slide-over" has no customer-specific logic —
 * `CustomerDetailsPanel` (this sprint) is its first consumer, but a
 * future Order details view, Book quick-view, or any other "click a row,
 * see more" flow reuses this exact shell.
 *
 * Built with the same dependency-light, hand-rolled accessibility
 * `MobileNavDrawer` already established, adapted for a right-anchored
 * panel: `role="dialog"` + `aria-modal` + `aria-labelledby`, Escape-to-
 * close, body-scroll lock while open, and a real `<button>` scrim (so the
 * backdrop is keyboard/screen-reader reachable, not just a click
 * target). Same known, documented gap as `MobileNavDrawer`: no focus trap
 * (Tab can escape into the page behind it) — intentionally not built for
 * the same reason (avoiding a general-purpose dialog/focus-trap
 * dependency), flagged here rather than silently shipped as complete.
 */
export function SlideOverPanel({ open, onClose, title, description, children, footer, className }: SlideOverPanelProps) {
  const CloseIcon = getIcon("close");

  useEffect(() => {
    if (!open) return;

    function handleKeyDown(event: KeyboardEvent) {
      if (event.key === "Escape") onClose();
    }

    document.addEventListener("keydown", handleKeyDown);
    document.body.style.overflow = "hidden";

    return () => {
      document.removeEventListener("keydown", handleKeyDown);
      document.body.style.overflow = "";
    };
  }, [open, onClose]);

  if (!open) return null;

  return (
    <div className="fixed inset-0 z-50">
      {/* Scrim */}
      <button
        type="button"
        onClick={onClose}
        aria-label="Close panel"
        className="absolute inset-0 h-full w-full bg-foreground/40 backdrop-blur-sm"
      />

      {/* Panel */}
      <div
        role="dialog"
        aria-modal="true"
        aria-labelledby="slide-over-panel-title"
        className={cn(
          "absolute inset-y-0 right-0 flex w-full max-w-md flex-col bg-card shadow-xl",
          "animate-in slide-in-from-right duration-200",
          className
        )}
      >
        <div className="flex items-start justify-between gap-3 border-b border-border px-5 py-4">
          <div>
            <h2 id="slide-over-panel-title" className="text-base font-semibold text-foreground">
              {title}
            </h2>
            {description && <p className="text-sm text-muted-foreground">{description}</p>}
          </div>
          <button
            type="button"
            onClick={onClose}
            aria-label="Close panel"
            className="rounded-md p-2 text-muted-foreground transition-colors hover:bg-accent hover:text-accent-foreground focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2"
          >
            <CloseIcon className="h-5 w-5" aria-hidden="true" />
          </button>
        </div>

        <div className="flex-1 overflow-y-auto px-5 py-4">{children}</div>

        {footer && <div className="border-t border-border px-5 py-4">{footer}</div>}
      </div>
    </div>
  );
}
