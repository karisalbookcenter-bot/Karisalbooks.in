import { CURRENCY, LOCALE, PAGINATION_DEFAULTS } from "@/constants/app.constants";

/**
 * Business/feature-behavior settings — distinct from `app.ts` (site identity)
 * and `navigation.ts` (menu structure). This is where toggles and defaults
 * that affect *behavior* live, so a future feature reads one flag from here
 * instead of a hardcoded value buried in its own code.
 */
export const settings = {
  currency: CURRENCY,
  locale: LOCALE,
  pagination: PAGINATION_DEFAULTS,

  /**
   * Feature flags. Every upcoming feature ships behind a flag defaulted to
   * `false` here, so this milestone can add the config surface for a
   * feature (like Pre Booking) without turning any real functionality on.
   */
  features: {
    preBookingEnabled: false,
    offerZoneEnabled: false,
    publicationServicesEnabled: false,
  },
} as const;

export type Settings = typeof settings;
