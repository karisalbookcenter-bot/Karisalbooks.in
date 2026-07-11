import { ROUTES } from "@/constants/routes.constants";
import type { NavigationItem, NavigationConfig } from "@/types/navigation.types";

/**
 * Main header navigation, in required display order:
 * Home, Books, Competitive Exams, Publication Services, Offer Zone,
 * Pre Booking, Contact, About.
 *
 * This is pure configuration data — no component here renders it.
 * A future layout/header component will simply map over
 * `mainNavigation.items` to render menu links.
 */
const mainNavigationItems: NavigationItem[] = [
  {
    id: "home",
    label: "Home",
    href: ROUTES.HOME,
    order: 1,
    isVisible: true,
  },
  {
    id: "books",
    label: "Books",
    href: ROUTES.BOOKS,
    order: 2,
    isVisible: true,
    // `children` intentionally left undefined for now. Once the categories
    // feature reads from the Day 2 `categories`/`subcategories` tables, this
    // can be populated for a dropdown/mega-menu without changing the type.
  },
  {
    id: "competitive-exams",
    label: "Competitive Exams",
    href: ROUTES.COMPETITIVE_EXAMS,
    order: 3,
    isVisible: true,
  },
  {
    id: "publication-services",
    label: "Publication Services",
    href: ROUTES.PUBLICATION_SERVICES,
    order: 4,
    isVisible: true,
  },
  {
    id: "offer-zone",
    label: "Offer Zone",
    href: ROUTES.OFFER_ZONE,
    order: 5,
    isVisible: true,
  },
  {
    id: "pre-booking",
    label: "Pre Booking",
    href: ROUTES.PRE_BOOKING,
    order: 6,
    isVisible: true,
  },
  {
    id: "contact",
    label: "Contact",
    href: ROUTES.CONTACT,
    order: 7,
    isVisible: true,
  },
  {
    id: "about",
    label: "About",
    href: ROUTES.ABOUT,
    order: 8,
    isVisible: true,
  },
];

export const mainNavigation: NavigationConfig = {
  id: "main",
  items: mainNavigationItems,
};

/** Convenience export for anything that only needs the raw item list. */
export const MAIN_NAVIGATION_ITEMS = mainNavigationItems;
