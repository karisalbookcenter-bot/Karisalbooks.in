import type { AppRoute } from "@/constants/routes.constants";

/**
 * Shape of a single navigation entry. `children` is optional and supports
 * future dropdown/mega-menu navigation (e.g. "Books" expanding into the
 * categories/subcategories tree from the Day 2 database) without requiring
 * a breaking change to this interface later.
 */
export interface NavigationItem {
  /** Stable identifier, e.g. "books" — used as a React key, not shown to users. */
  id: string;
  /** Text shown to the user, e.g. "Books". */
  label: string;
  /** Internal path, drawn from the centralized ROUTES constant. */
  href: AppRoute;
  /** Controls display order in the rendered menu (ascending). */
  order: number;
  /** Whether this item should currently render. Lets an item be defined
   *  ahead of time and toggled on later without deleting/re-adding it. */
  isVisible: boolean;
  /** Optional nested items for a future dropdown/mega-menu. */
  children?: NavigationItem[];
}

/** A full named navigation menu (e.g. the main header nav, a future footer nav). */
export interface NavigationConfig {
  id: string;
  items: NavigationItem[];
}
