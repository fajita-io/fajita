/**
 * Remaining glossary categories. Run after part 1:
 * node scripts/generate-glossary-terms.mjs && node scripts/generate-glossary-terms-part2.mjs
 */
import fs from "node:fs";
import path from "node:path";

const ROOT = path.resolve("src/lib/glossary/content");
const REVIEWED = "2026-07-17";
const NEXT = "2027-01-17";
const NEXT_Q = "2026-10-17";
const PV = "1.0";

/** @type {any[]} */
const SPECS = [];
function add(s) {
  SPECS.push(s);
}

function pack(opts) {
  const {
    slug,
    term,
    category,
    focus,
    exampleTarget,
    mistake,
    fajita,
    relatedTerms,
    primaryQuery,
    cta = "none",
    productAreas = [],
    documentationLinks = [],
    productLinks = [],
    synonyms = [],
    featured = false,
    foundational = false,
    cluster,
    acronym,
    expandedName,
    requiresLegalReview = false,
    requiresSecurityReview = false,
    faqs,
    formula,
    uptimeTable = false,
    searchBoost = 0,
    broaderTerms = [],
    narrowerTerms = [],
    title,
    description,
    whyExtra = [],
    howExtra = [],
  } = opts;

  const shortDefinition = `${term} is ${focus}.`;
  // Ensure >= 40 chars
  const shortDefinitionFull =
    shortDefinition.length >= 40
      ? shortDefinition
      : `${shortDefinition} Teams use a shared definition so checks and reviews stay precise.`;

  const shortAnswer = `${term} describes ${focus}. In reliability work, the label is useful only when it maps to a measurable check, a clear owner, and a next action when expectations break. Without that operational meaning, the phrase becomes decoration in dashboards and status updates.`;

  add({
    slug,
    term,
    shortDefinition: shortDefinitionFull.slice(0, 280),
    shortAnswer,
    category,
    primaryQuery: primaryQuery ?? `what is ${term.toLowerCase()}`,
    synonyms,
    relatedTerms,
    broaderTerms,
    narrowerTerms,
    productAreas,
    documentationLinks,
    productLinks,
    cta,
    featured,
    foundational,
    cluster,
    acronym,
    expandedName,
    requiresLegalReview,
    requiresSecurityReview,
    reviewers: requiresLegalReview
      ? ["product", "legal"]
      : requiresSecurityReview
        ? ["product", "engineering", "security"]
        : ["product", "engineering"],
    nextReviewDue: requiresLegalReview || requiresSecurityReview ? NEXT_Q : NEXT,
    searchBoost,
    title: title ?? `What Is ${term}? Definition and Examples`,
    description:
      description ??
      `${term}: ${focus}. A clear Fajita glossary definition for software teams.`.slice(0, 160),
    why: [
      `${term} matters because teams need a precise shared meaning for ${focus}. Vague language turns incidents into arguments about words instead of fixes.`,
      `When everyone uses the same definition, alerts, status updates, and post-incident reviews stay aligned.`,
      ...whyExtra,
    ],
    how: [
      `In practice, ${focus} shows up as a concrete signal you can measure or communicate. Operators define what good looks like, watch for deviations, and record what happened when expectations break.`,
      `The useful version of ${term.toLowerCase()} is operational: it changes who gets notified, what customers see, or which metric a team reviews after an incident.`,
      ...howExtra,
    ],
    example: [
      `Imagine a team operating around ${exampleTarget}. When observed behavior stops matching the definition of ${term.toLowerCase()}, the team treats that change as a reliability event with a clear owner and next step.`,
    ],
    misconception: {
      title: mistake,
      body: [
        `That reading usually collapses distinct ideas into one slogan. Keep ${term.toLowerCase()} tied to observable behavior so the definition stays useful under pressure.`,
      ],
    },
    fajita: fajita ? [fajita] : undefined,
    faqs,
    formula,
    uptimeTable,
  });
}

/* -------- Incidents -------- */
const incidents = [
  ["incident", "Incident", "incidents", "a tracked period of degraded or failed service", "api.example.com returning 503 after verification", "An incident is any failed monitor check", "Fajita opens incidents after verification, not after every blip. See [incident verification](/docs/incidents/verification).", { featured: true, foundational: true, cta: "status-page", documentationLinks: [{ href: "/docs/incidents/verification", label: "Incident verification" }], productLinks: [{ href: "/features/incident-communication", label: "Incident communication" }], related: ["incident-verification", "incident-severity", "recovery-confirmation", "incident-timeline", "false-positive"] }],
  ["incident-management", "Incident management", "incidents", "the process of detecting, coordinating, resolving, and reviewing service failures", "an open incident for checkout API failures", "Incident management is only a status-page post", "Fajita tracks incident state, timeline, and recovery. See [incident timeline](/docs/incidents/timeline).", { related: ["incident", "incident-response", "post-incident-review", "incident-acknowledgment"] }],
  ["incident-detection", "Incident detection", "incidents", "discovering that a service likely failed or degraded", "monitor failures on https://api.example.com/health", "Detection always equals a confirmed outage", "Fajita detects candidate failures through monitors, then verifies before treating them as incidents.", { related: ["incident-verification", "false-positive", "monitoring-interval"] }],
  ["incident-verification", "Incident verification", "incidents", "confirming a failure is real before treating it as an incident", "a second region confirming https://api.example.com/health is down", "Verification means blaming a root cause", "Fajita verifies failures before alerting. See [incident verification](/docs/incidents/verification).", { featured: true, foundational: true, cta: "monitor", documentationLinks: [{ href: "/docs/incidents/verification", label: "Incident verification" }], related: ["retry", "false-positive", "incident", "monitoring-region", "recovery-confirmation"] }],
  ["incident-response", "Incident response", "incidents", "the coordinated actions taken while a service is degraded or down", "acknowledging and assigning a checkout outage", "Response is only writing a public status update", "Fajita supports acknowledgment, assignment, timeline notes, and recovery confirmation during response.", { related: ["incident-acknowledgment", "incident-assignment", "incident-severity"] }],
  ["incident-severity", "Incident severity", "incidents", "a ranked label for how bad an incident is", "severity high for payments API downtime", "Severity is the same as priority forever", "Fajita lets teams set severity so routing and status communication match impact. See [degraded vs down](/docs/incidents/degraded-vs-down).", { related: ["degraded-performance", "major-outage", "partial-outage"] }],
  ["degraded-performance", "Degraded performance", "incidents", "a state where a service works partially or slowly but is not fully down", "search API responding in 4s instead of 200ms", "Degraded always means completely offline", "Fajita distinguishes degraded from down. See [degraded vs down](/docs/incidents/degraded-vs-down).", { related: ["partial-outage", "major-outage", "response-time-threshold"] }],
  ["partial-outage", "Partial outage", "incidents", "a failure that affects some features, regions, or customers but not the whole service", "billing API down while marketing site stays up", "Partial outage means only one server restarted", "Describe partial outages clearly on status pages so customers know what still works.", { related: ["degraded-performance", "major-outage", "status-page-component"] }],
  ["major-outage", "Major outage", "incidents", "a severe failure that blocks core customer journeys", "login and checkout both unavailable", "Every failed check is a major outage", "Reserve major outage language for core path failures and keep status copy honest.", { related: ["partial-outage", "incident-severity", "public-incident"] }],
  ["service-disruption", "Service disruption", "incidents", "an interruption to normal service behavior, whether partial or complete", "customers unable to export reports", "Disruption is only intentional maintenance", "Use disruption language carefully on status pages; pair it with components and updates.", { related: ["incident", "scheduled-maintenance", "public-incident"] }],
  ["recovery-confirmation", "Recovery confirmation", "incidents", "evidence that a service has returned to healthy behavior after a failure", "successful checks after api.example.com recovered", "Recovery is the first successful ping", "Fajita confirms recovery before closing the loop. See [recovery](/docs/incidents/recovery).", { foundational: true, documentationLinks: [{ href: "/docs/incidents/recovery", label: "Recovery" }], related: ["incident-resolution", "incident-verification", "flapping"] }],
  ["incident-resolution", "Incident resolution", "incidents", "closing an incident after the service is healthy again and work is complete", "marking the checkout incident resolved", "Resolution deletes the incident history", "Resolved incidents remain in history for review and uptime context.", { related: ["recovery-confirmation", "incident-recap", "post-incident-review"] }],
  ["incident-reopening", "Incident reopening", "incidents", "returning a resolved incident to an active state when failure returns", "checkout fails again twenty minutes after resolve", "Reopening always means a brand-new incident", "Reopening preserves context when a fix did not hold. Watch for flapping patterns.", { related: ["flapping", "recovery-confirmation", "incident"] }],
  ["flapping", "Flapping", "incidents", "rapid oscillation between healthy and failed states", "api.example.com alternating pass and fail each minute", "Flapping is the same as a planned deploy", "Fajita surfaces flapping so teams do not resolve and reopen endlessly.", { related: ["incident-reopening", "retry", "false-positive"] }],
  ["false-positive", "False positive", "incidents", "an alert or incident that fired when the service was actually fine", "a regional blip that looked like downtime", "False positives mean monitoring is useless", "Verification and retries reduce false positives without ignoring real outages.", { foundational: true, related: ["false-negative", "incident-verification", "retry"] }],
  ["false-negative", "False negative", "incidents", "a real failure that monitoring failed to detect", "checkout broken while /health still returned 200", "False negatives only happen with bad alert channels", "Monitor real customer paths, not only shallow health endpoints, to reduce false negatives.", { related: ["false-positive", "health-endpoint", "api-monitoring"] }],
  ["incident-timeline", "Incident timeline", "incidents", "the ordered record of detection, updates, and recovery for an incident", "timestamps from first fail to resolve", "A timeline is only for public customers", "Fajita keeps an internal timeline. See [incident timeline](/docs/incidents/timeline).", { documentationLinks: [{ href: "/docs/incidents/timeline", label: "Incident timeline" }], related: ["incident", "incident-recap", "public-incident"] }],
  ["incident-acknowledgment", "Incident acknowledgment", "incidents", "an explicit signal that a human has seen the incident and is engaging", "on-call acknowledges the payments incident", "Acknowledgment means the outage is fixed", "Acknowledgment stops duplicate paging confusion while work continues.", { related: ["incident-assignment", "incident-response", "alert"] }],
  ["incident-assignment", "Incident assignment", "incidents", "naming the person or role responsible for driving an incident", "assigning the checkout incident to the payments owner", "Assignment replaces the need for a timeline", "Clear assignment keeps incident response from stalling in a group channel.", { related: ["incident-acknowledgment", "incident-response"] }],
  ["incident-recap", "Incident recap", "incidents", "a short after-action summary of what happened and what changed", "recap of a two-hour API outage", "A recap is a full root-cause analysis", "Recaps help teams learn quickly; deeper RCA can follow when stakes require it.", { related: ["post-incident-review", "root-cause-analysis", "incident-timeline"] }],
  ["root-cause-analysis", "Root-cause analysis", "incidents", "structured investigation into why an incident happened", "finding a bad migration behind 500s", "There is always exactly one root cause", "Prefer clear contributing factors over a single blame story.", { related: ["post-incident-review", "incident-recap"] }],
  ["post-incident-review", "Post-incident review", "incidents", "a blameless review of detection, response, and prevention after an incident", "review meeting after a status-page-worthy outage", "The review exists to assign personal blame", "Focus reviews on system improvements: detection gaps, communication, and follow-up actions.", { related: ["root-cause-analysis", "incident-recap", "incident-management"] }],
];

