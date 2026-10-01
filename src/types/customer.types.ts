import type { BaseEntity, RecordStatus } from "./common.types";


/**
 * Customer entity type
 *
 * Customer Management + Membership integration.
 */

export interface Customer extends BaseEntity {


  user_id: string | null;


  name: string;


  email: string | null;


  phone: string | null;



  address: string | null;


  city: string | null;


  state: string | null;


  pincode: string | null;



  membership_id: string | null;

}




export interface CustomerInsert {


  user_id?: string | null;


  name: string;


  email?: string | null;


  phone?: string | null;


  address?: string | null;


  city?: string | null;


  state?: string | null;


  pincode?: string | null;


  membership_id?: string | null;


  status?: RecordStatus;

}




export interface CustomerUpdate {


  name?: string;


  email?: string | null;


  phone?: string | null;


  address?: string | null;


  city?: string | null;


  state?: string | null;


  pincode?: string | null;


  membership_id?: string | null;


  status?: RecordStatus;

}