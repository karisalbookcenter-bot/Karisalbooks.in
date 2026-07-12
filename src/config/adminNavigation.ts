import { ROUTES } from "@/constants/routes.constants";
import type { NavigationItemRecord, NavigationMenu } from "@/types/navigation.types";

/**
 * Admin sidebar navigation — Sprint 06.
 *
 * Reuses the exact `NavigationItemRecord` model from Day 4 (id, title,
 * slug, icon, order, visible, parent) rather than inventing a separate
 * "sidebar item" shape — this menu is built, filtered, and rendered with
 * the same `buildNavigationTree` / `resolveNavigationTree` helpers from
 * `@/lib/helpers/menu.helpers` as the Day 4 public site nav. A future
 * admin-panel navigation editor (see Day 4's CMS foundation docs) would
 * manage this exact list of rows, distinguished from the public menu only
 * by its own `menu.id` ("admin" vs. "main").
 *
 * All items are top-level today (`parent: null`). Nothing stops a future
 * item (e.g. "Reports") from gaining children later without a shape
 * change, the same unlimited-nesting property Day 4 established.
 */
const adminNavigationItems: NavigationItemRecord[] = [
  { id: "admin-dashboard", title: "Dashboard", slug: ROUTES.ADMIN_DASHBOARD, icon: "dashboard", order: 1, visible: true, parent: null },
  { id: "admin-books", title: "Books", slug: ROUTES.ADMIN_BOOKS, icon: "book-open", order: 2, visible: true, parent: null },
  { id: "admin-categories", title: "Categories", slug: ROUTES.ADMIN_CATEGORIES, icon: "folder-tree", order: 3, visible: true, parent: null },
  { id: "admin-authors", title: "Authors", slug: ROUTES.ADMIN_AUTHORS, icon: "users", order: 4, visible: true, parent: null },
  { id: "admin-publishers", title: "Publishers", slug: ROUTES.ADMIN_PUBLISHERS, icon: "building-2", order: 5, visible: true, parent: null },
  { id: "admin-competitive-exams", title: "Competitive Exams", slug: ROUTES.ADMIN_COMPETITIVE_EXAMS, icon: "graduation-cap", order: 6, visible: true, parent: null },
  { id: "admin-publication-services", title: "Publication Services", slug: ROUTES.ADMIN_PUBLICATION_SERVICES, icon: "printer", order: 7, visible: true, parent: null },
  { id: "admin-orders", title: "Orders", slug: ROUTES.ADMIN_ORDERS, icon: "shopping-cart", order: 8, visible: true, parent: null },
  { id: "admin-customers", title: "Customers", slug: ROUTES.ADMIN_CUSTOMERS, icon: "user-circle", order: 9, visible: true, parent: null },
  { id: "admin-coupons", title: "Coupons", slug: ROUTES.ADMIN_COUPONS, icon: "tag", order: 10, visible: true, parent: null },
  { id: "admin-offer-zone", title: "Offer Zone", slug: ROUTES.ADMIN_OFFER_ZONE, icon: "badge-percent", order: 11, visible: true, parent: null },
  { id: "admin-pre-booking", title: "Pre Booking", slug: ROUTES.ADMIN_PRE_BOOKING, icon: "calendar-clock", order: 12, visible: true, parent: null },
  { id: "admin-shipping", title: "Shipping", slug: ROUTES.ADMIN_SHIPPING, icon: "truck", order: 13, visible: true, parent: null },
  { id: "admin-reports", title: "Reports", slug: ROUTES.ADMIN_REPORTS, icon: "bar-chart", order: 14, visible: true, parent: null },
  { id: "admin-settings", title: "Settings", slug: ROUTES.ADMIN_SETTINGS, icon: "settings", order: 15, visible: true, parent: null },
];

export const adminNavigation: NavigationMenu = {
  id: "admin",
  items: adminNavigationItems,
};

export const ADMIN_NAVIGATION_ITEMS = adminNavigationItems;