for (const row of incidents) {
  const [slug, term, category, focus, exampleTarget, mistake, fajita, extra = {}] = row;
  pack({
    slug,
    term,
    category,
    focus,
    exampleTarget,
    mistake,
    fajita,
    relatedTerms: extra.related ?? ["incident", "incident-verification"],
    cta: extra.cta ?? "none",
    featured: extra.featured,
    foundational: extra.foundational,
    documentationLinks: extra.documentationLinks,
    productLinks: extra.productLinks,
    productAreas: extra.productAreas ?? ["incident-communication"],
  });
}

/* -------- Alerts -------- */
const alerts = [
  ["alert", "Alert", "alerts", "a message that tells someone a monitored condition needs attention", "Slack notice that api.example.com is down", "Every log line is an alert", "Fajita sends alerts through email, Slack, Discord, and webhooks after verification. See [connect an alert channel](/docs/getting-started/connect-an-alert-channel).", { foundational: true, cta: "alert", documentationLinks: [{ href: "/docs/getting-started/connect-an-alert-channel", label: "Connect an alert channel" }], related: ["alert-channel", "alert-routing", "outage-alert", "recovery-alert"] }],
  ["outage-alert", "Outage alert", "alerts", "a notification that a service has entered a failed or down state", "email that checkout is down", "Outage alerts should fire on every retry", "Fajita outage alerts follow verified incident state, not every transient fail.", { cta: "alert", related: ["alert", "recovery-alert", "incident"] }],
  ["recovery-alert", "Recovery alert", "alerts", "a notification that a previously failing service is healthy again", "Slack message that api.example.com recovered", "Recovery alerts are optional noise", "Recovery notifications close the loop for responders. See [recovery notifications](/docs/alerts/recovery-notifications).", { documentationLinks: [{ href: "/docs/alerts/recovery-notifications", label: "Recovery notifications" }], related: ["outage-alert", "recovery-confirmation"] }],
  ["alert-channel", "Alert channel", "alerts", "a configured destination for alert delivery such as email or Slack", "a Slack channel named #ops-alerts", "A channel is the same as a routing rule", "Fajita supports email, Slack, Discord, and generic webhooks as channels.", { foundational: true, cta: "alert", related: ["alert-routing", "slack-alert", "discord-alert", "email-alert", "webhook-alert"] }],
  ["alert-routing", "Alert routing", "alerts", "rules that decide which channels receive which events", "payments monitors route to #payments-oncall", "Routing means forwarding every alert everywhere", "Create routing rules so the right team hears the right failures. See [routing rules](/docs/alerts/routing-rules).", { featured: true, foundational: true, cta: "alert", documentationLinks: [{ href: "/docs/alerts/routing-rules", label: "Alert routing rules" }], related: ["alert-rule", "alert-channel", "quiet-hours"] }],
  ["alert-rule", "Alert rule", "alerts", "a specific condition that maps events to channels or suppression behavior", "rule: severity high to email and Slack", "Rules replace monitors", "Rules sit between incident events and channels so delivery stays intentional.", { related: ["alert-routing", "quiet-hours", "alert-deduplication"] }],
  ["alert-fatigue", "Alert fatigue", "alerts", "desensitization caused by too many low-value alerts", "dozens of nightly flaky warnings", "Fatigue means people need louder sounds", "Reduce fatigue with verification, routing, and quiet hours instead of more noise.", { related: ["false-positive", "quiet-hours", "alert-deduplication"] }],
  ["alert-deduplication", "Alert deduplication", "alerts", "suppressing repeated identical alerts while a condition remains open", "one page for a continuing outage instead of fifty", "Deduplication deletes incident history", "Deduplicate delivery, keep the timeline. Responders need one clear signal.", { related: ["alert-fatigue", "alert-routing"] }],
  ["quiet-hours", "Quiet hours", "alerts", "a window when non-critical alerts are delayed or suppressed", "no low-severity pages between 22:00 and 07:00", "Quiet hours block all emergency alerts forever", "Configure quiet hours carefully. Critical outages may still need to break through. See [quiet hours](/docs/alerts/quiet-hours).", { documentationLinks: [{ href: "/docs/alerts/quiet-hours", label: "Quiet hours" }], related: ["alert-routing", "alert-fatigue"] }],
  ["alert-retry", "Alert retry", "alerts", "sending an alert again after a delivery attempt failed", "retrying a Slack webhook after HTTP 500", "Retries guarantee the human saw the message", "Retries improve delivery reliability. Dead letters capture lasting failures. See [retries and dead letters](/docs/alerts/retries-and-dead-letters).", { documentationLinks: [{ href: "/docs/alerts/retries-and-dead-letters", label: "Retries and dead letters" }], related: ["alert-delivery", "dead-letter-queue"] }],
  ["alert-delivery", "Alert delivery", "alerts", "the attempt to send an alert to a channel and record the outcome", "successful Discord post for an outage", "Delivery means the outage is fixed", "Delivery logs show whether the channel accepted the message.", { related: ["alert-retry", "dead-letter-queue", "alert-channel"] }],
  ["dead-letter-queue", "Dead-letter queue", "alerts", "a holding place for alert deliveries that exhausted retries", "failed webhook stored for operator review", "Dead letters are deleted customer emails", "Inspect dead letters and fix the channel. See [retries and dead letters](/docs/alerts/retries-and-dead-letters).", { documentationLinks: [{ href: "/docs/alerts/retries-and-dead-letters", label: "Retries and dead letters" }], related: ["alert-retry", "alert-delivery", "webhook-alert"] }],
  ["webhook-alert", "Webhook alert", "alerts", "an alert delivered as an HTTP POST to a URL you control", "POST to https://hooks.example.com/fajita", "Webhook alerts are unsigned by nature", "Fajita generic webhooks can include signatures. See [generic webhooks](/docs/alerts/generic-webhooks).", { documentationLinks: [{ href: "/docs/alerts/generic-webhooks", label: "Generic webhooks" }], cta: "alert", related: ["webhook", "webhook-signature", "alert-channel"] }],
  ["slack-alert", "Slack alert", "alerts", "an alert delivered into a Slack workspace channel or conversation", "#incidents receives a downtime notice", "Slack alerts replace on-call ownership", "Connect Slack as a channel in Fajita. See [Slack alerts](/docs/alerts/slack).", { documentationLinks: [{ href: "/docs/alerts/slack", label: "Slack alerts" }], cta: "alert", related: ["alert-channel", "discord-alert", "email-alert"] }],
  ["discord-alert", "Discord alert", "alerts", "an alert delivered into a Discord channel via webhook integration", "ops Discord channel receives recovery notice", "Discord alerts are only for gaming communities", "Connect Discord in Fajita. See [Discord alerts](/docs/alerts/discord).", { documentationLinks: [{ href: "/docs/alerts/discord", label: "Discord alerts" }], cta: "alert", related: ["alert-channel", "slack-alert"] }],
  ["email-alert", "Email alert", "alerts", "an alert delivered to one or more email addresses", "oncall@example.com receives an outage email", "Email alerts are always the fastest channel", "Email remains a reliable baseline channel in Fajita alongside chat integrations.", { cta: "alert", related: ["alert-channel", "slack-alert"] }],
];

