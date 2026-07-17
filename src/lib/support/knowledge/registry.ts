import { publicArticles, publicComparisons, publicTools } from "@/lib/content/registry";
import { publicDocs } from "@/lib/docs/registry";
import { blocksToMarkdown } from "@/lib/docs/serialize";
import { publicTerms } from "@/lib/glossary/registry";
import { publicClaims } from "@/lib/site/claims";
import { publicPlans, pricingConfig } from "@/lib/site/pricing";
import { PLANS } from "@/lib/stripe/plans";

import type { KnowledgeSource } from "./types";

const PRODUCT_VERSION = "2026.07";

function docsSources(): KnowledgeSource[] {
  return publicDocs()
    .filter((p) => !p.meta.deprecated && p.meta.status === "published")
    .map((page) => ({
      sourceId: `docs:${page.meta.slug}`,
      sourceType: "documentation_page" as const,
      title: page.meta.title,
      canonicalUrl: `/docs/${page.meta.slug}`,
      productArea: page.meta.category,
      audience: "both" as const,
      visibility: "public" as const,
      authorityLevel: 8,
      contentVersion: page.meta.docsVersion,
      productVersion: page.meta.productVersion,
      publishedAt: page.meta.lastReviewedAt,
      lastReviewedAt: page.meta.lastReviewedAt,
      deprecated: Boolean(page.meta.deprecated),
      replacementSource: page.meta.replacementSlug
        ? `docs:${page.meta.replacementSlug}`
        : undefined,
      indexableForChat: true,
      supportsPublicMode: true,
      supportsAuthenticatedMode: true,
      requiredPermissions: [],
      allowedAnswerTypes: ["product", "setup", "troubleshooting"],
      sensitivity: "public" as const,
      body: `${page.meta.title}\n${page.meta.description}\n${blocksToMarkdown(page.body)}`,
      keywords: page.meta.keywords ?? [],
    }));
}

function glossarySources(): KnowledgeSource[] {
  return publicTerms()
    .filter((term) => !term.meta.deprecated)
    .map((term) => ({
      sourceId: `glossary:${term.meta.slug}`,
      sourceType: "glossary_term" as const,
      title: term.meta.term,
      canonicalUrl: `/glossary/${term.meta.slug}`,
      productArea: term.meta.category,
      audience: "both" as const,
      visibility: "public" as const,
      authorityLevel: 6,
      contentVersion: term.meta.contentVersion,
      productVersion: term.meta.productVersion,
      publishedAt: term.meta.lastReviewedAt,
      lastReviewedAt: term.meta.lastReviewedAt,
      deprecated: Boolean(term.meta.deprecated),
      replacementSource: term.meta.replacementSlug
        ? `glossary:${term.meta.replacementSlug}`
        : undefined,
      indexableForChat: true,
      supportsPublicMode: true,
      supportsAuthenticatedMode: true,
      requiredPermissions: [],
      allowedAnswerTypes: ["definition"],
      sensitivity: "public" as const,
      body: `${term.meta.term}\n${term.meta.shortDefinition}\n${term.meta.shortAnswer}`,
      keywords: term.meta.synonyms ?? [],
    }));
}

function blogSources(): KnowledgeSource[] {
  return publicArticles().map((article) => ({
    sourceId: `blog:${article.meta.slug}`,
    sourceType: "blog_article" as const,
    title: article.meta.title,
    canonicalUrl: `/blog/${article.meta.slug}`,
    productArea: String(article.meta.category ?? "blog"),
    audience: "both" as const,
    visibility: "public" as const,
    authorityLevel: 4,
    contentVersion: article.meta.contentVersion,
    productVersion: article.meta.productVersion,
    publishedAt: article.meta.publishedAt ?? article.meta.updatedAt,
    lastReviewedAt: article.meta.lastReviewedAt,
    deprecated: Boolean(article.meta.deprecated),
    indexableForChat: true,
    supportsPublicMode: true,
    supportsAuthenticatedMode: true,
    requiredPermissions: [],
    allowedAnswerTypes: ["editorial"],
    sensitivity: "public" as const,
    body: `${article.meta.title}\n${article.meta.description}\n${article.meta.thesis}`,
    keywords: [
      article.meta.primaryQuery,
      ...article.meta.secondaryQueries,
      article.meta.topicCluster,
    ],
  }));
}

function comparisonSources(): KnowledgeSource[] {
  return publicComparisons().map((c) => ({
    sourceId: `compare:${c.meta.slug}`,
    sourceType: "comparison_page" as const,
    title: c.meta.title,
    canonicalUrl: `/compare/${c.meta.slug}`,
    productArea: "comparisons",
    audience: "both" as const,
    visibility: "public" as const,
    authorityLevel: 3,
    contentVersion: c.meta.contentVersion,
    productVersion: c.meta.productVersion,
    publishedAt: c.meta.publishedAt ?? c.meta.updatedAt,
    lastReviewedAt: c.meta.lastReviewedAt,
    deprecated: Boolean(c.meta.deprecated),
    indexableForChat: true,
    supportsPublicMode: true,
    supportsAuthenticatedMode: true,
    requiredPermissions: [],
    allowedAnswerTypes: ["comparison"],
    sensitivity: "public" as const,
    body: `${c.meta.title}\n${c.meta.description}\n${c.meta.summary}`,
    keywords: [c.meta.primaryQuery, ...c.meta.secondaryQueries, c.meta.topicCluster],
  }));
}

