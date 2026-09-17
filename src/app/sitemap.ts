import type { MetadataRoute } from "next";
import { PRODUCTS } from "@/data/catalog";
import { siteUrl } from "@/lib/site";

export default function sitemap(): MetadataRoute.Sitemap {
  const base = siteUrl();
  const now = new Date();
  const staticRoutes: MetadataRoute.Sitemap = [
    { url: `${base}/`, lastModified: now, changeFrequency: "weekly", priority: 1 },
    { url: `${base}/boutique`, lastModified: now, changeFrequency: "weekly", priority: 0.9 },
    { url: `${base}/homme`, lastModified: now, changeFrequency: "weekly", priority: 0.9 },
    { url: `${base}/femme`, lastModified: now, changeFrequency: "monthly", priority: 0.5 },
    {
      url: `${base}/aide/livraison-retours`,
      lastModified: now,
      changeFrequency: "monthly",
      priority: 0.6,
    },
  ];
  const products = PRODUCTS.map((p) => ({
    url: `${base}/product/${p.slug}`,
    lastModified: now,
    changeFrequency: "weekly" as const,
    priority: 0.8,
  }));
  return [...staticRoutes, ...products];
}
