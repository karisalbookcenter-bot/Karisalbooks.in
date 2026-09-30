import type { RecordStatus } from "./common.types";


/**
 * Membership Plan
 *
 * Example:
 * Standard ₹600 - 12%
 * Premium ₹1000 - 16%
 */
export interface MembershipPlan {

  id: string;

  name: string;

  price: number;

  discount_percentage: number;

  validity_days: number;

  status: RecordStatus;

  created_at: string;

  updated_at: string;

}



/**
 * Membership
 *
 * Customer purchased membership record
 */
export interface Membership {

  id: string;

  /**
   * Auto generated membership number
   *
   * Example:
   * KBM-2026-000001
   */
  membership_id: string;


  customer_id: string;


  plan_id: string;


  payment_amount: number;


  payment_status:
    | "pending"
    | "paid"
    | "failed"
    | "refunded";


  start_date: string;


  expiry_date: string;


  status: RecordStatus;


  created_at: string;


  updated_at: string;

}




/**
 * Create Membership Plan
 */
export interface MembershipPlanInsert {

  name: string;

  price: number;

  discount_percentage: number;

  validity_days: number;

  status?: RecordStatus;

}



/**
 * Update Membership Plan
 */
export type MembershipPlanUpdate =
  Partial<MembershipPlanInsert>;





/**
 * Create Membership
 */
export interface MembershipInsert {

  membership_id: string;

  customer_id: string;

  plan_id: string;

  payment_amount: number;

  payment_status?:
    | "pending"
    | "paid"
    | "failed"
    | "refunded";


  start_date: string;

  expiry_date: string;

  status?: RecordStatus;

}




/**
 * Update Membership
 */
export type MembershipUpdate =
  Partial<MembershipInsert>;





/**
 * Membership with joined data
 *
 * Admin table / customer profile use
 */
export interface MembershipWithDetails extends Membership {

  plan?: MembershipPlan;


  customer?: {

    id: string;

    email?: string | null;

    full_name?: string | null;

  } | null;

}