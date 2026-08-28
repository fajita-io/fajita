import { h2, ol, p, ul } from "@/lib/docs/blocks";

import { defineArticle } from "../types";
import { LAUNCH_REVIEWS } from "./_shared";

export const monitoringBeforeProductHunt = defineArticle({
  meta: {
    ...LAUNCH_REVIEWS,
    id: "article-monitoring-before-product-hunt",
    contentType: "article",
    slug: "monitoring-before-product-hunt",
    title: "Monitoring Before Product Hunt",
    description:
      "Before a launch spike, monitor signup, core API, and your status page. Set intervals and alerts so you learn about failure before social media does.",
    articleType: "founder-operations",
    category: "founder-operations",
    topicCluster: "small-team-reliability",
    primaryQuery: "monitoring before product hunt launch",
    secondaryQueries: [
      "launch day monitoring checklist",
      "product hunt uptime monitoring",
    ],
    searchIntent: "how-to",
    audience: "Founders preparing for a public launch",
    funnelStage: "activation",
    readingMinutes: 8,
    thesis:
      "Launch traffic exposes weak endpoints, not new bugs magically. A short pre-launch monitoring pass protects the story you are trying to tell.",
    originalContribution:
      "Pre-launch monitor set and alert routing checklist for concentrated traffic spikes.",
    relatedContent: ["minimum-reliability-stack-solo-saas"],
    relatedDocs: [
      { href: "/docs/getting-started/create-your-first-monitor", label: "Create your first monitor" },
      { href: "/docs/status-pages/create", label: "Create a status page" },
    ],
    relatedGlossary: ["uptime-monitoring", "status-page", "alert-routing"],
    relatedTools: ["status-page-checklist"],
    relatedComparisons: [],
    productCta: "start-monitoring",
  },
  body: [
    p(
      "Product Hunt and similar launches concentrate attention into a few hours. That spike finds endpoints you forgot to cache, database pools sized for normal Tuesdays, and signup flows that never ran under parallel requests. Monitoring before the clock starts gives you a chance to fix issues privately.",
    ),

    h2("Minimum monitors before launch day"),
    ol([
      "Marketing site home and pricing pages",
      "Signup or login path with the same checks a customer hits",
      "Primary API health endpoint or critical JSON route",
      "Background job heartbeat if billing or email depends on cron",
      "Status page URL so the page itself stays reachable",
    ]),

    h2("Alert routing for launch week"),
    p(
      "Send alerts to a channel you will actually watch during the launch window. Email alone is easy to miss when notifications flood in. Slack or Discord with verified incidents only keeps signal high.",
    ),
    ul([
      "Confirm failures before paging when possible",
      "Assign one person as incident writer for public updates",
      "Draft a status page component list before traffic arrives",
    ]),

    h2("What not to over-optimize"),
    p(
      "Do not spend launch week tuning fancy dashboards. Do verify monitors from outside your network, store auth tokens securely, and test that alerts reach your phone. A simple external check that pages you when signup fails beats twenty internal graphs nobody watches.",
    ),
    p(
      "Publish a one paragraph status page message before launch even if everything is green. When something breaks, you already have a place to write updates instead of scrambling to create a page under pressure.",
    ),

    h2("After the spike"),
    p(
      "Review which monitors fired, which stayed quiet, and whether customers reported issues first. Tighten intervals on paths that struggled. Write a short internal note about what broke so the next launch starts smarter.",
    ),
    p(
      "Keep the launch monitor set for a week after traffic normalizes. Many teams remove extra checks too early and miss regressions introduced while firefighting during the spike.",
    ),
  ],
});
