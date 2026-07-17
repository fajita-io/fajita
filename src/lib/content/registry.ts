import { blocksToMarkdown } from "@/lib/docs/serialize";

import { requireAuthor } from "./authors";
import { allArticles } from "./articles";
import { findForbiddenClaims } from "./claims";
import { allComparisons } from "./comparisons";
import { estimateWordCount, scanAntiAiSlop } from "./quality";
import { allResearch } from "./research";
import { allTools } from "./tools";
import type {
  ContentArticle,
  ContentComparison,
  ContentResearch,
  ContentTool,
} from "./types";

function assertNoEmDash(label: string, text: string): void {
  if (/\u2014|\u2013/.test(text) || / -- /.test(text)) {
    throw new Error(`${label}: contains em dash or -- pause`);
  }
}

function assertIntegrity(): void {
  const articleSlugs = new Set<string>();
  const comparisonSlugs = new Set<string>();
  const toolSlugs = new Set<string>();
  const researchSlugs = new Set<string>();

  for (const article of allArticles) {
    const { slug } = article.meta;
    if (articleSlugs.has(slug)) throw new Error(`Duplicate article slug: ${slug}`);
    articleSlugs.add(slug);
    requireAuthor(article.meta.author);
    const corpus = `${article.meta.thesis}\n${article.meta.description}\n${blocksToMarkdown(article.body)}`;
    assertNoEmDash(`article ${slug}`, corpus);
    for (const f of scanAntiAiSlop(corpus, slug)) {
      if (f.severity === "error") throw new Error(f.message);
    }
    const forbidden = findForbiddenClaims(corpus);
    if (forbidden.length) {
      throw new Error(`article ${slug}: forbidden claims ${forbidden.join(", ")}`);
    }
    if (article.meta.status === "published") {
      const words = estimateWordCount(corpus);
      // Soft floor: focused tutorials may be concise; validate script warns under 700.
      if (words < 350) {
        throw new Error(`article ${slug}: only ${words} words (need ~350+ useful words)`);
      }
    }
  }

  for (const page of allComparisons) {
    const { slug } = page.meta;
    if (comparisonSlugs.has(slug)) throw new Error(`Duplicate comparison slug: ${slug}`);
    comparisonSlugs.add(slug);
    requireAuthor(page.meta.author);
    const corpus = `${page.meta.summary}\n${blocksToMarkdown(page.body)}`;
    assertNoEmDash(`comparison ${slug}`, corpus);
    for (const f of scanAntiAiSlop(corpus, slug)) {
      if (f.severity === "error") throw new Error(f.message);
    }
  }

  for (const tool of allTools) {
    const { slug } = tool.meta;
    if (toolSlugs.has(slug)) throw new Error(`Duplicate tool slug: ${slug}`);
    toolSlugs.add(slug);
    requireAuthor(tool.meta.author);
    assertNoEmDash(`tool ${slug}`, `${tool.meta.privacySummary}\n${blocksToMarkdown(tool.body)}`);
  }

  for (const item of allResearch) {
    const { slug } = item.meta;
    if (researchSlugs.has(slug)) throw new Error(`Duplicate research slug: ${slug}`);
    researchSlugs.add(slug);
    requireAuthor(item.meta.author);
  }

  // Related content must resolve when published.
  for (const article of allArticles.filter((a) => a.meta.status === "published")) {
    for (const related of article.meta.relatedContent) {
      if (!articleSlugs.has(related)) {
        throw new Error(`article ${article.meta.slug}: missing related ${related}`);
      }
    }
    for (const tool of article.meta.relatedTools) {
      if (!toolSlugs.has(tool)) {
        throw new Error(`article ${article.meta.slug}: missing tool ${tool}`);
      }
    }
    for (const comparison of article.meta.relatedComparisons) {
      if (!comparisonSlugs.has(comparison)) {
        throw new Error(`article ${article.meta.slug}: missing comparison ${comparison}`);
      }
    }
  }
}

assertIntegrity();

const ARTICLES_BY_SLUG = new Map(allArticles.map((a) => [a.meta.slug, a]));
const COMPARISONS_BY_SLUG = new Map(allComparisons.map((c) => [c.meta.slug, c]));
const TOOLS_BY_SLUG = new Map(allTools.map((t) => [t.meta.slug, t]));
const RESEARCH_BY_SLUG = new Map(allResearch.map((r) => [r.meta.slug, r]));

