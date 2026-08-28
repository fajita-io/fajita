import { GLOSSARY_CATEGORIES } from "@/lib/glossary/frontmatter";
import { alphabetAvailability, publicTerms } from "@/lib/glossary/registry";
import { siteUrl } from "@/lib/site/site-config";

export const dynamic = "force-static";

function urlEntry(path: string, lastmod: string, priority: string) {
  return `  <url>
    <loc>${siteUrl}${path}</loc>
    <lastmod>${lastmod}</lastmod>
    <changefreq>monthly</changefreq>
    <priority>${priority}</priority>
  </url>`;
}

export function GET() {
  const terms = publicTerms().filter((t) => !t.meta.noindex && !t.meta.deprecated);
  const parts = [
    urlEntry("/glossary", "2026-07-17", "0.8"),
    urlEntry("/glossary/updates", "2026-07-17", "0.4"),
    ...GLOSSARY_CATEGORIES.map((c) =>
      urlEntry(`/glossary/category/${c}`, "2026-07-17", "0.6"),
    ),
    ...alphabetAvailability()
      .filter((entry) => entry.count > 0)
      .map((entry) =>
        urlEntry(`/glossary/letter/${entry.letter}`, "2026-07-17", "0.45"),
      ),
    ...terms.map((t) =>
      urlEntry(`/glossary/${t.meta.slug}`, t.meta.lastReviewedAt, "0.55"),
    ),
  ];

  const xml = `<?xml version="1.0" encoding="UTF-8"?>
<urlset xmlns="http://www.sitemaps.org/schemas/sitemap/0.9">
${parts.join("\n")}
</urlset>
`;

  return new Response(xml, {
    headers: {
      "Content-Type": "application/xml; charset=utf-8",
      "Cache-Control": "public, max-age=3600, s-maxage=86400",
    },
  });
}
