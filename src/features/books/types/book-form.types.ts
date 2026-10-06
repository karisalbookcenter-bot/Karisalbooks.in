/**
 * Book form values.
 *
 * All form values are kept as strings because they are controlled
 * inputs. Numeric values are converted to numbers before saving.
 */

/**
 * Status values supported by the book form.
 */
export type RecordStatus =
  | "active"
  | "inactive"
  | "archived";

/**
 * Highlight types available for homepage books.
 */
export type BookHighlightType =
  | "featured"
  | "prebooking"
  | "new_launch"
  | "";

/**
 * Book form values.
 *
 * Form inputs are strings because they are controlled inputs.
 * Numeric values are converted before saving.
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
  highlightType: BookHighlightType;
  highlightOrder: string;
}

/**
 * Default values for the book form.
 */
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

  weightKg: "0",

  coverImageUrl: "",

  status: "active",

  isHighlighted: false,
  highlightType: "",
  highlightOrder: "0",
};