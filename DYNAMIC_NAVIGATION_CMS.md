# KarisalBooks.in — Dynamic Navigation & CMS Foundation

**Milestone:** Day 4 — Dynamic Navigation and CMS Foundation
**Builds on:** Day 3 (Master Architecture)
**Explicitly out of scope today:** login/auth, admin dashboard, products,
cart, checkout, orders, payment, APIs, database tables, and UI pages.
Nothing here queries a database, renders a menu, or exposes an endpoint —
it is the data model and helper logic an admin panel and a header
component will both build on top of later.

---

## 1. What changed and why

Day 3 shipped a first-pass, static navigation config (`label` / `href`,
optional `children`). Today's task requires a richer shape — `title`,
`slug`, `icon`, `parent` — because the real goal isn't "a navigation menu,"
it's **a navigation menu shaped like data a future admin panel can edit**.

Two files from Day 3 were updated as part of today's task (both are
navigation-specific, so this falls under "update files related to today's
task," not an unrelated change):

- `src/types/navigation.types.ts` — replaced `NavigationItem`/
  `NavigationConfig` with `NavigationItemRecord`, `NavigationItemNode`, and
  `NavigationMenu` (details in §2).
- `src/config/navigation.ts` — rebuilt `mainNavigation` on the new record
  shape.

No other Day 1–3 file was modified. (Checked: nothing else in the codebase
referenced the old `NavigationItem`/`NavigationConfig` types before today.)

## 2. The navigation data model

Every navigation item now has exactly the fields required:

| Field     | Type                | Meaning                                                          |
|-----------|---------------------|-------------------------------------------------------------------|
| `id`      | `string`            | Stable identifier (a future DB row's UUID)                       |
| `title`   | `string`            | Label shown to the user                                          |
| `slug`    | `string`            | URL path, admin-editable content, not a hardcoded code constant  |
| `icon`    | `string \| null`    | Icon identifier (e.g. `"book-open"`) — mapped to a real icon by a future UI component; never JSX here |
| `order`   | `number`            | Display order among siblings, ascending                          |
| `visible` | `boolean`           | Whether the item currently renders                                |
| `parent`  | `string \| null`    | Id of the parent item, or `null` for top-level                    |
| `children`| present only on the *tree* shape, not the stored record            |

This is deliberately split into two interfaces:

- **`NavigationItemRecord`** — a flat row, no `children` field. This is
  what gets stored (today: hardcoded in `config/navigation.ts`; later: a
  row in a `navigation_items` table).
- **`NavigationItemNode`** — `NavigationItemRecord` plus a `children:
  NavigationItemNode[]` array, assembled at runtime. This is what a header
  component actually renders.

The `parent` self-reference is the same adjacency-list pattern used by
`categories.parent_id` in the Day 2 SQL migration — chosen deliberately, so
navigation nesting and category nesting work identically and both support
**unlimited depth** without any schema change. A future admin panel can
therefore reuse the same "pick a parent from a dropdown" UI pattern for
both categories and navigation items.

## 3. Route Constants

`src/constants/routes.constants.ts` already defined `ROUTES` in Day 3 and
covers every route this milestone needs (`HOME`, `BOOKS`,
`COMPETITIVE_EXAMS`, `PUBLICATION_SERVICES`, `OFFER_ZONE`, `PRE_BOOKING`,
`ABOUT`, `CONTACT`). It was not modified — today's `config/navigation.ts`
simply imports `ROUTES` for each item's `slug` value, the same as before.

## 4. Menu Helper utilities (`src/lib/helpers/menu.helpers.ts`)

Pure functions, no UI, no side effects:

| Function                     | Purpose                                                              |
|-------------------------------|------------------------------------------------------------------------|
| `buildNavigationTree(items, parentId?)` | Assembles flat records into a nested `NavigationItemNode[]` tree, grouping by `parent`, recursively, at unlimited depth. |
| `flattenNavigationTree(nodes)` | Inverse of the above — flattens a tree back into flat records. Useful for round-tripping through a future table-based admin editor. |
| `sortByOrder(a, b)`            | Comparator for ascending `order`.                                     |
| `getVisibleItems(items)`       | Filters to only `visible: true` items.                                |
| `findNavigationItemBySlug(items, slug)` | Looks up a single item by its `slug`.                       |
| `filterByFeatureFlags(items, flags)` | Hides items whose visibility is gated behind a disabled feature flag (see §6). |
| `resolveNavigationTree(items, flags)` | The full pipeline — flag-filter → visibility-filter → build tree — that a future header component would call. |

## 5. Reusable CMS configuration (`src/config/cms.ts`)

Defines the *contract* a future CMS/admin panel will be built against:

- `CMS_CONTENT_TYPES` — the kinds of content the CMS will eventually
  manage (`navigation_item`, `page`, `banner`, `announcement`). Adding a
  new kind here today is a type-level decision; later it becomes a new
  admin-panel section and a new database table.
- `cmsNavigationConfig` — rules a future navigation editor UI must
  enforce: a practical `maxDepth` (3) even though the data model supports
  unlimited nesting, whether custom/external links are allowed, whether
  icons are allowed, and a fallback `defaultIcon`.
- `cmsContentDefaults` — minimal starting limits for future simple content
  blocks (e.g. max active banners), left deliberately small and only grown
  when a real feature needs a field it doesn't already have.

## 6. Feature flags (`src/config/featureFlags.ts`)

A single, typed `FeatureFlags` interface and `featureFlags` object with
exactly the four flags requested:

```ts
enableOffers: boolean;
enablePreBooking: boolean;
enablePublicationServices: boolean;
enableWishlist: boolean;
```

All default to `false`. A `NAV_ITEM_FEATURE_FLAG_MAP` alongside them maps a
navigation item's `id` to the flag that gates it (e.g. `"offer-zone"` →
`enableOffers`), which is what `filterByFeatureFlags` in the menu helpers
reads. An item not listed in the map is never flag-gated.

