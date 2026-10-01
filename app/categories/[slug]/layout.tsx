import type { Metadata } from "next";

import { createClient } from "@/lib/supabase/server";

interface CategoryLayoutProps {
  children: React.ReactNode;
  params: Promise<{ slug: string }>;
}

export async function generateMetadata({ params }: CategoryLayoutProps): Promise<Metadata> {
  const { slug } = await params;
  const supabase = await createClient();
  const { data: category } = await supabase
    .from("categories")
    .select("name, description")
    .eq("slug", slug)
    .eq("status", "active")
    .maybeSingle();

  if (!category) {
    return { title: "Category not found", robots: { index: false, follow: true } };
  }

  const description = category.description?.trim() || `Browse ${category.name} books at Karisal Books.`;
  const canonical = `/categories/${slug}`;

  return {
    title: `${category.name} Books`,
    description,
    alternates: { canonical },
    openGraph: {
      type: "website",
      title: `${category.name} Books`,
      description,
      url: canonical,
    },
  };
}

export default function CategoryLayout({ children }: Pick<CategoryLayoutProps, "children">) {
  return children;
}