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
  const emailSent = searchParams.get("emailSent") === "true";

  return (

    <MainLayout>

      <div className="container flex min-h-[60vh] flex-col items-center justify-center gap-5 text-center">


        <h1 className="text-3xl font-bold text-green-600">
          {prebookingId ? "Pre-booking confirmed" : "Order placed successfully"}
        </h1>



        <p className="text-muted-foreground">
          {prebookingId ? "உங்கள் முன்பதிவு வெற்றிகரமாக பதிவு செய்யப்பட்டுள்ளது." : "உங்கள் ஆர்டர் வெற்றிகரமாக பதிவு செய்யப்பட்டுள்ளது."}
        </p>



        <p className="text-sm text-muted-foreground">
          {prebookingId ? emailSent ? "புத்தகம் விநியோகத்திற்குத் தயாரானதும் உங்களுக்கு மின்னஞ்சல் அனுப்புவோம்." : "முன்பதிவு உறுதியாகியுள்ளது. மின்னஞ்சல் வரவில்லை என்றால் இந்த ID-ஐ ஆதரவுக் குழுவிடம் தெரிவிக்கவும்." : "நாங்கள் விரைவில் உங்கள் ஆர்டரை செயல்படுத்துவோம்."}
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