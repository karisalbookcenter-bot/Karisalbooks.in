"use client";

import { useState } from "react";

import { InvoiceDownloadButton } from "./InvoiceDownloadButton";
import { WhatsAppButton } from "./WhatsAppButton";
import { OrderDetailActions } from "./OrderDetailActions";


type OrderStatus =
  | "pending"
  | "confirmed"
  | "shipped"
  | "delivered"
  | "cancelled";



interface Props {

  order: {

    id: string;

    customer_name: string;

    mobile: string;

    total_amount: number;

    status: OrderStatus;

    courier_name?: string | null;

    tracking_number?: string | null;

    order_items:any[];

  };

}



export function OrderWorkflowActions({

  order,

}:Props){



const [copied,setCopied] =
useState(false);



function copyTrackingLink(){


const url =
`${window.location.origin}/track-order?id=${order.id}`;


navigator.clipboard.writeText(url);


setCopied(true);


setTimeout(()=>{

setCopied(false);

},2000);


}




return(


<div className="space-y-5 rounded-lg border p-5">


<h3 className="text-lg font-semibold">

Order Workflow

</h3>





<OrderDetailActions

id={order.id}

status={order.status}

courier_name={order.courier_name}

tracking_number={order.tracking_number}

/>






<div className="flex flex-wrap gap-3">


<InvoiceDownloadButton

order={order}

/>





<WhatsAppButton

mobile={order.mobile}

customerName={order.customer_name}

orderId={order.id}

status={order.status}

total={order.total_amount}

courier={order.courier_name}

tracking={order.tracking_number}

/>





<button

type="button"

onClick={copyTrackingLink}

className="
rounded
border
px-4
py-2
text-sm
hover:bg-muted
"

>

{
copied
?
"Copied!"
:
"Copy Tracking Link"
}


</button>



</div>




</div>


);


}