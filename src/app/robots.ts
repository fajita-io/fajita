import type { MetadataRoute } from "next";

const siteUrl =
  process.env.NEXT_PUBLIC_APP_URL?.replace(/\/$/, "") ?? "https://fajita.io";

export default function robots(): MetadataRoute.Robots {
  return {
    rules: [
      {
        userAgent: "*",
        allow: "/",
        // /docs/raw is the plain-text mirror of pages (for AI ingestion), not
        // a canonical indexable surface. Search results and previews stay out.
        disallow: [
          "/api/",
          "/internal/",
          "/docs/raw/",
          "/glossary/raw/",
          "/blog/raw/",
          "/compare/raw/",
          "/tools/raw/",
          "/research/raw/",
          "/glossary/search",
        ],
      },
    ],
    sitemap: `${siteUrl}/sitemap.xml`,
    host: siteUrl,
  };
}
