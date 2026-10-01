import type { MetadataRoute } from "next";
import { appConfig } from "@/config/app";

export default function robots(): MetadataRoute.Robots {
  return {
    rules: {
      userAgent: "*",
      allow: "/",
      disallow: ["/admin/", "/account/", "/api/", "/checkout/"],
    },
    sitemap: `${appConfig.url}/sitemap.xml`,
    host: appConfig.url,
  };
}