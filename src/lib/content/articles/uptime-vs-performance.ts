import { h2, ol, p, ul } from "@/lib/docs/blocks";

import { defineArticle } from "../types";
import { LAUNCH_REVIEWS } from "./_shared";

export const uptimeVsPerformance = defineArticle({
  meta: {
    ...LAUNCH_REVIEWS,
    id: "article-uptime-vs-performance",
    contentType: "article",
    slug: "uptime-monitoring-vs-performance-monitoring",
    title: "Uptime Monitoring Versus Performance Monitoring",
    description:
      "Uptime monitoring answers whether software works. Performance monitoring answers how fast it feels. Small teams usually need the first before the second.",
    articleType: "definitive-guide",
    category: "monitoring",
    topicCluster: "uptime-monitoring",
    primaryQuery: "uptime monitoring vs performance monitoring",
    secondaryQueries: [
      "difference uptime and performance monitoring",
      "do I need APM or uptime monitoring",
    ],
    searchIntent: "learn",
    audience: "Founders comparing monitoring categories",
    funnelStage: "education",
    readingMinutes: 7,
    thesis:
      "Uptime monitoring proves availability from the outside. Performance monitoring explains latency distributions inside your stack. They overlap in charts but solve different buyer questions.",
    originalContribution:
      "Sequencing guide: availability before performance for teams under ten engineers.",
    relatedContent: [
      "minimum-reliability-stack-solo-saas",
      "how-often-should-you-check-a-website",
    ],
    relatedDocs: [
      { href: "/docs/monitors/website-monitoring", label: "Website monitoring" },
      { href: "/docs/monitors/api-monitoring", label: "API monitoring" },
    ],
    relatedGlossary: ["uptime-monitoring", "health-endpoint", "monitoring-interval"],
    relatedTools: [],
    relatedComparisons: ["fajita-vs-better-stack"],
    productCta: "start-monitoring",
  },
  body: [
    p(
      "Founders often ask whether they need uptime monitoring or performance monitoring first. The honest answer for most early SaaS products is uptime. Customers forgive slow pages more often than they forgive error screens. You can add performance depth later without throwing away availability checks.",
    ),

    h2("What uptime monitoring measures"),
    p(
      "Uptime monitoring sends scheduled requests from outside your infrastructure and records pass or fail against explicit expectations. Did the site return 200? Did the API JSON include `status: ok`? Did TLS handshakes succeed? The question is binary: can a customer complete the workflow?",
    ),
    ul([
      "Website and redirect checks",
      "API health endpoints with assertions",
      "SSL certificate expiration",
      "Heartbeat signals from cron jobs",
    ]),

    h2("What performance monitoring measures"),
    p(
      "Performance monitoring collects timing data across requests, services, or browsers. It surfaces percentiles, regressions, and request traces. The question is continuous: how long did work take, and which dependency slowed down?",
    ),
    ul([
      "Apdex or latency percentiles",
      "Request tracing across services",
      "Real user monitoring in browsers",
      "Database query timings",
    ]),

    h2("Where teams confuse the two"),
    p(
      "A slow API can look healthy to uptime tooling if it eventually returns 200. Conversely, a fast 503 is still downtime. Some platforms blend both into one dashboard. That convenience does not change the operating question. Incidents start with can users succeed? Performance tuning starts with why did this request take four seconds?",
    ),
    p(
      "Teams also over-buy performance tooling before they monitor login. When signup fails during a launch, a latency dashboard does not help. Start with the paths that gate revenue, then add percentile charts when slow responses become a recurring support theme.",
    ),

    h2("Practical sequencing for small teams"),
    ol([
      "Monitor the routes that represent revenue or login",
      "Publish a status page before launch traffic",
      "Add performance tooling when latency complaints repeat or SLAs include percentiles",
    ]),
    p(
      "Fajita deliberately focuses on availability, verification, and customer communication. If you need deeper latency tooling, run it alongside Fajita rather than expecting one product to replace both disciplines.",
    ),
  ],
});
