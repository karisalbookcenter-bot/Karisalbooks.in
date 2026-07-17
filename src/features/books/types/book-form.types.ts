import type { RecordStatus } from "@/types/common.types";

/**
 * Book form values — Sprint 10.
 *
 * camelCase and string-typed throughout (even `price`/`stockQuantity`,
 * despite `Book` typing them as `number`) — the exact same convention
 * `CategoryFormValues`/`SubcategoryFormValues` (Sprints 08–09) already
 * established: form state stays ergonomic for controlled inputs, and
 * `useBookForm`'s submit step is what maps this shape to the snake_case,
 * correctly-typed `BookInsert`/`BookUpdate` the service layer expects.
 *
 * Empty string represents "not set" for every optional field
 * (`subcategoryId`, `publisherId`, `isbn`, `coverImageUrl`) — mapped to
 * `null` at submit time, matching how `ParentCategorySelector`
 * (Sprint 09) already represents "no selection" as `""` in a native
 * `<select>`.
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
  coverImageUrl: string;
  status: RecordStatus;
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
  coverImageUrl: "",
  status: "active",
};
