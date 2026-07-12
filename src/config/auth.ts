import { ROUTES } from "@/constants/routes.constants";
import { ROLES, type Role } from "@/constants/roles.constants";

/**
 * Auth configuration — Sprint 05 (Authentication Foundation).
 *
 * The single place that describes how Supabase Authentication is wired
 * into the app: which internal routes participate in auth redirects, which
 * path prefixes require a session (or an elevated role), and session
 * refresh behavior. Middleware and any future auth-aware code read from
 * here rather than hardcoding these decisions inline.
 *
 * Auth method for this milestone: email + password only
 * (`supabase.auth.signInWithPassword`, see `features/auth/services/auth.service.ts`).
 * OTP, magic link, and social providers (Google/Facebook) are explicitly
 * out of scope this sprint and are not configured here.
 */
export const authConfig = {
  routes: {
    /** Where an unauthenticated user is sent when a protected route
     *  requires a session. The page itself is not built this sprint. */
    login: ROUTES.LOGIN,
    /** Where an authenticated-but-insufficiently-privileged user is sent. */
    unauthorized: ROUTES.UNAUTHORIZED,
    /** Where a user lands after a future login form succeeds. */
    afterLogin: ROUTES.HOME,
    /** Where a user lands after signing out. */
    afterLogout: ROUTES.HOME,
  },

  /**
   * Path prefixes that require *any* authenticated session (any role).
   * Intentionally empty today — no protected page exists yet (a future
   * customer "Account" area would add "/account" here once it's built).
   * Middleware still runs on every route to keep the session cookie fresh;
   * this list only controls whether a *redirect* fires.
   */
  protectedRoutePrefixes: [] as string[],

  /**
   * Path prefixes that require at least `minimumAdminRole`. Intentionally
   * empty today — the Admin Dashboard is a future milestone and out of
   * scope this sprint. Populate with a route constant (e.g. `ROUTES.ADMIN`)
   * once that milestone adds one, rather than a hardcoded string.
   */
  adminRoutePrefixes: [] as string[],

  /** Minimum role allowed into any path matching `adminRoutePrefixes`. */
  minimumAdminRole: ROLES.STAFF as Role,

  /** If the access token expires within this many seconds, middleware's
   *  session refresh is considered due. Supabase's SSR client handles the
   *  actual refresh; this documents the intended margin. */
  sessionRefreshMarginSeconds: 60,
} as const;

export type AuthConfig = typeof authConfig;
