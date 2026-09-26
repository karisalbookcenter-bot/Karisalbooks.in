"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";

import {
  updateOrderStatus,
} from "@/features/orders/admin-order.service";

import { OrderStatusBadge } from "@/features/admin/components/orders/OrderStatusBadge";


type OrderStatus =
  | "pending"
  | "confirmed"
  | "shipped"
  | "delivered"
  | "cancelled";


interface Props {
  id: string;
  status: OrderStatus;
}


export function OrderDetailActions({
  id,
  status,
}: Props) {

  const router = useRouter();

  const [currentStatus, setCurrentStatus] =
    useState<OrderStatus>(status);

  const [loading, setLoading] =
    useState(false);


  async function handleChange(
    value: OrderStatus
  ){

    try {

      setLoading(true);

      await updateOrderStatus(
        id,
        value
      );

      setCurrentStatus(value);

      router.refresh();


    } catch(error){

      console.error(
        "STATUS UPDATE ERROR:",
        error
      );

      alert(
        "Unable to update status"
      );

    }
    finally{

      setLoading(false);

    }

  }



  return (

    <div className="space-y-3">

      <OrderStatusBadge
        status={currentStatus}
      />


      <select
        className="rounded border px-3 py-2"
        value={currentStatus}
        disabled={loading}
        onChange={(e)=>
          handleChange(
            e.target.value as OrderStatus
          )
        }
      >

        <option value="pending">
          Pending
        </option>

        <option value="confirmed">
          Confirmed
        </option>

        <option value="shipped">
          Shipped
        </option>

        <option value="delivered">
          Delivered
        </option>

        <option value="cancelled">
          Cancelled
        </option>


      </select>


    </div>

  );

}