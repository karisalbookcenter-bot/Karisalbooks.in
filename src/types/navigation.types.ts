/**
 * Navigation types — CMS Foundation (Day 4).
 *
 * These are intentionally shaped like a future database row (flat, with a
 * self-referencing `parent` id) rather than a pre-nested tree, mirroring
 * the same adjacency-list pattern used by `categories` in the Day 2 SQL
 * migration (`parent_id`, unlimited nesting via recursive query). That
 * means a future `navigation_items` table can use this exact shape as its
 * row type, and an admin panel can manage it as flat rows in a table UI —
 * no nested-JSON editing required.
 *
 * `NavigationItemRecord` = what is stored (or, today, hardcoded as config).
 * `NavigationItemNode`   = what is rendered, built from records at runtime
 *                          by the menu helpers in `@/lib/helpers/menu.helpers`.
 */

/**
 * A single navigation entry, as it would be stored — one row, no nested
 * children. This is the shape both today's static config and a future
 * `navigation_items` database table should use.
 */
export interface NavigationItemRecord {
  /** Stable identifier (would be the row's UUID in a future database table). */
  id: string;
  /** Text shown to the user, e.g. "Books". */
  title: string;
  /** URL path segment or full path, e.g. "/books". Kept as its own field
   *  (rather than reusing a route constant directly) because in a CMS this
   *  becomes admin-editable content, not a code constant. */
  slug: string;
  /** Icon identifier (e.g. "home", "book-open") that a future UI component
   *  maps to an actual icon (e.g. a lucide-react icon). Never a rendered
   *  icon/JSX here — this layer stays UI-free. */
  icon: string | null;
  /** Controls display order among siblings (ascending). */
  order: number;
  /** Whether this item should currently render. Lets an item be defined
   *  ahead of time (and toggled on later, e.g. once a feature flag flips)
   *  without deleting/re-adding it. */
  visible: boolean;
  /** Id of the parent navigation item, or null for a top-level/root item.
   *  Self-referencing, exactly like `categories.parent_id` — this is what
   *  gives navigation unlimited nesting depth without a schema change. */
  parent: string | null;
}

/**
 * A navigation entry after being assembled into a tree (i.e. after
 * `buildNavigationTree()` groups records by `parent`). This is the shape
 * a future header/menu component actually renders.
 */
export interface NavigationItemNode extends NavigationItemRecord {
  children: NavigationItemNode[];
}

/** A full named navigation menu (e.g. the main header nav, a future footer nav). */
export interface NavigationMenu {
  /** Menu identifier, e.g. "main", "footer". */
  id: string;
  /** Flat, unassembled records — the "source of truth" list. */
  items: NavigationItemRecord[];
}
