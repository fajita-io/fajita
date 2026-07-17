import { h2, ol, p, ul } from "@/lib/docs/blocks";

import { defineComparison } from "../types";

/**
 * Public comparison methodology. Always published with the compare index.
 */
export const comparisonMethodology = defineComparison({
  meta: {
    id: "comparison-methodology",
    contentType: "comparison",
    slug: "comparison-methodology",
    title: "How Fajita Researches Product Comparisons",
    description:
      "How Fajita verifies competitor facts, handles pricing, lists limitations, and accepts corrections on comparison pages.",
    status: "published",
    comparisonType: "category",
    topicCluster: "uptime-monitoring",
    primaryQuery: "fajita comparison methodology",
    secondaryQueries: ["how fajita compares monitoring tools"],
    searchIntent: "reference",
    audience: "Buyers evaluating monitoring tools",
    funnelStage: "evaluation",
    author: "fajita-editorial",
    owner: "content-editorial",
    reviewers: ["product", "editorial", "legal"],
    publishedAt: "2026-07-17",
    updatedAt: "2026-07-17",
    lastReviewedAt: "2026-07-17",
    nextReviewDue: "2026-10-17",
    contentVersion: "1",
    productVersion: "1.0",
    summary:
      "Comparisons use dated official sources, separate facts from interpretation, include competitor strengths and Fajita limitations, and never invent prices or ratings.",
    fajitaBestFor:
      "Readers who want transparent, dated comparison notes rather than attack pages.",
    fajitaLimitations: [
      "Fajita authors these pages and is not an independent review lab.",
      "Competitor pricing and limits change; always confirm on official sites.",
    ],
    competitorStrengths: [
      "Official vendor documentation remains the authority for that product.",
    ],
    trademarkNotice:
      "Competitor names are trademarks of their respective owners. Comparisons do not imply affiliation or endorsement.",
    pricingStatus: "link-only",
    methodologySlug: "comparison-methodology",
    originalContribution:
      "Public methodology for dated facts, unknown pricing, correction intake, and fair-fit framing.",
    technicalReviewPassed: true,
    editorialReviewPassed: true,
    productReviewPassed: true,
    comparisonFactReviewPassed: true,
    originalityReviewPassed: true,
    antiAiSlopPassed: true,
    productCta: "none",
    featured: false,
    indexable: true,
    llmInclude: true,
  },
  body: [
    p(
      "Fajita publishes comparisons to help small software teams choose tools honestly. We are the vendor for Fajita. That conflict of interest is stated on every page. We still require dated sources, competitor strengths, and our own limitations.",
    ),

    h2("Research steps"),
    ol([
      "Define the buyer and the job (uptime monitoring, status pages, or both).",
      "Collect facts only from official pricing, docs, or primary product pages.",
      "Record each fact with source URL, verification date, and reviewer.",
      "Mark unknown values as unknown. Do not guess prices or limits.",
      "Draft fit guidance: when Fajita is a good match and when the other product is.",
      "Pass editorial, product, and comparison-fact review before publish.",
    ]),

    h2("What we will not do"),
    ul([
      "Invent star ratings or fake review averages",
      "Scrape private competitor data or customer reviews",
      "Use attack language or imply affiliation",
      "Auto-update prices without human verification",
      "Hide Fajita limitations",
    ]),

    h2("Pricing"),
    p(
      "Competitor pricing changes often. When we cannot verify an exact figure on the review date, we link to the official pricing page and say current pricing should be confirmed directly.",
    ),

    h2("Corrections"),
    p(
      "Every comparison page includes a correction form. Send the claim, the suggested fix, and a source. We review before changing the page. Reporter identity is not published.",
    ),

    h2("Review cadence"),
    p(
      "Comparison pages and competitor facts are reviewed at least quarterly, and immediately when product behavior or public pricing changes in a material way.",
    ),
  ],
});
