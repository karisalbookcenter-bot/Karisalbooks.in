import { ROLES, type Role } from "@/constants/roles.constants";

/**
 * Permission constants — Sprint 05 (Authentication Foundation).
 *
 * Roles answer "who is this user?"; permissions answer "what is this user
 * allowed to do?" Keeping both separate (rather than checking role names
 * directly in feature code) means a future feature checks
 * `hasPermission(role, PERMISSIONS.MANAGE_PRODUCTS)` instead of
 * `role === "admin" || role === "super_admin"` — so adding a new role later,
 * or regranting a permission to a different role, is a one-line change here
 * instead of a hunt through every feature.
 *
 * These are named ahead of the features that will use them
 * (Product Management, Orders, etc. are future milestones) so that when
 * those milestones arrive, the permission already exists and only needs to
 * be checked, not designed.
 */
export const PERMISSIONS = {
  // Content / navigation (Day 4 CMS foundation)
  MANAGE_NAVIGATION: "manage:navigation",
  MANAGE_CONTENT: "manage:content",

  // Catalog (future milestones)
  MANAGE_CATEGORIES: "manage:categories",
  MANAGE_PRODUCTS: "manage:products",

  // Commerce (future milestones)
  MANAGE_ORDERS: "manage:orders",
  VIEW_ORDERS: "view:orders",

  // People (future milestones)
  MANAGE_USERS: "manage:users",
  MANAGE_STAFF: "manage:staff",

  // Admin surface access
  ACCESS_ADMIN_DASHBOARD: "access:admin_dashboard",
} as const;

export type Permission = (typeof PERMISSIONS)[keyof typeof PERMISSIONS];

/**
 * Which permissions each role holds. Super Admin implicitly has every
 * permission (checked separately in `hasPermission`, not by listing all of
 * them here) so this table doesn't need updating every time a new
 * permission is added.
 */
export const ROLE_PERMISSIONS: Record<Role, Permission[]> = {
  [ROLES.SUPER_ADMIN]: [], // implicit: all permissions — see hasPermission()
  [ROLES.ADMIN]: [
    PERMISSIONS.MANAGE_NAVIGATION,
    PERMISSIONS.MANAGE_CONTENT,
    PERMISSIONS.MANAGE_CATEGORIES,
    PERMISSIONS.MANAGE_PRODUCTS,
    PERMISSIONS.MANAGE_ORDERS,
    PERMISSIONS.VIEW_ORDERS,
    PERMISSIONS.MANAGE_STAFF,
    PERMISSIONS.ACCESS_ADMIN_DASHBOARD,
  ],
  [ROLES.STAFF]: [
    PERMISSIONS.MANAGE_CONTENT,
    PERMISSIONS.VIEW_ORDERS,
    PERMISSIONS.ACCESS_ADMIN_DASHBOARD,
  ],
  [ROLES.CUSTOMER]: [],
};

/**
 * Checks whether `role` holds `permission`. Super Admin always returns
 * true, so it never needs to be kept in sync with every permission added
 * to `PERMISSIONS` over time.
 */
export function hasPermission(role: Role, permission: Permission): boolean {
  if (role === ROLES.SUPER_ADMIN) return true;
  return ROLE_PERMISSIONS[role]?.includes(permission) ?? false;
}
