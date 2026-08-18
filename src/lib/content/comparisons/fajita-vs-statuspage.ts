import { callout, h2, p, table, ul } from "@/lib/docs/blocks";

import { defineComparison } from "../types";

export const fajitaVsStatuspage = defineComparison({
  meta: {
    id: "comparison-fajita-vs-statuspage",
    contentType: "comparison",
    slug: "fajita-vs-statuspage",
    title: "Fajita vs Atlassian Statuspage",
    description:
      "A dated, fair comparison of Fajita and Atlassian Statuspage for small software teams. Strengths, limitations, and when each product fits.",
    status: "published",
    comparisonType: "versus",
    competitorName: "Atlassian Statuspage",
    competitorSlug: "statuspage",
    topicCluster: "status-pages",
    primaryQuery: "fajita vs statuspage",
    secondaryQueries: [
      "statuspage alternative small saas",
      "atlassian statuspage alternative",
      "status page with uptime monitoring",
    ],
    searchIntent: "compare",
    audience: "Teams choosing a status page, with or without monitoring attached",
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
      "Atlassian Statuspage is a dedicated status-page product for incidents, maintenance, and subscribers. Fajita includes status pages plus the monitors that can open and resolve those incidents. Confirm current Statuspage packaging on Atlassian.",
    fajitaBestFor:
      "Teams that want one product for external checks, confirmed incidents, and a public status page.",
    competitorBestFor:
      "Teams that already have monitoring elsewhere and want a dedicated Atlassian status page.",
    fajitaLimitations: [
      "Fajita is not an Atlassian product and does not sit inside Jira Service Management.",
      "Fajita status pages are part of a monitoring product, not a standalone enterprise comms suite.",
    ],
    competitorStrengths: [
      "Dedicated status-page product with subscriber and incident communication features.",
      "Atlassian ecosystem and brand familiarity.",
      "Useful when monitoring is already solved by another vendor.",
    ],
    trademarkNotice:
      "Atlassian and Statuspage are trademarks of Atlassian. This page is authored by Fajita and is not affiliated with or endorsed by Atlassian.",
    pricingStatus: "link-only",
    factIds: ["statuspage-atlassian-product"],
    methodologySlug: "comparison-methodology",
    originalContribution:
      "Fit split: status page bundled with monitoring versus a dedicated Atlassian status-page product.",
    technicalReviewPassed: true,
    editorialReviewPassed: true,
    productReviewPassed: true,
    comparisonFactReviewPassed: true,
    originalityReviewPassed: true,
    antiAiSlopPassed: true,
    productCta: "compare-plans",
    featured: true,
    relatedComparisons: ["status-page-tools-small-teams", "fajita-vs-better-stack"],
    relatedContent: ["what-belongs-on-status-page"],
    relatedDocs: [
      { href: "/docs/status-pages/create", label: "Create a status page" },
    ],
    relatedGlossary: ["status-page", "incident"],
    relatedTools: ["status-page-checklist"],
    indexable: true,
    llmInclude: true,
  },
  body: [
    h2("Direct summary"),
    p(
      "Choose Atlassian Statuspage when you want a dedicated status-page product and already have monitoring you trust. Choose Fajita when you want the page and the monitors in one product, with incidents that can open from a confirmed check failure.",
    ),
    h2("Best fit"),
    table(
      ["Choose Fajita when", "Choose Statuspage when"],
      [
        [
          "You still need uptime, SSL, and heartbeat checks",
          "Monitoring is already handled by another tool",
        ],
        [
          "You want the status page updated from the same incident",
          "You want an Atlassian-native comms surface",
        ],
        [
          "You are a small team buying one reliability product",
          "You already pay for Atlassian and want their status page",
        ],
      ],
    ),
    h2("Feature areas (qualitative)"),
    table(
      ["Area", "Fajita", "Atlassian Statuspage (public positioning)"],
      [
        ["Public status page", "Yes", "Yes, the core product"],
        ["Incident timeline and subscribers", "Yes", "Yes, advertised subscriber and incident features"],
        ["Uptime / API / SSL monitors", "Yes", "Not the product; pair with other monitoring"],
        ["Heartbeat / cron", "Yes", "Not the product"],
        ["Failure confirmation", "Yes, before the incident opens", "Incidents are typically opened by operators or integrations"],
        ["Atlassian ecosystem", "No", "Yes"],
      ],
    ),
    callout("note", [
      p(
        "Exact numeric limits and prices for Statuspage are not quoted here because they change. See https://www.atlassian.com/software/statuspage for current plans.",
      ),
    ]),
    h2("Pricing"),
    p(
      "Fajita plans are listed on [/pricing](/pricing) and include monitoring plus status pages. Statuspage pricing should be confirmed on Atlassian. We do not invent promotional rates.",
    ),
    h2("Important limitations"),
    ul([
      "Fajita authors this comparison.",
      "Statuspage is a communications product. Fajita is not trying to replace Atlassian for Jira-centric workflows.",
      "If you already run Statuspage well, switching only makes sense if you also want to replace the monitor behind it.",
    ]),
    h2("Who should choose each"),
    p(
      "If you need a standalone status page next to existing monitoring, start with official Statuspage pages. If you do not yet have a monitor or you want one vendor for checks and the public page, evaluate Fajita.",
    ),
  ],
});
