"use client";

import Link from "next/link";

import { MainLayout } from "@/components/layout/MainLayout";


export default function OrderSuccessPage() {


  return (

    <MainLayout>

      <div className="container flex min-h-[60vh] flex-col items-center justify-center gap-5 text-center">


        <h1 className="text-3xl font-bold text-green-600">
          Order placed successfully 🎉
        </h1>



        <p className="text-muted-foreground">
          உங்கள் ஆர்டர் வெற்றிகரமாக பதிவு செய்யப்பட்டுள்ளது.
        </p>



        <p className="text-sm text-muted-foreground">
          நாங்கள் விரைவில் உங்கள் ஆர்டரை செயல்படுத்துவோம்.
        </p>





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