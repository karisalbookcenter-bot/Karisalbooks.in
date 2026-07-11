import { ROUTES } from "@/constants/routes.constants";
import type { NavigationItemRecord, NavigationMenu } from "@/types/navigation.types";
import { buildNavigationTree } from "@/lib/helpers/menu.helpers";

/**
 * Main header navigation — CMS Foundation (Day 4).
 *
 * This is a flat list of records, deliberately shaped like rows a future
 * `navigation_items` database table would hold (see `NavigationItemRecord`).
 * Today it is hardcoded here; later, an admin panel writes to that table
 * instead, and this file's only remaining job is to provide a fallback/
 * seed data set. See `docs/DYNAMIC_NAVIGATION_CMS.md` for the full plan.
 *
 * Required items, in order: Home, Books, Competitive Exams, Publication
 * Services, Offer Zone, Pre Booking, About, Contact.
 *
 * All items are top-level today (`parent: null`), but the model supports
 * unlimited nesting — e.g. "Books" could later get children built from the
 * Day 2 `categories` table without any type or shape change here.
 */
const mainNavigationItems: NavigationItemRecord[] = [
  {
    id: "home",
    title: "Home",
    slug: ROUTES.HOME,
    icon: "home",
    order: 1,
    visible: true,
    parent: null,
  },
  {
    id: "books",
    title: "Books",
    slug: ROUTES.BOOKS,
    icon: "book-open",
    order: 2,
    visible: true,
    parent: null,
  },
  {
    id: "competitive-exams",
    title: "Competitive Exams",
    slug: ROUTES.COMPETITIVE_EXAMS,
    icon: "graduation-cap",
    order: 3,
    visible: true,
    parent: null,
  },
  {
    id: "publication-services",
    title: "Publication Services",
    slug: ROUTES.PUBLICATION_SERVICES,
    icon: "printer",
    order: 4,
    visible: true,
    parent: null,
  },
  {
    id: "offer-zone",
    title: "Offer Zone",
    slug: ROUTES.OFFER_ZONE,
    icon: "tag",
    order: 5,
    visible: true,
    parent: null,
  },
  {
    id: "pre-booking",
    title: "Pre Booking",
    slug: ROUTES.PRE_BOOKING,
    icon: "calendar-clock",
    order: 6,
    visible: true,
    parent: null,
  },
  {
    id: "about",
    title: "About",
    slug: ROUTES.ABOUT,
    icon: "info",
    order: 7,
    visible: true,
    parent: null,
  },
  {
    id: "contact",
    title: "Contact",
    slug: ROUTES.CONTACT,
    icon: "mail",
    order: 8,
    visible: true,
    parent: null,
  },
];

export const mainNavigation: NavigationMenu = {
  id: "main",
  items: mainNavigationItems,
};

/** Convenience export for anything that only needs the raw, flat record list. */
export const MAIN_NAVIGATION_ITEMS = mainNavigationItems;

/** Convenience export for anything that wants the pre-assembled tree without
 *  running feature-flag filtering (use `resolveNavigationTree` from the menu
 *  helpers instead if flag-gating is needed). */
export const MAIN_NAVIGATION_TREE = buildNavigationTree(mainNavigationItems);
