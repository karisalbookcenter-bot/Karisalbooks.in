import { MainLayout } from "@/components/layout/MainLayout";

export default function AboutPage() {
  return (
    <MainLayout>
      <main className="container max-w-3xl py-10 sm:py-14">
        <p className="text-xs font-semibold uppercase text-primary">Karisal Books</p>
        <h1 className="mt-2 text-3xl font-semibold">About Us</h1>

        <section className="mt-8 space-y-3">
          <h2 className="text-lg font-semibold">Our address</h2>
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
