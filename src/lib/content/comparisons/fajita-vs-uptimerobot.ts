import { callout, h2, p, table, ul } from "@/lib/docs/blocks";

import { defineComparison } from "../types";

export const fajitaVsUptimeRobot = defineComparison({
  meta: {
    id: "comparison-fajita-vs-uptimerobot",
    contentType: "comparison",
    slug: "fajita-vs-uptimerobot",
    title: "Fajita vs UptimeRobot",
    description:
      "A dated, fair comparison of Fajita and UptimeRobot for small software teams. Strengths, limitations, and when each product fits.",
    status: "published",
    comparisonType: "versus",
    competitorName: "UptimeRobot",
    competitorSlug: "uptimerobot",
    topicCluster: "uptime-monitoring",
    primaryQuery: "fajita vs uptimerobot",
    secondaryQueries: ["uptimerobot alternative small saas", "fajita uptimerobot comparison"],
    searchIntent: "compare",
    audience: "Solo founders and small teams choosing an uptime monitor",
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
      "UptimeRobot is a widely known uptime checker with a public free tier and broad monitor coverage. Fajita focuses on small-team monitoring with verification before incidents, status pages, heartbeats, and paid plans without a free forever monitoring tier. Confirm current UptimeRobot pricing on their site.",
    fajitaBestFor:
      "Teams that want confirmed incidents, status pages, heartbeats, and a paid product shaped for small software companies.",
    competitorBestFor:
      "Teams that want a long-established uptime checker and are evaluating UptimeRobot's free or paid plans on official pricing.",
    fajitaLimitations: [
      "Fajita does not offer a free forever monitoring plan.",
      "Fajita is not a full observability suite (no agents, APM, or log pipelines).",
      "Fajita is newer than UptimeRobot in market tenure.",
    ],
    competitorStrengths: [
      "Long market presence as an uptime monitoring brand.",
      "Public free tier advertised on official pricing (confirm current limits there).",
      "Broad awareness and a large existing user base.",
    ],
    trademarkNotice:
      "UptimeRobot is a trademark of its respective owner. This page is authored by Fajita and is not affiliated with or endorsed by UptimeRobot.",
    pricingStatus: "link-only",
    factIds: ["uptimerobot-has-free-tier", "uptimerobot-status-pages-exist"],
    methodologySlug: "comparison-methodology",
    originalContribution:
      "Fit-first versus framing with explicit free-tier difference and Fajita limitations stated first-class.",
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
      { href: "/docs/getting-started/what-fajita-monitors", label: "What Fajita monitors" },
      { href: "/docs/billing/plans", label: "Plans" },
    ],
    relatedGlossary: ["uptime-monitoring", "incident-verification", "heartbeat-monitoring"],
    relatedTools: ["uptime-calculator"],
    indexable: true,
    llmInclude: true,
  },
  body: [
    h2("Direct summary"),
    p(
      "Choose UptimeRobot when you specifically want their free or paid offering as described on their site today. Choose Fajita when you want a paid small-team monitor with failure confirmation, heartbeats, status pages, and subscriber email as first-class product surfaces, and you are fine without a free forever monitoring tier.",
    ),

    h2("Best fit"),
    table(
      ["Choose Fajita when", "Choose UptimeRobot when"],
      [
        [
          "You want incidents confirmed before noisy alerts",
          "You want to evaluate their free tier first",
        ],
        [
          "You need status pages and heartbeats in one product story",
          "You already run UptimeRobot and it meets your needs",
        ],
        [
          "You prefer clear paid plans for a small SaaS",
          "Brand familiarity matters more than switching",
        ],
      ],
    ),

    h2("Feature areas (qualitative)"),
    table(
      ["Area", "Fajita", "UptimeRobot (public positioning)"],
      [
        ["HTTP/HTTPS monitors", "Yes", "Yes (confirm current types on their site)"],
        ["Failure confirmation", "Yes, verification before incident", "Confirm current behavior in their docs"],
        ["Heartbeat / cron", "Yes", "Confirm current cron or keyword options on their site"],
        ["Status pages", "Yes, with components and subscribers", "Offered; confirm current capabilities"],
        ["Free forever monitoring", "No", "Advertised free plan; confirm limits"],
        ["Full observability", "No", "Not positioned as full APM"],
      ],
    ),
    callout("note", [
      p(
        "Exact numeric limits and prices for UptimeRobot are not quoted here because they change. See https://uptimerobot.com/pricing/ for current figures.",
      ),
    ]),

    h2("Pricing"),
    p(
      "Fajita plans are listed on [/pricing](/pricing): Core, Team, and Scale with monthly and annual options. UptimeRobot pricing should be confirmed on their official pricing page. We do not convert currencies or invent promotional rates.",
    ),

    h2("Important limitations"),
    ul([
      "Fajita authors this comparison.",
      "Neither product replaces on-host observability.",
      "Migration cost and alert rewiring are real switching costs either direction.",
    ]),

    h2("Who should choose each"),
    p(
      "If you need a free forever checker while you validate demand, start with official UptimeRobot pricing and limits. If you are ready for a paid reliability stack with status communication and heartbeats, evaluate Fajita against your first four monitors and one status page.",
    ),

    h2("Self-hosting"),
    p(
      "Fajita can also be [self-hosted](/self-host) under AGPL-3.0 with the same verification engine. UptimeRobot is a hosted service; confirm whether they offer a self-hosted edition on their site.",
    ),
  ],
});