for (const row of alerts) {
  const [slug, term, category, focus, exampleTarget, mistake, fajita, extra = {}] = row;
  pack({
    slug,
    term,
    category,
    focus,
    exampleTarget,
    mistake,
    fajita,
    relatedTerms: extra.related ?? ["alert", "alert-channel"],
    cta: extra.cta ?? "alert",
    featured: extra.featured,
    foundational: extra.foundational,
    documentationLinks: extra.documentationLinks,
    productLinks: extra.productLinks ?? [{ href: "/integrations", label: "Integrations" }],
    productAreas: ["alerts"],
  });
}

/* -------- Status pages -------- */
const statusPages = [
  ["status-page", "Status page", "status-pages", "a public or private page that communicates current service health and incidents", "status.example.com during a checkout incident", "A status page is only a marketing site", "Fajita hosts status pages with components, incidents, maintenance, and uptime history. See [create a status page](/docs/status-pages/create).", { featured: true, foundational: true, cluster: "status-page", cta: "status-page", documentationLinks: [{ href: "/docs/status-pages/create", label: "Create a status page" }, { href: "/docs/getting-started/publish-a-status-page", label: "Publish a status page" }], productLinks: [{ href: "/features/status-pages", label: "Status pages" }], related: ["status-page-component", "public-incident", "scheduled-maintenance", "status-page-subscriber", "uptime-history"], faqs: [{ question: "Should every outage appear on the status page?", answer: "Publish incidents that affect customers or stakeholders. Internal blips that never left verification may not belong in public view." }, { question: "What belongs in a status update?", answer: "What is affected, what you know, what you are doing, and when you will update again. Avoid speculation presented as fact." }] }],
  ["hosted-status-page", "Hosted status page", "status-pages", "a status page served on infrastructure managed by the monitoring provider", "https://example.fajita status hostname", "Hosted pages cannot use custom domains", "Fajita provides hosted status pages and optional custom domains.", { cluster: "status-page", cta: "status-page", related: ["status-page", "custom-status-page-domain", "public-status-page"] }],
  ["public-status-page", "Public status page", "status-pages", "a status page anyone can open without logging in", "customers reading status.example.com", "Public pages must show internal notes", "Publish only public-safe incident text. Keep internal diagnostics off the page.", { cluster: "status-page", cta: "status-page", related: ["private-status-page", "public-incident", "status-page"] }],
  ["private-status-page", "Private status page", "status-pages", "a status page limited to authorized viewers", "partner-only status for a B2B API", "Private means it is not useful", "Private pages still need clear components and honest updates for the audience that can see them.", { related: ["public-status-page", "status-page"] }],
  ["status-page-component", "Status-page component", "status-pages", "a named part of a product shown on a status page with its own health", "Checkout API component marked degraded", "Components are only decorative labels", "Map monitors to components carefully. See [components](/docs/status-pages/components).", { foundational: true, cluster: "status-page", documentationLinks: [{ href: "/docs/status-pages/components", label: "Status page components" }], related: ["component-group", "operational-status", "status-page"] }],
  ["component-group", "Component group", "status-pages", "a collection of related status-page components shown together", "group containing API, Dashboard, and Auth", "Groups replace individual component status", "Groups improve scanning; each component should still have its own state.", { related: ["status-page-component", "status-page"] }],
  ["public-incident", "Public incident", "status-pages", "an incident projection written for customers on a status page", "investigating elevated errors on checkout", "Public incidents must include server logs", "Write public-safe summaries. Keep stack traces and internal hosts off the page.", { cluster: "status-page", cta: "status-page", related: ["incident", "status-page", "status-page-subscriber"] }],
  ["status-page-subscriber", "Status-page subscriber", "status-pages", "a person who opts in to receive status updates by email", "subscriber confirms via double opt-in", "Subscribers are the same as alert channels for engineers", "Fajita uses verified double opt-in for subscribers. See [double opt-in](/docs/subscribers/double-opt-in).", { cluster: "status-page", documentationLinks: [{ href: "/docs/subscribers/double-opt-in", label: "Double opt-in" }], related: ["status-page", "public-incident", "scheduled-maintenance"] }],
  ["operational-status", "Operational status", "status-pages", "the healthy state indicating a component is working as expected", "all components green on status.example.com", "Operational means perfect performance forever", "Operational means within expected behavior, not that latency cannot improve.", { related: ["degraded-performance", "status-page-component"] }],
  ["scheduled-maintenance", "Scheduled maintenance", "status-pages", "planned work communicated in advance on a status page", "database upgrade window Sunday 02:00 UTC", "Maintenance is secret so customers are not worried", "Announce maintenance early. See [create maintenance](/docs/maintenance/create).", { foundational: true, documentationLinks: [{ href: "/docs/maintenance/create", label: "Create maintenance" }], related: ["maintenance-window", "status-page", "uptime"] }],
  ["maintenance-window", "Maintenance window", "status-pages", "the time range when planned maintenance is expected to run", "02:00–04:00 UTC maintenance window", "Maintenance windows erase downtime from physics", "Windows explain expected impact. Uptime eligibility rules may treat them specially.", { related: ["scheduled-maintenance", "uptime-percentage"] }],
  ["service-status-history", "Service-status history", "status-pages", "the historical record of component and incident states over time", "ninety days of component history", "History is only a marketing chart", "History helps customers judge reliability trends. Keep the methodology honest.", { related: ["uptime-history", "status-page"] }],
  ["uptime-history", "Uptime history", "status-pages", "a presentation of past availability for a service or component", "calendar of daily uptime for API", "Uptime history is a contractual SLA by itself", "Fajita can show uptime history on status pages. See [uptime history](/docs/status-pages/uptime-history).", { cluster: "status-page", documentationLinks: [{ href: "/docs/status-pages/uptime-history", label: "Uptime history" }], related: ["uptime-percentage", "status-page", "service-status-history"] }],
  ["status-badge", "Status badge", "status-pages", "a compact embeddable indicator of current status", "badge on docs.example.com linking to the status page", "Badges replace full incident communication", "Badges are shortcuts. Deep updates still belong on the status page.", { related: ["status-page", "operational-status"] }],
  ["custom-status-page-domain", "Custom status-page domain", "status-pages", "serving a status page on a domain you control such as status.example.com", "CNAME for status.example.com", "Custom domains remove the need for TLS", "Fajita supports custom domains with managed TLS. See [custom domains](/docs/status-pages/custom-domains).", { cluster: "status-page", cta: "status-page", documentationLinks: [{ href: "/docs/status-pages/custom-domains", label: "Custom domains" }], related: ["hosted-status-page", "managed-tls", "cname-record"] }],
];

