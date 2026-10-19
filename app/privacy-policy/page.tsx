import { MainLayout } from "@/components/layout/MainLayout";

export default function PrivacyPolicyPage() {
  return (
    <MainLayout>
      <main className="container max-w-3xl py-10 sm:py-14">
        <p className="text-xs font-semibold uppercase text-primary">Karisal Books</p>
        <h1 className="mt-2 text-3xl font-semibold">Privacy Policy</h1>

        <section className="mt-8 space-y-3">
          <h2 className="text-lg font-semibold">Information we use</h2>
          <p className="text-sm leading-6 text-muted-foreground">
            When you place an order or contact us, we use the information you
            provide, such as your name, contact details, delivery address and
            order information, to process and deliver your order and respond to
            your requests.
          </p>
        </section>

        <section className="mt-8 space-y-3">
          <h2 className="text-lg font-semibold">Payments and sharing</h2>
          <p className="text-sm leading-6 text-muted-foreground">
            Online payments are handled through the payment service shown at
            checkout. We share information as needed to complete your order,
            arrange delivery and provide customer support.
          </p>
        </section>

        <section className="mt-8 space-y-3">
          <h2 className="text-lg font-semibold">Privacy questions</h2>
          <p className="text-sm leading-6 text-muted-foreground">
            For questions about your information, contact Karisal Books at:
          </p>
          <address className="text-sm not-italic leading-6 text-muted-foreground">
            Karisal Book Center
            <br />
            1-337, East Street, Kalingapatti
            <br />
            Tenkasi District - 627719
          </address>
        </section>
      </main>
    </MainLayout>
  );
}
