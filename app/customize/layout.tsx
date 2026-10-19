import type { Metadata } from "next";

export const metadata: Metadata = {
  title: "Customized Book Orders",
  description:
    "Explore customized book orders for events and special occasions at Karisal Books.",
  alternates: { canonical: "/customize" },
};

export default function CustomizeLayout({
  children,
}: Readonly<{ children: React.ReactNode }>) {
  return children;
}
