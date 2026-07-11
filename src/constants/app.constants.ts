/**
 * Centralized, non-route constants used across the app.
 * Anything that would otherwise be a "magic string" or "magic number"
 * scattered across features belongs here instead.
 */

/** Generic record status values, mirrored from the database enum
 *  `record_status` created in the Day 2 SQL migration. Keeping this in
 *  sync with the DB enum means the frontend and database never disagree
 *  about what a valid status is. */
export const RECORD_STATUS = {
  ACTIVE: "active",
  INACTIVE: "inactive",
  ARCHIVED: "archived",
} as const;

/** Default pagination values used by any future list/grid feature. */
export const PAGINATION_DEFAULTS = {
  PAGE: 1,
  PAGE_SIZE: 20,
  MAX_PAGE_SIZE: 100,
} as const;

/** Generic, reusable UI copy that isn't tied to one specific feature.
 *  Feature-specific copy belongs inside that feature's own folder instead. */
export const MESSAGES = {
  GENERIC_ERROR: "Something went wrong. Please try again.",
  LOADING: "Loading...",
  NO_RESULTS: "No results found.",
} as const;

/** Date/number formatting locale used throughout the app. */
export const LOCALE = "en-IN";

/** Currency used throughout the app (India-first storefront). */
export const CURRENCY = {
  CODE: "INR",
  SYMBOL: "\u20B9",
} as const;
