```ts
import type { RecordStatus } from "@/types/common.types";

/**
 * Book form values.
 *
 * All form values are kept as strings because they are controlled
 * inputs. Numeric values are converted to numbers before saving.
 */
export interface BookFormValues {
  title: string;
  slug: string;
  description: string;
  categoryId: string;
  subcategoryId: string;
  authorId: string;
  publisherId: string;
  isbn: string;
  price: string;
  stockQuantity: string;

  /**
   * Book weight in kilograms.
   *
   * Examples:
   * 0.25, 0.5, 1, 4
   */
  weightKg: string;

  coverImageUrl: string;
  status: RecordStatus;

  /**
   * Homepage highlight settings.
   */
  isHighlighted: boolean;
  highlightType: "featured" | "prebooking" | "new_launch" | "";
  highlightOrder: string;
}

export const DEFAULT_BOOK_FORM_VALUES: BookFormValues = {
  title: "",
  slug: "",
  description: "",
  categoryId: "",
  subcategoryId: "",
  authorId: "",
  publisherId: "",
  isbn: "",
  price: "0",
  stockQuantity: "0",

  // Default weight for existing/new books.
  weightKg: "0",

  coverImageUrl: "",
  status: "active",

  // Homepage highlight defaults.
  isHighlighted: false,
  highlightType: "",
  highlightOrder: "0",
};
```
