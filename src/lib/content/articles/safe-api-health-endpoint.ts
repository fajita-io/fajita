import { callout, code, h2, p, ul } from "@/lib/docs/blocks";

import { defineArticle } from "../types";
import { LAUNCH_REVIEWS } from "./_shared";

/** Original contribution: Safe Health Endpoint checklist (public, cheap, honest, boring). */
export const safeApiHealthEndpoint = defineArticle({
  meta: {
    ...LAUNCH_REVIEWS,
    id: "article-safe-api-health-endpoint",
    contentType: "article",
    slug: "safe-api-health-endpoint",
    title: "How to Design a Safe API Health Endpoint",
    description:
      "Build a health endpoint that is public when possible, cheap, honest about dependencies, and boring under load. Includes shapes and security cautions.",
    articleType: "technical-tutorial",
    category: "apis-webhooks",
    topicCluster: "api-reliability",
    primaryQuery: "api health endpoint design",
    secondaryQueries: [
      "health check endpoint best practices",
      "safe health check dependencies",
      "what should health endpoint return",
    ],
    searchIntent: "how-to",
    audience: "Engineers adding monitoring to an API",
    funnelStage: "activation",
    readingMinutes: 9,
    thesis:
      "A safe health endpoint is cheap, honest, and hard to abuse. It should tell external monitors whether critical dependencies are reachable without becoming an open proxy into your internals.",
    featured: false,
    originalContribution:
      "Public, Cheap, Honest, Boring checklist for health endpoints, with dependency rules and response shapes.",
    relatedContent: [
      "monitor-api-without-alert-noise",
      "heartbeat-monitoring-for-cron-jobs",
    ],
    relatedDocs: [
      { href: "/docs/monitors/api-monitoring", label: "API monitoring" },
      { href: "/docs/security/monitoring-destinations", label: "Monitoring destinations" },
      { href: "/docs/assertions/json-path", label: "JSON path assertions" },
    ],
    relatedGlossary: [
      "health-endpoint",
      "api-health-check",
      "http-status-code",
      "api-monitoring",
    ],
    relatedTools: ["webhook-signature-generator"],
    relatedComparisons: [],
    productCta: "start-monitoring",
    author: "fajita-engineering",
    requiresSecurityReview: true,
    securityReviewPassed: true,
  },
  body: [
    p(
      "A health endpoint exists so an external monitor can ask a narrow question: are the dependencies we care about reachable enough to serve customers? It should be cheap to call, honest in failure, and boring under load. It should not become a debug console or an open proxy.",
    ),

    h2("Public, Cheap, Honest, Boring"),
    ul([
      "Public when possible. Prefer unauthenticated reachability for the basic liveness signal. Put privileged detail behind auth or omit it.",
      "Cheap. Constant-time checks. No full report generation. No unbounded fan-out.",
      "Honest. If the database is required for requests to succeed, a DB failure should fail the health check.",
      "Boring. Stable JSON keys. No timestamps required for success. No unique ids that break assertions.",
    ]),

    h2("Suggested response shape"),
    code(
      "json",
      `{\n  "status": "ok",\n  "checks": {\n    "database": "up",\n    "queue": "up"\n  }\n}`,
      "Healthy",
    ),
    code(
      "json",
      `{\n  "status": "error",\n  "checks": {\n    "database": "down",\n    "queue": "up"\n  }\n}`,
      "Unhealthy",
    ),
    p(
      "Return a non-success HTTP status when `status` is not ok, so monitors that only read status codes still work. Pair with JSON assertions when soft failures can return 200. See [API monitoring](/docs/monitors/api-monitoring).",
    ),

    h2("Dependency rules"),
    ul([
      "Include dependencies whose failure makes customer requests fail.",
      "Exclude third parties you cannot fix and that are not on the critical path for this service.",
      "Cap check time. A hung dependency should time out the health call, not hang forever.",
      "Do not follow user-controlled URLs inside the health handler.",
    ]),
    callout("security", [
      p(
        "Never let a health endpoint fetch arbitrary URLs, run shell commands, or dump environment variables. That turns monitoring into an attack surface.",
      ),
    ]),

    h2("Liveness versus readiness"),
    p(
      "Some teams split \"process is up\" from \"ready to take traffic.\" External uptime monitors usually want readiness for customer paths. If you only expose liveness, you may stay green while traffic should be draining. Name the endpoint so operators know which one they are hitting.",
    ),

    h2("What to assert from the monitor"),
    ul([
      "HTTP status in the success set you documented",
      "`status` field equals `ok` when you use that shape",
      "Optional: critical dependency fields equal `up`",
    ]),
    p(
      "Avoid asserting wall-clock fields. Related: [How to Monitor an API Without Creating Alert Noise](/blog/monitor-api-without-alert-noise).",
    ),

    h2("Load and abuse"),
    p(
      "Health endpoints get polled. Keep them cache-friendly only if caching cannot hide dependency failure. Rate-limit abusive clients if needed, but do not rate-limit your monitor into false downtime. Document expected poll intervals for operators.",
    ),

    h2("Ship checklist"),
    ul([
      "Path documented for on-call",
      "Success and failure examples recorded",
      "Monitor test passes before activation",
      "No secrets in response bodies",
      "Timeouts defined for each dependency check",
    ]),
    p(
      "After the endpoint ships, configure the monitor with confirmation settings from [How to Monitor an API Without Creating Alert Noise](/blog/monitor-api-without-alert-noise). A perfect health handler still pages too often if the monitor treats every blip as downtime.",
    ),
    p(
      "Revisit the dependency list when architecture changes. Yesterday’s optional cache can become today’s hard requirement after a launch. Health checks that lie about readiness teach everyone to ignore them.",
    ),
  ],
});
