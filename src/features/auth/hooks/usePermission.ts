"use client";

import { useAuth } from "@/features/auth/hooks/useAuth";
import { hasPermission, type Permission } from "@/constants/permissions.constants";

/**
 * Returns whether the current user holds `permission` (see
 * `ROLE_PERMISSIONS` in `permissions.constants.ts`). Returns `false` while
 * signed out. This is the hook a future admin UI checks before rendering
 * an action, e.g.:
 *
 *   const canManageProducts = usePermission(PERMISSIONS.MANAGE_PRODUCTS);
 */
export function usePermission(permission: Permission): boolean {
  const { user } = useAuth();
  if (!user) return false;
  return hasPermission(user.role, permission);
}
