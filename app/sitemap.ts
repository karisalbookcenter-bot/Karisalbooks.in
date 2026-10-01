import type { MetadataRoute } from "next";
import { appConfig } from "@/config/app";
import { createAdminClient } from "@/lib/supabase/admin";

export const dynamic = "force-dynamic";

export default async function sitemap(): Promise<MetadataRoute.Sitemap> {
  const lastModified = new Date();
  const baseRoutes: MetadataRoute.Sitemap = [
    { url: appConfig.url, lastModified, changeFrequency: "weekly", priority: 1 },
    { url: `${appConfig.url}/books`, lastModified, changeFrequency: "daily", priority: 0.9 },
    { url: `${appConfig.url}/membership/apply`, lastModified, changeFrequency: "monthly", priority: 0.7 },
  ];

  try {
    const supabase = createAdminClient();
    const [{ data: books }, { data: categories }] = await Promise.all([
      supabase.from("books").select("slug, updated_at").eq("status", "active").limit(50000),
      supabase.from("categories").select("slug, updated_at").eq("status", "active").limit(5000),
    ]);

    return [
      ...baseRoutes,
      ...(categories ?? []).map((category) => ({
        url: `${appConfig.url}/categories/${category.slug}`,
        lastModified: category.updated_at ? new Date(category.updated_at) : lastModified,
        changeFrequency: "weekly" as const,
        priority: 0.7,
      })),
      ...(books ?? []).map((book) => ({
        url: `${appConfig.url}/books/${book.slug}`,
        lastModified: book.updated_at ? new Date(book.updated_at) : lastModified,
        changeFrequency: "weekly" as const,
        priority: 0.8,
      })),
    ];
  } catch {
    return baseRoutes;
  }
}