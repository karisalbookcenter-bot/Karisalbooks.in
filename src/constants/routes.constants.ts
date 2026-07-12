/**
 * Centralized route path constants.
 *
 * This is the single source of truth for every internal URL in the app.
 * No component, config, or feature module should ever hardcode a path
 * string like "/books" — they import ROUTES.BOOKS from here instead.
 * That way, renaming a URL later is a one-line change in this file.
 *
 * NOTE: This file only defines paths. It does not create the pages that
 * live at these paths — that is out of scope for this milestone.
 */

export const ROUTES = {
  HOME: "/",
  BOOKS: "/books",
  COMPETITIVE_EXAMS: "/competitive-exams",
  PUBLICATION_SERVICES: "/publication-services",
  OFFER_ZONE: "/offer-zone",
  PRE_BOOKING: "/pre-booking",
  CONTACT: "/contact",
  ABOUT: "/about",

  // Auth-related redirect targets (Sprint 05). These are path constants
  // only — the login page, unauthorized page, etc. are NOT created in
  // this milestone. Added here because the middleware architecture built
  // today needs somewhere to redirect an unauthenticated/unauthorized
  // request to; the pages themselves come later.
  LOGIN: "/login",
  UNAUTHORIZED: "/unauthorized",

  // Admin route constants (Sprint 06). Added because the Admin Sidebar
  // navigation config built today needs real link targets — no admin
  // page/route actually exists at any of these paths yet (that's future
  // work); this is only the centralized path list the sidebar points at.
  ADMIN_DASHBOARD: "/admin",
  ADMIN_BOOKS: "/admin/books",
  ADMIN_CATEGORIES: "/admin/categories",
  ADMIN_AUTHORS: "/admin/authors",
  ADMIN_PUBLISHERS: "/admin/publishers",
  ADMIN_COMPETITIVE_EXAMS: "/admin/competitive-exams",
  ADMIN_PUBLICATION_SERVICES: "/admin/publication-services",
  ADMIN_ORDERS: "/admin/orders",
  ADMIN_CUSTOMERS: "/admin/customers",
  ADMIN_COUPONS: "/admin/coupons",
  ADMIN_OFFER_ZONE: "/admin/offer-zone",
  ADMIN_PRE_BOOKING: "/admin/pre-booking",
  ADMIN_SHIPPING: "/admin/shipping",
  ADMIN_REPORTS: "/admin/reports",
  ADMIN_SETTINGS: "/admin/settings",
} as const;

/**
 * Union type of every known route path, e.g. "/" | "/books" | "/about" ...
 * Useful anywhere a function should only accept a valid internal path.
 */
export type AppRoute = (typeof ROUTES)[keyof typeof ROUTES];

/**
 * Route "keys" (e.g. "HOME", "BOOKS") — useful when code needs to refer to
 * a route by name rather than by its literal path string.
 */
export type RouteKey = keyof typeof ROUTES;
