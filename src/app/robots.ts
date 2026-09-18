import type { MetadataRoute } from "next";
import { siteUrl, CANONICAL_SITE_URL } from "@/lib/site";

export default function robots(): MetadataRoute.Robots {
  const base = siteUrl();
  const isProductionHost =
    base === CANONICAL_SITE_URL ||
    base === "https://www.veltrano.ma";
  const allowIndex =
    (isProductionHost && process.env.NODE_ENV === "production") ||
    process.env.VELTRANO_ALLOW_INDEXING === "1";

  if (!allowIndex) {
    return {
      rules: {
        userAgent: "*",
        disallow: "/",
      },
    };
  }

  return {
    rules: {
      userAgent: "*",
      allow: "/",
      disallow: ["/admin", "/api/", "/cart", "/checkout", "/thank-you", "/orders"],
    },
    sitemap: `${CANONICAL_SITE_URL}/sitemap.xml`,
    host: CANONICAL_SITE_URL,
  };
}
