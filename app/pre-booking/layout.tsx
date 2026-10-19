import type { Metadata } from "next";

export const metadata: Metadata = {
  title: "Pre-book & Bulk Book Orders",
  description:
    "Reserve selected upcoming books or explore bulk ordering at Karisal Books.",
  alternates: { canonical: "/pre-booking" },
};

export default function PreBookingLayout({
  children,
}: Readonly<{ children: React.ReactNode }>) {
  return children;
}
