import type { Metadata } from "next";

export const metadata: Metadata = {
  title: "Book Membership Plans & Benefits",
  description:
    "Explore Karisal Books membership plans, eligible book discounts and membership benefits.",
  alternates: { canonical: "/membership/apply" },
};

export default function MembershipLayout({
  children,
}: Readonly<{ children: React.ReactNode }>) {
  return children;
}
