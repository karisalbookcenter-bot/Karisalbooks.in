"use client";


import {

generateOrderWhatsAppMessage

} from "@/features/orders/whatsapp/order-whatsapp-message";



interface Props {

mobile:string;

customerName:string;

orderId:string;

status:string;

total:number;

courier?:string|null;

tracking?:string|null;

}





export function WhatsAppButton({

mobile,

customerName,

orderId,

status,

total,

courier,

tracking,

}:Props){



function openWhatsApp(){



if(!mobile){

alert("Customer mobile number missing");

return;

}





const message =

generateOrderWhatsAppMessage({

customerName,

orderId,

total,

status,

courier,

tracking,

});





const phone =

mobile.replace(/\D/g,"");





if(!phone){

alert("Invalid mobile number");

return;

}





const url =

`https://wa.me/${phone}?text=${encodeURIComponent(message)}`;





window.open(

url,

"_blank"

);



}





return(



<button

type="button"

onClick={openWhatsApp}

className="
rounded
bg-green-600
px-4
py-2
text-white
hover:bg-green-700
"

>


Send WhatsApp


</button>


);


}