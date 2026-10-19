import { MainLayout } from "@/components/layout/MainLayout";

export default function TermsPage() {
  return (
    <MainLayout>
      <section className="container max-w-3xl py-10 sm:py-14">
        <p className="text-xs font-semibold uppercase text-primary">Karisal Books</p>
        <h1 className="mt-2 text-3xl font-semibold">Terms &amp; Conditions</h1>

        <section className="mt-8 space-y-3">
          <h2 className="text-lg font-semibold">Shipping and courier charges</h2>
          <p className="text-sm leading-6 text-muted-foreground">
            Standard courier pricing is ₹60 per started kilogram for Tamil Nadu and Puducherry, and ₹120 per started kilogram for other Indian states. Courier weight is calculated from the books in an order that do not have free delivery; their combined weight is rounded up to the next whole kilogram. Membership benefits reduce the applicable courier charge by 30% at checkout.
          </p>
          <p className="text-sm leading-6 text-muted-foreground">
            The other-state amount is an estimate. For destinations outside Tamil Nadu and Puducherry, the order may be sent through India Post and its final charge can vary with the packed parcel weight and destination. If the actual India Post charge differs from the estimate, our team will contact you before dispatch to confirm any adjustment.
          </p>
          <p className="text-sm leading-6 text-muted-foreground">
            Free-delivery books are excluded from the billable weight. Pre-booking delivery charges remain based on the per-copy rates shown for each title.
          </p>
        </section>

        <section className="mt-8 space-y-3">
          <h2 className="text-lg font-semibold">Membership discounts</h2>
          <p className="text-sm leading-6 text-muted-foreground">
            Membership discounts apply only to eligible books and active memberships. Only one membership number or coupon code may be used per order. Courier discounts apply to the displayed courier amount.
          </p>
        </section>
      </section>
    </MainLayout>
  );
}