import type { Subcategory } from "@/types/subcategory.types";

interface SubcategoryChipsProps {
  subcategories: Subcategory[];
  selectedId: string | null;
  onSelect: (id: string | null) => void;
}

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