for (const row of statusPages) {
  const [slug, term, category, focus, exampleTarget, mistake, fajita, extra = {}] = row;
  pack({
    slug,
    term,
    category,
    focus,
    exampleTarget,
    mistake,
    fajita,
    relatedTerms: extra.related ?? ["status-page"],
    cta: extra.cta ?? "status-page",
    featured: extra.featured,
    foundational: extra.foundational,
    cluster: extra.cluster,
    documentationLinks: extra.documentationLinks,
    productLinks: extra.productLinks ?? [{ href: "/features/status-pages", label: "Status pages" }],
    productAreas: ["status-pages"],
    faqs: extra.faqs,
  });
}

/* -------- APIs & webhooks -------- */
const apis = [
  ["api", "API", "apis-webhooks", "an interface that lets software request work from other software over a defined contract", "https://api.example.com/v1", "APIs are only public partner portals", "Fajita monitors API endpoints with HTTP assertions. See [API monitoring](/docs/monitors/api-monitoring).", { acronym: "API", expandedName: "Application Programming Interface", foundational: true, cta: "monitor", related: ["api-endpoint", "api-monitoring", "http-status-code"] }],
  ["api-endpoint", "API endpoint", "apis-webhooks", "a specific URL and method that performs one API operation", "GET https://api.example.com/v1/health", "An endpoint is the entire API product", "Monitor the endpoints that represent real customer journeys.", { related: ["api", "api-health-check", "endpoint-monitoring"] }],
  ["api-health-check", "API health check", "apis-webhooks", "a request that reports whether an API is ready to serve traffic", "GET /health returning {\"status\":\"ok\"}", "Health checks should create real purchases", "Point monitors at cheap health checks that still reflect dependency readiness.", { related: ["health-endpoint", "api-monitoring", "json-response"] }],
  ["http-status-code", "HTTP status code", "apis-webhooks", "a three-digit code describing the result of an HTTP request", "503 from https://api.example.com/health", "Status codes alone explain every failure", "Use status classes for monitoring rules, then inspect bodies when needed.", { foundational: true, howExtra: ["2xx usually means success, 3xx redirects, 4xx client problems, and 5xx server problems. Monitoring rules should match what your API actually returns for healthy traffic."], related: ["api-monitoring", "http-redirect", "http-timeout"] }],
  ["json-response", "JSON response", "apis-webhooks", "an HTTP response body encoded as JSON", "{\"status\":\"ok\"} from a health endpoint", "JSON responses are always small and safe to log whole", "Assert on specific fields. Avoid storing sensitive payloads in screenshots or tickets.", { acronym: "JSON", expandedName: "JavaScript Object Notation", related: ["json-path", "api-health-check"] }],
  ["json-path", "JSON path", "apis-webhooks", "an expression that selects a value inside a JSON document", "$.status equals ok", "JSON path is a database query language", "Fajita can assert JSON paths on API monitors. See [JSON path assertions](/docs/assertions/json-path).", { documentationLinks: [{ href: "/docs/assertions/json-path", label: "JSON path assertions" }], related: ["json-response", "api-monitoring"] }],
  ["response-header", "Response header", "apis-webhooks", "metadata returned by a server with an HTTP response", "content-type: application/json", "Headers never matter for monitoring", "Some monitors assert on headers when they encode cache or auth behavior.", { related: ["request-header", "http-status-code"] }],
  ["request-header", "Request header", "apis-webhooks", "metadata sent by a client with an HTTP request", "authorization header on an API check", "Put long-lived secrets in public docs examples", "Store monitor credentials as secrets. Rotate them like production keys.", { related: ["response-header", "api-monitoring"] }],
  ["webhook", "Webhook", "apis-webhooks", "an HTTP callback that delivers an event to a URL you provide", "POST incident.opened to https://hooks.example.com/fajita", "Webhooks are the same as polling APIs", "Fajita can send webhook alerts and documents verification. See [webhooks overview](/docs/webhooks/overview).", { foundational: true, cta: "alert", documentationLinks: [{ href: "/docs/webhooks/overview", label: "Webhooks overview" }], related: ["webhook-payload", "webhook-signature", "webhook-retry"] }],
  ["webhook-payload", "Webhook payload", "apis-webhooks", "the body of a webhook HTTP request describing an event", "JSON describing incident.opened", "Payloads should include raw secrets for convenience", "Keep payloads public-safe. Verify signatures before trusting content.", { related: ["webhook", "webhook-signature"] }],
  ["webhook-signature", "Webhook signature", "apis-webhooks", "a cryptographic proof that a webhook came from the expected sender", "HMAC signature header on a webhook POST", "Signatures are optional decoration", "Verify signatures before acting on webhooks. See [signatures](/docs/webhooks/signatures) and [webhook security](/docs/security/webhook-security).", { featured: true, requiresSecurityReview: true, documentationLinks: [{ href: "/docs/webhooks/signatures", label: "Webhook signatures" }, { href: "/docs/security/webhook-security", label: "Webhook security" }], related: ["hmac", "webhook", "webhook-payload"], faqs: [{ question: "What happens if I skip signature checks?", answer: "Anyone who discovers the URL can post forged events. Always verify signatures with your signing secret." }, { question: "Is HTTPS enough without signatures?", answer: "HTTPS protects the channel. Signatures prove the sender. You want both." }] }],
  ["hmac", "HMAC", "apis-webhooks", "a keyed hash used to authenticate a message such as a webhook body", "HMAC-SHA256 over the raw webhook body", "HMAC encrypts the payload so nobody can read it", "HMAC authenticates integrity and origin when used with a shared secret. It is not encryption by itself.", { acronym: "HMAC", expandedName: "Hash-based Message Authentication Code", requiresSecurityReview: true, related: ["webhook-signature", "webhook"] }],
  ["webhook-retry", "Webhook retry", "apis-webhooks", "sending a webhook again after the receiver failed or timed out", "retry after the receiver returned 500", "Retries mean duplicate side effects are impossible", "Receivers should be idempotent because retries happen. See [webhook retries](/docs/webhooks/retries).", { documentationLinks: [{ href: "/docs/webhooks/retries", label: "Webhook retries" }], related: ["webhook-idempotency", "idempotency-key", "alert-retry"] }],
  ["webhook-idempotency", "Webhook idempotency", "apis-webhooks", "designing receivers so duplicate webhook deliveries do not cause duplicate effects", "ignoring a second incident.opened with the same id", "Idempotency is only a Fajita setting on the sender", "Build receivers to key on event ids. Retries will occur on real networks.", { related: ["idempotency-key", "webhook-retry"] }],
  ["idempotency-key", "Idempotency key", "apis-webhooks", "a unique key that lets a system recognize and ignore duplicate requests", "Idempotency-Key header on a POST", "Keys make every request slower forever", "Use keys for safely retryable writes and event processing.", { related: ["webhook-idempotency", "webhook-retry"] }],
  ["http-timeout", "HTTP timeout", "apis-webhooks", "the client-side limit on how long to wait for an HTTP response", "10 second timeout on a health check", "Timeouts are server status codes", "Timeouts are client decisions. They appear as failed checks when exceeded.", { related: ["timeout", "api-monitoring", "latency"] }],
  ["http-redirect", "HTTP redirect", "apis-webhooks", "an HTTP response that tells the client to continue at another URL", "301 from http://example.com to https://example.com", "Redirects always mean the monitor should fail", "Decide whether monitors should follow redirects based on what customer success means.", { related: ["http-status-code", "https-monitoring"] }],
];

