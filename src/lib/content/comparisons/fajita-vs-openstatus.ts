import { callout, h2, p, table } from "@/lib/docs/blocks";

import { defineComparison } from "../types";

export const fajitaVsOpenStatus = defineComparison({
  meta: {
    id: "comparison-fajita-vs-openstatus",
    contentType: "comparison",
    slug: "openstatus",
    title: "Fajita vs OpenStatus",
    description:
      "Compare Fajita and OpenStatus for open-source uptime monitoring and status communication. Verification, deployment models, and fit for small teams.",
    status: "published",
    comparisonType: "versus",
    competitorName: "OpenStatus",
    competitorSlug: "openstatus",
    topicCluster: "uptime-monitoring",
    primaryQuery: "fajita vs openstatus",
    secondaryQueries: ["openstatus alternative", "open source status page monitoring"],
    searchIntent: "compare",
    audience: "Teams evaluating open-source monitoring and status tools",
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
      "OpenStatus is an open-source project focused on status pages and uptime visibility. Fajita is open-source uptime monitoring with verification before alerts, incidents, and status pages, plus optional Fajita Cloud.",
    fajitaBestFor:
      "Teams that want confirmed incidents, alert routing, and status communication in one monitoring product with self-host or Cloud deployment.",
    competitorBestFor:
      "Teams evaluating OpenStatus's open-source status and monitoring story as described on their official site.",
    fajitaLimitations: [
      "Different product lineage and community size than OpenStatus.",
      "Not positioned primarily as a developer-tools status API platform.",
    ],
    competitorStrengths: [
      "Open-source status and monitoring positioning in the OSS ecosystem.",
      "Public documentation and community activity to evaluate directly.",
    ],
    trademarkNotice:
      "OpenStatus is a trademark of its respective owner. This page is authored by Fajita and is not affiliated with or endorsed by OpenStatus.",
    pricingStatus: "link-only",
    factIds: [],
    methodologySlug: "comparison-methodology",
    originalContribution:
      "Verification-first monitoring comparison against an OSS status-oriented project without dismissing either audience.",
    technicalReviewPassed: true,
    editorialReviewPassed: true,
    productReviewPassed: true,
    comparisonFactReviewPassed: true,
    originalityReviewPassed: true,
    antiAiSlopPassed: true,
    productCta: "compare-plans",
    featured: false,
    relatedContent: ["status-page-tools-small-teams"],
    relatedDocs: [
      { href: "/docs/open-source/architecture", label: "Architecture" },
      { href: "/features/status-pages", label: "Status pages" },
    ],
    relatedGlossary: ["status-page", "uptime-monitoring", "incident-verification"],
    relatedTools: [],
    indexable: true,
    llmInclude: true,
  },
  body: [
    h2("Direct summary"),
    p(
      "Choose OpenStatus when their open-source status and monitoring combination matches what you read on their site today. Choose Fajita when verification before alerts, incident workflows, and optional managed Cloud matter for a small software team.",
    ),
    h2("Philosophy"),
    table(
      ["Topic", "Fajita", "OpenStatus"],
      [
        ["Primary story", "Verify failures before waking anyone up", "Open-source status and monitoring (confirm on their site)"],
        ["Self-host", "Supported via Docker Compose", "Supported (confirm current install path on their docs)"],
        ["Managed option", "Fajita Cloud", "Confirm hosted offerings on their site"],
      ],
    ),
    h2("Self-hosting"),
    p(
      "Fajita publishes its monitoring core under AGPL-3.0 and documents a [self-hosting path](/self-host). OpenStatus remains a respected OSS project in the same category; evaluate both codebases against your operational requirements.",
    ),
    callout("note", [
      p("Feature lists change. Confirm current OpenStatus capabilities on official documentation before switching."),
    ]),
  ],
});
