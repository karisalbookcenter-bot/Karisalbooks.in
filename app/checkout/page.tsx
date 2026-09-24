"use client";

import { MainLayout } from "@/components/layout/MainLayout";

export default function CheckoutPage() {
  return (
    <MainLayout>
      <div className="container py-10">

        <h1 className="text-3xl font-bold">
          Checkout
        </h1>

        <p className="mt-4 text-muted-foreground">
          Customer details and order confirmation will appear here.
        </p>

      </div>
    </MainLayout>
  );
}