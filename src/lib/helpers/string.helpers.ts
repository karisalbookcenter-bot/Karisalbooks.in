/**
 * String utility helpers. Pure functions only — no side effects, no DOM,
 * no framework dependency, so they're trivially unit-testable.
 */

/** Converts "Competitive Exams" -> "competitive-exams". Used to keep
 *  slugs consistent wherever a slug needs to be derived from a label. */
export function slugify(input: string): string {
  return input
    .toLowerCase()
    .trim()
    .replace(/[^a-z0-9]+/g, "-")
    .replace(/^-+|-+$/g, "");
}

/** Truncates text to a max length, appending an ellipsis if cut. */
export function truncate(input: string, maxLength: number): string {
  if (input.length <= maxLength) return input;
  return `${input.slice(0, maxLength).trimEnd()}...`;
}

/** Capitalizes only the first letter, leaving the rest of the string as-is. */
export function capitalize(input: string): string {
  if (!input) return input;
  return input.charAt(0).toUpperCase() + input.slice(1);
}
