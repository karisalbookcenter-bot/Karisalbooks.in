import { getIcon } from "@/lib/icons";
import { cn } from "@/lib/utils";
import type { WelcomeBannerProps } from "@/features/admin/types/dashboard.types";

const PLACEHOLDER_NAME = "Admin";

/**
 * WelcomeBanner — Sprint 07 (Task 7).
 *
 * A greeting strip at the top of the dashboard. Shows a placeholder name
 * ("Welcome back, Admin") until a real `user` prop is supplied — the same
 * pattern `UserProfileDropdown` (Sprint 06) established, rather than
 * reading from `useAuth()` directly, since no page currently wraps the
 * admin shell in `<AuthProvider>` and this component needs to render
 * safely on its own either way.
 */
export function WelcomeBanner({ user, className }: WelcomeBannerProps) {
  const SparklesIcon = getIcon("sparkles");
  const name = user?.name ?? PLACEHOLDER_NAME;

  return (
    <div
      className={cn(
        "flex items-center gap-3 rounded-lg border border-border bg-gradient-to-r from-primary/10 to-transparent p-5",
        className
      )}
    >
      <span className="flex h-10 w-10 shrink-0 items-center justify-center rounded-full bg-primary text-primary-foreground">
        <SparklesIcon className="h-5 w-5" aria-hidden="true" />
      </span>
      <div>
        <h1 className="text-lg font-semibold text-foreground">Welcome back, {name}</h1>
        <p className="text-sm text-muted-foreground">
          Here&apos;s an overview of your store. This dashboard is a framework —
          real data connects in a future sprint.
        </p>
      </div>
    </div>
  );
}
