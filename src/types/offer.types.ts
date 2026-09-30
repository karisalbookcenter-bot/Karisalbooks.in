// src/types/offer.types.ts

export type OfferStatus =
  | "active"
  | "inactive"
  | "expired";

export type OfferType =
  | "percentage";


export interface Offer {
  id: string;

  title: string;

  description: string | null;

  offer_type: OfferType;

  discount_percentage: number;

  special_day: string | null;

  coupon_code: string | null;

  start_date: string;

  end_date: string;

  status: OfferStatus;

  created_at: string;

  updated_at: string;
}


export type OfferInsert = Omit<
  Offer,
  "id" | "created_at" | "updated_at" | "coupon_code"
> & {
  coupon_code?: string | null;
};


export type OfferUpdate = Partial<
  Omit<
    Offer,
    "id" | "created_at" | "updated_at"
  >
>;