for (const row of apis) {
  const [slug, term, category, focus, exampleTarget, mistake, fajita, extra = {}] = row;
  pack({
    slug,
    term,
    category,
    focus,
    exampleTarget,
    mistake,
    fajita,
    relatedTerms: extra.related ?? ["api", "webhook"],
    cta: extra.cta ?? "documentation",
    featured: extra.featured,
    foundational: extra.foundational,
    acronym: extra.acronym,
    expandedName: extra.expandedName,
    requiresSecurityReview: extra.requiresSecurityReview,
    documentationLinks: extra.documentationLinks,
    productLinks: extra.productLinks ?? [{ href: "/features/api-monitoring", label: "API monitoring" }],
    productAreas: extra.productAreas ?? ["api-monitoring", "webhooks"],
    faqs: extra.faqs,
    howExtra: extra.howExtra,
  });
}

/* -------- SSL / DNS -------- */
const ssl = [
  ["ssl-certificate", "SSL certificate", "ssl-dns", "a digital certificate commonly used to enable HTTPS for a hostname", "certificate for www.example.com", "SSL certificates are only for email encryption", "Fajita watches certificates for expiry and validity. See [SSL monitoring](/docs/monitors/ssl-monitoring).", { foundational: true, confused: null, related: ["tls-certificate", "ssl-certificate-monitoring", "https-certificate"] }],
  ["tls-certificate", "TLS certificate", "ssl-dns", "a certificate used to authenticate a host during a TLS handshake", "certificate presented by api.example.com", "TLS and SSL are unrelated technologies", "People still say SSL in conversation. Modern HTTPS uses TLS. Monitor the certificate customers depend on.", { related: ["ssl-certificate", "tls-handshake", "ssl-certificate-monitoring"] }],
  ["ssl-certificate-monitoring", "SSL certificate monitoring", "ssl-dns", "watching certificates for upcoming expiration and validity problems", "alert 21 days before example.com expires", "Browsers will always warn your team first", "Fajita SSL monitors warn before customers see certificate errors. See [SSL monitoring](/docs/monitors/ssl-monitoring).", { featured: true, foundational: true, cta: "monitor", documentationLinks: [{ href: "/docs/monitors/ssl-monitoring", label: "SSL monitoring" }], productLinks: [{ href: "/features/ssl-monitoring", label: "SSL monitoring" }], related: ["certificate-expiration", "certificate-chain", "hostname-mismatch", "ssl-certificate"], faqs: [{ question: "How early should certificate alerts fire?", answer: "Many teams alert at 30 and 14 days before expiry so renewals are not last-minute emergencies." }, { question: "Does SSL monitoring replace uptime monitoring?", answer: "No. Certificates can be valid while the application is down, and the reverse can also happen." }] }],
  ["certificate-expiration", "Certificate expiration", "ssl-dns", "the moment after which a certificate should no longer be trusted", "example.com certificate ends on a calendar date", "Expiration is only a billing event", "Expired certificates break HTTPS for visitors. Monitor expiry dates deliberately.", { related: ["ssl-certificate-monitoring", "ssl-certificate"] }],
  ["certificate-chain", "Certificate chain", "ssl-dns", "the sequence of certificates from a server cert up to a trusted root", "leaf, intermediate, and root for api.example.com", "Browsers invent missing intermediates forever", "Incomplete chains cause trust errors on some clients. Monitor chain validity, not only dates.", { related: ["ssl-certificate", "tls-handshake"] }],
  ["hostname-mismatch", "Hostname mismatch", "ssl-dns", "when a certificate does not cover the hostname being visited", "certificate for example.com served on api.example.com", "Mismatch is the same as expiration", "Match certificate names to every hostname customers use, including www and api hosts.", { related: ["ssl-certificate-monitoring", "dns"] }],
  ["tls-handshake", "TLS handshake", "ssl-dns", "the negotiation that establishes a secure TLS session", "client connecting to https://api.example.com", "Handshakes only happen once per year", "Handshake failures appear as HTTPS errors in monitors and browsers.", { related: ["tls-certificate", "https-monitoring"] }],
  ["dns", "DNS", "ssl-dns", "the system that resolves human hostnames into addresses machines use", "resolving api.example.com", "DNS is only a domain registrar control panel", "DNS failures look like total outages even when servers are healthy.", { acronym: "DNS", expandedName: "Domain Name System", foundational: true, related: ["dns-resolution", "dns-record", "cname-record"] }],
  ["dns-resolution", "DNS resolution", "ssl-dns", "the process of looking up records for a hostname", "resolving status.example.com to an address", "Resolution always succeeds if the site worked yesterday", "Monitor HTTPS targets after DNS changes. Propagation mistakes are common.", { related: ["dns", "dns-record"] }],
  ["dns-record", "DNS record", "ssl-dns", "a typed piece of DNS data such as A, AAAA, CNAME, or TXT", "A record for example.com", "Records are decorative metadata", "Wrong records take sites offline or break verification.", { related: ["cname-record", "txt-record", "dns"] }],
  ["cname-record", "CNAME record", "ssl-dns", "a DNS record that aliases one hostname to another", "status.example.com CNAME to a hosted status target", "CNAME always replaces every other record at the zone apex safely", "Use CNAMEs where your DNS provider supports them, especially for status subdomains.", { related: ["custom-status-page-domain", "dns-record"] }],
  ["txt-record", "TXT record", "ssl-dns", "a DNS record that stores text, often for domain verification", "TXT verification token for example.com", "TXT records configure TLS ciphers", "Follow provider instructions for verification TXT values and remove stale tokens when done.", { related: ["domain-verification", "dns-record"] }],
  ["domain-verification", "Domain verification", "ssl-dns", "proving control of a domain, often via DNS or HTTP challenges", "creating a TXT record for status.example.com", "Verification means the site is secure forever", "Verification proves control at a moment in time. Keep DNS access tightly controlled.", { related: ["txt-record", "custom-status-page-domain", "managed-tls"] }],
  ["managed-tls", "Managed TLS", "ssl-dns", "automatic certificate provisioning and renewal for a hostname you control", "managed cert for status.example.com", "Managed TLS removes the need for DNS", "Fajita can manage TLS for custom status domains after DNS is correct.", { related: ["custom-status-page-domain", "ssl-certificate", "domain-verification"] }],
  ["https-certificate", "HTTPS certificate", "ssl-dns", "the certificate presented by a site serving HTTPS", "certificate for https://www.example.com", "HTTPS certificates are different from SSL certificates in every case", "In everyday speech HTTPS certificate and SSL certificate refer to the same operational object.", { related: ["ssl-certificate", "https-monitoring"] }],
];

