"use client";

import { useCallback, useEffect, useState } from "react";

import {
  PageContainer,
} from "@/components/common";

import {
  listOffersAction,
  deleteOfferAction,
} from "@/features/offers/actions/offer.actions";

import type {
  Offer,
} from "@/types/offer.types";

import {
  OfferToolbar,
} from "./OfferToolbar";

import {
  OfferTable,
} from "./OfferTable";

import {
  OfferFormLayout,
} from "./OfferFormLayout";


export function OfferManagementOverview() {


  const [offers, setOffers] = useState<Offer[]>([]);

  const [loading, setLoading] = useState(true);

  const [editingOffer, setEditingOffer] =
    useState<Offer | null | "new">(null);



  const loadOffers = useCallback(async () => {

    setLoading(true);


    const result =
      await listOffersAction({

        page: 1,

        pageSize: 100,

      });



    if (result.data) {

      setOffers(
        result.data.items
      );

    }


    setLoading(false);


  }, []);





  useEffect(() => {

    loadOffers();

  }, [loadOffers]);







  const handleDelete = async (
    offer: Offer
  ) => {


    const confirmDelete =
      window.confirm(
        "Delete this offer?"
      );


    if (!confirmDelete) return;



    await deleteOfferAction(
      offer.id
    );


    loadOffers();


  };







  return (

    <PageContainer

      title="Offers"

      description={`${offers.length} offers available`}

    >



      <OfferToolbar

        onAddOffer={() =>
          setEditingOffer("new")
        }

      />





      {
        editingOffer && (

          <div
            className="
              mb-5
              rounded-md
              border
              bg-card
              p-4
            "
          >


            <OfferFormLayout

              mode={
                editingOffer === "new"
                  ? "create"
                  : "edit"
              }



              initialOffer={
                editingOffer === "new"
                  ? undefined
                  : editingOffer
              }



              onCancel={() =>
                setEditingOffer(null)
              }



              onSuccess={() => {

                setEditingOffer(null);

                loadOffers();

              }}

            />


          </div>

        )
      }







      <OfferTable

        offers={offers}

        loading={loading}


        onEdit={(offer) =>
          setEditingOffer(offer)
        }



        onDelete={handleDelete}

      />



    </PageContainer>

  );

}