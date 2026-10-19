import type { Metadata } from "next";
import Link from "next/link";
import { MainLayout } from "@/components/layout/MainLayout";

export const metadata: Metadata = {
  title: "Contact Karisal Books",
  description:
    "Contact Karisal Books or visit our book center in Kalingapatti, Tenkasi District.",
};

export default function ContactPage() {
  return (
    <MainLayout>
      <section className="container max-w-3xl py-10 sm:py-14">
        <p className="text-xs font-semibold uppercase text-primary">Karisal Books</p>
        <h1 className="mt-2 text-3xl font-semibold">Contact Us</h1>
        <p className="mt-3 max-w-2xl text-sm leading-6 text-muted-foreground">
          Find our book center address below. For order questions, you can
          check your order status or sign in to your account.
        </p>

        <section className="mt-8 rounded-2xl border border-border bg-card p-5 sm:p-6">
          <h2 className="text-lg font-semibold">Visit Karisal Book Center</h2>
          <address className="mt-3 text-sm not-italic leading-6 text-muted-foreground">
            Karisal Book Center
            <br />
            1-337, East Street, Kalingapatti
            <br />
            Tenkasi District - 627719
          </address>
        </section>

        <div className="mt-6 flex flex-wrap gap-3">
          <Link href="/track-order" className="inline-flex min-h-11 items-center rounded-lg bg-primary px-4 text-sm font-semibold text-primary-foreground hover:opacity-90">
            Track an order
          </Link>
          <Link href="/account" className="inline-flex min-h-11 items-center rounded-lg border border-border px-4 text-sm font-semibold hover:bg-secondary">
            My account
          </Link>
        </div>
      </section>
    </MainLayout>
  );
}
