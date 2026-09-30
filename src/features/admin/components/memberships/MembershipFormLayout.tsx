// src/features/admin/components/memberships/MembershipFormLayout.tsx

"use client";

import { useEffect } from "react";

import { useMembershipForm } from "@/features/memberships/hooks/useMembershipForm";

import type {
  Membership,
} from "@/types/membership.types";



interface MembershipFormLayoutProps {


  mode:
  | "create"
  | "edit";


  initialMembership?:
  Membership;


  onCancel:
  ()=>void;


  onSuccess:
  ()=>void;

}





export function MembershipFormLayout({

mode,

initialMembership,

onCancel,

onSuccess,

}:MembershipFormLayoutProps){





const {

form,

setField,

errors,

loading,

submit,

}=useMembershipForm({

initialMembership,

onSuccess,

});







useEffect(()=>{


if(mode==="edit" && initialMembership){

setField(
"plan",
initialMembership.plan
);


setField(
"discount_percentage",
initialMembership.discount_percentage
);


}



},[
mode,
initialMembership
]);








return (

<form

onSubmit={async(e)=>{

e.preventDefault();

await submit();

}}

className="
space-y-4
"

>





<div>


<label className="text-sm">

Membership Plan

</label>



<select

value={form.plan}

onChange={(e)=>

setField(
"plan",
e.target.value as any
)

}

className="
mt-1
w-full
rounded-md
border
p-2
"

>


<option value="standard">

Standard

</option>


<option value="premium">

Premium

</option>



</select>


</div>









<div>


<label className="text-sm">

Discount %

</label>



<select


value={
form.discount_percentage
}


onChange={(e)=>

setField(

"discount_percentage",

Number(e.target.value)

)

}


className="
mt-1
w-full
rounded-md
border
p-2
"


>



<option value={15}>

15%

</option>



<option value={20}>

20%

</option>



<option value={25}>

25%

</option>



</select>



</div>








<div>


<label className="text-sm">

Payment Amount

</label>


<input


type="number"


value={
form.payment_amount
}


onChange={(e)=>

setField(

"payment_amount",

Number(e.target.value)

)

}


className="
mt-1
w-full
rounded-md
border
p-2
"


/>


{
errors.payment_amount &&

<p className="text-sm text-destructive">

{errors.payment_amount}

</p>

}


</div>









<div>


<label className="text-sm">

Start Date

</label>


<input


type="date"


value={
form.start_date
}


onChange={(e)=>

setField(
"start_date",
e.target.value
)

}


className="
mt-1
w-full
rounded-md
border
p-2
"


/>



</div>









<div>


<label className="text-sm">

Expiry Date

</label>


<input


type="date"


value={
form.end_date
}


onChange={(e)=>

setField(
"end_date",
e.target.value
)

}


className="
mt-1
w-full
rounded-md
border
p-2
"


/>



</div>









<div className="flex gap-3">


<button


type="submit"


disabled={loading}


className="
rounded-md
bg-primary
px-4
py-2
text-white
"


>


{
loading
?
"Saving..."
:
mode==="create"
?
"Create Membership"
:
"Update Membership"
}



</button>






<button


type="button"


onClick={onCancel}


className="
rounded-md
border
px-4
py-2
"


>


Cancel


</button>



</div>





</form>

);


}