for (const row of ssl) {
  const [slug, term, category, focus, exampleTarget, mistake, fajita, extra = {}] = row;
  pack({
    slug,
    term,
    category,
    focus,
    exampleTarget,
    mistake,
    fajita,
    relatedTerms: extra.related ?? ["ssl-certificate", "dns"],
    cta: extra.cta ?? (slug.includes("monitor") ? "monitor" : "documentation"),
    featured: extra.featured,
    foundational: extra.foundational,
    acronym: extra.acronym,
    expandedName: extra.expandedName,
    documentationLinks: extra.documentationLinks,
    productLinks: extra.productLinks ?? [{ href: "/features/ssl-monitoring", label: "SSL monitoring" }],
    productAreas: ["ssl-monitoring"],
    faqs: extra.faqs,
  });
}

/* -------- Performance -------- */
const performance = [
  ["latency", "Latency", "performance", "the delay between starting a request and observing a response milestone", "p95 latency of 240ms for /v1/search", "Latency is the same as downtime", "Watch latency with response-time thresholds so slowdowns page someone before full failure.", { related: ["response-time", "time-to-first-byte", "response-time-threshold"] }],
  ["response-time", "Response time", "performance", "how long a request takes until a complete response is received", "820ms response time on a health check", "Response time only matters for marketing sites", "Fajita can fail checks that exceed a response-time threshold.", { related: ["latency", "timeout", "response-time-threshold"] }],
  ["time-to-first-byte", "Time to first byte", "performance", "the time until the client receives the first byte of the response", "TTFB of 120ms for https://www.example.com", "TTFB always equals full page load time", "TTFB helps separate connection and server delay from download time.", { acronym: "TTFB", expandedName: "Time to First Byte", related: ["latency", "response-time"] }],
  ["error-rate", "Error rate", "performance", "the share of requests that fail within a period", "2% of checkout API calls returning 5xx", "Error rate is the same as uptime percentage", "Define which statuses count as errors before comparing periods.", { related: ["availability", "http-status-code", "uptime"] }],
];

for (const row of performance) {
  const [slug, term, category, focus, exampleTarget, mistake, fajita, extra = {}] = row;
  pack({
    slug,
    term,
    category,
    focus,
    exampleTarget,
    mistake,
    fajita,
    relatedTerms: extra.related,
    acronym: extra.acronym,
    expandedName: extra.expandedName,
    productAreas: ["uptime-monitoring"],
    documentationLinks: [{ href: "/docs/assertions/overview", label: "Assertions overview" }],
    productLinks: [{ href: "/features/uptime-monitoring", label: "Uptime monitoring" }],
    cta: "monitor",
  });
}

/* -------- Reliability metrics -------- */
const metrics = [
  ["uptime", "Uptime", "reliability-metrics", "the time a service was available during a period", "api.example.com available for 29 days 23 hours in a month", "Uptime is a vendor marketing badge with one universal formula", "Fajita derives uptime views from monitor history and status-page history. Definitions of eligible time can vary.", { foundational: true, related: ["downtime", "uptime-percentage", "availability"] }],
  ["downtime", "Downtime", "reliability-metrics", "the time a service was unavailable during a period", "43 minutes of downtime in a month", "Downtime only counts when you post a status incident", "Define whether maintenance and missing data count before comparing downtime numbers.", { related: ["uptime", "major-outage", "maintenance-window"] }],
  ["availability", "Availability", "reliability-metrics", "the share of time a service was able to fulfill its intended function", "99.9% availability target for checkout", "Availability always equals uptime percentage from one probe", "Availability definitions vary. Write yours down before arguing about decimals.", { foundational: true, related: ["uptime", "service-availability", "service-level-objective"] }],
  ["reliability", "Reliability", "reliability-metrics", "the consistency with which a service meets its expected behavior over time", "a quarter with fewer customer-facing incidents", "Reliability is only uptime marketing", "Reliability includes detection, recovery, and communication quality, not only green checks.", { related: ["availability", "mean-time-to-recovery", "incident-management"] }],
  ["service-availability", "Service availability", "reliability-metrics", "availability measured for a named service or customer journey", "availability of the billing API this month", "Service availability is a single global cloud number", "Measure the journey customers feel, not an unrelated internal host.", { related: ["availability", "uptime-percentage", "status-page-component"] }],
  ["uptime-percentage", "Uptime percentage", "reliability-metrics", "availability expressed as a percentage of eligible monitored time", "99.95% uptime for the API component", "Uptime percentage is automatically an SLA credit", "Uptime percentage is a metric. An SLA is a contract. Do not confuse them.", { foundational: true, uptimeTable: true, formula: { label: "Uptime percentage", expression: "Uptime percentage = Eligible available time ÷ Eligible monitored time × 100", notes: ["Define eligible time, including whether maintenance is excluded.", "Define how missing data is handled.", "Different providers calculate differently; compare methodologies before comparing numbers."] }, related: ["uptime", "downtime", "service-level-agreement"] }],
  ["mean-time-to-detect", "Mean time to detect", "reliability-metrics", "the average time from failure start to detection", "MTTD of eight minutes across incidents", "MTTD starts when someone opens a laptop", "Faster detection usually means better external monitoring coverage and alert delivery.", { acronym: "MTTD", expandedName: "Mean Time to Detect", formula: { label: "MTTD", expression: "MTTD = Total time from failure start to detection ÷ Number of incidents", notes: ["Failure start can be hard to know precisely.", "Use consistent clocks and incident markers."] }, related: ["mean-time-to-recovery", "incident-detection"] }],
  ["mean-time-to-recovery", "Mean time to recovery", "reliability-metrics", "the average time from failure to restored service", "MTTR of thirty-five minutes last quarter", "MTTR always means mean time to repair with one universal formula", "MTTR is ambiguous in the industry. Define whether it starts at failure, detection, or acknowledgment.", { acronym: "MTTR", expandedName: "Mean Time to Recovery", featured: true, foundational: true, formula: { label: "MTTR", expression: "MTTR = Total incident recovery time ÷ Number of resolved incidents", notes: ["State whether recovery time starts at failure detection or impact start.", "Do not treat MTTR as a contractual SLA unless a contract says so."] }, related: ["mean-time-to-detect", "incident-resolution", "recovery-confirmation"], faqs: [{ question: "Does MTTR mean repair or recovery?", answer: "Both expansions are used. Publish your definition beside the number." }, { question: "Should MTTR include nights and weekends?", answer: "Yes if customers were impacted then. Exclude periods only when your written definition says so." }] }],
  ["mean-time-between-failures", "Mean time between failures", "reliability-metrics", "the average time from one failure to the next for a system", "MTBF measured across production incidents", "MTBF proves a system will never fail again", "MTBF is a reliability statistic, not a promise. Sample size matters.", { acronym: "MTBF", expandedName: "Mean Time Between Failures", formula: { label: "MTBF", expression: "MTBF = Total operating time ÷ Number of failures", notes: ["Define operating time carefully.", "Small samples produce misleading averages."] }, related: ["reliability", "uptime", "mean-time-to-recovery"] }],
  ["service-level-indicator", "Service-level indicator", "reliability-metrics", "a quantitative measure of some aspect of service level", "success rate of checkout API as an SLI", "An SLI is a legal contract", "Pick SLIs that reflect user happiness, then set objectives against them.", { acronym: "SLI", expandedName: "Service-Level Indicator", related: ["service-level-objective", "service-level-agreement", "error-rate"] }],
  ["service-level-objective", "Service-level objective", "reliability-metrics", "a target value or range for a service-level indicator", "99.9% success over 28 days", "An SLO is automatically refundable", "SLOs guide engineering tradeoffs. SLAs are contractual. Keep them distinct.", { acronym: "SLO", expandedName: "Service-Level Objective", related: ["service-level-indicator", "service-level-agreement", "uptime-percentage"] }],
  ["service-level-agreement", "Service-level agreement", "reliability-metrics", "a contractual commitment about service level between parties", "contractual 99.9% monthly uptime with defined credits", "A glossary definition controls Fajita customer contracts", "This glossary page provides a general explanation. The applicable agreement controls Fajita’s contractual obligations.", { acronym: "SLA", expandedName: "Service-Level Agreement", requiresLegalReview: true, related: ["service-level-objective", "uptime-percentage", "service-level-indicator"], cta: "none", productLinks: [{ href: "/legal/terms", label: "Terms" }] }],
  ["recovery-time-objective", "Recovery time objective", "reliability-metrics", "the maximum acceptable time to restore a service after disruption", "RTO of one hour for billing", "RTO is measured automatically by every uptime tool", "RTO is a planning target. Measure actual recovery separately.", { acronym: "RTO", expandedName: "Recovery Time Objective", related: ["recovery-point-objective", "mean-time-to-recovery"] }],
  ["recovery-point-objective", "Recovery point objective", "reliability-metrics", "the maximum acceptable amount of data loss measured in time", "RPO of fifteen minutes for order data", "RPO is the same as MTTR", "RPO guides backup and replication design. Uptime monitoring does not set RPO by itself.", { acronym: "RPO", expandedName: "Recovery Point Objective", related: ["recovery-time-objective"] }],
];

