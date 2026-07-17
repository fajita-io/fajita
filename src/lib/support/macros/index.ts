import type { SourceCitation } from "../types";

export interface SupportMacro {
  id: string;
  triggers: RegExp[];
  explanation: string;
  nextActions: string[];
  sourceLinks: SourceCitation[];
  escalationCondition: string;
  version: string;
  owner: string;
  reviewDate: string;
  intent:
    | "monitor_failure"
    | "alert_failure"
    | "status_page"
    | "subscriber_email"
    | "billing"
    | "pricing"
    | "product_capability"
    | "setup";
}

export const SUPPORT_MACROS: SupportMacro[] = [
  {
    id: "unsupported_sms",
    triggers: [/sms/i, /text\s+message/i, /phone\s+(?:call|alert)/i],
    explanation:
      "Fajita does not currently support SMS or phone alerts. Launch alert channels are email, Slack, Discord, and generic webhooks.",
    nextActions: ["Open alert channel docs", "Connect Slack or email"],
    sourceLinks: [
      {
        sourceId: "registry:claims",
        title: "Product capabilities",
        sourceType: "product_claims_registry",
        url: "/docs/alerts/channels",
      },
    ],
    escalationCondition: "User insists SMS exists or needs a custom channel review",
    version: "1",
    owner: "product",
    reviewDate: "2026-07-17",
    intent: "product_capability",
  },
  {
    id: "destination_blocked",
    triggers: [/destination\s+blocked/i, /url\s+rejected/i, /private\s+ip/i, /ssrf/i],
    explanation:
      "Fajita blocks destinations that resolve to private, loopback, or otherwise unsafe addresses. Use a publicly reachable HTTPS endpoint.",
    nextActions: ["Review destination requirements", "Test the monitor again"],
    sourceLinks: [
      {
        sourceId: "docs:troubleshooting/destination-blocked",
        title: "Why was my destination blocked?",
        sourceType: "documentation_page",
        url: "/docs/troubleshooting",
      },
    ],
    escalationCondition: "User believes a legitimate public host was blocked",
    version: "1",
    owner: "monitoring",
    reviewDate: "2026-07-17",
    intent: "monitor_failure",
  },
  {
    id: "dns_failure",
    triggers: [/dns\s+(?:failure|error|resolution)/i, /nxdomain/i, /could not resolve/i],
    explanation:
      "A DNS failure means the check could not resolve the hostname before connecting. Confirm the hostname, DNS records, and that the name is publicly resolvable.",
    nextActions: ["Open the monitor detail", "Verify DNS for the hostname"],
    sourceLinks: [
      {
        sourceId: "docs:troubleshooting",
        title: "Troubleshooting",
        sourceType: "documentation_page",
        url: "/docs/troubleshooting",
      },
    ],
    escalationCondition: "DNS looks correct but checks still fail after retries",
    version: "1",
    owner: "monitoring",
    reviewDate: "2026-07-17",
    intent: "monitor_failure",
  },
  {
    id: "tls_failure",
    triggers: [/tls\s+(?:failure|error|handshake)/i, /certificate\s+(?:invalid|expired)/i, /ssl\s+error/i],
    explanation:
      "A TLS failure means the check could not complete a trusted HTTPS handshake. Confirm the certificate chain, hostname match, and expiry.",
    nextActions: ["Open SSL monitor docs", "Check certificate expiry"],
    sourceLinks: [
      {
        sourceId: "docs:monitors/ssl",
        title: "SSL certificate monitoring",
        sourceType: "documentation_page",
        url: "/docs/monitors",
      },
    ],
    escalationCondition: "Certificate appears valid in browsers but Fajita still fails TLS",
    version: "1",
    owner: "monitoring",
    reviewDate: "2026-07-17",
    intent: "monitor_failure",
  },
  {
    id: "json_path_missing",
    triggers: [/json\s+path/i, /assertion.*json/i, /jsonpath/i],
    explanation:
      "A JSON assertion fails when the response body is not JSON or the path does not match. Confirm the path against a real response, then re-run test-before-save.",
    nextActions: ["Open assertion docs", "Run a monitor test"],
    sourceLinks: [
      {
        sourceId: "docs:assertions",
        title: "Assertions",
        sourceType: "documentation_page",
        url: "/docs/assertions",
      },
    ],
    escalationCondition: "Path matches locally but scheduled checks still fail",
    version: "1",
    owner: "monitoring",
    reviewDate: "2026-07-17",
    intent: "monitor_failure",
  },
  {
    id: "slack_auth_failed",
    triggers: [/slack.*(auth|token|reconnect|unauthorized)/i],
    explanation:
      "Slack delivery fails when the saved authorization is rejected. Reconnect Slack, run a channel test, then confirm the routing rule still matches.",
    nextActions: ["Reconnect Slack", "Run an alert test"],
    sourceLinks: [
      {
        sourceId: "docs:alerts",
        title: "Alert channels",
        sourceType: "documentation_page",
        url: "/docs/alerts",
      },
    ],
    escalationCondition: "Reconnect succeeds but deliveries still dead-letter",
    version: "1",
    owner: "alerts",
    reviewDate: "2026-07-17",
    intent: "alert_failure",
  },
  {
    id: "discord_webhook_failed",
    triggers: [/discord.*(webhook|failed|404|unknown)/i],
    explanation:
      "Discord webhook delivery fails when the webhook was deleted or rotated. Create a new webhook URL in Discord, update the channel, and run a test.",
    nextActions: ["Update Discord webhook", "Run an alert test"],
    sourceLinks: [
      {
        sourceId: "docs:alerts",
        title: "Alert channels",
        sourceType: "documentation_page",
        url: "/docs/alerts",
      },
    ],
    escalationCondition: "Webhook is current but deliveries still fail",
    version: "1",
    owner: "alerts",
    reviewDate: "2026-07-17",
    intent: "alert_failure",
  },
  {
    id: "custom_domain_pending",
    triggers: [/custom\s+domain/i, /domain\s+(?:pending|verification|dns)/i, /tls\s+pending/i],
    explanation:
      "Custom domains stay pending until DNS points at Fajita and TLS can be issued. Confirm the CNAME or ALIAS record, wait for DNS, then refresh domain status.",
    nextActions: ["Open domain setup", "Check DNS records"],
    sourceLinks: [
      {
        sourceId: "docs:status-pages",
        title: "Status pages",
        sourceType: "documentation_page",
        url: "/docs/status-pages",
      },
    ],
    escalationCondition: "DNS is correct for more than an hour and TLS remains pending",
    version: "1",
    owner: "status-pages",
    reviewDate: "2026-07-17",
    intent: "status_page",
  },
  {
    id: "subscriber_suppressed",
    triggers: [/subscriber\s+suppressed/i, /bounce/i, /complaint/i, /confirmation\s+(?:missing|email)/i],
    explanation:
      "Suppressed subscribers do not receive incident email until the address is confirmed again or the suppression is cleared by an authorized admin after a bounce or complaint.",
    nextActions: ["Review subscriber delivery", "Ask the subscriber to confirm again"],
    sourceLinks: [
      {
        sourceId: "docs:subscribers",
        title: "Status page subscribers",
        sourceType: "documentation_page",
        url: "/docs/subscribers",
      },
    ],
    escalationCondition: "Suppression looks incorrect after a successful confirmation",
    version: "1",
    owner: "subscribers",
    reviewDate: "2026-07-17",
    intent: "subscriber_email",
  },
  {
    id: "payment_action_required",
    triggers: [/payment\s+(?:failed|action\s+required)/i, /past\s+due/i, /update\s+(?:card|payment)/i],
    explanation:
      "When payment action is required, open the Customer Portal to update the payment method. Product access follows the current billing grace rules for your organization.",
    nextActions: ["Open billing", "Open Customer Portal"],
    sourceLinks: [
      {
        sourceId: "docs:billing",
        title: "Billing",
        sourceType: "documentation_page",
        url: "/docs/billing",
      },
    ],
    escalationCondition: "Payment updated but access remains restricted after reconciliation",
    version: "1",
    owner: "billing",
    reviewDate: "2026-07-17",
    intent: "billing",
  },
  {
    id: "plan_limit_reached",
    triggers: [/plan\s+limit/i, /monitor\s+limit/i, /too\s+many\s+monitors/i, /upgrade/i],
    explanation:
      "Active monitor limits come from the current plan. Starter allows 10, Pro allows 50, and Business has no fixed monitor cap in the public catalog.",
    nextActions: ["Open usage", "Review pricing"],
    sourceLinks: [
      {
        sourceId: "registry:entitlements",
        title: "Plan limits",
        sourceType: "entitlement_registry",
        url: "/pricing",
      },
    ],
    escalationCondition: "Usage display disagrees with the active subscription",
    version: "1",
    owner: "billing",
    reviewDate: "2026-07-17",
    intent: "billing",
  },
  {
    id: "no_free_plan",
    triggers: [/free\s+plan/i, /free\s+tier/i, /is\s+there\s+a\s+free/i],
    explanation:
      "Fajita does not currently offer a free plan. See pricing for active plans and limits.",
    nextActions: ["Open pricing"],
    sourceLinks: [
      {
        sourceId: "registry:pricing",
        title: "Plans and pricing",
        sourceType: "pricing_catalog",
        url: "/pricing",
      },
    ],
    escalationCondition: "Sales needs a custom evaluation conversation",
    version: "1",
    owner: "billing",
    reviewDate: "2026-07-17",
    intent: "pricing",
  },
];

export function matchMacro(message: string): SupportMacro | null {
  for (const macro of SUPPORT_MACROS) {
    if (macro.triggers.some((re) => re.test(message))) return macro;
  }
  return null;
}
