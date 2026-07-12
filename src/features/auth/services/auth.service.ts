import type { User, Session } from "@supabase/supabase-js";

import { createClient } from "@/lib/supabase/client";
import { DEFAULT_ROLE, type Role } from "@/constants/roles.constants";
import type {
  AuthResult,
  AuthSession,
  AuthUser,
  SignInCredentials,
} from "@/features/auth/types/auth.types";

/**
 * Auth Service — Sprint 05 (Authentication Foundation).
 *
 * A thin, typed wrapper around `@supabase/supabase-js`'s auth methods, for
 * use in Client Components. This is the one place that talks to
 * `supabase.auth.*` directly; everything else in the app (future hooks,
 * future login/logout UI) goes through this service instead, so the
 * Supabase SDK is only imported in one spot.
 *
 * No login/register/forgot-password PAGE calls this yet — that UI is a
 * later milestone. This file only provides the reusable functions such a
 * page will eventually call.
 */

/**
 * Extracts the app's `Role` from a raw Supabase `User`. Role is read from
 * `app_metadata.role` — `app_metadata` (unlike `user_metadata`) can only be
 * written by a trusted server context (e.g. a future admin action or a
 * database trigger), never by the end user themselves, which is exactly
 * the property a role needs. Falls back to the default role if unset,
 * which will be the common case until role-assignment is built.
 */
function mapSupabaseUserToAuthUser(user: User): AuthUser {
  const role = (user.app_metadata?.role as Role | undefined) ?? DEFAULT_ROLE;

  return {
    id: user.id,
    email: user.email ?? null,
    role,
    emailVerified: user.email_confirmed_at != null,
    createdAt: user.created_at,
  };
}

/** Maps a raw Supabase `Session` into the app's `AuthSession` shape. */
function mapSupabaseSession(session: Session): AuthSession {
  return {
    user: mapSupabaseUserToAuthUser(session.user),
    expiresAt: session.expires_at ? session.expires_at * 1000 : null,
  };
}

/**
 * Signs a user in with email + password. Returns the app's `AuthResult`
 * shape rather than throwing, so callers (a future hook, a future login
 * form) handle success/failure uniformly.
 */
export async function signInWithPassword(
  credentials: SignInCredentials
): Promise<AuthResult<AuthSession>> {
  const supabase = createClient();

  const { data, error } = await supabase.auth.signInWithPassword({
    email: credentials.email,
    password: credentials.password,
  });

  if (error || !data.session) {
    return {
      data: null,
      error: { message: error?.message ?? "Sign in failed." },
    };
  }

  return { data: mapSupabaseSession(data.session), error: null };
}

/** Signs the current user out, clearing their session. */
export async function signOut(): Promise<AuthResult<null>> {
  const supabase = createClient();
  const { error } = await supabase.auth.signOut();

  if (error) {
    return { data: null, error: { message: error.message } };
  }

  return { data: null, error: null };
}

/** Reads the current session on the client, if any. */
export async function getCurrentSession(): Promise<AuthResult<AuthSession | null>> {
  const supabase = createClient();
  const { data, error } = await supabase.auth.getSession();

  if (error) {
    return { data: null, error: { message: error.message } };
  }

  return {
    data: data.session ? mapSupabaseSession(data.session) : null,
    error: null,
  };
}

/**
 * Subscribes to auth state changes (sign-in, sign-out, token refresh).
 * Returns an unsubscribe function — callers (e.g. `useAuth`) are
 * responsible for calling it on cleanup.
 */
export function onAuthStateChange(
  callback: (session: AuthSession | null) => void
): () => void {
  const supabase = createClient();

  const { data } = supabase.auth.onAuthStateChange((_event, session) => {
    callback(session ? mapSupabaseSession(session) : null);
  });

  return () => data.subscription.unsubscribe();
}

/** Grouped export for callers that prefer a single namespace import,
 *  e.g. `AuthService.signInWithPassword(...)`. */
export const AuthService = {
  signInWithPassword,
  signOut,
  getCurrentSession,
  onAuthStateChange,
};
