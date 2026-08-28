import { AUTHORS } from "@/lib/content/authors";
import { publishedClusters } from "@/lib/content/clusters";
import { BLOG_CATEGORY_META } from "@/lib/content/categories";
import { articlesInCategory, publicArticles } from "@/lib/content/registry";
import { siteUrl } from "@/lib/site/site-config";

export function GET() {
  const urls: { loc: string; lastmod: string }[] = [
    { loc: `${siteUrl}/blog`, lastmod: "2026-07-17" },
    { loc: `${siteUrl}/blog/updates`, lastmod: "2026-07-17" },
  ];

  for (const cat of Object.values(BLOG_CATEGORY_META)) {
    if (articlesInCategory(cat.id).length) {
      urls.push({
        loc: `${siteUrl}/blog/category/${cat.slug}`,
        lastmod: "2026-07-17",
      });
    }
  }

  for (const a of publicArticles()) {
    urls.push({
      loc: `${siteUrl}/blog/${a.meta.slug}`,
      lastmod: a.meta.updatedAt,
    });
  }

  for (const author of AUTHORS) {
    urls.push({
      loc: `${siteUrl}/blog/author/${author.slug}`,
      lastmod: "2026-07-17",
    });
  }

  for (const cluster of publishedClusters()) {
    urls.push({
      loc: `${siteUrl}/blog/topics/${cluster.id}`,
      lastmod: "2026-07-17",
    });
  }

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
