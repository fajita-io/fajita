import { blocksToMarkdown } from "@/lib/docs/serialize";

import { publicArticles, publicComparisons, publicTools } from "./registry";

export interface ContentSearchHit {
  type: "article" | "comparison" | "tool" | "research";
  slug: string;
  title: string;
  description: string;
  href: string;
  category?: string;
  score: number;
}

const SECRETISH =
  /(sk_live_|sk_test_|whsec_|Bearer\s+[A-Za-z0-9]|eyJ[A-Za-z0-9_-]+\.|@[a-z0-9.-]+\.[a-z]{2,}|https?:\/\/\S+\?[^\s]+|\b(?:\d{1,3}\.){3}\d{1,3}\b)/i;

export function sanitizeSearchQuery(raw: string): {
  query: string;
  redacted: boolean;
} {
  let redacted = false;
  let query = raw.slice(0, 200);
  if (SECRETISH.test(query)) {
    query = query.replace(SECRETISH, "[redacted]");
    redacted = true;
  }
  return { query: query.trim(), redacted };
}

function scoreText(haystack: string, needle: string): number {
  const h = haystack.toLowerCase();
  const n = needle.toLowerCase();
  if (!n) return 0;
  if (h === n) return 100;
  if (h.startsWith(n)) return 80;
  if (h.includes(n)) return 50;
  // crude token overlap
  const tokens = n.split(/\s+/).filter(Boolean);
  let hit = 0;
  for (const t of tokens) if (h.includes(t)) hit += 1;
  return hit * 10;
}

export function searchContent(rawQuery: string, limit = 20): ContentSearchHit[] {
  const { query } = sanitizeSearchQuery(rawQuery);
  if (query.length < 2) return [];

  const hits: ContentSearchHit[] = [];

  for (const article of publicArticles()) {
    const corpus = [
      article.meta.title,
      article.meta.description,
      article.meta.thesis,
      article.meta.category,
      article.meta.topicCluster,
      article.meta.primaryQuery,
      blocksToMarkdown(article.body),
    ].join("\n");
    const score = scoreText(corpus, query);
    if (score > 0) {
      hits.push({
        type: "article",
        slug: article.meta.slug,
        title: article.meta.title,
        description: article.meta.description,
        href: `/blog/${article.meta.slug}`,
        category: article.meta.category,
        score,
      });
    }
  }

  for (const page of publicComparisons()) {
    const corpus = [
      page.meta.title,
      page.meta.description,
      page.meta.summary,
      blocksToMarkdown(page.body),
    ].join("\n");
    const score = scoreText(corpus, query);
    if (score > 0) {
      hits.push({
        type: "comparison",
        slug: page.meta.slug,
        title: page.meta.title,
        description: page.meta.description,
        href: `/compare/${page.meta.slug}`,
        score,
      });
    }
  }

  for (const tool of publicTools()) {
    const corpus = [
      tool.meta.title,
      tool.meta.description,
      tool.meta.methodologySummary,
      blocksToMarkdown(tool.body),
    ].join("\n");
    const score = scoreText(corpus, query);
    if (score > 0) {
      hits.push({
        type: "tool",
        slug: tool.meta.slug,
        title: tool.meta.title,
        description: tool.meta.description,
        href: `/tools/${tool.meta.slug}`,
        score,
      });
    }
  }

  return hits.sort((a, b) => b.score - a.score).slice(0, limit);
}
