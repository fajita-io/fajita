import { callout, h2, p, table, ul } from "@/lib/docs/blocks";

import { defineComparison } from "../types";

export const fajitaVsBetterStack = defineComparison({
  meta: {
    id: "comparison-fajita-vs-better-stack",
    contentType: "comparison",
    slug: "fajita-vs-better-stack",
    title: "Fajita vs Better Stack",
    description:
      "Fair comparison of Fajita and Better Stack for small teams. Scope, strengths, limitations, and when each product is a better fit.",
    status: "published",
    comparisonType: "versus",
    competitorName: "Better Stack",
    competitorSlug: "better-stack",
    topicCluster: "uptime-monitoring",
    primaryQuery: "fajita vs better stack",
    secondaryQueries: ["better stack alternative small team", "better uptime vs fajita"],
    searchIntent: "compare",
    audience: "Small teams evaluating uptime and status tools",
    funnelStage: "evaluation",
    author: "fajita-editorial",
    owner: "content-editorial",
    reviewers: ["product", "editorial"],
    publishedAt: "2026-07-17",
    updatedAt: "2026-07-17",
    lastReviewedAt: "2026-07-17",
    nextReviewDue: "2026-10-17",
    contentVersion: "1",
    productVersion: "1.0",
    summary:
      "Better Stack markets a broader reliability suite including uptime and status pages. Fajita stays narrowly focused on monitoring, incidents, alerts, and status communication for small software teams without becoming a full observability platform. Confirm Better Stack packaging on their site.",
    fajitaBestFor:
      "Teams that want a focused uptime, heartbeat, incident, and status-page product without adopting a wider suite.",
    competitorBestFor:
      "Teams that want Better Stack's broader product combination as described on their official site.",
    fajitaLimitations: [
      "Narrower product surface than a multi-product reliability suite.",
      "No free forever monitoring plan.",
      "No log management or on-host agents.",
    ],
    competitorStrengths: [
      "Broader suite positioning across reliability products.",
      "Established brand presence in the uptime and status category.",
      "Documentation and packaging depth to evaluate on their site.",
    ],
    trademarkNotice:
      "Better Stack is a trademark of its respective owner. This page is authored by Fajita and is not affiliated with or endorsed by Better Stack.",
    pricingStatus: "link-only",
    factIds: ["betterstack-uptime-product"],
    methodologySlug: "comparison-methodology",
    originalContribution:
      "Suite-versus-focus framing that refuses feature scorecards without dated official numbers.",
    technicalReviewPassed: true,
    editorialReviewPassed: true,
    productReviewPassed: true,
    comparisonFactReviewPassed: true,
    originalityReviewPassed: true,
    antiAiSlopPassed: true,
    productCta: "compare-plans",
    featured: true,
    relatedComparisons: ["fajita-vs-uptimerobot"],
    relatedDocs: [
      { href: "/docs/getting-started/what-fajita-monitors", label: "What Fajita monitors" },
    ],
    relatedGlossary: ["uptime-monitoring", "status-page"],
    relatedTools: [],
    indexable: true,
    llmInclude: true,
  },
  body: [
    h2("Direct summary"),
    p(
      "If you want a wider reliability suite under one vendor brand, evaluate Better Stack on their official materials. If you want a focused monitoring and status product for a small SaaS without logs or agents, evaluate Fajita.",
    ),

    h2("Best fit"),
    table(
      ["Fajita", "Better Stack"],
      [
        [
          "Focused monitors, incidents, alerts, status pages",
          "Broader suite positioning (confirm modules you need)",
        ],
        [
          "Paid plans aimed at small teams",
          "Packaging and trials as listed on their site",
        ],
        [
          "No free forever monitoring",
          "Confirm current free or trial options officially",
        ],
      ],
    ),

    h2("Monitoring model"),
    p(
      "Fajita runs external checks for websites, APIs, SSL, and heartbeats, with verification before incidents. Better Stack's uptime product should be understood from their current docs. Do not assume identical confirmation semantics across vendors.",
    ),

    h2("Status pages and subscribers"),
    p(
      "Both vendors position status communication as important. Compare component models, custom domains, and subscriber verification on official docs for each product before switching.",
    ),

    callout("note", [
      p(
        "We do not quote Better Stack prices here. Use their official pricing pages for current numbers.",
      ),
    ]),

    h2("Limitations to respect"),
    ul([
      "Fajita will not match a multi-product suite feature-for-feature.",
      "Better Stack may include modules you do not need; complexity has a cost.",
      "This page is vendor-authored by Fajita.",
    ]),

    h2("Self-hosting"),
    p(
      "Fajita can be [self-hosted](/self-host) under AGPL-3.0. Better Stack is primarily a hosted suite; confirm any self-hosted options on their official site.",
    ),
  ],
});
