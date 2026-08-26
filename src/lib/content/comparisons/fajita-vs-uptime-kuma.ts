import { callout, h2, p, table, ul } from "@/lib/docs/blocks";

import { defineComparison } from "../types";

export const fajitaVsUptimeKuma = defineComparison({
  meta: {
    id: "comparison-fajita-vs-uptime-kuma",
    contentType: "comparison",
    slug: "uptime-kuma",
    title: "Fajita vs Uptime Kuma",
    description:
      "A fair comparison of Fajita and Uptime Kuma for self-hosted and managed uptime monitoring. Verification, status pages, deployment, and when each fits.",
    status: "published",
    comparisonType: "versus",
    competitorName: "Uptime Kuma",
    competitorSlug: "uptime-kuma",
    topicCluster: "uptime-monitoring",
    primaryQuery: "fajita vs uptime kuma",
    secondaryQueries: [
      "uptime kuma alternative",
      "self hosted uptime monitoring comparison",
    ],
    searchIntent: "compare",
    audience: "Teams evaluating self-hosted or managed uptime monitors",
    funnelStage: "evaluation",
    author: "fajita-editorial",
    owner: "content-editorial",
    reviewers: ["product", "editorial"],
    publishedAt: "2026-08-26",
    updatedAt: "2026-08-26",
    lastReviewedAt: "2026-08-26",
    nextReviewDue: "2026-11-26",
    contentVersion: "1",
    productVersion: "1.0",
    summary:
      "Uptime Kuma is a popular open-source uptime monitor with a straightforward self-hosted install. Fajita is also open source and self-hostable, with failure verification before incidents, status pages, and an optional managed Cloud path.",
    fajitaBestFor:
      "Teams that want verification before alerts, polished incident and status-page workflows, and the choice between self-hosting and Fajita Cloud.",
    competitorBestFor:
      "Teams that want a widely deployed open-source uptime dashboard with a simple Docker install and community familiarity.",
    fajitaLimitations: [
      "Newer project than Uptime Kuma in community tenure.",
      "Requires Clerk for authentication today (no built-in local auth).",
      "Heavier stack than a minimal single-container monitor.",
    ],
    competitorStrengths: [
      "Large self-hosting community and long OSS track record.",
      "Simple Docker deployment familiar to homelab operators.",
      "Broad monitor type coverage on official documentation.",
    ],
    trademarkNotice:
      "Uptime Kuma is a trademark of its respective owner. This page is authored by Fajita and is not affiliated with or endorsed by Uptime Kuma.",
    pricingStatus: "link-only",
    factIds: [],
    methodologySlug: "comparison-methodology",
    originalContribution:
      "Verification-first framing with honest stack and auth tradeoffs for two OSS monitors.",
    technicalReviewPassed: true,
    editorialReviewPassed: true,
    productReviewPassed: true,
    comparisonFactReviewPassed: true,
    originalityReviewPassed: true,
    antiAiSlopPassed: true,
    productCta: "compare-plans",
    featured: true,
    relatedContent: ["uptime-monitoring-tools-solo-saas"],
    relatedDocs: [
      { href: "/docs/self-hosting/quickstart", label: "Self-hosting quickstart" },
      { href: "/open-source", label: "Open source overview" },
    ],
    relatedGlossary: ["uptime-monitoring", "incident-verification", "status-page"],
    relatedTools: ["uptime-calculator"],
    indexable: true,
    llmInclude: true,
  },
  body: [
    h2("Direct summary"),
    p(
      "Choose Uptime Kuma when you want a well-known self-hosted uptime dashboard with a minimal install story. Choose Fajita when verification before escalation, incident communication, and status pages are first-class, and when you want either self-hosting or a managed Cloud option from the same product.",
    ),
    h2("Deployment"),
    table(
      ["Topic", "Fajita", "Uptime Kuma"],
      [
        ["Open source", "Yes (AGPL-3.0)", "Yes (MIT on official repo; confirm current license)"],
        ["Self-host", "Docker Compose stack", "Docker (popular single-container path)"],
        ["Managed option", "Fajita Cloud", "Community / third-party hosts only"],
      ],
    ),
    h2("Verification"),
    p(
      "Fajita verifies failures before opening incidents and sending alerts. Uptime Kuma focuses on fast status checks and notifications. Confirm Uptime Kuma retry and notification behavior on their documentation.",
    ),
    h2("Self-hosting note"),
    p(
      "Fajita can be [self-hosted](/self-host) with the same verification engine available on Fajita Cloud. Neither product is a crippled free tier of the other; they differ in workflow depth and operational model.",
    ),
    callout("note", [
      p(
        "Confirm current Uptime Kuma features and license on the official project site before deciding.",
      ),
    ]),
  ],
});
