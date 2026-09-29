// src/types/offer.types.ts

import type { Database } from "@/types/database.types";

export type OfferStatus =
  | "active"
  | "inactive"
  | "expired";

export type OfferType =
  | "percentage";


export interface Offer {
  id: string;

  title: string;

  offer_type: OfferType;

  discount_percentage: 5 | 10 | 15 | 20 | 25;

  special_day: string | null;

  start_date: string;

  end_date: string;

  status: OfferStatus;

  created_at: string;

  updated_at: string;
}


export type OfferInsert = Omit<
  Offer,
  "id" | "created_at" | "updated_at"
>;


export type OfferUpdate = Partial<
  Omit<
    Offer,
    "id" | "created_at" | "updated_at"
  >
>;
