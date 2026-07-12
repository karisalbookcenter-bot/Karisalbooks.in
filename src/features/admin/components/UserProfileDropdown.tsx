"use client";

import { useEffect, useRef, useState } from "react";
import { User, Settings, LogOut } from "lucide-react";
import { cn } from "@/lib/utils";
import type { AdminUserSummary } from "@/features/admin/types/admin-layout.types";

export interface UserProfileDropdownProps {
  /** Defaults to a placeholder identity — a future sprint replaces this
   *  with the real, signed-in `AuthUser` from `@/features/auth`. */
  user?: AdminUserSummary;
  className?: string;
}

const PLACEHOLDER_USER: AdminUserSummary = {
  name: "Admin User",
  email: "admin@karisalbooks.in",
};

function getInitials(name: string): string {
  return name
    .split(" ")
    .map((part) => part[0])
    .slice(0, 2)
    .join("")
    .toUpperCase();
}

/**
 * UserProfileDropdown — Sprint 06 (Task 8).
 *
 * **UI only, as required — no auth action is wired up.** The "Sign out"
 * row is rendered and focusable, but its `onClick` deliberately does
 * nothing beyond closing the menu; a comment marks exactly where a future
 * sprint wires it to `AuthService.signOut()` (`@/features/auth/services/auth.service`)
 * plus a redirect to `authConfig.routes.afterLogout`. Building it fully
 * functional today would mean this component depends on a signed-in
 * session existing, which is out of scope for a layout-only sprint.
 *
 * Shows a placeholder identity (`PLACEHOLDER_USER`) until a real one is
 * passed in — once `AuthProvider` is mounted in a future sprint, a caller
 * passes `user={session.user}` (mapped to `AdminUserSummary`) instead.
 *
 * Built with plain state + a click-outside/Escape handler rather than a
 * Radix `DropdownMenu`, consistent with this project's dependency-light
 * component approach.
 */
export function UserProfileDropdown({ user = PLACEHOLDER_USER, className }: UserProfileDropdownProps) {
  const [open, setOpen] = useState(false);
  const containerRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    if (!open) return;

    function handlePointerDown(event: MouseEvent) {
      if (containerRef.current && !containerRef.current.contains(event.target as Node)) {
        setOpen(false);
      }
    }

    function handleKeyDown(event: KeyboardEvent) {
      if (event.key === "Escape") setOpen(false);
    }

    document.addEventListener("mousedown", handlePointerDown);
    document.addEventListener("keydown", handleKeyDown);
    return () => {
      document.removeEventListener("mousedown", handlePointerDown);
      document.removeEventListener("keydown", handleKeyDown);
    };
  }, [open]);

  return (
    <div ref={containerRef} className={cn("relative", className)}>
      <button
        type="button"
        onClick={() => setOpen((prev) => !prev)}
        aria-haspopup="menu"
        aria-expanded={open}
        aria-label="Open user menu"
        className="flex items-center gap-2 rounded-full p-1 pr-2 text-sm transition-colors hover:bg-accent focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2 focus-visible:ring-offset-background"
      >
        <span className="flex h-8 w-8 items-center justify-center rounded-full bg-primary text-xs font-semibold text-primary-foreground">
          {getInitials(user.name)}
        </span>
        <span className="hidden max-w-[8rem] truncate font-medium text-foreground sm:inline">
          {user.name}
        </span>
      </button>

      {open && (
        <div
          role="menu"
          aria-label="User menu"
          className="absolute right-0 z-40 mt-2 w-56 overflow-hidden rounded-md border border-border bg-popover text-popover-foreground shadow-lg animate-in fade-in zoom-in-95 duration-150"
        >
          <div className="border-b border-border px-3 py-2.5">
            <p className="truncate text-sm font-medium">{user.name}</p>
            <p className="truncate text-xs text-muted-foreground">{user.email}</p>
          </div>

          <div className="p-1">
            <button
              type="button"
              role="menuitem"
              onClick={() => setOpen(false)}
              className="flex w-full items-center gap-2 rounded-sm px-2.5 py-2 text-left text-sm text-foreground transition-colors hover:bg-accent hover:text-accent-foreground"
            >
              <User className="h-4 w-4" aria-hidden="true" />
              Profile
            </button>
            <button
              type="button"
              role="menuitem"
              onClick={() => setOpen(false)}
              className="flex w-full items-center gap-2 rounded-sm px-2.5 py-2 text-left text-sm text-foreground transition-colors hover:bg-accent hover:text-accent-foreground"
            >
              <Settings className="h-4 w-4" aria-hidden="true" />
              Account settings
            </button>
          </div>

          <div className="border-t border-border p-1">
            <button
              type="button"
              role="menuitem"
              onClick={() => {
                // Intentionally a no-op this sprint — UI only, per task 8.
                // Future wiring: await AuthService.signOut(); then redirect
                // to authConfig.routes.afterLogout.
                setOpen(false);
              }}
              className="flex w-full items-center gap-2 rounded-sm px-2.5 py-2 text-left text-sm text-destructive transition-colors hover:bg-destructive/10"
            >
              <LogOut className="h-4 w-4" aria-hidden="true" />
              Sign out
            </button>
          </div>
        </div>
      )}
    </div>
  );
}
