import { publicDocs } from "@/lib/docs/registry";
import { siteUrl } from "@/lib/site/site-config";

export function GET() {
  const pages = publicDocs()
    .filter((page) => !page.meta.deprecated && !page.meta.noindex)
    .sort((a, b) => a.meta.title.localeCompare(b.meta.title));

  const items = pages
    .map(
      (page) => `<item>
  <title><![CDATA[${page.meta.title}]]></title>
  <link>${siteUrl}/docs/${page.meta.slug}</link>
  <guid isPermaLink="true">${siteUrl}/docs/${page.meta.slug}</guid>
  <pubDate>${new Date(`${page.meta.lastReviewedAt}T12:00:00Z`).toUTCString()}</pubDate>
  <description><![CDATA[${page.meta.description}]]></description>
</item>`,
    )
    .join("\n");

  const xml = `<?xml version="1.0" encoding="UTF-8"?>
<rss version="2.0">
<channel>
  <title>Fajita Documentation</title>
  <link>${siteUrl}/docs</link>
  <description>Product documentation for Fajita uptime monitoring, alerts, and status pages.</description>
  <language>en</language>
  ${items}
</channel>
</rss>`;

  return new Response(xml, {
    headers: {
      "Content-Type": "application/rss+xml; charset=utf-8",
      "Cache-Control": "public, max-age=1800",
    },
  });
}
