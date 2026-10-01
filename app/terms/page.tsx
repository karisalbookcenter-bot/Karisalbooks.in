import { MainLayout } from "@/components/layout/MainLayout";

export default function TermsPage() {
  return (
    <MainLayout>
      <main className="container max-w-3xl py-10 sm:py-14">
        <p className="text-xs font-semibold uppercase text-primary">Karisal Books</p>
        <h1 className="mt-2 text-3xl font-semibold">Terms &amp; Conditions</h1>

        <section className="mt-8 space-y-3">
          <h2 className="text-lg font-semibold">Shipping and courier charges</h2>
          <p className="text-sm leading-6 text-muted-foreground">
            Standard courier pricing is ₹60 for Tamil Nadu and Puducherry, and ₹120 for other Indian states, for parcels up to 1 kg. Membership benefits reduce the applicable courier charge by 30% at checkout.
          </p>
          <p className="text-sm leading-6 text-muted-foreground">
            The other-state amount is an estimate. For destinations outside Tamil Nadu and Puducherry, the order may be sent through India Post and its final charge can vary with the packed parcel weight and destination. If the actual India Post charge differs from the estimate, our team will contact you before dispatch to confirm any adjustment.
          </p>
          <p className="text-sm leading-6 text-muted-foreground">
            Prices shown at checkout cover parcels up to 1 kg. Orders above that weight may require an additional courier amount based on the final packed weight.
          </p>
        </section>

        <section className="mt-8 space-y-3">
          <h2 className="text-lg font-semibold">Membership discounts</h2>
          <p className="text-sm leading-6 text-muted-foreground">
            Membership discounts apply only to eligible books and active memberships. Only one membership number or coupon code may be used per order. Courier discounts apply to the displayed courier amount.
          </p>
        </section>
      </main>
    </MainLayout>
  );
}