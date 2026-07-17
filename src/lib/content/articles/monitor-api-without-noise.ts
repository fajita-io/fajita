import { callout, code, h2, ol, p, table, ul } from "@/lib/docs/blocks";

import { defineArticle } from "../types";
import { LAUNCH_REVIEWS } from "./_shared";

/**
 * Original contribution: the Confirm Ladder (probe → retry → verify → open).
 */
export const monitorApiWithoutNoise = defineArticle({
  meta: {
    ...LAUNCH_REVIEWS,
    id: "article-monitor-api-without-noise",
    contentType: "article",
    slug: "monitor-api-without-alert-noise",
    title: "How to Monitor an API Without Creating Alert Noise",
    description:
      "Use the Confirm Ladder: probe, retry, verify, then open an incident. Keep API monitors useful without paging on every transient blip.",
    articleType: "definitive-guide",
    category: "apis-webhooks",
    topicCluster: "api-reliability",
    primaryQuery: "monitor api without alert noise",
    secondaryQueries: [
      "api monitoring false positives",
      "retry before incident",
      "api health check alerting",
    ],
    searchIntent: "how-to",
    audience: "Founders and small engineering teams running APIs",
    funnelStage: "education",
    readingMinutes: 10,
    thesis:
      "A monitor should not open an incident because one request failed. A safer setup retries the request, confirms the failure, and separates customer downtime from monitoring-platform uncertainty. This guide explains how to design that sequence without hiding real outages.",
    deepGuide: true,
    featured: true,
    originalContribution:
      "The Confirm Ladder: probe, retry, verify, open. A four-step sequence for API monitors that reduces noise without suppressing confirmed outages.",
    relatedContent: [
      "why-one-failed-check-is-not-downtime",
      "safe-api-health-endpoint",
      "minimum-reliability-stack-solo-saas",
    ],
    relatedDocs: [
      { href: "/docs/monitors/api-monitoring", label: "API monitoring" },
      { href: "/docs/monitors/retries", label: "Retries" },
      { href: "/docs/incidents/verification", label: "Incident verification" },
    ],
    relatedGlossary: [
      "api-monitoring",
      "retry",
      "incident-verification",
      "health-endpoint",
    ],
    relatedTools: ["uptime-calculator"],
    relatedComparisons: [],
    productCta: "start-monitoring",
  },
  body: [
    p(
      "A monitor should not open an incident because one request failed. A safer setup retries the request, confirms the failure, and separates customer downtime from monitoring-platform uncertainty. This guide explains how to design that sequence without hiding real outages.",
    ),
    p(
      "Assumptions: you control the API health path, checks run from outside your VPC, and alerts go to a human who will mute noisy rules if you get this wrong.",
    ),

    h2("The Confirm Ladder"),
    ol([
      "Probe. Send one scheduled request to a dedicated health or critical path.",
      "Retry. On failure or timeout, retry within a short window before changing customer-facing state.",
      "Verify. Require consecutive failures (or multi-region agreement, when you have it) before opening an incident.",
      "Open. Only then alert and update status. Recovery should also require confirmation, not a single lucky success.",
    ]),
    p(
      "The ladder is not a license to ignore brief outages that customers feel. It is a filter for single-packet loss, brief deploys, and flaky edges that do not deserve a public incident.",
    ),

    h2("Choose what to probe"),
    ul([
      "Prefer a dedicated [health endpoint](/glossary/health-endpoint) over scraping a random authenticated route.",
      "Accept only the status codes that mean healthy for that path (often 200; sometimes 204).",
      "Assert a small, stable JSON field when a soft failure can still return 200.",
      "Keep timeouts shorter than your alert patience but long enough for cold starts you accept.",
    ]),
    code(
      "json",
      `{\n  "status": "ok",\n  "checks": {\n    "database": "up"\n  }\n}`,
      "Example health body",
    ),

    h2("Retry without hiding outages"),
    p(
      "Retries buy you protection against transient network errors. They do not buy infinite patience. Document the retry count and delay so on-call knows how long confirmation takes. Product behavior for Fajita retries is described in [Retries](/docs/monitors/retries) and [Incident verification](/docs/incidents/verification).",
    ),
    table(
      ["Failure pattern", "Confirm Ladder treatment", "Customer impact risk"],
      [
        ["Single timeout, next probe OK", "Stay operational", "Low if rare"],
        ["Three consecutive failures", "Open incident after verify", "High if sustained"],
        ["Intermittent 500s every other check", "Investigate flapping; do not mute forever", "Medium"],
        ["Deploy window returns 503 for 90 seconds", "Maintenance or short verify window", "Known"],
      ],
    ),

    h2("Assertions that reduce noise"),
    p(
      "Status code alone is a weak signal for APIs that return 200 with `{\"ok\": false}`. Add JSON assertions for the fields that mean ready. Keep assertions few and stable so deploys do not become alert storms. See [JSON path assertions](/docs/assertions/json-path).",
    ),
    callout("warning", [
      p(
        "Do not assert wall-clock timestamps or request ids. They change every response and create permanent failures.",
      ),
    ]),

    h2("Authentication without secret sprawl"),
    p(
      "If the health path must be authenticated, use a dedicated monitoring credential with least privilege, rotate it, and never put production user tokens in monitors. Prefer a public health path when the only goal is reachability of critical dependencies. See [Authenticated monitoring](/docs/monitors/authenticated-monitoring).",
    ),

    h2("Alert routing that matches severity"),
    p(
      "Page for confirmed down. Defer chatty channels for degraded or verifying states if your product distinguishes them. Quiet hours help after you have trust in confirmation, not before. Related: [Why One Failed Check Should Not Mean Downtime](/blog/why-one-failed-check-is-not-downtime).",
    ),

    h2("A small configuration checklist"),
    ul([
      "Dedicated health path exists and is documented",
      "Accepted status codes listed",
      "One or two stable body assertions",
      "Retry and confirmation settings written down",
      "Alert channel tested with a deliberate failure",
      "Recovery confirmation required before auto-resolve",
    ]),

    h2("Regions and confirmation"),
    p(
      "If you later add a second region, treat disagreement carefully. One region failing while another succeeds is often a network path issue, not a full customer outage. Require agreement before a public incident, unless your product is only served from the failing path.",
    ),
    p(
      "Do not multiply regions only to create more pages. Multiply regions when customers are geographically concentrated enough that a single vantage point lies.",
    ),

    h2("Worked example"),
    p(
      "Suppose `/health` should return 200 with `{\"status\":\"ok\"}` every minute. Configure one retry on timeout, open an incident after two consecutive confirmed failures, and require two consecutive successes to recover. A single packet loss creates no ticket. A five-minute outage still surfaces within a few minutes.",
    ),
    p(
      "Write that configuration in the monitor description so the next person on call knows how long confirmation takes. Silence without a documented budget feels like a broken product.",
    ),

    h2("What this does not solve"),
    p(
      "External uptime checks will not replace tracing, log search, or product analytics. They answer whether the API path you chose is reachable and behaving as asserted. Keep that scope honest and the Confirm Ladder stays useful.",
    ),
  ],
});
