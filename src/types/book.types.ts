```ts
import type { BaseEntity } from "./common.types";

/**
 * Homepage highlight types.
 */
export type BookHighlightType =
  | "featured"
  | "prebooking"
  | "new_launch";

/**
 * Book entity types — Sprint 10 (Book CRUD + Supabase Integration).
 */
export interface Book extends BaseEntity {
  category_id: string;
  category_name?: string;

  subcategory_id: string | null;

  author_id: string;

  publisher_id: string | null;

  title: string;
  slug: string;
  description: string | null;
  isbn: string | null;

  price: number;
  stock_quantity: number;

  /**
   * Book weight in kilograms.
   *
   * Examples:
   * 0.25 = 250g
   * 0.5  = 500g
   * 1    = 1kg
   * 4    = 4kg
   */
  weight_kg: number;

  cover_image_url: string | null;

  /**
   * Homepage highlight settings.
   */
  is_highlighted: boolean;
  highlight_type: BookHighlightType | null;
  highlight_order: number;

  prebooking_enabled?: boolean;
  prebooking_start_at?: string | null;
  prebooking_end_at?: string | null;
  prebooking_price?: number | null;
  prebooking_offer_price?: number | null;
  prebooking_offer_start_at?: string | null;
  prebooking_offer_end_at?: string | null;
  prebooking_ready_at?: string | null;
  prebooking_professional_courier_charge?: number;
  prebooking_postal_charge?: number;
}

/**
 * Shape for creating a book.
 */
export interface BookInsert {
  category_id: string;
  subcategory_id?: string | null;
  author_id: string;
  publisher_id?: string | null;

  title: string;
  slug?: string;
  description?: string | null;
  isbn?: string | null;

  price?: number;
  stock_quantity?: number;

  /**
   * Weight in kilograms.
   */
  weight_kg?: number;

  cover_image_url?: string | null;

  /**
   * Homepage highlight settings.
   */
  is_highlighted?: boolean;
  highlight_type?: BookHighlightType | null;
  highlight_order?: number;

  prebooking_enabled?: boolean;
  prebooking_start_at?: string | null;
  prebooking_end_at?: string | null;
  prebooking_price?: number | null;
  prebooking_offer_price?: number | null;
  prebooking_offer_start_at?: string | null;
  prebooking_offer_end_at?: string | null;
  prebooking_ready_at?: string | null;
  prebooking_professional_courier_charge?: number;
  prebooking_postal_charge?: number;

  status?: Book["status"];
}

/**
 * Shape for updating a book.
 */
export type BookUpdate = Partial<BookInsert>;
```
