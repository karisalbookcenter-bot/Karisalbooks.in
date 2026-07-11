/**
 * CMS configuration — Day 4 foundation.
 *
 * Defines *what shape* future CMS-managed content will take and *what
 * limits* apply, without creating any database table, API, or UI to manage
 * it. Think of this as the schema/contract a future admin panel will be
 * built against — the same relationship `types/common.types.ts` has to the
 * Day 2 database tables.
 */

/** Kinds of content a future CMS will manage. Adding a new kind here is a
 *  documentation/type change today; later it becomes a new admin-panel
 *  section and a new database table. */
export const CMS_CONTENT_TYPES = [
  "navigation_item",
  "page",
  "banner",
  "announcement",
] as const;

export type CmsContentType = (typeof CMS_CONTENT_TYPES)[number];

/** Rules the navigation editor UI (future milestone) must enforce. Kept
 *  here rather than hardcoded in a future component so the limit is
 *  defined once and shared by both validation logic and any UI hint text. */
export const cmsNavigationConfig = {
  /** Sensible practical cap for menu depth, even though the underlying
   *  `NavigationItemRecord` model (see navigation.types.ts) supports
   *  unlimited nesting. A future admin UI should warn, not silently
   *  truncate, past this depth. */
  maxDepth: 3,
  /** Whether an admin can add a nav item that points at an arbitrary
   *  external/custom URL, vs. only ever linking to a known internal route. */
  allowCustomLinks: true,
  /** Whether an admin can attach an icon identifier to a nav item. */
  allowIcons: true,
  /** Fallback icon identifier used when a nav item has `icon: null`. */
  defaultIcon: "circle",
} as const;

/** Generic settings for future simple content blocks (banners,
 *  announcements) — deliberately minimal today; this grows only once a
 *  real feature needs a field it doesn't already list. */
export const cmsContentDefaults = {
  banner: {
    maxActiveCount: 3,
  },
  announcement: {
    maxActiveCount: 1,
  },
} as const;

export const cmsConfig = {
  contentTypes: CMS_CONTENT_TYPES,
  navigation: cmsNavigationConfig,
  contentDefaults: cmsContentDefaults,
} as const;

export type CmsConfig = typeof cmsConfig;
