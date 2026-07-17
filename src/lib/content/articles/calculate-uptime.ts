import { callout, h2, p, table, ul } from "@/lib/docs/blocks";

import { defineArticle } from "../types";
import { LAUNCH_REVIEWS } from "./_shared";

/** Original contribution: the Measurement Contract for uptime percentages. */
export const calculateUptime = defineArticle({
  meta: {
    ...LAUNCH_REVIEWS,
    id: "article-calculate-uptime",
    contentType: "article",
    slug: "how-to-calculate-uptime-correctly",
    title: "How to Calculate Uptime Correctly",
    description:
      "Uptime percent is allowed downtime divided by the measurement window. Define maintenance, check gaps, and the Measurement Contract before you publish a number.",
    articleType: "operating-framework",
    category: "reliability-metrics",
    topicCluster: "uptime-monitoring",
    primaryQuery: "how to calculate uptime percentage",
    secondaryQueries: [
      "uptime calculator downtime minutes",
      "99.9 uptime meaning",
      "sla uptime calculation",
    ],
    searchIntent: "calculate",
    audience: "Founders and operators publishing reliability numbers",
    funnelStage: "education",
    readingMinutes: 8,
    thesis:
      "Uptime percentage only means something when you define the window, what counts as down, and how maintenance is treated. This article gives the Measurement Contract and worked examples.",
    featured: false,
    deepGuide: true,
    originalContribution:
      "Measurement Contract: window, denominator, downtime definition, maintenance policy, and precision rules for publishing uptime.",
    relatedContent: [
      "why-one-failed-check-is-not-downtime",
      "minimum-reliability-stack-solo-saas",
    ],
    relatedDocs: [
      { href: "/docs/status-pages/uptime-history", label: "Uptime history" },
      { href: "/docs/monitors/check-intervals", label: "Check intervals" },
    ],
    relatedGlossary: ["uptime", "uptime-percentage", "downtime", "availability"],
    relatedTools: ["uptime-calculator"],
    relatedComparisons: [],
    productCta: "use-free-tool",
  },
  body: [
    p(
      "Uptime percentage is not a personality trait for your product. It is a ratio: time the service met your definition of available, divided by the measurement window you chose. Change the definition or the window and the number moves, even if customer experience did not.",
    ),

    h2("The Measurement Contract"),
    p("Before you publish a percentage, write down:"),
    ul([
      "Window. 30 days, 90 days, calendar month, or trailing year.",
      "Denominator. Wall-clock time in the window, minus any time you explicitly exclude.",
      "Downtime definition. Confirmed down only, or any failed check.",
      "Maintenance policy. Excluded, included, or partially excluded.",
      "Precision. How many decimals you will show, and that they match check granularity.",
    ]),

    h2("Core formula"),
    p(
      "Allowed downtime for a target uptime `U` over period `T` is `(1 - U) * T`. Available time is `U * T`. Use consistent units. The [uptime calculator](/tools/uptime-calculator) applies this with decimal-safe math for common windows.",
    ),

    h2("Worked examples"),
    table(
      ["Target", "30-day window", "Allowed downtime (approx)"],
      [
        ["99%", "30 days", "7 hours 12 minutes"],
        ["99.9%", "30 days", "43 minutes 12 seconds"],
        ["99.99%", "30 days", "4 minutes 19 seconds"],
      ],
    ),
    callout("note", [
      p(
        "These figures assume a continuous 30-day window with no excluded maintenance. Your contract may differ.",
      ),
    ]),

    h2("Why monitor granularity matters"),
    p(
      "If you check once every five minutes, you cannot honestly claim second-level precision. A single missed check might represent up to five minutes of uncertainty unless you have other evidence. Related: [monitoring interval](/glossary/monitoring-interval) and [Why One Failed Check Should Not Mean Downtime](/blog/why-one-failed-check-is-not-downtime).",
    ),

    h2("Maintenance and honesty"),
    ul([
      "If you exclude maintenance, say so next to the percentage.",
      "If you include maintenance, your number is harder but clearer.",
      "Do not silently exclude unplanned downtime as maintenance.",
    ]),

    h2("Uptime is not an SLA by itself"),
    p(
      "A public uptime percentage is a historical measurement under your contract. A contractual SLA is a legal promise with remedies. Do not treat them as synonyms. Glossary: [uptime percentage](/glossary/uptime-percentage), [service level agreement](/glossary/service-level-agreement).",
    ),

    h2("Partial periods and launches"),
    p(
      "If your product is twelve days old, do not publish a trailing-year percentage as if it were earned. State the window. Early numbers swing hard because the denominator is small. That is math, not destiny.",
    ),

    h2("Publish fewer, clearer numbers"),
    p(
      "One trailing-30-day figure with a visible Measurement Contract beats five unexplained nines. Link history from your [status page uptime history](/docs/status-pages/uptime-history) when you show numbers to customers.",
    ),
    p(
      "Use the [uptime calculator](/tools/uptime-calculator) when you need minutes from a target percentage. Then decide whether your confirmation delay fits inside that budget.",
    ),
  ],
});