for (const row of metrics) {
  const [slug, term, category, focus, exampleTarget, mistake, fajita, extra = {}] = row;
  pack({
    slug,
    term,
    category,
    focus,
    exampleTarget,
    mistake,
    fajita,
    relatedTerms: extra.related ?? ["uptime", "availability"],
    acronym: extra.acronym,
    expandedName: extra.expandedName,
    featured: extra.featured,
    foundational: extra.foundational,
    requiresLegalReview: extra.requiresLegalReview,
    formula: extra.formula,
    uptimeTable: extra.uptimeTable,
    faqs: extra.faqs,
    cta: extra.cta ?? "documentation",
    documentationLinks: [{ href: "/docs/reference/terminology", label: "Terminology" }],
    productLinks: extra.productLinks ?? [{ href: "/features/uptime-monitoring", label: "Uptime monitoring" }],
    productAreas: ["uptime-monitoring"],
  });
}

/* -------- Scheduled jobs -------- */
const jobs = [
  ["cron-job", "Cron job", "scheduled-jobs", "a task scheduled to run at calendar or interval expressions", "nightly backup at 02:15 UTC", "Cron jobs always report their own failures loudly", "Pair cron jobs with heartbeat monitoring so silence becomes an alert.", { cluster: "heartbeat", related: ["heartbeat-monitoring", "scheduled-task", "grace-period"] }],
  ["heartbeat-monitoring", "Heartbeat monitoring", "scheduled-jobs", "expecting a periodic signal from a job and alerting when the signal is late or missing", "backup job pings a heartbeat URL each night", "Heartbeat monitoring is the same as website monitoring", "Fajita heartbeat monitors watch for expected pings. See [heartbeat monitoring](/docs/monitors/heartbeat-monitoring).", { featured: true, foundational: true, cluster: "heartbeat", cta: "monitor", documentationLinks: [{ href: "/docs/monitors/heartbeat-monitoring", label: "Heartbeat monitoring" }], productLinks: [{ href: "/features/cron-monitoring", label: "Cron monitoring" }], related: ["cron-job", "missed-heartbeat", "late-heartbeat", "grace-period", "dead-mans-switch"], faqs: [{ question: "What should call the heartbeat URL?", answer: "The job itself, after successful work completes, or at a stage you define clearly." }, { question: "What if a job runs long?", answer: "Use a grace period that matches realistic runtime so late work does not page incorrectly." }] }],
  ["heartbeat-url", "Heartbeat URL", "scheduled-jobs", "the URL a job must request to prove it is still running on schedule", "https://heartbeat.example.com/h/abc123", "Share heartbeat URLs in public screenshots", "Treat heartbeat URLs like secrets. Rotate them if exposed.", { cluster: "heartbeat", related: ["heartbeat-monitoring", "missed-heartbeat"] }],
  ["missed-heartbeat", "Missed heartbeat", "scheduled-jobs", "a heartbeat that did not arrive within the allowed schedule and grace period", "backup heartbeat missing after 02:15 UTC plus grace", "Missed means the server is on fire", "A missed heartbeat means the expected signal did not arrive. Investigate the job path.", { cluster: "heartbeat", related: ["late-heartbeat", "grace-period", "heartbeat-monitoring"] }],
  ["late-heartbeat", "Late heartbeat", "scheduled-jobs", "a heartbeat that arrives after the expected time but may still be within grace", "ping arriving twelve minutes late", "Late and missed are identical states", "Late heartbeats can indicate slow jobs. Tune grace periods with real runtimes.", { cluster: "heartbeat", related: ["missed-heartbeat", "grace-period"] }],
  ["grace-period", "Grace period", "scheduled-jobs", "extra time allowed after the expected heartbeat before alerting", "fifteen minute grace after a nightly job", "Grace periods hide all failures forever", "Set grace to cover normal variance without swallowing true misses.", { cluster: "heartbeat", related: ["heartbeat-monitoring", "late-heartbeat"] }],
  ["dead-mans-switch", "Dead man's switch", "scheduled-jobs", "a control that alerts when an expected signal stops arriving", "alert if the reporter job stops pinging daily", "Dead man's switches are only physical hardware", "Heartbeat monitoring is a software dead man's switch for scheduled work.", { cluster: "heartbeat", synonyms: ["dead man switch", "dead man's switch"], related: ["heartbeat-monitoring", "cron-job"] }],
  ["scheduled-task", "Scheduled task", "scheduled-jobs", "work configured to run at a future time or on a repeating schedule", "weekly report generation task", "Scheduled tasks never need monitoring", "If silence is failure, add a heartbeat.", { related: ["cron-job", "heartbeat-monitoring", "background-job-monitoring"] }],
  ["background-job-monitoring", "Background job monitoring", "scheduled-jobs", "watching asynchronous jobs for timely completion and success signals", "queue worker heartbeat each minute", "Background job monitoring requires browser scripting", "Use heartbeats or success pings from workers. External HTTP monitors alone may not see queue lag.", { related: ["heartbeat-monitoring", "scheduled-task", "cron-job"] }],
];

for (const row of jobs) {
  const [slug, term, category, focus, exampleTarget, mistake, fajita, extra = {}] = row;
  pack({
    slug,
    term,
    category,
    focus,
    exampleTarget,
    mistake,
    fajita,
    relatedTerms: extra.related,
    synonyms: extra.synonyms,
    featured: extra.featured,
    foundational: extra.foundational,
    cluster: extra.cluster,
    faqs: extra.faqs,
    cta: extra.cta ?? "monitor",
    documentationLinks: extra.documentationLinks ?? [{ href: "/docs/monitors/heartbeat-monitoring", label: "Heartbeat monitoring" }],
    productLinks: extra.productLinks ?? [{ href: "/features/cron-monitoring", label: "Cron monitoring" }],
    productAreas: ["heartbeat-monitoring", "cron-monitoring"],
  });
}

