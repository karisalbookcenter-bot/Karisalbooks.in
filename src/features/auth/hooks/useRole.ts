"use client";

import { useAuth } from "@/features/auth/hooks/useAuth";
import { isAtLeastRole, type Role } from "@/constants/roles.constants";

/** Returns the current user's role, or `null` if signed out. */
export function useRole(): Role | null {
  const { user } = useAuth();
  return user?.role ?? null;
}

/**
 * Returns whether the current user's role is at least as senior as
 * `minimumRole` (see `ROLE_HIERARCHY` in `roles.constants.ts`). Returns
 * `false` while signed out. Useful for a future component like:
 *
 *   const canSeeAdminLink = useHasMinimumRole(ROLES.STAFF);
 */
export function useHasMinimumRole(minimumRole: Role): boolean {
  const role = useRole();
  if (!role) return false;
  return isAtLeastRole(role, minimumRole);
}
