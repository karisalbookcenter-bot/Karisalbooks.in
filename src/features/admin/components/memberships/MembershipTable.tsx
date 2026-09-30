// src/features/admin/components/memberships/MembershipTable.tsx

"use client";

import { StatusBadge } from "@/components/common";

import { formatCurrency } from "@/lib/helpers/format.helpers";

import type {
  Membership,
} from "@/types/membership.types";



interface MembershipTableProps {


  memberships: Membership[];


  loading:boolean;


  selectedIds:string[];


  onSelectionChange?:
  (ids:string[])=>void;


  onEdit?:
  (membership:Membership)=>void;


  onDelete?:
  (membership:Membership)=>void;

}




export function MembershipTable({

memberships,

loading,

selectedIds=[],

onSelectionChange,

onEdit,

onDelete,

}:MembershipTableProps){





if(loading){

return (

<div className="p-6 text-sm text-muted-foreground">

Loading memberships...

</div>

);

}







if(memberships.length===0){

return (

<div className="rounded-md border p-6 text-center text-muted-foreground">

No memberships found.

</div>

);

}







const allSelected =
memberships.length>0
&&
selectedIds.length===memberships.length;







const toggleAll =()=>{


onSelectionChange?.(

allSelected

?

[]

:

memberships.map(
(item)=>item.id
)

);


};








const toggleOne=(id:string)=>{


if(!onSelectionChange)
return;



onSelectionChange(

selectedIds.includes(id)

?

selectedIds.filter(
(x)=>x!==id
)

:

[
...selectedIds,
id
]

);


};









return (

<div className="overflow-x-auto rounded-md border">


<table className="w-full">


<thead className="border-b bg-muted/40">


<tr>


<th className="px-4 py-3">

<input

type="checkbox"

checked={allSelected}

onChange={toggleAll}

/>

</th>



<th className="px-4 py-3 text-left">

Membership ID

</th>



<th className="px-4 py-3 text-left">

Customer

</th>



<th className="px-4 py-3 text-left">

Plan

</th>



<th className="px-4 py-3 text-left">

Amount

</th>



<th className="px-4 py-3 text-left">

Status

</th>



<th className="px-4 py-3">

Actions

</th>



</tr>


</thead>







<tbody>


{

memberships.map((membership)=>(


<tr

key={membership.id}

className="
border-b
hover:bg-muted/20
"

>



<td className="px-4 py-3">


<input

type="checkbox"

checked={
selectedIds.includes(
membership.id
)
}

onChange={()=>
toggleOne(
membership.id
)
}

/>


</td>






<td className="px-4 py-3 text-sm font-medium">


{membership.membership_id}


</td>






<td className="px-4 py-3 text-sm">


{membership.customer_id}


</td>






<td className="px-4 py-3 text-sm">


{membership.plan_id}


</td>






<td className="px-4 py-3 text-sm">


{formatCurrency(
membership.payment_amount
)}


</td>






<td className="px-4 py-3">


<StatusBadge

status={
membership.status
}

/>


</td>








<td className="px-4 py-3 text-right">


<button

className="
mr-3
text-sm
text-muted-foreground
hover:text-foreground
"

onClick={()=>
onEdit?.(membership)
}

>

Edit

</button>






<button

className="
text-sm
text-destructive
"

onClick={()=>
onDelete?.(membership)
}

>

Delete

</button>



</td>






</tr>


))

}


</tbody>



</table>


</div>

);


}