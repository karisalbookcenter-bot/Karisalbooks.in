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
