import { h2, p, ul } from "@/lib/docs/blocks";

import { defineTool } from "../types";

const TOOL_REVIEWS = {
  status: "published" as const,
  author: "fajita-engineering",
  owner: "content-editorial",
  reviewers: ["engineering", "security", "editorial"],
  publishedAt: "2026-07-17",
  updatedAt: "2026-07-17",
  lastReviewedAt: "2026-07-17",
  nextReviewDue: "2027-01-17",
  contentVersion: "1",
  productVersion: "1.0",
  securityReviewPassed: true,
  privacyReviewPassed: true,
  calculationTestsPassed: true,
  accessibilityReviewPassed: true,
  antiAiSlopPassed: true,
  indexable: true,
  llmInclude: true,
  funnelStage: "activation" as const,
};

export const uptimeCalculatorTool = defineTool({
  meta: {
    ...TOOL_REVIEWS,
    id: "tool-uptime-calculator",
    contentType: "tool",
    slug: "uptime-calculator",
    toolId: "uptime-calculator",
    title: "Uptime calculator",
    description:
      "Convert an uptime percentage into allowed downtime for 24 hours, 30 days, a year, or a custom window. Runs in your browser.",
    topicCluster: "uptime-monitoring",
    primaryQuery: "uptime calculator",
    secondaryQueries: ["downtime calculator", "99.9 uptime minutes"],
    searchIntent: "calculate",
    audience: "Operators publishing or targeting uptime percentages",
    networkAccess: false,
    storesInput: false,
    clientSideOnly: true,
    privacySummary:
      "All inputs stay in your browser. No server request is made. Nothing is stored. Analytics events never include your percentage or custom duration.",
    methodologySummary:
      "Allowed downtime equals (1 - uptime/100) multiplied by the selected period in seconds. Available time equals uptime/100 multiplied by the period. Calendar months vary; the 30-day option uses exactly 30 days.",
    limitations: [
      "Does not equal contractual SLA compliance by itself",
      "Does not model maintenance exclusions unless you adjust the window",
      "Monitoring definitions of downtime vary by product",
    ],
    originalContribution:
      "Decimal-safe browser calculator with Measurement Contract links and no server storage.",
    productCta: "start-monitoring",
    relatedGlossary: ["uptime-percentage", "downtime", "uptime"],
    relatedDocs: [
      { href: "/docs/status-pages/uptime-history", label: "Uptime history" },
    ],
    relatedContent: ["how-to-calculate-uptime-correctly"],
    featured: true,
  },
  body: [
    p(
      "Enter a target uptime percentage and a time window. The calculator returns allowed downtime and available time. It does not claim SLA compliance.",
    ),
    h2("Methodology"),
    p(
      "Allowed downtime = (1 - U) × T, where U is the uptime fraction and T is the period length. See [How to Calculate Uptime Correctly](/blog/how-to-calculate-uptime-correctly).",
    ),
    h2("Limitations"),
    ul([
      "Check intervals limit how precisely downtime can be known",
      "Maintenance treatment changes the meaning of the percentage",
      "This tool does not replace monitoring",
    ]),
  ],
});

export const webhookSignatureTool = defineTool({
  meta: {
    ...TOOL_REVIEWS,
    id: "tool-webhook-signature",
    contentType: "tool",
    slug: "webhook-signature-generator",
    toolId: "webhook-signature-generator",
    title: "Webhook signature generator and verifier",
    description:
      "Generate or verify HMAC SHA-256 webhook signatures in your browser. Secrets never leave the device.",
    topicCluster: "api-reliability",
    primaryQuery: "webhook signature generator hmac",
    secondaryQueries: ["verify webhook signature", "hmac sha256 webhook"],
    searchIntent: "calculate",
    audience: "Engineers implementing webhook receivers",
    networkAccess: false,
    storesInput: false,
    clientSideOnly: true,
    privacySummary:
      "Secret, payload, timestamp, and signature stay in browser memory only. No server request. No localStorage. Clear the form when finished. Do not paste a production secret on a device you do not trust.",
    methodologySummary:
      "Signed message is timestamp + '.' + raw body. Signature is hex-encoded HMAC SHA-256 of that message using your secret. Verification compares hex digests in constant time after normalizing an optional sha256= prefix.",
    limitations: [
      "Does not send webhooks",
      "Does not match every vendor's canonicalization quirks",
      "Requires Web Crypto in the browser",
    ],
    originalContribution:
      "Client-only HMAC tool with explicit raw-body and timestamp teaching notes.",
    productCta: "review-documentation",
    relatedGlossary: ["webhook-signature", "hmac", "webhook"],
    relatedDocs: [
      { href: "/docs/webhooks/signatures", label: "Webhook signatures" },
      { href: "/docs/security/webhook-security", label: "Webhook security" },
    ],
    relatedContent: ["safe-api-health-endpoint"],
    featured: true,
  },
  body: [
    p(
      "Use this tool to learn the signed-message shape and to verify fixtures. Prefer generating secrets on trusted machines only.",
    ),
    h2("Security notes"),
    ul([
      "Compare signatures with a constant-time function in production code",
      "Reject stale timestamps",
      "Verify against the raw body, not a re-serialized JSON object",
    ]),
  ],
});

