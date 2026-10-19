import type { Metadata } from "next";

export const metadata: Metadata = {
  title: "Handpicked Book Recommendations",
  description:
    "Find your next read with curated Tamil book recommendations from Karisal Books.",
  alternates: { canonical: "/recommendations" },
};

export default function RecommendationsLayout({
  children,
}: Readonly<{ children: React.ReactNode }>) {
  return children;
}
