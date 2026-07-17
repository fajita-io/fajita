import type { ContentBlock } from "@/lib/docs/blocks";

import {
  articleFrontmatterSchema,
  comparisonFrontmatterSchema,
  researchFrontmatterSchema,
  toolFrontmatterSchema,
  type ArticleFrontmatter,
  type ComparisonFrontmatter,
  type ResearchFrontmatter,
  type ToolFrontmatter,
} from "./schema";

export interface ContentArticle {
  meta: ArticleFrontmatter;
  body: ContentBlock[];
  faqs?: { question: string; answer: string }[];
}

export interface ContentComparison {
  meta: ComparisonFrontmatter;
  body: ContentBlock[];
}

export interface ContentTool {
  meta: ToolFrontmatter;
  body: ContentBlock[];
}

export interface ContentResearch {
  meta: ResearchFrontmatter;
  body: ContentBlock[];
}

export type AnyContent =
  | ContentArticle
  | ContentComparison
  | ContentTool
  | ContentResearch;

export function defineArticle(input: {
  meta: Parameters<typeof articleFrontmatterSchema.parse>[0];
  body: ContentBlock[];
  faqs?: { question: string; answer: string }[];
}): ContentArticle {
  const meta = articleFrontmatterSchema.parse(input.meta);
  if (meta.status === "published") {
    assertPublicationGates(meta);
  }
  return { meta, body: input.body, faqs: input.faqs };
}

export function defineComparison(input: {
  meta: Parameters<typeof comparisonFrontmatterSchema.parse>[0];
  body: ContentBlock[];
}): ContentComparison {
  const meta = comparisonFrontmatterSchema.parse(input.meta);
  if (meta.status === "published") {
    if (!meta.comparisonFactReviewPassed) {
      throw new Error(`Comparison "${meta.slug}" missing comparison fact review`);
    }
    if (!meta.editorialReviewPassed || !meta.productReviewPassed) {
      throw new Error(`Comparison "${meta.slug}" missing required reviews`);
    }
    if (!meta.antiAiSlopPassed || !meta.originalityReviewPassed) {
      throw new Error(`Comparison "${meta.slug}" missing quality gates`);
    }
  }
  return { meta, body: input.body };
}

export function defineTool(input: {
  meta: Parameters<typeof toolFrontmatterSchema.parse>[0];
  body: ContentBlock[];
}): ContentTool {
  const meta = toolFrontmatterSchema.parse(input.meta);
  if (meta.status === "published") {
    if (!meta.securityReviewPassed || !meta.privacyReviewPassed) {
      throw new Error(`Tool "${meta.slug}" missing security/privacy review`);
    }
    if (!meta.calculationTestsPassed) {
      throw new Error(`Tool "${meta.slug}" missing calculation tests`);
    }
  }
  return { meta, body: input.body };
}

export function defineResearch(input: {
  meta: Parameters<typeof researchFrontmatterSchema.parse>[0];
  body: ContentBlock[];
}): ContentResearch {
  const meta = researchFrontmatterSchema.parse(input.meta);
  if (meta.status === "published") {
    if (!meta.privacyReviewPassed || !meta.methodologyComplete) {
      throw new Error(`Research "${meta.slug}" cannot publish without privacy and methodology`);
    }
    // Methodology templates are not studies and have no cohort.
    const isMethodologyTemplate = meta.slug.includes("methodology");
    if (!isMethodologyTemplate) {
      const orgs = meta.organizationCount ?? 0;
      if (orgs < meta.minimumCohort) {
        throw new Error(
          `Research "${meta.slug}" organizationCount ${orgs} below minimumCohort ${meta.minimumCohort}`,
        );
      }
    }
  }
  return { meta, body: input.body };
}

function assertPublicationGates(meta: ArticleFrontmatter): void {
  const required = [
    ["technicalReviewPassed", meta.technicalReviewPassed],
    ["editorialReviewPassed", meta.editorialReviewPassed],
    ["originalityReviewPassed", meta.originalityReviewPassed],
    ["antiAiSlopPassed", meta.antiAiSlopPassed],
  ] as const;
  for (const [name, ok] of required) {
    if (!ok) throw new Error(`Article "${meta.slug}" missing gate: ${name}`);
  }
  if (meta.requiresProductReview && !meta.productReviewPassed) {
    throw new Error(`Article "${meta.slug}" missing product review`);
  }
  if (meta.requiresSecurityReview && !meta.securityReviewPassed) {
    throw new Error(`Article "${meta.slug}" missing security review`);
  }
  if (meta.requiresLegalReview) {
    throw new Error(`Article "${meta.slug}" requires legal review before publish`);
  }
  if (!meta.publishedAt) {
    throw new Error(`Article "${meta.slug}" published without publishedAt`);
  }
  if (!meta.originalContribution || meta.originalContribution.length < 20) {
    throw new Error(`Article "${meta.slug}" missing original contribution`);
  }
}
