import type { User } from "@supabase/supabase-js";

import { createClient } from "@/lib/supabase/server";
import { DEFAULT_ROLE, isAtLeastRole, type Role } from "@/constants/roles.constants";
import { hasPermission, type Permission } from "@/constants/permissions.constants";
import type { AuthUser } from "@/features/auth/types/auth.types";

/**
 * Session Helper — Sprint 05 (Authentication Foundation).
 *
 * Server-side session/role reading, for use in Server Components, Route
 * Handlers, Server Actions, and middleware — anywhere `@/lib/supabase/server`
 * is appropriate. This is the server-side counterpart to the client-side
 * `auth.service.ts`; the two are kept separate because they run in
 * different Supabase client contexts (browser vs. server), even though the
 * logic they wrap (read the current user, read their role) is conceptually
 * the same operation.
 */

/** Same mapping logic as `auth.service.ts` — role lives in `app_metadata`,
 *  which only a trusted server context can write. */
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

/**
 * Returns the currently authenticated user on the server, or `null` if
 * there is no valid session. Uses `getUser()` (not `getSession()`) because
 * `getUser()` revalidates the token against Supabase Auth itself rather
 * than trusting a cookie's contents — the correct choice whenever a
 * server context is about to make an authorization decision.
 */
export async function getServerAuthUser(): Promise<AuthUser | null> {
  const supabase = await createClient();
  const {
    data: { user },
    error,
  } = await supabase.auth.getUser();

  if (error || !user) return null;

  return mapSupabaseUserToAuthUser(user);
}

/** Convenience boolean for the common "is anyone logged in?" check. */
export async function isAuthenticated(): Promise<boolean> {
  const user = await getServerAuthUser();
  return user !== null;
}

/** Checks the current server-side user's role against a minimum required
 *  role in the hierarchy (see `ROLE_HIERARCHY` in roles.constants.ts). */
export async function hasMinimumRole(minimumRole: Role): Promise<boolean> {
  const user = await getServerAuthUser();
  if (!user) return false;
  return isAtLeastRole(user.role, minimumRole);
}

/** Checks the current server-side user's role against a specific
 *  permission (see `ROLE_PERMISSIONS` in permissions.constants.ts). */
export async function hasServerPermission(permission: Permission): Promise<boolean> {
  const user = await getServerAuthUser();
  if (!user) return false;
  return hasPermission(user.role, permission);
}