export function getArticle(slug: string): ContentArticle | undefined {
  return ARTICLES_BY_SLUG.get(slug);
}

export function getComparison(slug: string): ContentComparison | undefined {
  return COMPARISONS_BY_SLUG.get(slug);
}

export function getTool(slug: string): ContentTool | undefined {
  return TOOLS_BY_SLUG.get(slug);
}

export function getResearch(slug: string): ContentResearch | undefined {
  return RESEARCH_BY_SLUG.get(slug);
}

export function publicArticles(): ContentArticle[] {
  return allArticles.filter(
    (a) =>
      a.meta.status === "published" &&
      !a.meta.deprecated &&
      a.meta.indexable &&
      !a.meta.noindex,
  );
}

export function publicComparisons(): ContentComparison[] {
  return allComparisons.filter(
    (c) =>
      c.meta.status === "published" &&
      !c.meta.deprecated &&
      c.meta.indexable &&
      !c.meta.noindex,
  );
}

export function publicTools(): ContentTool[] {
  return allTools.filter(
    (t) =>
      t.meta.status === "published" &&
      !t.meta.deprecated &&
      t.meta.indexable &&
      !t.meta.noindex,
  );
}

export function publicResearch(): ContentResearch[] {
  return allResearch.filter(
    (r) =>
      r.meta.status === "published" &&
      !r.meta.deprecated &&
      r.meta.indexable &&
      !r.meta.noindex,
  );
}

export function llmArticles(): ContentArticle[] {
  return publicArticles().filter((a) => a.meta.llmInclude);
}

export function llmComparisons(): ContentComparison[] {
  return publicComparisons().filter((c) => c.meta.llmInclude);
}

export function llmTools(): ContentTool[] {
  return publicTools().filter((t) => t.meta.llmInclude);
}

export function articlesInCategory(category: string): ContentArticle[] {
  return publicArticles()
    .filter((a) => a.meta.category === category)
    .sort((a, b) => (b.meta.publishedAt ?? "").localeCompare(a.meta.publishedAt ?? ""));
}

export function articlesByAuthor(author: string): ContentArticle[] {
  return publicArticles().filter((a) => a.meta.author === author);
}

export function featuredArticles(): ContentArticle[] {
  return publicArticles().filter((a) => a.meta.featured);
}

export function deepGuides(): ContentArticle[] {
  return publicArticles().filter((a) => a.meta.deepGuide);
}

export function latestArticles(limit = 10): ContentArticle[] {
  return [...publicArticles()]
    .sort((a, b) => (b.meta.publishedAt ?? "").localeCompare(a.meta.publishedAt ?? ""))
    .slice(0, limit);
}

export function relatedArticles(slug: string, limit = 4): ContentArticle[] {
  const article = getArticle(slug);
  if (!article) return [];
  const related = article.meta.relatedContent
    .map((s) => getArticle(s))
    .filter((a): a is ContentArticle => {
      return a !== undefined && a.meta.status === "published";
    });
  if (related.length >= limit) return related.slice(0, limit);
  const sameCluster = publicArticles().filter(
    (a) => a.meta.slug !== slug && a.meta.topicCluster === article.meta.topicCluster,
  );
  const merged = [...related];
  for (const a of sameCluster) {
    if (merged.length >= limit) break;
    if (!merged.some((m) => m.meta.slug === a.meta.slug)) merged.push(a);
  }
  return merged.slice(0, limit);
}

export function orphanArticles(): ContentArticle[] {
  const inbound = new Set<string>();
  for (const a of publicArticles()) {
    for (const r of a.meta.relatedContent) inbound.add(r);
  }
  return publicArticles().filter((a) => !inbound.has(a.meta.slug) && !a.meta.featured);
}

export function staleContent(asOf = "2026-07-17"): {
  articles: ContentArticle[];
  comparisons: ContentComparison[];
  tools: ContentTool[];
} {
  return {
    articles: allArticles.filter((a) => a.meta.nextReviewDue < asOf),
    comparisons: allComparisons.filter((c) => c.meta.nextReviewDue < asOf),
    tools: allTools.filter((t) => t.meta.nextReviewDue < asOf),
  };
}