function toolSources(): KnowledgeSource[] {
  return publicTools().map((t) => ({
    sourceId: `tool:${t.meta.slug}`,
    sourceType: "tool_methodology" as const,
    title: t.meta.title,
    canonicalUrl: `/tools/${t.meta.slug}`,
    productArea: "tools",
    audience: "both" as const,
    visibility: "public" as const,
    authorityLevel: 3,
    contentVersion: t.meta.contentVersion,
    productVersion: t.meta.productVersion,
    publishedAt: t.meta.publishedAt ?? t.meta.updatedAt,
    lastReviewedAt: t.meta.lastReviewedAt,
    deprecated: Boolean(t.meta.deprecated),
    indexableForChat: true,
    supportsPublicMode: true,
    supportsAuthenticatedMode: true,
    requiredPermissions: [],
    allowedAnswerTypes: ["tool"],
    sensitivity: "public" as const,
    body: `${t.meta.title}\n${t.meta.description}`,
    keywords: [t.meta.primaryQuery, ...t.meta.secondaryQueries, t.meta.topicCluster],
  }));
}

function pricingSource(): KnowledgeSource {
  const lines = publicPlans.map((p) => {
    const limit =
      p.monitorLimit === null ? "unlimited monitors" : `${p.monitorLimit} monitors`;
    const price =
      pricingConfig.published && p.monthlyUsd != null
        ? `$${p.monthlyUsd}/mo, $${p.yearlyUsd}/yr`
        : "see pricing page";
    return `${p.name}: ${limit}; ${price}. ${p.audience}`;
  });
  return {
    sourceId: "registry:pricing",
    sourceType: "pricing_catalog",
    title: "Plans and pricing",
    canonicalUrl: "/pricing",
    productArea: "billing",
    audience: "both",
    visibility: "public",
    authorityLevel: 9,
    contentVersion: "2026.07",
    productVersion: PRODUCT_VERSION,
    publishedAt: "2026-07-17",
    lastReviewedAt: "2026-07-17",
    deprecated: false,
    indexableForChat: true,
    supportsPublicMode: true,
    supportsAuthenticatedMode: true,
    requiredPermissions: [],
    allowedAnswerTypes: ["pricing", "plan"],
    sensitivity: "public",
    body: `Fajita plans: ${lines.join(" ")} No free plan. Taxes may apply.`,
    keywords: ["pricing", "plans", "starter", "pro", "business", "cost"],
  };
}

function entitlementsSource(): KnowledgeSource {
  return {
    sourceId: "registry:entitlements",
    sourceType: "entitlement_registry",
    title: "Plan limits",
    canonicalUrl: "/pricing",
    productArea: "billing",
    audience: "both",
    visibility: "public",
    authorityLevel: 9,
    contentVersion: "2026.07",
    productVersion: PRODUCT_VERSION,
    publishedAt: "2026-07-17",
    lastReviewedAt: "2026-07-17",
    deprecated: false,
    indexableForChat: true,
    supportsPublicMode: true,
    supportsAuthenticatedMode: true,
    requiredPermissions: [],
    allowedAnswerTypes: ["plan", "limits"],
    sensitivity: "public",
    body: Object.values(PLANS)
      .map(
        (p) =>
          `${p.name}: ${p.monitorLimit === null ? "unlimited" : p.monitorLimit} active monitors. ${p.description}`,
      )
      .join(" "),
    keywords: ["limits", "entitlements", "monitors", "usage"],
  };
}

function claimsSource(): KnowledgeSource {
  const marketable = publicClaims.filter(
    (c) => c.status === "available-now" || c.status === "at-launch",
  );
  const unsupported = publicClaims.filter(
    (c) => c.status === "planned" || c.status === "internal-only",
  );
  return {
    sourceId: "registry:claims",
    sourceType: "product_claims_registry",
    title: "Product capabilities",
    canonicalUrl: "/docs",
    productArea: "product",
    audience: "both",
    visibility: "public",
    authorityLevel: 10,
    contentVersion: "2026.07",
    productVersion: PRODUCT_VERSION,
    publishedAt: "2026-07-17",
    lastReviewedAt: "2026-07-17",
    deprecated: false,
    indexableForChat: true,
    supportsPublicMode: true,
    supportsAuthenticatedMode: true,
    requiredPermissions: [],
    allowedAnswerTypes: ["product", "capability"],
    sensitivity: "public",
    body: [
      "Supported:",
      ...marketable.map((c) => c.statement),
      "Not currently supported or not marketable:",
      ...unsupported.map((c) => `${c.id}: ${c.statement} (${c.status})`),
    ].join("\n"),
    keywords: ["capabilities", "features", "sms", "api", "ssl", "alerts"],
  };
}

let CACHE: KnowledgeSource[] | null = null;

export function listKnowledgeSources(): KnowledgeSource[] {
  if (CACHE) return CACHE;
  CACHE = [
    ...docsSources(),
    ...glossarySources(),
    ...blogSources(),
    ...comparisonSources(),
    ...toolSources(),
    pricingSource(),
    entitlementsSource(),
    claimsSource(),
  ].filter((s) => s.indexableForChat && !s.deprecated);
  return CACHE;
}

export function getKnowledgeSource(id: string): KnowledgeSource | undefined {
  return listKnowledgeSources().find((s) => s.sourceId === id);
}

export function buildSupportSearchIndex(): KnowledgeSource[] {
  return listKnowledgeSources();
}

export function resetKnowledgeRegistryCache(): void {
  CACHE = null;
}
