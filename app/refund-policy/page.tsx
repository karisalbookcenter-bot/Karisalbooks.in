import { MainLayout } from "@/components/layout/MainLayout";

export default function RefundPolicyPage() {
  return (
    <MainLayout>
      <main className="container max-w-3xl py-10 sm:py-14">
        <p className="text-xs font-semibold uppercase text-primary">Karisal Books</p>
        <h1 className="mt-2 text-3xl font-semibold">Refund Policy</h1>

        <section className="mt-8 space-y-3">
          <h2 className="text-lg font-semibold">Requesting a refund</h2>
          <p className="text-sm leading-6 text-muted-foreground">
            If there is a problem with your order, contact Karisal Books with
            your order details and a description of the issue. Refund or
            replacement requests are reviewed based on the order and the
            circumstances reported. Please contact us before sending any item
            back.
          </p>
          <p className="text-sm leading-6 text-muted-foreground">
            We will confirm the available resolution after reviewing your
            request. If a refund is approved, the time it takes to appear in
            your account may depend on your payment provider.
          </p>
        </section>
      </main>
    </MainLayout>
  );
}
