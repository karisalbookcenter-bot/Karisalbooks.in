"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";

import {
  updateOrderStatus,
  updateOrderCourier,
  updateOrderPayment,
} from "@/features/orders/admin-order.service";

import { OrderStatusBadge } from "@/features/admin/components/orders/OrderStatusBadge";


type OrderStatus =
  | "pending"
  | "confirmed"
  | "shipped"
  | "delivered"
  | "cancelled";


type PaymentStatus =
  | "pending"
  | "paid"
  | "failed"
  | "cod";


interface Props {

  id: string;

  status: OrderStatus;

  courier_name?: string | null;

  tracking_number?: string | null;

  payment_status?: PaymentStatus | null;

  payment_method?: string | null;

  payment_id?: string | null;

}



export function OrderDetailActions({

  id,

  status,

  courier_name,

  tracking_number,

  payment_status,

  payment_method,

  payment_id,

}: Props) {



  const router = useRouter();



  const [currentStatus, setCurrentStatus] =
    useState<OrderStatus>(status);



  const [courier, setCourier] =
    useState(courier_name ?? "");



  const [tracking, setTracking] =
    useState(tracking_number ?? "");



  const [paymentStatus, setPaymentStatus] =
    useState<PaymentStatus>(
      payment_status ?? "pending"
    );



  const [paymentMethod, setPaymentMethod] =
    useState(
      payment_method ?? ""
    );



  const [paymentId, setPaymentId] =
    useState(
      payment_id ?? ""
    );



  const [loading, setLoading] =
    useState(false);





  async function handleStatusChange(
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

      console.error(error);

      alert(
        "Unable to update status"
      );

    }
    finally{

      setLoading(false);

    }

  }






  async function handleCourierUpdate(){

    try {

      setLoading(true);


      await updateOrderCourier(
        id,
        courier,
        tracking
      );


      alert(
        "Shipping details updated"
      );


      router.refresh();


    } catch(error){

      console.error(error);

      alert(
        "Unable to update shipping"
      );

    }
    finally{

      setLoading(false);

    }

  }







  async function handlePaymentUpdate(){

    try {

      setLoading(true);


      await updateOrderPayment(
        id,
        paymentStatus,
        paymentMethod,
        paymentId
      );


      alert(
        "Payment details updated"
      );


      router.refresh();


    } catch(error){

      console.error(error);

      alert(
        "Unable to update payment"
      );

    }
    finally{

      setLoading(false);

    }

  }






  return (

    <div className="space-y-4">



      {/* ORDER STATUS */}

      <div className="space-y-2">


        <OrderStatusBadge
          status={currentStatus}
        />


        <select

          className="rounded border px-3 py-2"

          value={currentStatus}

          disabled={loading}

          onChange={(e)=>
            handleStatusChange(
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





      {/* SHIPPING */}


      <div className="space-y-3 rounded border p-4">


        <h3 className="font-semibold">
          Shipping Details
        </h3>



        <input

          className="w-full rounded border px-3 py-2"

          placeholder="Courier Name"

          value={courier}

          onChange={(e)=>
            setCourier(e.target.value)
          }

        />



        <input

          className="w-full rounded border px-3 py-2"

          placeholder="Tracking Number"

          value={tracking}

          onChange={(e)=>
            setTracking(e.target.value)
          }

        />



        <button

          type="button"

          disabled={loading}

          onClick={handleCourierUpdate}

          className="rounded bg-primary px-4 py-2 text-white"

        >

          Save Shipping Details

        </button>


      </div>






      {/* PAYMENT */}


      <div className="space-y-3 rounded border p-4">


        <h3 className="font-semibold">
          Payment Details
        </h3>



        <select

          className="w-full rounded border px-3 py-2"

          value={paymentStatus}

          onChange={(e)=>
            setPaymentStatus(
              e.target.value as PaymentStatus
            )
          }

        >

          <option value="pending">
            Pending
          </option>


          <option value="paid">
            Paid
          </option>


          <option value="failed">
            Failed
          </option>


          <option value="cod">
            COD
          </option>


        </select>




        <input

          className="w-full rounded border px-3 py-2"

          placeholder="Payment Method"

          value={paymentMethod}

          onChange={(e)=>
            setPaymentMethod(
              e.target.value
            )
          }

        />




        <input

          className="w-full rounded border px-3 py-2"

          placeholder="Payment ID"

          value={paymentId}

          onChange={(e)=>
            setPaymentId(
              e.target.value
            )
          }

        />




        <button

          type="button"

          disabled={loading}

          onClick={handlePaymentUpdate}

          className="rounded bg-primary px-4 py-2 text-white"

        >

          Save Payment Details

        </button>



      </div>



    </div>

  );

}