**Note on Day 3 overlap:** `src/config/settings.ts` already contains an
early `features` object (`preBookingEnabled`, `offerZoneEnabled`,
`publicationServicesEnabled`) as part of general business settings. Per
today's scope ("only update files related to today's task"), `settings.ts`
was left untouched rather than refactored. Recommendation for a future
cleanup milestone: remove `settings.features` and have anything that
needs a flag import from `@/config/featureFlags` instead, so there is only
one feature-flag surface in the codebase.

## 7. How a future admin panel manages navigation dynamically

This is the core question today's foundation is built to answer. The plan:

**Step A — Table, not config file.** A future `navigation_items` table is
created with exactly the columns `NavigationItemRecord` already defines
(`id uuid`, `title text`, `slug text`, `icon text nullable`, `order int`,
`visible boolean`, `parent_id uuid nullable references
navigation_items(id)`), following the same pattern as the Day 2
`categories` table. `config/navigation.ts`'s hardcoded array becomes the
seed/migration data for that table, not a permanent source of truth.

**Step B — Read path.** A future service (implementing the `BaseService<T>`
contract from Day 3's `src/services/base.service.ts`) fetches all rows from
`navigation_items`, ordered by `order`. The existing, unchanged menu helper
`resolveNavigationTree(items, flags)` takes that array and produces exactly
the same `NavigationItemNode[]` tree a header component needs — the
helpers written today do not change when the data source moves from a
hardcoded array to a database query, because both are just
`NavigationItemRecord[]` in, `NavigationItemNode[]` out.

**Step C — Write path (the admin panel itself).** An authenticated
admin-only screen (built in the Admin Dashboard milestone, not today) lets
an editor:
- Create/edit/delete rows in `navigation_items` (title, slug, icon,
  order, visible, parent) via ordinary form inputs — no JSON/tree editing,
  because the stored shape is flat.
- Pick a parent from a dropdown of existing items (self-reference), the
  same UI pattern already needed for `categories.parent_id`.
- Drag-and-drop reordering simply rewrites each affected row's `order`
  value.
- Toggling `visible` off hides an item immediately without deleting it.
- The `cmsNavigationConfig.maxDepth` limit (from `config/cms.ts`) is what
  that screen's validation checks against before allowing a new
  grandchild-of-a-grandchild item, surfacing a warning instead of letting
  the menu grow unmanageably deep.

**Step D — Feature-gated items.** For nav items tied to an
in-development feature (Offer Zone, Pre Booking, Publication Services),
the admin panel doesn't need its own on/off switch for those items
specifically — flipping the relevant flag in `featureFlags` (eventually
also promoted to an admin-editable settings table) hides them via
`filterByFeatureFlags` automatically, on top of whatever `visible` value
the row has.

Nothing above is built today — no table, no admin screen, no API route.
Today's deliverable is the shape and the pure logic (`NavigationItemRecord`
/ `NavigationItemNode`, the menu helpers, the CMS config) that make Steps
A–D a matter of *wiring*, not *redesigning*, when their turn comes.

## 8. Files added or changed today

**New:**
- `src/config/featureFlags.ts`
- `src/config/cms.ts`
- `src/lib/helpers/menu.helpers.ts`
- `docs/DYNAMIC_NAVIGATION_CMS.md` (this file)

**Updated (navigation-specific, per today's task):**
- `src/types/navigation.types.ts`
- `src/config/navigation.ts`
- `src/config/index.ts` (barrel — added two new exports)
- `src/lib/helpers/index.ts` (barrel — added one new export)

**Untouched:** everything else from Day 1–3, including
`src/config/settings.ts`, `src/constants/routes.constants.ts`,
`src/services/base.service.ts`, and all feature-folder scaffolding.
