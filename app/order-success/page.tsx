"use client";

import Link from "next/link";
import { useSearchParams } from "next/navigation";
import { Suspense } from "react";

import { MainLayout } from "@/components/layout/MainLayout";


export default function OrderSuccessPage() {
  return (
    <Suspense fallback={null}>
      <OrderSuccessContent />
    </Suspense>
  );
}

function OrderSuccessContent() {
  const searchParams = useSearchParams();
  const orderId = searchParams.get("orderId");
  const prebookingId = searchParams.get("prebookingId");
  const mixedOrderId = searchParams.get("mixedOrderId");
  const isPrebooking = Boolean(prebookingId);
  const isMixedOrder = Boolean(mixedOrderId);

  return (

    <MainLayout>

      <div className="container flex min-h-[60vh] flex-col items-center justify-center gap-5 text-center">


        <h1 className="text-3xl font-bold text-green-600">
          {isPrebooking ? "Pre-booking confirmed" : "Order placed successfully"}
        </h1>



        <p className="text-muted-foreground">
          {isPrebooking
            ? "உங்கள் முன்பதிவு வெற்றிகரமாக பதிவு செய்யப்பட்டுள்ளது."
            : isMixedOrder
              ? "முன்பதிவு நூல்களும் மற்ற நூல்களும் ஒரே ஆர்டராக பதிவு செய்யப்பட்டுள்ளன."
              : "உங்கள் ஆர்டர் வெற்றிகரமாக பதிவு செய்யப்பட்டுள்ளது."}
        </p>



        <p className="max-w-xl text-sm text-muted-foreground">
          உங்கள் Order ID-ஐ screenshot எடுத்து வைத்துக்கொள்ளுங்கள். ஆர்டர் விவரங்களை WhatsApp-ல் அனுப்பி இந்த screenshot-ஐ இணைக்கவும்.
        </p>

        {orderId && (
          <p className="text-sm font-medium">
            Order reference: <span className="font-mono">{orderId}</span>
          </p>
        )}

        {prebookingId && (
          <p className="text-base font-semibold">
            Pre-booking ID: <span className="font-mono">{prebookingId}</span>
          </p>
        )}
        {mixedOrderId && (
          <p className="text-base font-semibold">
            Mixed order reference: <span className="font-mono">{mixedOrderId}</span>
          </p>
        )}





        <div className="mt-4 flex gap-4">


          <Link

            href="/books"

            className="rounded-md bg-primary px-6 py-3 text-sm font-semibold text-white"

          >

            Continue Shopping

          </Link>




          <Link

            href="/"

            className="rounded-md border px-6 py-3 text-sm font-semibold"

          >

            Home

          </Link>



        </div>



      </div>


    </MainLayout>

  );

}