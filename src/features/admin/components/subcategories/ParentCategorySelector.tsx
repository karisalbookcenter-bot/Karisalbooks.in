"use client";

import { Select } from "@/components/ui/select";
import { getCategoryOptionList } from "@/lib/helpers/category.helpers";
import type { ParentCategorySelectorProps } from "@/features/admin/types/subcategory-management.types";

/**
 * ParentCategorySelector — Sprint 09 (Task 3 — UI only).
 *
 * The picker for "which category does this subcategory belong to,"
 * reused in two places: `SubcategoryFormLayout` (required — a
 * subcategory always has a category) and `SubcategoryFilters`
 * (`allowAll`, optional — "show subcategories from any category").
 *
 * Built on the existing `Select` primitive (Sprint 08) rather than a new
 * component, and on `getCategoryOptionList`
 * (`@/lib/helpers/category.helpers`, extended this sprint) rather than
 * flattening the category tree itself — options render indented by depth
 * (an em-dash per level) so a nested category like "Fiction > Fantasy" is
 * visually distinguishable from a top-level one, using the exact same
 * hierarchy `CategoryTreeView` (Sprint 08) renders, not a second,
 * possibly-inconsistent ordering.
 *
 * UI only — selecting a category does not persist anything; `onChange`
 * simply reports the chosen id to the caller.
 */
export function ParentCategorySelector({
  categories,
  value,
  onChange,
  allowAll = false,
  placeholder = "Select a category",
  id,
  className,
}: ParentCategorySelectorProps) {
  const options = getCategoryOptionList(categories);

  return (
    <Select
      id={id}
      aria-label={allowAll ? "Filter by category" : "Category"}
      value={value ?? ""}
      onChange={(e) => onChange?.(e.target.value || null)}
      className={className}
    >
      {allowAll ? (
        <option value="">All categories</option>
      ) : (
        <option value="" disabled>
          {placeholder}
        </option>
      )}
      {options.map(({ category, depth }) => (
        <option key={category.id} value={category.id}>
          {"\u2014 ".repeat(depth)}
          {category.name}
        </option>
      ))}
    </Select>
  );
}
