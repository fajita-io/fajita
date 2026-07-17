import { publicTools } from "@/lib/content/registry";
import { siteUrl } from "@/lib/site/site-config";

export function GET() {
  const urls = [
    { loc: `${siteUrl}/tools`, lastmod: "2026-07-17" },
    ...publicTools().map((t) => ({
      loc: `${siteUrl}/tools/${t.meta.slug}`,
      lastmod: t.meta.updatedAt,
    })),
  ];

  const body = `<?xml version="1.0" encoding="UTF-8"?>
<urlset xmlns="http://www.sitemaps.org/schemas/sitemap/0.9">
${urls
  .map(
    (u) => `  <url><loc>${u.loc}</loc><lastmod>${u.lastmod}</lastmod></url>`,
  )
  .join("\n")}
</urlset>`;

  return new Response(body, {
    headers: { "Content-Type": "application/xml; charset=utf-8" },
  });
}
