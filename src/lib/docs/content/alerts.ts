import { callout, code, h2, p, steps, table, ul } from "../blocks";
import { defineDoc, type DocPage } from "../types";

const base = {
  category: "alerts" as const,
  lastReviewedAt: "2026-07-17",
  owner: "docs-alerts",
  reviewers: ["engineering", "product"],
  productVersion: "2026.07",
};

export const alertsPages: DocPage[] = [
  defineDoc({
    meta: {
      ...base,
      slug: "alerts/slack",
      title: "Slack alerts",
      description: "Send incident and recovery alerts to Slack using an incoming webhook URL.",
      model: "build",
      pageType: "task",
      order: 0,
      requiredPermission: "integrations:manage",
      requiredRole: "admin",
      productArea: ["alerts"],
      keywords: ["slack", "incoming webhook", "channel", "notification"],
      relatedPages: ["alerts/routing-rules", "troubleshooting/slack"],
      searchBoost: 2,
    },
    body: [
      h2("Outcome"),
      p("A Slack channel receives confirmed incident and recovery alerts."),
      h2("How Fajita connects to Slack"),
      p("Fajita uses a Slack incoming webhook URL. You create the webhook in Slack, choose the channel there, and paste the URL into Fajita."),
      h2("Steps"),
      steps([
        {
          title: "Create an incoming webhook in Slack",
          body: [p("In Slack, add an incoming webhook and select the channel that should receive alerts. Slack gives you a URL that starts with `https://hooks.slack.com/services/`.")],
        },
        {
          title: "Add the channel in Fajita",
          body: [p("In Integrations, add a Slack channel and paste the webhook URL.")],
        },
        {
          title: "Send a test",
          body: [p("Send a test alert and confirm it appears in Slack.")],
        },
        {
          title: "Route to it",
          body: [p("Create a routing rule so incidents reach the channel. See [Routing rules](/docs/alerts/routing-rules).")],
        },
      ]),
      callout("security", [
        p("The incoming webhook URL can post to your channel. Treat it like a password. Replace it in Fajita if it leaks; Fajita stores it encrypted."),
      ]),
      h2("Replace or remove"),
      p("To point at a different channel, create a new webhook in Slack and replace the stored URL. Removing the channel stops delivery."),
    ],
  }),

  defineDoc({
    meta: {
      ...base,
      slug: "alerts/discord",
      title: "Discord alerts",
      description: "Send alerts to a Discord channel using a channel webhook URL.",
      model: "build",
      pageType: "task",
      order: 1,
      requiredPermission: "integrations:manage",
      requiredRole: "admin",
      productArea: ["alerts"],
      keywords: ["discord", "webhook", "channel", "notification"],
      relatedPages: ["troubleshooting/discord", "alerts/routing-rules"],
    },
    body: [
      h2("Outcome"),
      p("A Discord channel receives confirmed alerts."),
      h2("Steps"),
      steps([
        {
          title: "Create a webhook in Discord",
          body: [p("In the channel's integration settings, create a webhook and copy its URL.")],
        },
        {
          title: "Add the channel in Fajita",
          body: [p("Add a Discord channel and paste the webhook URL.")],
        },
        {
          title: "Test and route",
          body: [p("Send a test, then add a routing rule.")],
        },
      ]),
      callout("security", [
        p("Treat a Discord webhook URL like a password. Anyone with the URL can post to that channel. Delete and recreate it in Discord to rotate."),
      ]),
      h2("Deleted webhooks"),
      p("If the webhook is deleted in Discord, delivery fails. Fajita records the failure; recreate the webhook and replace the URL."),
    ],
  }),

  defineDoc({
    meta: {
      ...base,
      slug: "alerts/generic-webhooks",
      title: "Generic webhooks",
      description:
        "Send signed alert events to your own HTTPS endpoint, with retries, timeouts, and delivery history.",
      model: "build",
      pageType: "task",
      order: 2,
      requiredPermission: "integrations:manage",
      requiredRole: "admin",
      productArea: ["alerts", "webhooks"],
      keywords: ["webhook", "endpoint", "signed", "hmac", "https", "delivery"],
      relatedPages: ["webhooks/overview", "webhooks/signatures", "alerts/retries-and-dead-letters"],
      searchBoost: 2,
    },
    body: [
      h2("Outcome"),
      p("Your HTTPS endpoint receives signed event payloads for incidents, maintenance, and monitor signals."),
      h2("Requirements"),
      ul([
        "An HTTPS endpoint on a public host. Private destinations are blocked.",
        "The endpoint responds within 10 seconds.",
        "The endpoint returns a 2xx status to acknowledge receipt.",
      ]),
      h2("Delivery behavior"),
      ul([
        "Fajita signs each request. See [Verify webhook signatures](/docs/webhooks/signatures).",
        "A non-2xx or timeout is retried with backoff.",
        "After the maximum attempts, the delivery moves to a dead-letter state you can inspect and retry.",
      ]),
      code(
        "text",
        "POST https://hooks.example.com/fajita\nContent-Type: application/json\nFajita-Event-Type: incident.opened",
        "A delivery to your endpoint (headers abbreviated)",
      ),
      p("Continue to the [Webhook overview](/docs/webhooks/overview) for the full contract."),
    ],
  }),

  defineDoc({
    meta: {
      ...base,
      slug: "alerts/routing-rules",
      title: "Routing rules",
      description: "Decide which channels receive which alerts, using scope and severity, with precedence rules.",
      model: "operate",
      pageType: "concept",
      order: 3,
      requiredPermission: "integrations:manage",
      productArea: ["alerts"],
      keywords: ["routing", "rule", "scope", "severity", "who gets alerted", "precedence"],
      relatedPages: ["alerts/quiet-hours", "alerts/recovery-notifications"],
    },
    body: [
      p("A channel only receives alerts through a routing rule. Rules connect what happened to who hears about it."),
      h2("Rule inputs"),
      table(
        ["Input", "Options"],
        [
          ["Scope", "The whole organization, a tag, a group, or a single monitor"],
          ["Severity", "Minor, major, or critical"],
          ["Channels", "One or more connected channels"],
        ],
      ),
      h2("Precedence"),
      p("When more than one rule selects the same channel, the most specific scope wins: monitor, then group, then tag, then organization."),
      callout("note", [
        p("Quiet hours and recovery behavior are configured alongside rules. See [Quiet hours](/docs/alerts/quiet-hours) and [Recovery notifications](/docs/alerts/recovery-notifications)."),
      ]),
    ],
  }),

  defineDoc({
    meta: {
      ...base,
      slug: "alerts/quiet-hours",
      title: "Quiet hours",
      description: "Hold non-critical alerts during defined windows without silencing confirmed critical incidents.",
      model: "operate",
      pageType: "concept",
      order: 4,
      requiredPermission: "integrations:manage",
      productArea: ["alerts"],
      keywords: ["quiet hours", "snooze", "mute", "schedule", "do not disturb"],
      relatedPages: ["alerts/routing-rules", "alerts/recovery-notifications"],
    },
    body: [
      p("Quiet hours reduce noise during periods when a person is not watching a channel. They delay lower-severity notifications instead of dropping them."),
      h2("What quiet hours do"),
      ul([
        "Hold minor and major notifications for a channel until the window ends.",
        "Deliver held notifications once the window closes, if the incident is still open.",
        "Never suppress a confirmed critical incident. Critical always pages through.",
      ]),
      h2("What quiet hours do not do"),
      ul([
        "They do not pause monitoring. Checks and incident verification continue.",
        "They do not resolve incidents. State still changes underneath.",
      ]),
      callout("warning", [
        p("Quiet hours apply to notification delivery, not to detection. An incident that opens during quiet hours is still recorded with its real start time."),
      ]),
    ],
  }),

  defineDoc({
    meta: {
      ...base,
      slug: "alerts/recovery-notifications",
      title: "Recovery notifications",
      description: "How Fajita tells a channel that a confirmed incident has recovered.",
      model: "operate",
      pageType: "concept",
      order: 5,
      requiredPermission: "integrations:manage",
      productArea: ["alerts", "incidents"],
      keywords: ["recovery", "resolved", "all clear", "back up", "notification"],
      relatedPages: ["incidents/recovery", "alerts/routing-rules"],
    },
    body: [
      p("A recovery notification follows the incident that triggered it. Channels that received the alert receive the recovery."),
      h2("When a recovery is sent"),
      ul([
        "The monitor passes again and Fajita confirms recovery across consecutive checks.",
        "The incident moves to recovering, then resolved.",
        "The recovery notification is sent to the same channels the incident reached.",
      ]),
      callout("note", [
        p("Recovery is confirmed the same way a failure is: across consecutive checks, not on a single passing result. See [Recovery](/docs/incidents/recovery)."),
      ]),
      h2("If you never got the incident alert"),
      p("You will not receive a recovery notification for an incident that never reached your channel. Check your [routing rules](/docs/alerts/routing-rules)."),
    ],
  }),

  defineDoc({
    meta: {
      ...base,
      slug: "alerts/retries-and-dead-letters",
      title: "Delivery retries and dead letters",
      description: "How Fajita retries failed alert deliveries and what a dead-letter state means.",
      model: "operate",
      pageType: "concept",
      order: 6,
      requiredPermission: "integrations:manage",
      productArea: ["alerts", "webhooks"],
      keywords: ["retry", "backoff", "dead letter", "failed delivery", "delivery history"],
      relatedPages: ["alerts/generic-webhooks", "webhooks/retries"],
    },
    body: [
      p("Delivery can fail for reasons outside Fajita: a channel is down, a webhook was deleted, or an endpoint times out. Fajita retries before giving up."),
      h2("Retry behavior"),
      ul([
        "A failed delivery is retried with increasing backoff.",
        "Retries stop after a maximum number of attempts.",
        "Every attempt is recorded in delivery history with its result.",
      ]),
      h2("Dead letters"),
      p("After the final attempt fails, the delivery moves to a dead-letter state. It is not lost. You can inspect the reason and retry it manually once the destination is fixed."),
      table(
        ["State", "Meaning"],
        [
          ["Delivered", "The destination returned a success response"],
          ["Retrying", "A previous attempt failed and another is scheduled"],
          ["Dead letter", "All attempts failed; awaiting manual retry"],
        ],
      ),
      callout("tip", [
        p("A repeated dead letter on a webhook usually means the endpoint is rejecting the request. Confirm it returns 2xx and responds within 10 seconds."),
      ]),
    ],
  }),
];
