"use client";


import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { Button } from "@/components/ui/button";
import { useState } from "react";
import Image from "next/image";


import { useOfferForm } from "@/features/offers/hooks/useOfferForm";

import type { Offer } from "@/types/offer.types";



interface OfferFormLayoutProps {

  mode: "create" | "edit";

  initialOffer?: Offer;

  onSuccess?: (campaignMessage?: string) => void;

  onCancel?: () => void;

}




function offerToFormValues(
  offer: Offer
) {

  return {

    title: offer.title,

    description:
      offer.description ?? "",

    couponCode:
      offer.coupon_code ?? "",


    discountPercentage:
      String(offer.discount_percentage),


    startDate:
      offer.start_date
        ? offer.start_date.slice(0,10)
        : "",


    endDate:
      offer.end_date
        ? offer.end_date.slice(0,10)
        : "",


    status:
      offer.status,

    campaignPosterUrl: offer.campaign_poster_url ?? "",
    campaignPriceDetails: offer.campaign_price_details ?? "",
    campaignEmailSubject: offer.campaign_email_subject ?? "",
    campaignEmailBody: offer.campaign_email_body ?? "",
    sendCampaign: false,


  };

}







export function OfferFormLayout({

  mode,

  initialOffer,

  onSuccess,

  onCancel,

}: OfferFormLayoutProps) {

  const [posterUploading, setPosterUploading] = useState(false);
  const [posterError, setPosterError] = useState("");



  const {

    values,

    setField,

    submit,

    loading,

    error,

  } = useOfferForm({

    mode,

    offerId:
      initialOffer?.id,


    initialValues:
      initialOffer
        ? offerToFormValues(initialOffer)
        : undefined,


  });








  const handleSave = async () => {


    const result =
      await submit();


    if (result.error || !result.data) return;

    let campaignMessage = "Offer saved.";
    if (values.sendCampaign) {
      try {
        const response = await fetch("/api/admin/offers/send", {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({ offerId: result.data.id }),
        });
        const campaign = await response.json() as { sentCount?: number; failedCount?: number; error?: string };
        if (!response.ok) throw new Error(campaign.error ?? "Offer saved, but the email campaign could not be sent.");
        campaignMessage = `Offer saved. Sent: ${campaign.sentCount ?? 0}; failed: ${campaign.failedCount ?? 0}.`;
      } catch (campaignError) {
        campaignMessage = campaignError instanceof Error ? campaignError.message : "Offer saved, but the email campaign could not be sent.";
      }
    }

    onSuccess?.(campaignMessage);


  };

  async function uploadPoster(file: File | undefined) {
    if (!file) return;
    setPosterError("");
    setPosterUploading(true);
    try {
      const form = new FormData();
      form.set("file", file);
      const response = await fetch("/api/admin/site-assets", { method: "POST", body: form });
      const result = await response.json() as { url?: string; error?: string };
      if (!response.ok || !result.url) throw new Error(result.error ?? "Unable to upload campaign poster.");
      setField("campaignPosterUrl", result.url);
    } catch (uploadError) {
      setPosterError(uploadError instanceof Error ? uploadError.message : "Unable to upload campaign poster.");
    } finally {
      setPosterUploading(false);
    }
  }








  return (

    <div className="flex flex-col gap-4">



      <div>

        <Label>
          Offer Title
        </Label>


        <Input

          value={values.title}

          onChange={(e)=>
            setField(
              "title",
              e.target.value
            )
          }

        />

      </div>






      <div>

        <Label>
          Description
        </Label>


        <Textarea

          value={values.description}

          onChange={(e)=>
            setField(
              "description",
              e.target.value
            )
          }

        />

      </div>


      <div>

        <Label htmlFor="offer-coupon-code">
          Coupon Code
        </Label>

        <Input
          id="offer-coupon-code"
          value={values.couponCode}
          maxLength={32}
          placeholder="For example, PONGAL25"
          onChange={(e) =>
            setField("couponCode", e.target.value.toUpperCase())
          }
        />

      </div>







      <div>


        <Label>
          Discount Percentage
        </Label>



        <select

          className="
          border
          rounded-md
          h-10
          px-3
          "

          value={
            values.discountPercentage
          }


          onChange={(e)=>
            setField(
              "discountPercentage",
              e.target.value
            )
          }

        >


          {
            [5,10,15,20,25].map(
              (value)=>(

                <option

                  key={value}

                  value={value}

                >

                  {value}%


                </option>


              )
            )
          }


        </select>


      </div>







      <div className="grid grid-cols-2 gap-4">


        <div>

          <Label>
            Start Date
          </Label>


          <Input

            type="date"


            value={
              values.startDate
            }


            onChange={(e)=>
              setField(
                "startDate",
                e.target.value
              )
            }

          />


        </div>





        <div>

          <Label>
            End Date
          </Label>


          <Input

            type="date"


            value={
              values.endDate
            }


            onChange={(e)=>
              setField(
                "endDate",
                e.target.value
              )
            }

          />


        </div>


      </div>








      <div>


        <Label>
          Status
        </Label>


        <select

          className="
          border
          rounded-md
          h-10
          px-3
          "


          value={
            values.status
          }


          onChange={(e)=>
            setField(
              "status",
              e.target.value as
              "active" | "inactive"
            )
          }


        >

          <option value="active">
            Active
          </option>


          <option value="inactive">
            Inactive
          </option>


        </select>


      </div>







      <section className="space-y-4 border-t border-border pt-4">
        <div>
          <h3 className="text-sm font-semibold">Offer email campaign</h3>
          <p className="mt-1 text-xs leading-5 text-muted-foreground">Only customers who opted in to offers receive campaign email. New offers send after save; edits do not resend unless selected.</p>
        </div>

        <div>
          <Label htmlFor="offer-poster">Campaign poster</Label>
          <Input id="offer-poster" type="file" accept="image/jpeg,image/png,image/webp" disabled={posterUploading} onChange={(event) => void uploadPoster(event.target.files?.[0])} />
          {posterUploading && <p className="mt-1 text-xs text-muted-foreground">Uploading poster…</p>}
          {posterError && <p role="alert" className="mt-1 text-xs text-destructive">{posterError}</p>}
          {values.campaignPosterUrl && <div className="relative mt-3 h-48 w-full max-w-md"><Image src={values.campaignPosterUrl} alt="Offer poster preview" fill sizes="(max-width: 768px) 100vw, 448px" className="object-contain" /></div>}
        </div>

        <div>
          <Label htmlFor="offer-price-details">Price details</Label>
          <Textarea id="offer-price-details" value={values.campaignPriceDetails} onChange={(event) => setField("campaignPriceDetails", event.target.value)} placeholder="Eligible books, offer price, and exclusions" />
        </div>

        <div>
          <Label htmlFor="offer-email-subject">Email subject</Label>
          <Input id="offer-email-subject" maxLength={180} value={values.campaignEmailSubject} onChange={(event) => setField("campaignEmailSubject", event.target.value)} placeholder={`A special offer from Karisal Books: ${values.title || "{{title}}"}`} />
        </div>

        <div>
          <Label htmlFor="offer-email-body">Email message</Label>
          <Textarea id="offer-email-body" rows={6} maxLength={5000} value={values.campaignEmailBody} onChange={(event) => setField("campaignEmailBody", event.target.value)} placeholder={`Vanakkam {{name}},\n\n${values.title || "{{title}}"}\n{{description}}\n{{discount}}% off\n{{price_details}}\nCode: {{code}}\nValid until {{end_date}}`} />
          <p className="mt-1 text-xs text-muted-foreground">Tokens: {"{{name}}, {{title}}, {{description}}, {{discount}}, {{price_details}}, {{code}}, {{start_date}}, {{end_date}}, {{offer_url}}"}</p>
        </div>

        <div className="rounded-md border border-border bg-secondary/30 p-3">
          <p className="mb-2 text-xs font-semibold uppercase text-muted-foreground">Preview</p>
          <p className="font-semibold">{values.campaignEmailSubject || `A special offer from Karisal Books: ${values.title || "Offer title"}`}</p>
          <p className="mt-2 whitespace-pre-line text-sm text-muted-foreground">{values.campaignEmailBody || `Vanakkam {{name}},\n\n${values.title || "{{title}}"}\n{{description}}\n{{discount}}% off\n{{price_details}}\nCode: {{code}}\nValid until {{end_date}}`}</p>
        </div>

        <label className="flex items-start gap-2 text-sm">
          <input type="checkbox" checked={values.sendCampaign} onChange={(event) => setField("sendCampaign", event.target.checked)} className="mt-0.5 h-4 w-4 accent-primary" />
          <span>Email this campaign to opted-in customers after saving</span>
        </label>
      </section>

      {
        error && (

          <p className="
          text-sm
          text-destructive
          ">

            {error}

          </p>

        )
      }







      <div className="
      flex
      justify-end
      gap-3
      border-t
      pt-4
      ">


        <Button

          variant="outline"

          onClick={onCancel}

        >

          Cancel

        </Button>





        <Button

          onClick={handleSave}

          disabled={loading}

        >

          {
            loading
            ? "Saving..."
            : mode === "create"
              ? "Add Offer"
              : "Save Changes"
          }


        </Button>



      </div>



    </div>

  );

}