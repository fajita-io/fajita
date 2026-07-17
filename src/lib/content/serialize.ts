import { blocksToMarkdown } from "@/lib/docs/serialize";

import type {
  ContentArticle,
  ContentComparison,
  ContentResearch,
  ContentTool,
} from "./types";

const siteUrl =
  process.env.NEXT_PUBLIC_APP_URL?.replace(/\/$/, "") ?? "https://fajita.io";

export function articleToPlainText(article: ContentArticle): string {
  const { meta, body } = article;
  return [
    `# ${meta.title}`,
    "",
    meta.thesis,
    "",
    `Author: ${meta.author}`,
    `Published: ${meta.publishedAt ?? "n/a"}`,
    `Updated: ${meta.updatedAt}`,
    `Last reviewed: ${meta.lastReviewedAt}`,
    `Version: ${meta.contentVersion}`,
    `Canonical: ${siteUrl}/blog/${meta.slug}`,
    "",
    blocksToMarkdown(body),
    "",
    meta.originalContribution
      ? `Original contribution: ${meta.originalContribution}`
      : "",
  ]
    .filter(Boolean)
    .join("\n");
}

export function comparisonToPlainText(page: ContentComparison): string {
  const { meta, body } = page;
  return [
    `# ${meta.title}`,
    "",
    meta.summary,
    "",
    `Last reviewed: ${meta.lastReviewedAt}`,
    `Version: ${meta.contentVersion}`,
    `Canonical: ${siteUrl}/compare/${meta.slug}`,
    `Methodology: ${siteUrl}/compare/${meta.methodologySlug}`,
    "",
    `Best for Fajita: ${meta.fajitaBestFor}`,
    meta.competitorBestFor ? `Best for other: ${meta.competitorBestFor}` : "",
    "",
    "Fajita limitations:",
    ...meta.fajitaLimitations.map((l) => `- ${l}`),
    "",
    blocksToMarkdown(body),
    "",
    meta.trademarkNotice,
  ]
    .filter(Boolean)
    .join("\n");
}

export function toolToPlainText(tool: ContentTool): string {
  const { meta, body } = tool;
  return [
    `# ${meta.title}`,
    "",
    meta.description,
    "",
    `Privacy: ${meta.privacySummary}`,
    `Methodology: ${meta.methodologySummary}`,
    `Network access: ${meta.networkAccess ? "yes" : "no"}`,
    `Stores input: ${meta.storesInput ? "yes" : "no"}`,
    `Client-side only: ${meta.clientSideOnly ? "yes" : "no"}`,
    `Canonical: ${siteUrl}/tools/${meta.slug}`,
    "",
    blocksToMarkdown(body),
    "",
    "Limitations:",
    ...meta.limitations.map((l) => `- ${l}`),
  ].join("\n");
}

export function researchToPlainText(item: ContentResearch): string {
  const { meta, body } = item;
  return [
    `# ${meta.title}`,
    "",
    `Status: ${meta.status}`,
    `Question: ${meta.researchQuestion}`,
    `Minimum cohort: ${meta.minimumCohort}`,
    meta.organizationCount !== undefined
      ? `Organization count: ${meta.organizationCount}`
      : "",
    `Canonical: ${siteUrl}/research/${meta.slug}`,
    "",
    blocksToMarkdown(body),
  ]
    .filter(Boolean)
    .join("\n");
}
