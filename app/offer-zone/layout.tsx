import type { Metadata } from "next";

export const metadata: Metadata = {
  title: "Book Offers & Membership Benefits",
  description:
    "Discover current Karisal Books offers, membership benefits, coupons and pre-booking deals.",
  alternates: { canonical: "/offer-zone" },
};

export default function OfferZoneLayout({
  children,
}: Readonly<{ children: React.ReactNode }>) {
  return children;
}
