import type { Metadata } from "next";

import { createClient } from "@/lib/supabase/server";

interface BookLayoutProps {
  children: React.ReactNode;
  params: Promise<{ slug: string }>;
}

export async function generateMetadata({ params }: BookLayoutProps): Promise<Metadata> {
  const { slug } = await params;
  const supabase = await createClient();
  const { data: book } = await supabase
    .from("books")
    .select("title, description, cover_image_url")
    .eq("slug", slug)
    .eq("status", "active")
    .maybeSingle();

  if (!book) {
    return { title: "Book not found", robots: { index: false, follow: true } };
  }

  const description = book.description?.trim() || `Buy ${book.title} from Karisal Books.`;
  const canonical = `/books/${slug}`;

  return {
    title: book.title,
    description,
    alternates: { canonical },
    openGraph: {
      type: "website",
      title: book.title,
      description,
      url: canonical,
      images: book.cover_image_url ? [{ url: book.cover_image_url, alt: book.title }] : undefined,
    },
  };
}

export default function BookLayout({ children }: Pick<BookLayoutProps, "children">) {
  return children;
}