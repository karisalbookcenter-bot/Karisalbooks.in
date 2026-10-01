// src/features/admin/components/memberships/MembershipManagementOverview.tsx


"use client";


import {
  useCallback,
  useEffect,
  useState,
} from "react";


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


import {
  MembershipToolbar,
} from "./MembershipToolbar";


import {
  MembershipEmptyState,
} from "./MembershipEmptyState";





const PAGE_SIZE = 10;





const BULK_ACTIONS = [

  {
    id:"activate",
    label:"Activate",
    icon:"check-circle",
  },

  {
    id:"deactivate",
    label:"Deactivate",
    icon:"x-circle",
  },

  {
    id:"delete",
    label:"Delete",
    icon:"close",
  },

];








export function MembershipManagementOverview(){



  const [
    memberships,
    setMemberships
  ] = useState<Membership[]>([]);




  const [
    loading,
    setLoading
  ] = useState(true);




  const [
    totalCount,
    setTotalCount
  ] = useState(0);




  const [
    page,
    setPage
  ] = useState(1);




  const [
    selectedIds,
    setSelectedIds
  ] = useState<string[]>([]);




  const [
    editingMembership,
    setEditingMembership
  ] =
  useState<
    Membership | "new" | null
  >(null);




  const [
    searchValue,
    setSearchValue
  ] = useState("");




  const [
    planFilter,
    setPlanFilter
  ] =
  useState<
    "all" | "standard" | "premium"
  >("all");









  const loadMemberships =
  useCallback(async()=>{


    setLoading(true);



    const result =
    await membershipService.listMemberships({

      page,

      pageSize:PAGE_SIZE,

      search:
        searchValue || undefined,


      plan:
        planFilter==="all"
        ? undefined
        : planFilter,


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



  },[
    page,
    searchValue,
    planFilter
  ]);











  useEffect(()=>{


    loadMemberships();


  },[
    loadMemberships
  ]);












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
      ? "active"
      : "inactive";



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

      description={
        `${totalCount} memberships`
      }

    >





      <MembershipToolbar



        searchValue={searchValue}



        onSearchChange={(value)=>{


          setSearchValue(value);


          setPage(1);


        }}




        selectedPlan={planFilter}



        onPlanChange={(value)=>{


          setPlanFilter(value);


          setPage(1);


        }}





        onAddMembership={()=>{


          setEditingMembership(
            "new"
          );


        }}




      />









      {
        selectedIds.length > 0 && (


          <div className="mt-4">


            <BulkActionBar


              count={
                selectedIds.length
              }


              actions={
                BULK_ACTIONS
              }


              onAction={
                handleBulkAction
              }


              onClear={()=>
                setSelectedIds([])
              }


            />


          </div>


        )
      }









      {
        editingMembership && (


          <div

            className="
              mt-4
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



              onCancel={()=>{


                setEditingMembership(
                  null
                );


              }}



              onSuccess={()=>{


                setEditingMembership(
                  null
                );


                loadMemberships();


              }}



            />



          </div>


        )
      }









      {
        !loading &&
        memberships.length===0

        ?

        (

          <div className="mt-4">


            <MembershipEmptyState


              variant="no-data"


              onCreateMembership={()=>{


                setEditingMembership(
                  "new"
                );


              }}


            />


          </div>

        )


        :


        (

          <div className="mt-4">


            <MembershipTable



              memberships={
                memberships
              }



              loading={
                loading
              }



              selectedIds={
                selectedIds
              }



              onSelectionChange={
                setSelectedIds
              }



              onEdit={
                setEditingMembership
              }



              onDelete={
                handleDelete
              }



            />


          </div>


        )


      }









      {
        !loading &&
        totalCount > 0 && (


          <Pagination



            result={{

              page,

              pageSize:PAGE_SIZE,

              totalItems:
                totalCount,


              totalPages:
                Math.max(
                  1,
                  Math.ceil(
                    totalCount /
                    PAGE_SIZE
                  )
                )


            }}



            onPageChange={
              setPage
            }



          />


        )
      }







    </PageContainer>

  );

}