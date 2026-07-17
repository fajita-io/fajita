import { h2, p, table, ul } from "@/lib/docs/blocks";

import { defineComparison } from "../types";

export const uptimeToolsSoloSaas = defineComparison({
  meta: {
    id: "comparison-uptime-tools-solo-saas",
    contentType: "comparison",
    slug: "uptime-monitoring-tools-solo-saas",
    title: "Uptime Monitoring Tools for Solo SaaS Founders",
    description:
      "How solo SaaS founders should evaluate uptime tools: confirmation, heartbeats, status pages, price honesty, and when Fajita fits.",
    status: "published",
    comparisonType: "category",
    topicCluster: "small-team-reliability",
    primaryQuery: "uptime monitoring tools for solo saas",
    secondaryQueries: ["best uptime monitor indie hacker", "simple uptime monitoring small team"],
    searchIntent: "choose",
    audience: "Solo SaaS founders",
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
      "Solo founders should prioritize external checks, failure confirmation, one alert path, heartbeats for silent jobs, and a status page. Full observability suites are usually the wrong first buy.",
    fajitaBestFor:
      "Founders who want paid monitoring plus status communication without agents or log pipelines.",
    competitorBestFor:
      "Founders who need a free forever tier or an existing vendor they already trust.",
    fajitaLimitations: [
      "No free forever monitoring plan.",
      "Not an APM or log platform.",
    ],
    competitorStrengths: [
      "Some competitors offer free tiers useful for earliest validation.",
      "Longer market tenure can matter for risk-averse buyers.",
    ],
    trademarkNotice:
      "Competitor names are trademarks of their owners. Fajita authors this page and is not affiliated with those products.",
    pricingStatus: "link-only",
    methodologySlug: "comparison-methodology",
    originalContribution:
      "Solo-founder evaluation rubric: four signals, confirmation, status, and refuse-agents test.",
    technicalReviewPassed: true,
    editorialReviewPassed: true,
    productReviewPassed: true,
    comparisonFactReviewPassed: true,
    originalityReviewPassed: true,
    antiAiSlopPassed: true,
    productCta: "start-monitoring",
    featured: true,
    relatedComparisons: ["fajita-vs-uptimerobot", "fajita-vs-better-stack"],
    relatedContent: ["minimum-reliability-stack-solo-saas"],
    relatedDocs: [
      { href: "/docs/getting-started/create-your-first-monitor", label: "Create your first monitor" },
    ],
    relatedGlossary: ["uptime-monitoring", "heartbeat-monitoring"],
    relatedTools: ["uptime-calculator"],
    indexable: true,
    llmInclude: true,
  },
  body: [
    p(
      "Last reviewed 2026-07-17. This is a category guide, not a ranked leaderboard and not a star-rating page. Method: [comparison methodology](/compare/comparison-methodology).",
    ),

    h2("Evaluation rubric for solo founders"),
    table(
      ["Question", "Why it matters"],
      [
        ["Does it confirm failure before paging?", "Protects sleep and trust"],
        ["Can it watch cron via heartbeat?", "Silent jobs fail quietly"],
        ["Can you publish a status page?", "Customers need a place to look"],
        ["Is pricing honest about free vs paid?", "Avoid surprise locks"],
        ["Do you need agents on day one?", "Usually no for uptime"],
      ],
    ),

    h2("Where Fajita fits"),
    p(
      "Fajita is built for the minimum stack described in [The Minimum Reliability Stack for a Solo SaaS Founder](/blog/minimum-reliability-stack-solo-saas). It is a paid product. If you need free forever monitoring, evaluate vendors that advertise that clearly on official pricing pages.",
    ),

    h2("Related comparisons"),
    ul([
      "[Fajita vs UptimeRobot](/compare/fajita-vs-uptimerobot)",
      "[Fajita vs Better Stack](/compare/fajita-vs-better-stack)",
      "[Status page tools for small teams](/compare/status-page-tools-small-teams)",
    ]),
  ],
});

export const statusPageToolsSmallTeams = defineComparison({
  meta: {
    id: "comparison-status-page-tools-small-teams",
    contentType: "comparison",
    slug: "status-page-tools-small-teams",
    title: "Status Page Tools for Small Software Teams",
    description:
      "How small teams should choose a status page: components, incidents, maintenance, subscribers, and when Fajita fits versus dedicated status products.",
    status: "published",
    comparisonType: "status-page",
    competitorName: "Atlassian Statuspage",
    topicCluster: "status-pages",
    primaryQuery: "status page tools for small software teams",
    secondaryQueries: ["statuspage alternative small team", "simple status page saas"],
    searchIntent: "choose",
    audience: "Small software companies",
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
      "Dedicated status products can be excellent when status communication is the whole job. Monitoring-integrated status pages fit teams that want monitors and public updates in one workflow. Confirm Atlassian Statuspage packaging on Atlassian sites.",
    fajitaBestFor:
      "Teams that want status pages tied to monitors, incidents, and maintenance in one product.",
    competitorBestFor:
      "Teams standardized on Atlassian who want a dedicated Statuspage workspace.",
    fajitaLimitations: [
      "Not a standalone enterprise status network.",
      "No free forever monitoring attached to the page.",
    ],
    competitorStrengths: [
      "Dedicated status-page product focus from Atlassian Statuspage.",
      "Familiar to teams already in the Atlassian ecosystem.",
    ],
    trademarkNotice:
      "Atlassian and Statuspage are trademarks of Atlassian. This page is authored by Fajita and is not affiliated with or endorsed by Atlassian.",
    pricingStatus: "link-only",
    factIds: ["statuspage-atlassian-product"],
    methodologySlug: "comparison-methodology",
    originalContribution:
      "Dedicated-versus-integrated status page decision frame for small teams.",
    technicalReviewPassed: true,
    editorialReviewPassed: true,
    productReviewPassed: true,
    comparisonFactReviewPassed: true,
    originalityReviewPassed: true,
    antiAiSlopPassed: true,
    productCta: "publish-status-page",
    featured: true,
    relatedContent: ["what-belongs-on-status-page"],
    relatedDocs: [
      { href: "/docs/status-pages/create", label: "Create a status page" },
    ],
    relatedGlossary: ["status-page", "status-page-subscriber"],
    relatedTools: ["status-page-checklist"],
    indexable: true,
    llmInclude: true,
  },
  body: [
    p(
      "Last reviewed 2026-07-17. Method: [comparison methodology](/compare/comparison-methodology). Confirm Atlassian Statuspage plans at https://www.atlassian.com/software/statuspage.",
    ),

    h2("Decision frame"),
    table(
      ["Choose an integrated monitor + status product when", "Choose a dedicated status product when"],
      [
        [
          "The same team owns monitors and public updates",
          "Status communication is owned separately from monitoring",
        ],
        [
          "You want components mapped to monitors",
          "You already bought monitoring elsewhere",
        ],
        [
          "You want one vendor for small-team scope",
          "You need Atlassian ecosystem alignment",
        ],
      ],
    ),

    h2("What small teams actually need"),
    ul([
      "Customer-visible components",
      "Incident updates with cadence",
      "Maintenance windows",
      "Verified subscribers when email is offered",
      "A page that stays honest during outages",
    ]),
    p(
      "See [What Should Go on a Public Status Page?](/blog/what-belongs-on-status-page) and the [checklist tool](/tools/status-page-checklist).",
    ),
  ],
});
