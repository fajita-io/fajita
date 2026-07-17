import { getAuthor } from "@/lib/content/authors";
import { publicArticles } from "@/lib/content/registry";
import { siteUrl } from "@/lib/site/site-config";

export function GET() {
  const articles = [...publicArticles()].sort((a, b) =>
    (b.meta.publishedAt ?? "").localeCompare(a.meta.publishedAt ?? ""),
  );

  const items = articles
    .map((a) => {
      const author = getAuthor(a.meta.author);
      return `<item>
  <title><![CDATA[${a.meta.title}]]></title>
  <link>${siteUrl}/blog/${a.meta.slug}</link>
  <guid isPermaLink="true">${siteUrl}/blog/${a.meta.slug}</guid>
  <pubDate>${new Date(`${a.meta.publishedAt}T12:00:00Z`).toUTCString()}</pubDate>
  <author>${author?.name ?? "Fajita Editorial"}</author>
  <category>${a.meta.category}</category>
  <description><![CDATA[${a.meta.description}]]></description>
</item>`;
    })
    .join("\n");

  const xml = `<?xml version="1.0" encoding="UTF-8"?>
<rss version="2.0">
<channel>
  <title>Fajita Blog</title>
  <link>${siteUrl}/blog</link>
  <description>Practical reliability thinking for small software teams.</description>
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
