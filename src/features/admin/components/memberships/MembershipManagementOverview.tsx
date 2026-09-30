// src/features/admin/components/memberships/MembershipManagementOverview.tsx

"use client";

import { useCallback, useEffect, useState } from "react";

import {
  PageContainer,
  Pagination,
  BulkActionBar,
} from "@/components/common";


import * as membershipService from "@/features/memberships/services/membership.service";


import type {
  Membership,
} from "@/types/membership.types";


import type {
  RecordStatus,
} from "@/types/common.types";


import {
  MembershipTable,
} from "./MembershipTable";


import {
  MembershipFormLayout,
} from "./MembershipFormLayout";



const PAGE_SIZE = 10;



const BULK_ACTIONS = [
  {
    id:"activate",
    label:"Activate",
  },
  {
    id:"deactivate",
    label:"Deactivate",
  },
  {
    id:"delete",
    label:"Delete",
  },
];




export function MembershipManagementOverview(){



const [memberships,setMemberships]
=
useState<Membership[]>([]);



const [loading,setLoading]
=
useState(true);



const [totalCount,setTotalCount]
=
useState(0);



const [page,setPage]
=
useState(1);



const [selectedIds,setSelectedIds]
=
useState<string[]>([]);



const [editingMembership,setEditingMembership]
=
useState<Membership|null|"new">(null);






const loadMemberships =
useCallback(async()=>{


setLoading(true);



const result =
await membershipService.listMemberships({

page,

pageSize:PAGE_SIZE,

});



if(result.data){

setMemberships(
 result.data.items
);


setTotalCount(
 result.data.totalItems
);

}



setLoading(false);



},[page]);







useEffect(()=>{

loadMemberships();

},[loadMemberships]);








const handleDelete =
async(
 membership:Membership
)=>{


await membershipService.deleteMembership(
 membership.id
);


loadMemberships();


};







const handleBulkAction =
async(
 action:string
)=>{


if(action==="delete"){


await membershipService.bulkDeleteMemberships(
 selectedIds
);


}

else{


const status:RecordStatus =
action==="activate"
?
"active"
:
"inactive";



await membershipService.bulkUpdateMembershipsStatus(
 selectedIds,
 status
);


}



setSelectedIds([]);


loadMemberships();



};






return (

<PageContainer

title="Memberships"

description={`${totalCount} memberships`}

>



<div className="mb-4 flex justify-between">


<button

className="
rounded-md
bg-primary
px-4
py-2
text-sm
text-white
"

onClick={()=>setEditingMembership("new")}

>

Add Membership

</button>


</div>






{
selectedIds.length>0 &&

<BulkActionBar

count={selectedIds.length}

actions={BULK_ACTIONS}

onAction={handleBulkAction}

/>

}








{
editingMembership &&

<div
className="
mb-4
rounded-md
border
p-4
"
>


<MembershipFormLayout

mode={
editingMembership==="new"
?
"create"
:
"edit"
}


initialMembership={
editingMembership==="new"
?
undefined
:
editingMembership
}



onCancel={()=>setEditingMembership(null)}



onSuccess={()=>{

setEditingMembership(null);

loadMemberships();

}}



/>


</div>

}








<MembershipTable

memberships={memberships}

loading={loading}

selectedIds={selectedIds}

onSelectionChange={setSelectedIds}

onEdit={setEditingMembership}

onDelete={handleDelete}

/>








{
!loading && memberships.length>0 &&

<Pagination

result={{

page,

pageSize:PAGE_SIZE,

totalItems:totalCount,

totalPages:
Math.max(
1,
Math.ceil(
totalCount/PAGE_SIZE
)
)

}}



onPageChange={setPage}



/>

}



</PageContainer>


);



}