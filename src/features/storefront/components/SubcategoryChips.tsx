import type { Subcategory } from "@/types/subcategory.types";

interface SubcategoryChipsProps {
  subcategories: Subcategory[];
  selectedId: string | null;
  onSelect: (id: string | null) => void;
}

/**
 * SubcategoryChips — Sprint 18. Renders subcategories as clickable chips
 * that filter the same `/categories/[slug]` page in place — the whole
 * point of requirement 2 ("no nested routes"). Selecting a chip sets
 * local state on the category page, which refetches
 * `bookService.listBooks({ subcategoryId })`; it never navigates.
 */
export function SubcategoryChips({ subcategories, selectedId, onSelect }: SubcategoryChipsProps) {
  if (subcategories.length === 0) return null;

  return (
    <div className="flex flex-wrap gap-2">
      <button
        type="button"
        onClick={() => onSelect(null)}
        className={`rounded-full border px-3 py-1 text-sm ${
          selectedId === null
            ? "border-primary bg-primary text-primary-foreground"
            : "border-border text-muted-foreground hover:bg-muted"
        }`}
      >
        All
      </button>
      {subcategories.map((sub) => (
        <button
          key={sub.id}
          type="button"
          onClick={() => onSelect(sub.id)}
          className={`rounded-full border px-3 py-1 text-sm ${
            selectedId === sub.id
              ? "border-primary bg-primary text-primary-foreground"
              : "border-border text-muted-foreground hover:bg-muted"
          }`}
        >
          {sub.name}
        </button>
      ))}
    </div>
  );
}