export function contentManifest() {
  const siteUrl =
    process.env.NEXT_PUBLIC_APP_URL?.replace(/\/$/, "") ?? "https://fajita.io";

  const entries = [
    ...publicArticles().map((a) => ({
      id: a.meta.id,
      type: "article" as const,
      title: a.meta.title,
      canonicalUrl: `${siteUrl}/blog/${a.meta.slug}`,
      description: a.meta.description,
      category: a.meta.category,
      topicCluster: a.meta.topicCluster,
      searchIntent: a.meta.searchIntent,
      publishedAt: a.meta.publishedAt,
      updatedAt: a.meta.updatedAt,
      lastReviewedAt: a.meta.lastReviewedAt,
      contentVersion: a.meta.contentVersion,
      author: a.meta.author,
      relatedDocs: a.meta.relatedDocs,
      relatedGlossary: a.meta.relatedGlossary,
      relatedTools: a.meta.relatedTools,
      productArea: a.meta.topicCluster,
      plainTextRoute: `${siteUrl}/blog/raw/${a.meta.slug}`,
      indexable: a.meta.indexable,
      deprecated: a.meta.deprecated,
      replacementUrl: a.meta.replacementSlug
        ? `${siteUrl}/blog/${a.meta.replacementSlug}`
        : undefined,
    })),
    ...publicComparisons().map((c) => ({
      id: c.meta.id,
      type: "comparison" as const,
      title: c.meta.title,
      canonicalUrl: `${siteUrl}/compare/${c.meta.slug}`,
      description: c.meta.description,
      category: c.meta.comparisonType,
      topicCluster: c.meta.topicCluster,
      searchIntent: c.meta.searchIntent,
      publishedAt: c.meta.publishedAt,
      updatedAt: c.meta.updatedAt,
      lastReviewedAt: c.meta.lastReviewedAt,
      contentVersion: c.meta.contentVersion,
      author: c.meta.author,
      relatedDocs: c.meta.relatedDocs,
      relatedGlossary: c.meta.relatedGlossary,
      relatedTools: c.meta.relatedTools,
      productArea: c.meta.topicCluster,
      plainTextRoute: `${siteUrl}/compare/raw/${c.meta.slug}`,
      indexable: c.meta.indexable,
      deprecated: c.meta.deprecated,
    })),
    ...publicTools().map((t) => ({
      id: t.meta.id,
      type: "tool" as const,
      title: t.meta.title,
      canonicalUrl: `${siteUrl}/tools/${t.meta.slug}`,
      description: t.meta.description,
      category: "tool",
      topicCluster: t.meta.topicCluster,
      searchIntent: t.meta.searchIntent,
      publishedAt: t.meta.publishedAt,
      updatedAt: t.meta.updatedAt,
      lastReviewedAt: t.meta.lastReviewedAt,
      contentVersion: t.meta.contentVersion,
      author: t.meta.author,
      relatedDocs: t.meta.relatedDocs,
      relatedGlossary: t.meta.relatedGlossary,
      relatedTools: [],
      productArea: t.meta.topicCluster,
      plainTextRoute: `${siteUrl}/tools/raw/${t.meta.slug}`,
      indexable: t.meta.indexable,
      deprecated: t.meta.deprecated,
    })),
    ...publicResearch().map((r) => ({
      id: r.meta.id,
      type: "research" as const,
      title: r.meta.title,
      canonicalUrl: `${siteUrl}/research/${r.meta.slug}`,
      description: r.meta.description,
      category: r.meta.researchType,
      topicCluster: r.meta.topicCluster,
      searchIntent: r.meta.searchIntent,
      publishedAt: r.meta.publishedAt,
      updatedAt: r.meta.updatedAt,
      lastReviewedAt: r.meta.lastReviewedAt,
      contentVersion: r.meta.contentVersion,
      author: r.meta.author,
      relatedDocs: r.meta.relatedDocs,
      relatedGlossary: r.meta.relatedGlossary,
      relatedTools: r.meta.relatedTools,
      productArea: r.meta.topicCluster,
      plainTextRoute: `${siteUrl}/research/raw/${r.meta.slug}`,
      indexable: r.meta.indexable,
      deprecated: r.meta.deprecated,
    })),
  ];

  return {
    version: "2026-07-17",
    generatedAt: "2026-07-17",
    entries,
  };
}

export {
  allArticles,
  allComparisons,
  allResearch,
  allTools,
};
