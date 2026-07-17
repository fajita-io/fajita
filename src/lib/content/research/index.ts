import { h2, p, ul } from "@/lib/docs/blocks";

import { defineResearch } from "../types";

/**
 * Research foundation. No fabricated customer studies are published.
 * Data-insufficient is a valid public state.
 */

export const RESEARCH_MINIMUM_COHORT = 50;

export const researchMethodologyTemplate = defineResearch({
  meta: {
    id: "research-methodology-template",
    contentType: "research",
    slug: "methodology-template",
    title: "Research methodology template",
    description:
      "Required sections for any Fajita original research publication: question, cohort, privacy, calculations, limitations, and corrections.",
    status: "published",
    researchType: "benchmark",
    topicCluster: "uptime-monitoring",
    primaryQuery: "fajita research methodology",
    secondaryQueries: [],
    searchIntent: "reference",
    audience: "Readers evaluating Fajita research rigor",
    funnelStage: "education",
    author: "fajita-research",
    owner: "content-research",
    reviewers: ["privacy", "editorial", "engineering"],
    publishedAt: "2026-07-17",
    updatedAt: "2026-07-17",
    lastReviewedAt: "2026-07-17",
    nextReviewDue: "2027-07-17",
    contentVersion: "1",
    productVersion: "1.0",
    researchQuestion:
      "What sections must every Fajita research publication include before release?",
    minimumCohort: RESEARCH_MINIMUM_COHORT,
    methodologyComplete: true,
    privacyReviewPassed: true,
    organizationCount: 0,
    limitations: [
      "This page is a template, not a study.",
      "No customer operational metrics are published here.",
    ],
    originalContribution:
      "Mandatory methodology skeleton with privacy cohort gates and retraction rules.",
    productCta: "none",
    indexable: true,
    llmInclude: true,
  },
  body: [
    p(
      "Fajita publishes original research only when privacy-safe aggregated data and a complete methodology exist. Until then, studies remain in data-insufficient or collecting states.",
    ),
    h2("Required sections"),
    ul([
      "Research question",
      "Date range",
      "Dataset definition",
      "Inclusion and exclusion criteria",
      "Sample size and organization count",
      "Metric definitions and calculations",
      "Limitations",
      "Privacy protections",
      "Version and correction process",
    ]),
    h2("Privacy boundaries"),
    ul([
      "No customer names, domains, monitor URLs, or incident titles",
      `Minimum cohort threshold: ${RESEARCH_MINIMUM_COHORT} independent eligible organizations (configurable, privacy-reviewed)`,
      "No publication from fabricated synthetic customer behavior",
    ]),
    h2("Corrections and retractions"),
    p(
      "Material errors require a public correction notice and version bump. Invalid studies are retracted with a public notice. Findings are never silently rewritten.",
    ),
  ],
});

export const proposedAlertLatencyStudy = defineResearch({
  meta: {
    id: "research-alert-latency-proposed",
    contentType: "research",
    slug: "alert-delivery-latency-study",
    title: "Alert delivery latency study (proposed)",
    description:
      "Proposed study of aggregated alert-delivery latency. Not published as findings. Data insufficient until cohort thresholds are met.",
    status: "data-insufficient",
    researchType: "benchmark",
    topicCluster: "uptime-monitoring",
    primaryQuery: "alert delivery latency benchmark",
    secondaryQueries: [],
    searchIntent: "research",
    audience: "Operators interested in future Fajita research",
    funnelStage: "awareness",
    author: "fajita-research",
    owner: "content-research",
    reviewers: ["privacy"],
    updatedAt: "2026-07-17",
    lastReviewedAt: "2026-07-17",
    nextReviewDue: "2026-10-17",
    contentVersion: "1",
    productVersion: "1.0",
    researchQuestion:
      "What is the distribution of alert-delivery latency across eligible aggregated channels once enough organizations exist?",
    minimumCohort: RESEARCH_MINIMUM_COHORT,
    organizationCount: 0,
    methodologyComplete: false,
    privacyReviewPassed: false,
    limitations: [
      "No findings are available.",
      "Organization count is below the minimum cohort threshold.",
    ],
    originalContribution:
      "Placeholder study record demonstrating data-insufficient as a first-class state.",
    productCta: "none",
    indexable: false,
    llmInclude: false,
    noindex: true,
  },
  body: [
    p(
      "This study is proposed and data-insufficient. Fajita will not publish latency percentiles until the minimum organization cohort is met and privacy review passes.",
    ),
    h2("Current status"),
    p("Data insufficient. No charts. No downloadable dataset. No conclusions."),
  ],
});

export const allResearch = [
  researchMethodologyTemplate,
  proposedAlertLatencyStudy,
];
