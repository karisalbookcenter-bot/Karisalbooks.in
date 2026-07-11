/**
 * Feature flags — Day 4.
 *
 * A single, typed source of truth for which not-yet-fully-built features
 * are switched on. Any feature module, or the navigation menu helpers,
 * reads a flag from here rather than checking scattered conditions.
 *
 * Note: Day 3's `src/config/settings.ts` already introduced an early,
 * similarly-shaped `features` object (`preBookingEnabled`, etc.) as part of
 * general business settings. This file is today's authoritative, dedicated
 * feature-flag surface, matching the exact flags requested for the CMS
 * foundation. `settings.ts` is left untouched per today's scope ("only
 * update files related to today's task") — a future cleanup pass can
 * consolidate the two into one, and that recommendation is written up in
 * today's documentation rather than acted on here.
 */

export interface FeatureFlags {
  /** Shows/enables the Offer Zone section and its nav item. */
  enableOffers: boolean;
  /** Shows/enables the Pre Booking flow and its nav item. */
  enablePreBooking: boolean;
  /** Shows/enables the Publication Services section and its nav item. */
  enablePublicationServices: boolean;
  /** Shows/enables wishlist functionality (no nav item today — this flag
   *  exists ahead of the feature itself, so it can be wired in later
   *  without adding a new config surface at that point). */
  enableWishlist: boolean;
}

export const featureFlags: FeatureFlags = {
  enableOffers: false,
  enablePreBooking: false,
  enablePublicationServices: false,
  enableWishlist: false,
};

/**
 * Maps a navigation item's `id` to the feature flag that gates its
 * visibility, for use by `filterByFeatureFlags` in the menu helpers. An
 * item not listed here is never flag-gated (always shown, subject only to
 * its own `visible` field).
 */
export const NAV_ITEM_FEATURE_FLAG_MAP: Partial<Record<string, keyof FeatureFlags>> = {
  "offer-zone": "enableOffers",
  "pre-booking": "enablePreBooking",
  "publication-services": "enablePublicationServices",
};