/* -------- Teams & operations -------- */
const teams = [
  ["audit-log", "Audit log", "teams-operations", "a recorded history of important actions taken in an account", "member role change recorded with actor and time", "Audit logs are the same as monitor history", "Fajita records team and security-relevant actions in the organization audit log. See [audit log](/docs/teams/audit-log).", { documentationLinks: [{ href: "/docs/teams/audit-log", label: "Audit log" }], related: ["incident-assignment", "operational-status"], cta: "documentation" }],
  ["operational-readiness", "Operational readiness", "teams-operations", "whether people, processes, and tools are prepared to detect and handle failures", "alert channel tested before launch day", "Readiness is a one-time checklist at company founding", "Before launch, confirm monitors, alert channels, and status-page ownership exist.", { related: ["alert-channel", "status-page", "monitor"], cta: "documentation", documentationLinks: [{ href: "/docs/getting-started/next-steps", label: "Next steps" }] }],
];

for (const row of teams) {
  const [slug, term, category, focus, exampleTarget, mistake, fajita, extra = {}] = row;
  pack({
    slug,
    term,
    category,
    focus,
    exampleTarget,
    mistake,
    fajita,
    relatedTerms: extra.related,
    cta: extra.cta ?? "none",
    documentationLinks: extra.documentationLinks,
    productAreas: ["alerts", "status-pages"],
  });
}

// ---- emit ----
function emitTerm(spec) {
  const meta = {
    id: spec.slug,
    term: spec.term,
    slug: spec.slug,
    shortDefinition: spec.shortDefinition,
    shortAnswer: spec.shortAnswer,
    category: spec.category,
    secondaryCategories: [],
    acronym: spec.acronym,
    expandedName: spec.expandedName,
    synonyms: spec.synonyms ?? [],
    relatedTerms: spec.relatedTerms,
    broaderTerms: spec.broaderTerms ?? [],
    narrowerTerms: spec.narrowerTerms ?? [],
    oppositeTerms: [],
    confusedWith: [],
    productAreas: spec.productAreas ?? [],
    documentationLinks: spec.documentationLinks ?? [],
    productLinks: spec.productLinks ?? [],
    searchIntent: "definition",
    primaryQuery: spec.primaryQuery,
    secondaryQueries: [],
    status: "published",
    owner: "glossary-editorial",
    reviewers: spec.reviewers ?? ["product", "engineering"],
    lastReviewedAt: REVIEWED,
    nextReviewDue: spec.nextReviewDue ?? NEXT,
    contentVersion: "1",
    productVersion: PV,
    technicalStandardRefs: [],
    featured: !!spec.featured,
    foundational: !!spec.foundational,
    llmInclude: true,
    indexable: true,
    canonical: true,
    redirects: [],
    cta: spec.cta ?? "none",
    requiresLegalReview: !!spec.requiresLegalReview,
    requiresSecurityReview: !!spec.requiresSecurityReview,
    searchBoost: spec.searchBoost ?? 0,
    title: spec.title,
    description: spec.description,
    noindex: false,
    deprecated: false,
    cluster: spec.cluster,
  };
  for (const k of Object.keys(meta)) if (meta[k] === undefined) delete meta[k];

  const arr = (xs) => xs.map((t) => `\n      ${JSON.stringify(t)},`).join("");
  let misconception = "undefined";
  if (spec.misconception) {
    misconception = `{ title: ${JSON.stringify(spec.misconception.title)}, body: [${spec.misconception.body.map((t) => JSON.stringify(t)).join(", ")}] }`;
  }
  let fajita = spec.fajita?.length
    ? `[${spec.fajita.map((t) => JSON.stringify(t)).join(", ")}]`
    : "undefined";
  let faqs = "undefined";
  if (spec.faqs?.length) {
    faqs = `[${spec.faqs.map((f) => `{ question: ${JSON.stringify(f.question)}, answer: ${JSON.stringify(f.answer)} }`).join(", ")}]`;
  }
  let formula = "undefined";
  if (spec.formula) {
    formula = `{ label: ${JSON.stringify(spec.formula.label)}, expression: ${JSON.stringify(spec.formula.expression)}, notes: [${spec.formula.notes.map((n) => JSON.stringify(n)).join(", ")}] }`;
  }
  const extra = spec.uptimeTable
    ? `extra: (() => { const t = uptimeTableForBlocks(); return [h2("Uptime and downtime examples"), table(t.headers, t.rows, t.caption), p("Month figures use a 30-day month. Year figures use 365.25 days. Organizations may define eligible time differently.")]; })(),`
    : "";

  return `defineTerm({
  meta: ${JSON.stringify(meta, null, 2)},
  body: buildTermBody({
    whyItMatters: [${arr(spec.why)}
    ],
    howItWorks: [${arr(spec.how)}
    ],
    example: [${arr(spec.example)}
    ],
    misconception: ${misconception},
    fajita: ${fajita},
    ${extra}
  }),
  faqs: ${faqs},
  formula: ${formula},
})`;
}

function writeModule(file, exportName, specs) {
  const needsTable = specs.some((s) => s.uptimeTable);
  const content = `import { h2, p, table } from "@/lib/docs/blocks";
import { buildTermBody } from "@/lib/glossary/authoring";
import { defineTerm, type GlossaryTerm } from "@/lib/glossary/types";
${needsTable ? 'import { uptimeTableForBlocks } from "@/lib/glossary/uptime-tables";\n' : ""}
export const ${exportName}: GlossaryTerm[] = [
${specs.map(emitTerm).join(",\n\n")}
];
`;
  fs.writeFileSync(path.join(ROOT, file), content);
  console.log(`Wrote ${file} (${specs.length} terms)`);
}

const groups = [
  ["incidents.ts", "incidentTerms", "incidents"],
  ["alerts.ts", "alertTerms", "alerts"],
  ["status-pages.ts", "statusPageTerms", "status-pages"],
  ["apis-webhooks.ts", "apiWebhookTerms", "apis-webhooks"],
  ["ssl-dns.ts", "sslDnsTerms", "ssl-dns"],
  ["performance.ts", "performanceTerms", "performance"],
  ["reliability-metrics.ts", "reliabilityMetricTerms", "reliability-metrics"],
  ["scheduled-jobs.ts", "scheduledJobTerms", "scheduled-jobs"],
  ["teams-operations.ts", "teamsOperationsTerms", "teams-operations"],
];

for (const [file, exportName, cat] of groups) {
  writeModule(
    file,
    exportName,
    SPECS.filter((s) => s.category === cat),
  );
}

fs.writeFileSync(
  path.join(ROOT, "index.ts"),
  `import { monitoringTerms } from "./monitoring";
import { incidentTerms } from "./incidents";
import { alertTerms } from "./alerts";
import { statusPageTerms } from "./status-pages";
import { apiWebhookTerms } from "./apis-webhooks";
import { sslDnsTerms } from "./ssl-dns";
import { performanceTerms } from "./performance";
import { reliabilityMetricTerms } from "./reliability-metrics";
import { scheduledJobTerms } from "./scheduled-jobs";
import { teamsOperationsTerms } from "./teams-operations";
import type { GlossaryTerm } from "@/lib/glossary/types";

export {
  monitoringTerms,
  incidentTerms,
  alertTerms,
  statusPageTerms,
  apiWebhookTerms,
  sslDnsTerms,
  performanceTerms,
  reliabilityMetricTerms,
  scheduledJobTerms,
  teamsOperationsTerms,
};

export const allTermModules: GlossaryTerm[] = [
  ...monitoringTerms,
  ...incidentTerms,
  ...alertTerms,
  ...statusPageTerms,
  ...apiWebhookTerms,
  ...sslDnsTerms,
  ...performanceTerms,
  ...reliabilityMetricTerms,
  ...scheduledJobTerms,
  ...teamsOperationsTerms,
];
`,
);

console.log(`Total part2 specs: ${SPECS.length}`);
