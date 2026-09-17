import type { MetadataRoute } from "next";
import { siteUrl, CANONICAL_SITE_URL } from "@/lib/site";

export default function robots(): MetadataRoute.Robots {
  const base = siteUrl();
  const isProduction =
    base === CANONICAL_SITE_URL ||
    base === "https://www.veltrano.ma" ||
    process.env.VELTRANO_ALLOW_INDEXING === "1";

  if (!isProduction) {
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
    sitemap: `${base}/sitemap.xml`,
    host: base,
  };
}
