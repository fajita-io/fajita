import { publicTerms } from "@/lib/glossary/registry";
import { siteUrl } from "@/lib/site/site-config";

export function GET() {
  const terms = publicTerms()
    .filter((term) => !term.meta.deprecated && !term.meta.noindex)
    .sort((a, b) => a.meta.term.localeCompare(b.meta.term));

  const items = terms
    .map(
      (term) => `<item>
  <title><![CDATA[${term.meta.term}]]></title>
  <link>${siteUrl}/glossary/${term.meta.slug}</link>
  <guid isPermaLink="true">${siteUrl}/glossary/${term.meta.slug}</guid>
  <pubDate>${new Date(`${term.meta.lastReviewedAt}T12:00:00Z`).toUTCString()}</pubDate>
  <description><![CDATA[${term.meta.shortDefinition}]]></description>
</item>`,
    )
    .join("\n");

  const xml = `<?xml version="1.0" encoding="UTF-8"?>
<rss version="2.0">
<channel>
  <title>Fajita Glossary</title>
  <link>${siteUrl}/glossary</link>
  <description>Software reliability definitions for monitoring, incidents, alerts, and status pages.</description>
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