export const cronExplainerTool = defineTool({
  meta: {
    ...TOOL_REVIEWS,
    id: "tool-cron-explainer",
    contentType: "tool",
    slug: "cron-expression-explainer",
    toolId: "cron-expression-explainer",
    title: "Cron expression explainer",
    description:
      "Explain a 5-field cron expression and show upcoming UTC run times. No commands are executed.",
    topicCluster: "cron-heartbeat",
    primaryQuery: "cron expression explainer",
    secondaryQueries: ["cron schedule next runs", "understand crontab"],
    searchIntent: "calculate",
    audience: "Engineers scheduling jobs and heartbeats",
    networkAccess: false,
    storesInput: false,
    clientSideOnly: true,
    privacySummary:
      "The expression stays in your browser. No server request. Analytics never receive the expression text.",
    methodologySummary:
      "Parses classic 5-field cron (minute hour day-of-month month day-of-week) with lists, ranges, and steps. Next runs are projected minute-by-minute in UTC. Day-of-month and day-of-week restrictions follow common OR semantics and are called out in warnings.",
    limitations: [
      "Not every platform uses identical cron syntax",
      "Seconds fields and some extensions are unsupported",
      "Timezone conversions around DST need human care",
    ],
    originalContribution:
      "5-field explainer with OR-semantics warning and heartbeat conversion path.",
    productCta: "create-heartbeat",
    relatedGlossary: ["cron-job", "heartbeat-monitoring", "grace-period"],
    relatedDocs: [
      { href: "/docs/monitors/heartbeat-monitoring", label: "Heartbeat monitoring" },
    ],
    relatedContent: ["heartbeat-monitoring-for-cron-jobs"],
    featured: true,
  },
  body: [
    p(
      "A cron expression describes when a job should run. Pair it with a [heartbeat monitor](/features/cron-monitoring) to learn whether it actually ran.",
    ),
  ],
});

export const statusChecklistTool = defineTool({
  meta: {
    ...TOOL_REVIEWS,
    id: "tool-status-checklist",
    contentType: "tool",
    slug: "status-page-checklist",
    toolId: "status-page-checklist",
    title: "Status-page readiness checklist",
    description:
      "Interactive checklist for ownership, components, incidents, maintenance, subscribers, and testing. Not a certification.",
    topicCluster: "status-pages",
    primaryQuery: "status page checklist",
    secondaryQueries: ["status page readiness", "launch status page checklist"],
    searchIntent: "how-to",
    audience: "Teams publishing a customer status page",
    networkAccess: false,
    storesInput: false,
    clientSideOnly: true,
    privacySummary:
      "Answers stay in your browser unless you copy them. No account required. Nothing is stored on Fajita servers.",
    methodologySummary:
      "Critical items must be yes before the summary can read ready. Partial answers count as needs review. The tool never issues a badge or claims outage-proof status.",
    limitations: [
      "Not a certification or compliance attestation",
      "Does not prove the page will stay current during a real incident",
      "Custom process items may not appear in the list",
    ],
    originalContribution:
      "Readiness summary with critical-path gating and copyable plain-text export.",
    productCta: "publish-status-page",
    relatedGlossary: ["status-page", "status-page-component", "scheduled-maintenance"],
    relatedDocs: [
      { href: "/docs/status-pages/create", label: "Create a status page" },
      { href: "/docs/status-pages/components", label: "Components" },
    ],
    relatedContent: ["what-belongs-on-status-page"],
    featured: true,
  },
  body: [
    p(
      "Work through the checklist, then copy the summary into your launch notes. Green on a checklist is not the same as calm during an outage.",
    ),
  ],
});

export const allTools = [
  uptimeCalculatorTool,
  webhookSignatureTool,
  cronExplainerTool,
  statusChecklistTool,
];

/** HTTP status checker intentionally deferred: networked fetch needs full SSRF reuse proof. */
export const DEFERRED_TOOLS = [
  {
    slug: "http-status-checker",
    reason:
      "Deferred in Phase 15. Destination validation exists for monitors, but a public one-shot fetcher needs isolated capacity, redirect rebinding defenses under tool load, and abuse controls proven separately from paid workers.",
  },
] as const;
