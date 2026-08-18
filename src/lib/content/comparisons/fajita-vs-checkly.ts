import { callout, h2, p, table, ul } from "@/lib/docs/blocks";

import { defineComparison } from "../types";

export const fajitaVsCheckly = defineComparison({
  meta: {
    id: "comparison-fajita-vs-checkly",
    contentType: "comparison",
    slug: "fajita-vs-checkly",
    title: "Fajita vs Checkly",
    description:
      "A dated, fair comparison of Fajita and Checkly for small software teams. Strengths, limitations, and when each product fits.",
    status: "published",
    comparisonType: "versus",
    competitorName: "Checkly",
    competitorSlug: "checkly",
    topicCluster: "uptime-monitoring",
    primaryQuery: "fajita vs checkly",
    secondaryQueries: [
      "checkly alternative small saas",
      "checkly alternative without playwright",
      "uptime monitoring without monitoring as code",
    ],
    searchIntent: "compare",
    audience: "Teams choosing between a simple uptime product and monitoring-as-code",
    funnelStage: "evaluation",
    author: "fajita-editorial",
    owner: "content-editorial",
    reviewers: ["product", "editorial"],
    publishedAt: "2026-08-18",
    updatedAt: "2026-08-18",
    lastReviewedAt: "2026-08-18",
    nextReviewDue: "2026-11-18",
    contentVersion: "1",
    productVersion: "1.0",
    summary:
      "Checkly is a code-first active reliability layer: Playwright checks, monitors as JS/TS or Terraform, traces, and an AI-native workflow. Fajita is a no-agent uptime product: URLs, heartbeats, confirmed incidents, and status pages. Confirm current Checkly packaging on their site.",
    fajitaBestFor:
      "Founders who want a monitor to be a URL, a schedule, and the people to tell, without writing Playwright or owning an observability stack.",
    competitorBestFor:
      "Engineering teams that want monitoring as code, browser checks, and agent-driven setup.",
    fajitaLimitations: [
      "Fajita does not offer Playwright transaction checks or monitoring as code.",
      "Fajita does not collect traces or OpenTelemetry.",
      "Fajita does not offer a free forever monitoring plan.",
    ],
    competitorStrengths: [
      "Code-first monitors with Playwright, Terraform, and Pulumi on the official story.",
      "Global browser and API checks marketed for developers and agents.",
      "Advertised free start path on the homepage; confirm current limits there.",
    ],
    trademarkNotice:
      "Checkly is a trademark of its respective owner. This page is authored by Fajita and is not affiliated with or endorsed by Checkly.",
    pricingStatus: "link-only",
    factIds: ["checkly-code-first-playwright", "checkly-start-for-free"],
    methodologySlug: "comparison-methodology",
    originalContribution:
      "Fit split: no-agent URL and heartbeat monitoring versus Checkly monitoring-as-code and Playwright.",
    technicalReviewPassed: true,
    editorialReviewPassed: true,
    productReviewPassed: true,
    comparisonFactReviewPassed: true,
    originalityReviewPassed: true,
    antiAiSlopPassed: true,
    productCta: "compare-plans",
    featured: true,
    relatedComparisons: ["fajita-vs-uptimerobot", "fajita-vs-better-stack"],
    relatedContent: ["uptime-monitoring-tools-solo-saas"],
    relatedDocs: [
      { href: "/docs/getting-started/what-fajita-monitors", label: "What Fajita monitors" },
    ],
    relatedGlossary: ["uptime-monitoring", "api-monitoring", "heartbeat-monitoring"],
    relatedTools: ["uptime-calculator"],
    indexable: true,
    llmInclude: true,
  },
  body: [
    h2("Direct summary"),
    p(
      "Choose Checkly when you want monitors as code, Playwright flows, and an AI-native reliability workflow as described on their site today. Choose Fajita when you want external checks, failure confirmation, heartbeats, and a status page without writing tests or installing agents.",
    ),
    h2("Best fit"),
    table(
      ["Choose Fajita when", "Choose Checkly when"],
      [
        [
          "A monitor should be a URL and a schedule",
          "You want Playwright or API checks in git",
        ],
        [
          "You want confirmed incidents and a public status page",
          "You want agents or CLI to create monitors from prompts",
        ],
        [
          "You do not want traces, OTel, or a reliability platform",
          "You already treat monitoring as part of the deploy pipeline",
        ],
      ],
    ),
    h2("Feature areas (qualitative)"),
    table(
      ["Area", "Fajita", "Checkly (public positioning)"],
      [
        ["HTTP/API monitors", "Yes", "Yes, including code-defined API checks"],
        ["Browser / Playwright checks", "No", "Yes, advertised as a core workflow"],
        ["Failure confirmation", "Yes, verification before incident", "Confirm current retry and alert behavior in their docs"],
        ["Heartbeat / cron", "Yes", "Heartbeat checks advertised"],
        ["Status pages", "Yes", "Advertised status pages"],
        ["Monitoring as code", "No", "JS/TS, Terraform, Pulumi advertised"],
        ["Traces / OTel", "No", "Advertised OpenTelemetry traces"],
        ["Free start", "No free forever plan", "Start for free advertised; confirm limits"],
      ],
    ),
    callout("note", [
      p(
        "Exact numeric limits and prices for Checkly are not quoted here because they change. See https://www.checklyhq.com/ for current plans.",
      ),
    ]),
    h2("Pricing"),
    p(
      "Fajita plans are listed on [/pricing](/pricing). Checkly pricing should be confirmed on their official site. We do not invent promotional rates.",
    ),
    h2("Important limitations"),
    ul([
      "Fajita authors this comparison.",
      "Checkly is a testing and reliability platform. Fajita is not trying to replace Playwright or monitoring as code.",
      "Teams that already own Checkly checks in git will feel switching cost in the repo, not just the UI.",
    ]),
    h2("Who should choose each"),
    p(
      "If your team wants monitors beside application code and browser flows, start with official Checkly docs. If you want four external checks, one heartbeat, and a status page without a new programming workflow, evaluate Fajita.",
    ),
  ],
});
