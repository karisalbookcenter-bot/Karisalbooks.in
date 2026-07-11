/**
 * App-level configuration: identity and metadata for KarisalBooks.in.
 * Anything a page's <head>/SEO or a future layout needs about "what is
 * this site" should be read from here rather than hardcoded inline.
 */

export const appConfig = {
  name: "KarisalBooks.in",
  shortName: "KarisalBooks",
  description:
    "KarisalBooks.in — books, competitive exam materials, and publication services.",
  url: "https://karisalbooks.in",
  defaultLocale: "en-IN",
  contact: {
    email: "support@karisalbooks.in",
    phone: "",
  },
  social: {
    facebook: "",
    instagram: "",
    twitter: "",
    youtube: "",
  },
} as const;

export type AppConfig = typeof appConfig;
