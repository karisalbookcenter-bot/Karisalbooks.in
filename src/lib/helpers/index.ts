/**
 * Barrel export for reusable, framework-agnostic utility helpers.
 * Import from "@/lib/helpers" rather than reaching into individual files.
 *
 * Note: this is separate from the existing "@/lib/utils" (the shadcn/ui
 * `cn()` class-name helper from Day 1), which is left untouched.
 */
export * from "./string.helpers";
export * from "./format.helpers";
export * from "./array.helpers";
export * from "./menu.helpers";
export * from "./category.helpers";
