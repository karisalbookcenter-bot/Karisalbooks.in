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

  campaign_poster_url?: string | null;

  campaign_price_details?: string | null;

  campaign_email_subject?: string | null;

  campaign_email_body?: string | null;

  campaign_sent_at?: string | null;

  campaign_sent_count?: number;

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
