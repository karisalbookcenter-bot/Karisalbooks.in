import type { Metadata } from "next";

export const metadata: Metadata = {
  title: "Tamil Books & New Arrivals",
  description:
    "Browse Tamil literature, competitive exam books and new arrivals at Karisal Books. Search by title, author, category or publisher.",
  alternates: { canonical: "/books" },
  openGraph: {
    type: "website",
    title: "Browse Tamil Books | Karisal Books",
    description:
      "Discover Tamil books, study materials and new arrivals at Karisal Books.",
    url: "/books",
  },
};

export default function BooksLayout({
  children,
}: Readonly<{ children: React.ReactNode }>) {
  return children;
}
