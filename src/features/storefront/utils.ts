/**
 * buildNameMap — Sprint 18. Small, storefront-local helper (not added to
 * any shared `*.helpers.ts` file, since none of those files' real source
 * was supplied for this feature area — same caution Sprint 17 applied to
 * `category.helpers.ts`). Used by every storefront page to turn an
 * Author[]/Publisher[] list into an `{ [id]: name }` lookup for `BookGrid`.
 */
export function buildNameMap(items: { id: string; name: string }[]): Record<string, string> {
  return Object.fromEntries(items.map((item) => [item.id, item.name]));
}
