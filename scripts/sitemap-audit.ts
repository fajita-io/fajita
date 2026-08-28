#!/usr/bin/env tsx
/**
 * Verify sitemap.ts includes every indexable public route and excludes noindex pages.
 * Exit 1 on mismatch.
 */
import sitemap from "../src/app/sitemap";
import { AUTHORS } from "../src/lib/content/authors";
import { publishedClusters } from "../src/lib/content/clusters";
import { BLOG_CATEGORY_META } from "../src/lib/content/categories";
import {
  articlesInCategory,
  publicArticles,
  publicComparisons,
  publicResearch,
  publicTools,
} from "../src/lib/content/registry";
import { publicDocs } from "../src/lib/docs/registry";
import { GLOSSARY_CATEGORIES } from "../src/lib/glossary/frontmatter";
import { alphabetAvailability, publicTerms } from "../src/lib/glossary/registry";
import { featureOrder } from "../src/lib/site/features";
import { legalDocs } from "../src/lib/site/legal";

function pathFromUrl(url: string): string {
  const parsed = new URL(url);
  return parsed.pathname === "" ? "/" : parsed.pathname;
}

function expectedPaths(): Set<string> {
  const paths = new Set<string>([
    "/",
    "/pricing",
    "/features",
    "/integrations",
    "/support",
    "/security",
    "/about",
    "/contact",
    "/changelog",
    "/roadmap",
    "/status",
    "/affiliates",
    "/affiliates/apply",
    "/legal",
    "/docs",
    "/glossary",
    "/glossary/updates",
    "/blog",
    "/blog/updates",
    "/compare",
    "/tools",
  ]);

  for (const slug of featureOrder) paths.add(`/features/${slug}`);

  for (const doc of legalDocs) {
    if (doc.status === "in-force" && doc.href && !doc.noindex) {
      paths.add(doc.href);
    }
  }

  for (const page of publicDocs()) {
    if (!page.meta.deprecated && !page.meta.noindex) {
      paths.add(`/docs/${page.meta.slug}`);
    }
  }

  for (const category of GLOSSARY_CATEGORIES) {
    paths.add(`/glossary/category/${category}`);
  }

  for (const entry of alphabetAvailability()) {
    if (entry.count > 0) {
      paths.add(`/glossary/letter/${entry.letter}`);
    }
  }

  for (const term of publicTerms()) {
    if (!term.meta.deprecated && !term.meta.noindex) {
      paths.add(`/glossary/${term.meta.slug}`);
    }
  }

  for (const cat of Object.values(BLOG_CATEGORY_META)) {
    if (articlesInCategory(cat.id).length > 0) {
      paths.add(`/blog/category/${cat.slug}`);
    }
  }

  for (const article of publicArticles()) {
    paths.add(`/blog/${article.meta.slug}`);
  }

  for (const author of AUTHORS) {
    paths.add(`/blog/author/${author.slug}`);
  }

  for (const cluster of publishedClusters()) {
    paths.add(`/blog/topics/${cluster.id}`);
  }

  for (const page of publicComparisons()) {
    paths.add(`/compare/${page.meta.slug}`);
  }

  for (const tool of publicTools()) {
    paths.add(`/tools/${tool.meta.slug}`);
  }

  for (const item of publicResearch()) {
    if (item.meta.indexable !== false && !item.meta.noindex) {
      paths.add(`/research/${item.meta.slug}`);
    }
  }

  return paths;
}

function main() {
  const entries = sitemap();
  const sitemapPaths = new Set(entries.map((entry) => pathFromUrl(entry.url)));
  const expected = expectedPaths();

  const missing = [...expected].filter((path) => !sitemapPaths.has(path)).sort();
  const extra = [...sitemapPaths].filter((path) => !expected.has(path)).sort();

  if (missing.length > 0) {
    console.error("Missing from sitemap.xml:");
    for (const path of missing) console.error(`  - ${path}`);
  }

  if (extra.length > 0) {
    console.error("Unexpected entries in sitemap.xml:");
    for (const path of extra) console.error(`  - ${path}`);
  }

  if (missing.length > 0 || extra.length > 0) {
    console.error(
      `\nSitemap audit failed (${missing.length} missing, ${extra.length} extra).`,
    );
    process.exit(1);
  }

  console.log(`Sitemap audit passed (${sitemapPaths.size} indexable routes).`);
}

main();
