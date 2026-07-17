import { ORG_ROLES } from "@/lib/auth/roles";

import { callout, code, h2, ol, p, table, ul } from "../blocks";
import { defineDoc, type DocPage } from "../types";

const REVIEWED = "2026-07-17";
const PRODUCT_VERSION = "2026.07";

const ts = {
  category: "troubleshooting" as const,
  lastReviewedAt: REVIEWED,
  owner: "docs-support",
  reviewers: ["engineering", "product"],
  productVersion: PRODUCT_VERSION,
  pageType: "troubleshooting" as const,
  model: "operate" as const,
};

const mig = {
  category: "migrations" as const,
  lastReviewedAt: REVIEWED,
  owner: "docs-product",
  reviewers: ["product"],
  productVersion: PRODUCT_VERSION,
};

const ref = {
  category: "reference" as const,
  lastReviewedAt: REVIEWED,
  owner: "docs-product",
  reviewers: ["engineering", "product"],
  productVersion: PRODUCT_VERSION,
  model: "reference" as const,
  pageType: "reference" as const,
};

export const troubleshootingMigrationReferencePages: DocPage[] = [
  defineDoc({
    meta: {
      ...ts,
      slug: "troubleshooting/check-blocked",
      title: "Why was my check blocked?",
      description: "What a blocked destination means and how to make your endpoint reachable.",
      order: 0,
      productArea: ["monitors", "security"],
      keywords: ["blocked", "destination", "private", "localhost", "ssrf", "check failed"],
      relatedPages: ["security/monitoring-destinations"],
      searchBoost: 2,
    },
    body: [
      h2("Symptom"),
      p("A monitor shows a blocked destination and never runs a normal check."),
      h2("Most likely causes"),
      ul([
        "The hostname resolves to a private IP address.",
        "The URL points to `localhost` or a loopback address.",
        "A redirect leads to a restricted destination.",
        "The port or protocol is not supported.",
      ]),
      h2("How to confirm"),
      p("Resolve the hostname from a public network and confirm it returns a public address. Follow any redirects to their final destination."),
      h2("Resolution"),
      ul([
        "Use a publicly reachable HTTPS endpoint.",
        "Remove redirects to private destinations.",
        "Confirm DNS resolves publicly.",
      ]),
      h2("What Fajita records"),
      p("The result is recorded as blocked and is excluded from uptime. See [Monitoring destinations](/docs/security/monitoring-destinations)."),
      h2("When to contact support"),
      p("If the endpoint is genuinely public and still blocked, contact support with the URL. Do not include secrets."),
    ],
  }),

  defineDoc({
    meta: {
      ...ts,
      slug: "troubleshooting/alert-not-delivered",
      title: "Why did my alert fail?",
      description: "Diagnose an alert that did not arrive: routing, channel health, and delivery history.",
      order: 1,
      productArea: ["alerts"],
      keywords: ["alert not delivered", "no notification", "delivery failed", "dead letter"],
      relatedPages: ["alerts/routing-rules", "webhooks/retries"],
      searchBoost: 2,
    },
    body: [
      h2("Symptom"),
      p("A confirmed incident did not produce an alert in your channel."),
      h2("Most likely causes"),
      ul([
        "No routing rule connects the monitor to the channel.",
        "The channel is paused or its credential is invalid.",
        "Quiet hours suppressed or delayed the alert.",
        "The destination rejected the delivery.",
      ]),
      h2("How to confirm"),
      p("Open the channel's delivery history. Each attempt shows its status and any error category."),
      h2("Resolution"),
      ul([
        "Add or fix a routing rule that references the channel.",
        "Re-test the channel and replace an invalid credential.",
        "Retry a dead-lettered delivery after fixing the destination.",
      ]),
      h2("What Fajita records"),
      p("Every attempt is recorded with a status and an error category, and repeated failures move a delivery to a dead-letter state."),
      h2("When to contact support"),
      p("If deliveries show as sent but never arrive, contact support with the delivery reference."),
    ],
  }),

  defineDoc({
    meta: {
      ...ts,
      slug: "troubleshooting/status-page-stale",
      title: "Why is my status page stale?",
      description: "When a status page seems out of date, check component mapping, caching, and monitor state.",
      order: 2,
      productArea: ["status-pages"],
      keywords: ["status page stale", "not updating", "wrong state", "component"],
      relatedPages: ["status-pages/components"],
      searchBoost: 1,
    },
    body: [
      h2("Symptom"),
      p("The public status page does not reflect the current state."),
      h2("Most likely causes"),
      ul([
        "The component is not mapped to the expected monitor.",
        "The component uses manual status.",
        "A short cache delay after a state change.",
      ]),
      h2("Resolution"),
      ul([
        "Confirm the component maps to the right monitor and calculation mode.",
        "If the component is manual, update its state.",
        "Reload after a moment to clear a brief cache.",
      ]),
      h2("What Fajita records"),
      p("Component state is recalculated from monitor results. See [Components and state](/docs/status-pages/components)."),
      h2("When to contact support"),
      p("If mapping is correct and the state stays wrong, contact support with the status page and component names."),
    ],
  }),

  defineDoc({
    meta: {
      ...ts,
      slug: "troubleshooting/subscriber-email",
      title: "Why didn't a subscriber get email?",
      description: "Diagnose a subscriber who did not receive a confirmation or incident email.",
      order: 3,
      productArea: ["subscribers"],
      keywords: ["subscriber email", "confirmation missing", "bounce", "complaint", "suppressed"],
      relatedPages: ["subscribers/double-opt-in"],
    },
    body: [
      h2("Symptom"),
      p("A subscriber did not receive a confirmation or incident email."),
      h2("Most likely causes"),
      ul([
        "The subscriber is still pending and never confirmed.",
        "The address bounced or filed a complaint and is suppressed.",
        "The subscriber is not subscribed to the affected component or event type.",
      ]),
      h2("Resolution"),
      ul([
        "Ask the subscriber to confirm; the link is single use and expires.",
        "Check whether the address is suppressed.",
        "Confirm the component and event-type preferences include the update.",
      ]),
      h2("What Fajita records"),
      p("Subscriber status and provider events (delivered, bounced, complained) are recorded per address."),
      h2("When to contact support"),
      p("If a confirmed, unsuppressed subscriber still misses email, contact support."),
    ],
  }),

  defineDoc({
    meta: {
      ...ts,
      slug: "troubleshooting/json-assertion",
      title: "Why did my JSON assertion fail?",
      description: "Diagnose a JSON path assertion that fails: missing path, type mismatch, or invalid JSON.",
      order: 4,
      productArea: ["assertions"],
      keywords: ["json", "jsonpath", "assertion failed", "path missing", "type mismatch", "invalid json"],
      relatedPages: ["assertions/json-path"],
      searchBoost: 1,
    },
    body: [
      h2("Symptom"),
      p("A monitor with a JSON path assertion reports the assertion failed, even though the endpoint looks healthy."),
      h2("Most likely causes"),
      ul([
        "The response is not valid JSON, or the content type is not JSON.",
        "The path does not exist in the response body.",
        "The value exists but its type does not match the comparison.",
        "The response is larger than the inspected limit.",
      ]),
      h2("How to confirm"),
      p("Run a manual test and read the recorded response. Compare the exact path against the returned structure. A manual test never opens an incident, so it is safe to repeat."),
      h2("Resolution"),
      ul([
        "Return valid JSON with a JSON content type.",
        "Correct the path to match the real structure.",
        "Compare a scalar value (string, number, or boolean), not an object or array.",
      ]),
      code(
        "text",
        "Path: $.status\nExpected: ok\nReturned: {\"status\":\"ok\"}",
        "A passing configuration",
      ),
      h2("What Fajita records"),
      p("The result is recorded as an assertion failure. See [JSON path assertions](/docs/assertions/json-path)."),
      h2("When to contact support"),
      p("If the path and type are correct and the assertion still fails, contact support with the monitor name."),
    ],
  }),

  defineDoc({
    meta: {
      ...ts,
      slug: "troubleshooting/slack",
      title: "Slack alerts are not arriving",
      description: "Fix a Slack channel that stopped receiving alerts.",
      order: 5,
      productArea: ["alerts"],
      keywords: ["slack", "channel missing", "webhook", "not receiving", "revoked"],
      relatedPages: ["alerts/slack"],
    },
    body: [
      h2("Symptom"),
      p("A Slack channel stopped receiving alerts, or a test does not appear."),
      h2("Most likely causes"),
      ul([
        "The incoming webhook was revoked or the app was removed in Slack.",
        "The webhook points at a channel that was archived or renamed.",
        "No routing rule connects an incident to the channel.",
      ]),
      h2("How to confirm"),
      p("Send a test from Fajita and open the channel's delivery history. A rejected delivery shows the error category."),
      h2("Resolution"),
      ul([
        "Recreate the incoming webhook in Slack and replace the stored URL.",
        "Confirm the target channel still exists.",
        "Add or fix a routing rule.",
      ]),
      h2("What Fajita records"),
      p("Each attempt is recorded in delivery history. See [Slack alerts](/docs/alerts/slack)."),
      h2("When to contact support"),
      p("If a fresh webhook still fails, contact support with the delivery reference."),
    ],
  }),

  defineDoc({
    meta: {
      ...ts,
      slug: "troubleshooting/discord",
      title: "Discord alerts are not arriving",
      description: "Fix a Discord channel that stopped receiving alerts.",
      order: 6,
      productArea: ["alerts"],
      keywords: ["discord", "webhook deleted", "not receiving", "channel"],
      relatedPages: ["alerts/discord"],
    },
    body: [
      h2("Symptom"),
      p("A Discord channel stopped receiving alerts."),
      h2("Most likely causes"),
      ul([
        "The channel webhook was deleted in Discord.",
        "The channel was removed or its permissions changed.",
        "No routing rule connects an incident to the channel.",
      ]),
      h2("How to confirm"),
      p("Send a test and read the delivery history. A deleted webhook returns a not-found error."),
      h2("Resolution"),
      ul([
        "Recreate the webhook in Discord and replace the stored URL.",
        "Confirm the channel exists and the webhook has permission to post.",
        "Add or fix a routing rule.",
      ]),
      h2("What Fajita records"),
      p("Each attempt and its result appear in delivery history. See [Discord alerts](/docs/alerts/discord)."),
      h2("When to contact support"),
      p("If a fresh webhook still fails, contact support with the delivery reference."),
    ],
  }),

  defineDoc({
    meta: {
      ...ts,
      slug: "troubleshooting/custom-domain",
      title: "My custom domain is stuck pending",
      description: "Diagnose a status-page custom domain that will not verify or provision TLS.",
      order: 7,
      productArea: ["status-pages"],
      keywords: ["custom domain", "pending", "dns", "cname", "tls", "certificate", "verification failed"],
      relatedPages: ["status-pages/custom-domains"],
    },
    body: [
      h2("Symptom"),
      p("A custom domain for a status page stays pending and never goes active."),
      h2("Most likely causes"),
      ul([
        "The DNS record does not point at the target Fajita provides.",
        "A proxy or CDN in front of the domain hides the record Fajita checks.",
        "DNS has not propagated yet.",
      ]),
      h2("How to confirm"),
      p("Look up the record for your subdomain from a public resolver and confirm it matches the target shown in Fajita."),
      h2("Resolution"),
      ul([
        "Create the exact record Fajita shows for the subdomain.",
        "If a proxy is in front, allow direct resolution long enough for verification.",
        "Wait for DNS to propagate, then re-check.",
      ]),
      h2("What Fajita records"),
      p("Fajita marks the domain active only after DNS routing and HTTPS are verified. See [Custom domains](/docs/status-pages/custom-domains)."),
      h2("When to contact support"),
      p("If the record is correct and the domain stays pending, contact support with the domain name."),
    ],
  }),

  defineDoc({
    meta: {
      ...ts,
      slug: "troubleshooting/payment",
      title: "A payment failed or needs action",
      description: "What to do when a subscription payment fails or requires additional authentication.",
      order: 8,
      productArea: ["billing"],
      keywords: ["payment failed", "declined", "action required", "past due", "card", "billing"],
      relatedPages: ["billing/payment-failures"],
      requiredPermission: "billing:manage",
    },
    body: [
      h2("Symptom"),
      p("A payment did not go through, or your bank requires an extra confirmation step."),
      h2("Most likely causes"),
      ul([
        "The card expired, was declined, or has insufficient funds.",
        "The bank requires additional authentication for the charge.",
        "The billing details on file are out of date.",
      ]),
      h2("How to confirm"),
      p("Open billing settings. A failed or action-required payment is shown with the next step."),
      h2("Resolution"),
      ul([
        "Update the payment method in the customer portal.",
        "Complete any authentication your bank requests.",
        "Retry the payment from billing settings.",
      ]),
      h2("What Fajita records"),
      p("Fajita follows the payment state and applies a grace period before restricting access. See [Payment failures](/docs/billing/payment-failures)."),
      h2("When to contact support"),
      p("If the payment succeeds at your bank but Fajita still shows it as failed, contact billing support."),
    ],
  }),

  defineDoc({
    meta: {
      ...mig,
      slug: "migrations/overview",
      title: "Migrating to Fajita",
      description: "A vendor-neutral approach to moving monitors, alerts, and status communication into Fajita.",
      model: "operate",
      pageType: "migration",
      order: 0,
      productArea: ["monitors", "status-pages"],
      keywords: ["migrate", "migration", "move", "switch", "import", "checklist"],
      relatedPages: ["subscribers/import"],
    },
    body: [
      p("Fajita does not require a specific source tool. The pattern is the same: export what you have, recreate the equivalent structure, verify, then retire the old service."),
      h2("Approach"),
      p("Export the resources available from your current provider, then recreate the equivalent monitor and communication structure in Fajita."),
      h2("Checklist"),
      ol([
        "Inventory monitors and their check intervals.",
        "Record assertions and alert destinations.",
        "Record maintenance windows and status-page components.",
        "Export subscribers you have lawful consent for.",
        "Create the monitors in Fajita and test them.",
        "Connect alert channels and add routing rules.",
        "Publish the status page and verify any custom domain.",
        "Import confirmed subscribers.",
        "Run both systems in parallel and confirm delivery.",
        "Retire the old service once Fajita is verified.",
      ]),
      callout("warning", [
        p("Do not turn off your old monitoring until Fajita is verified and delivering alerts."),
      ]),
    ],
  }),

  defineDoc({
    meta: {
      ...ref,
      slug: "reference/monitor-states",
      title: "Monitor and incident states",
      description: "A reference of monitor lifecycle states and the operational states used during incidents.",
      order: 0,
      productArea: ["monitors", "incidents"],
      keywords: ["states", "reference", "operational", "degraded", "down", "recovering", "lifecycle"],
      relatedPages: ["monitors/monitor-states", "incidents/degraded-vs-down"],
    },
    body: [
      h2("Lifecycle states"),
      table(
        ["State", "Meaning"],
        [
          ["Draft", "Created, not yet checking"],
          ["Active", "Running on schedule"],
          ["Paused", "Stopped, configuration kept"],
          ["Archived", "Retired, history kept"],
          ["Deleted", "Removed"],
        ],
      ),
      h2("Operational states"),
      table(
        ["State", "Meaning"],
        [
          ["Operational", "Checks pass"],
          ["Verifying", "Confirming a failure"],
          ["Degraded", "Working but outside expected performance"],
          ["Down", "Confirmed failing"],
          ["Recovering", "Passing again, confirming recovery"],
          ["Maintenance", "Suppressed by a maintenance window"],
          ["Unknown", "No recent conclusive data"],
        ],
      ),
    ],
  }),

  defineDoc({
    meta: {
      ...ref,
      slug: "reference/failure-categories",
      title: "Failure categories",
      description: "The categories Fajita records when a check does not succeed, and what each means.",
      order: 1,
      productArea: ["monitors"],
      keywords: ["failure", "error", "category", "dns", "timeout", "tls", "blocked"],
      relatedPages: ["troubleshooting/check-blocked"],
    },
    body: [
      p("When a scheduled check does not succeed, Fajita records why. These categories appear in history and delivery details."),
      table(
        ["Category", "Meaning"],
        [
          ["DNS failure", "The hostname could not be resolved"],
          ["Blocked destination", "The target is private, reserved, or otherwise not allowed"],
          ["Timeout", "The response did not arrive within the timeout"],
          ["Unexpected status", "The status code was not one you expect"],
          ["Assertion failed", "A keyword, header, or JSON assertion did not pass"],
          ["TLS error", "The certificate was invalid, mismatched, or expired"],
        ],
      ),
      callout("note", [
        p("These are stable customer-facing categories. Internal diagnostic detail is not exposed in public results."),
      ]),
    ],
  }),

  defineDoc({
    meta: {
      ...ref,
      slug: "reference/terminology",
      title: "Terminology",
      description: "The words Fajita uses for its core concepts, so docs, product, and support stay consistent.",
      order: 2,
      productArea: [],
      keywords: ["terminology", "glossary", "definitions", "vocabulary", "terms"],
      relatedPages: [],
    },
    body: [
      p(`Fajita uses a consistent vocabulary. Roles are ${ORG_ROLES.join(", ")}.`),
      p(
        "For fuller definitions of monitoring, incidents, alerts, status pages, and reliability metrics, see the [software reliability glossary](/glossary).",
      ),
      table(
        ["Term", "Meaning"],
        [
          ["Organization", "The account that owns monitors, pages, and billing"],
          ["Monitor", "A configured check against one target"],
          ["Scheduled check", "A check that runs on the monitor's interval"],
          ["Manual test", "An on-demand check that never affects incidents"],
          ["Assertion", "A rule a response must satisfy"],
          ["Verification", "Confirming a failure across consecutive checks"],
          ["Incident", "A confirmed period of unhealthy behavior"],
          ["Alert channel", "A destination for notifications"],
          ["Routing rule", "The link between what happened and who is alerted"],
          ["Component", "A public unit of your service on a status page"],
          ["Subscriber", "A confirmed recipient of status updates"],
          ["Entitlement", "What your plan allows"],
        ],
      ),
    ],
  }),
];
