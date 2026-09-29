"use server";

import * as offerService from "../services/offer.service";

import type {
  OfferInsert,
  OfferUpdate,
} from "@/types/offer.types";


export async function listOffersAction(
  input?: any
) {
  return offerService.listOffers(input);
}



export async function createOfferAction(
  input: OfferInsert
) {
  return offerService.createOffer(input);
}



export async function updateOfferAction(
  id:string,
  input:OfferUpdate
) {
  return offerService.updateOffer(id,input);
}



export async function deleteOfferAction(
  id:string
) {
  return offerService.deleteOffer(id);
}