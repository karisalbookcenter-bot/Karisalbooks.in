/**
 * Role definitions — Sprint 05 (Authentication Foundation).
 *
 * Centralized here (not inside `features/auth/`) because roles are a
 * cross-cutting concern: the future Admin Dashboard, Product Management,
 * Order Management, and other milestones will all need to check "is this
 * user at least an Admin?" without importing from the auth feature folder
 * itself. This follows the Day 3 rule: anything used by two or more
 * features is promoted to a shared top-level folder.
 */

export const ROLES = {
  SUPER_ADMIN: "super_admin",
  ADMIN: "admin",
  STAFF: "staff",
  CUSTOMER: "customer",
} as const;

export type Role = (typeof ROLES)[keyof typeof ROLES];

/**
 * Numeric hierarchy level for each role, highest = most privileged.
 * Lets future authorization logic ask "is this role at least as senior as
 * X?" with a single comparison, instead of hardcoding role lists everywhere
 * a check is needed (e.g. `roleLevel(userRole) >= roleLevel(ROLES.ADMIN)`).
 */
export const ROLE_HIERARCHY: Record<Role, number> = {
  [ROLES.SUPER_ADMIN]: 40,
  [ROLES.ADMIN]: 30,
  [ROLES.STAFF]: 20,
  [ROLES.CUSTOMER]: 10,
};

/** Every customer-facing account defaults to this role at sign-up time
 *  (sign-up itself is out of scope this sprint — this constant just
 *  documents the intended default for whenever it's built). */
export const DEFAULT_ROLE: Role = ROLES.CUSTOMER;

/** Returns true if `role` is at least as senior as `minimumRole` in the
 *  hierarchy above. */
export function isAtLeastRole(role: Role, minimumRole: Role): boolean {
  return ROLE_HIERARCHY[role] >= ROLE_HIERARCHY[minimumRole];
}
