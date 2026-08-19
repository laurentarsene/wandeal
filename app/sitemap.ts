import type { MetadataRoute } from "next";
import { site } from "@/lib/site";

export default function sitemap(): MetadataRoute.Sitemap {
  return [
    {
      url: site.url,
      lastModified: new Date(),
      changeFrequency: "weekly",
      priority: 1,
    },
    {
      url: `${site.url}/legal`,
      lastModified: new Date(site.legalUpdated),
      changeFrequency: "yearly",
      priority: 0.2,
    },
  ];
}
