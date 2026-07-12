import type { Role } from "@/constants/roles.constants";

/**
 * Auth types — Sprint 05 (Authentication Foundation).
 *
 * These describe the shape of an authenticated user/session as the rest of
 * the app will consume it — deliberately a thin, app-specific wrapper
 * around whatever `@supabase/supabase-js` returns, so feature code depends
 * on `AuthUser`/`AuthSession` (stable, ours) rather than directly on
 * Supabase's SDK types (which can change between SDK versions).
 */

/** The authenticated user, as the rest of the app should consume it. */
export interface AuthUser {
  id: string; // Supabase auth user id (UUID)
  email: string | null;
  role: Role;
  /** True once email ownership has been confirmed. Relevant even before
   *  an actual email-verification flow is built, since Supabase surfaces
   *  this on the user object today. */
  emailVerified: boolean;
  createdAt: string; // ISO timestamp
}

/** The current auth session — a user plus token lifetime info. */
export interface AuthSession {
  user: AuthUser;
  /** Unix ms timestamp the current access token expires at. */
  expiresAt: number | null;
}

/**
 * Client-side auth state as exposed by `useAuth()`. `status` is the
 * primary thing UI (once built) branches on, rather than juggling several
 * booleans that could contradict each other.
 */
export type AuthStatus = "loading" | "authenticated" | "unauthenticated";

export interface AuthState {
  status: AuthStatus;
  user: AuthUser | null;
  session: AuthSession | null;
}

/**
 * Input shape for an email/password sign-in call. Defined here so
 * `AuthService.signInWithPassword` has a typed parameter today — the
 * actual login form/page that collects these values is a later milestone.
 */
export interface SignInCredentials {
  email: string;
  password: string;
}

/** Consistent result shape for auth operations, mirroring the app-wide
 *  `ApiResponse<T>` pattern from `@/types/common.types` but scoped to auth
 *  so callers get an `AuthUser`/`AuthSession` typed result rather than a
 *  generic payload. */
export type AuthResult<T> =
  | { data: T; error: null }
  | { data: null; error: { message: string; code?: string } };
