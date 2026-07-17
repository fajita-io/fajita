import type { GlossaryCategory } from "./frontmatter";

export interface CategoryMeta {
  id: GlossaryCategory;
  slug: GlossaryCategory;
  label: string;
  /** Short hub definition (one or two sentences). */
  definition: string;
  /** Why this category matters for software teams. */
  whyItMatters: string;
  /** Recommended learning order (term slugs). */
  learningOrder: string[];
  foundationalSlugs: string[];
  advancedSlugs: string[];
  documentationLinks: { href: string; label: string }[];
  productLinks: { href: string; label: string }[];
  order: number;
}

/**
 * Controlled category registry. Category hubs add editorial value beyond a
 * list of links. Do not invent a category for a single orphan term.
 */
export const GLOSSARY_CATEGORY_META: Record<GlossaryCategory, CategoryMeta> = {
  monitoring: {
    id: "monitoring",
    slug: "monitoring",
    label: "Monitoring",
    definition:
      "Monitoring is the practice of checking websites, APIs, certificates, and scheduled jobs from outside the system so teams learn about failures before customers do.",
    whyItMatters:
      "Without external checks, teams often hear about outages from support tickets. Monitoring turns silent failures into verified signals with enough context to act.",
    learningOrder: [
      "uptime-monitoring",
      "api-monitoring",
      "monitoring-interval",
      "retry",
      "incident-verification",
    ],
    foundationalSlugs: [
      "uptime-monitoring",
      "website-monitoring",
      "api-monitoring",
      "health-check",
      "monitor",
    ],
    advancedSlugs: [
      "synthetic-monitoring",
      "monitoring-region",
      "response-time-threshold",
      "availability-monitoring",
    ],
    documentationLinks: [
      { href: "/docs/getting-started/create-your-first-monitor", label: "Create your first monitor" },
      { href: "/docs/monitors/website-monitoring", label: "Website monitoring" },
    ],
    productLinks: [
      { href: "/features/uptime-monitoring", label: "Uptime monitoring" },
      { href: "/features/api-monitoring", label: "API monitoring" },
    ],
    order: 10,
  },
  incidents: {
    id: "incidents",
    slug: "incidents",
    label: "Incidents",
    definition:
      "Incidents are verified periods of degraded or failed service that a team tracks from detection through recovery and review.",
    whyItMatters:
      "A failed check is a signal. An incident is the shared record of what broke, who is working it, and when the service returned to a healthy state.",
    learningOrder: [
      "incident",
      "incident-verification",
      "incident-severity",
      "recovery-confirmation",
      "post-incident-review",
    ],
    foundationalSlugs: [
      "incident",
      "incident-management",
      "incident-verification",
      "false-positive",
      "recovery-confirmation",
    ],
    advancedSlugs: [
      "flapping",
      "incident-reopening",
      "root-cause-analysis",
      "post-incident-review",
    ],
    documentationLinks: [
      { href: "/docs/incidents/verification", label: "Incident verification" },
      { href: "/docs/incidents/timeline", label: "Incident timeline" },
    ],
    productLinks: [
      { href: "/features/incident-communication", label: "Incident communication" },
    ],
    order: 20,
  },
  alerts: {
    id: "alerts",
    slug: "alerts",
    label: "Alerts",
    definition:
      "Alerts are messages that tell the right people when a monitor fails, recovers, or needs attention through channels they already use.",
    whyItMatters:
      "Detection without delivery leaves teams blind. Good alerting routes verified events, respects quiet hours, and retries failed deliveries without drowning the inbox.",
    learningOrder: [
      "alert",
      "alert-channel",
      "alert-routing",
      "quiet-hours",
      "alert-fatigue",
    ],
    foundationalSlugs: [
      "alert",
      "alert-channel",
      "alert-routing",
      "outage-alert",
      "recovery-alert",
    ],
    advancedSlugs: [
      "alert-deduplication",
      "dead-letter-queue",
      "quiet-hours",
      "alert-fatigue",
    ],
    documentationLinks: [
      { href: "/docs/alerts/routing-rules", label: "Alert routing rules" },
      { href: "/docs/getting-started/connect-an-alert-channel", label: "Connect an alert channel" },
    ],
    productLinks: [
      { href: "/integrations", label: "Integrations" },
    ],
    order: 30,
  },
  "status-pages": {
    id: "status-pages",
    slug: "status-pages",
    label: "Status Pages",
    definition:
      "Status pages are public or private surfaces that communicate current service health, active incidents, maintenance, and historical uptime.",
    whyItMatters:
      "Customers and stakeholders need a single place to learn whether a problem is known. A clear status page reduces support load and builds trust during disruption.",
    learningOrder: [
      "status-page",
      "status-page-component",
      "public-incident",
      "scheduled-maintenance",
      "status-page-subscriber",
    ],
    foundationalSlugs: [
      "status-page",
      "public-status-page",
      "status-page-component",
      "scheduled-maintenance",
      "uptime-history",
    ],
    advancedSlugs: [
      "custom-status-page-domain",
      "status-badge",
      "status-page-subscriber",
      "component-group",
    ],
    documentationLinks: [
      { href: "/docs/status-pages/create", label: "Create a status page" },
      { href: "/docs/getting-started/publish-a-status-page", label: "Publish a status page" },
    ],
    productLinks: [
      { href: "/features/status-pages", label: "Status pages" },
    ],
    order: 40,
  },
  "apis-webhooks": {
    id: "apis-webhooks",
    slug: "apis-webhooks",
    label: "APIs and Webhooks",
    definition:
      "APIs and webhooks are how services exchange requests and event notifications over HTTP, including status codes, payloads, signatures, and retries.",
    whyItMatters:
      "Most modern products expose or consume HTTP interfaces. Understanding endpoints, signatures, and idempotency keeps monitoring and alerting reliable.",
    learningOrder: [
      "api",
      "api-endpoint",
      "http-status-code",
      "webhook",
      "webhook-signature",
    ],
    foundationalSlugs: [
      "api",
      "api-endpoint",
      "http-status-code",
      "webhook",
      "json-response",
    ],
    advancedSlugs: [
      "webhook-signature",
      "hmac",
      "webhook-idempotency",
      "idempotency-key",
    ],
    documentationLinks: [
      { href: "/docs/webhooks/overview", label: "Webhooks overview" },
      { href: "/docs/webhooks/signatures", label: "Verify webhook signatures" },
    ],
    productLinks: [
      { href: "/features/api-monitoring", label: "API monitoring" },
    ],
    order: 50,
  },
  "ssl-dns": {
    id: "ssl-dns",
    slug: "ssl-dns",
    label: "SSL, TLS, and DNS",
    definition:
      "SSL, TLS, and DNS cover how browsers and clients find hosts and establish encrypted connections, including certificates, hostnames, and resolution.",
    whyItMatters:
      "An expired certificate or a broken DNS record can take a healthy application offline for every visitor. These layers fail quietly until someone notices.",
    learningOrder: [
      "ssl-certificate",
      "tls-certificate",
      "ssl-certificate-monitoring",
      "dns",
      "dns-resolution",
    ],
    foundationalSlugs: [
      "ssl-certificate",
      "ssl-certificate-monitoring",
      "certificate-expiration",
      "dns",
      "https-certificate",
    ],
    advancedSlugs: [
      "certificate-chain",
      "hostname-mismatch",
      "tls-handshake",
      "managed-tls",
      "cname-record",
    ],
    documentationLinks: [
      { href: "/docs/monitors/ssl-monitoring", label: "SSL monitoring" },
    ],
    productLinks: [
      { href: "/features/ssl-monitoring", label: "SSL monitoring" },
    ],
    order: 60,
  },
  performance: {
    id: "performance",
    slug: "performance",
    label: "Performance",
    definition:
      "Performance terms describe how fast and consistently a service responds, including latency, timeouts, thresholds, and related availability signals.",
    whyItMatters:
      "A service can be reachable and still fail users when responses crawl. Performance monitoring catches slowdowns before they become outages.",
    learningOrder: [
      "latency",
      "response-time",
      "timeout",
      "response-time-threshold",
      "time-to-first-byte",
    ],
    foundationalSlugs: [
      "latency",
      "response-time",
      "timeout",
      "response-time-threshold",
    ],
    advancedSlugs: ["time-to-first-byte", "error-rate"],
    documentationLinks: [
      { href: "/docs/assertions/overview", label: "Assertions overview" },
    ],
    productLinks: [
      { href: "/features/uptime-monitoring", label: "Uptime monitoring" },
    ],
    order: 70,
  },
  "reliability-metrics": {
    id: "reliability-metrics",
    slug: "reliability-metrics",
    label: "Reliability Metrics",
    definition:
      "Reliability metrics quantify how often a service works as expected and how quickly teams detect and recover from failure.",
    whyItMatters:
      "Shared numbers let teams compare periods, set goals, and explain impact. Without clear definitions, uptime and MTTR become marketing language instead of operational tools.",
    learningOrder: [
      "uptime",
      "uptime-percentage",
      "availability",
      "mean-time-to-detect",
      "mean-time-to-recovery",
    ],
    foundationalSlugs: [
      "uptime",
      "downtime",
      "availability",
      "uptime-percentage",
      "mean-time-to-recovery",
    ],
    advancedSlugs: [
      "mean-time-to-detect",
      "mean-time-between-failures",
      "service-level-objective",
      "service-level-agreement",
      "service-level-indicator",
    ],
    documentationLinks: [
      { href: "/docs/reference/terminology", label: "Terminology" },
    ],
    productLinks: [
      { href: "/features/uptime-monitoring", label: "Uptime monitoring" },
    ],
    order: 80,
  },
  "scheduled-jobs": {
    id: "scheduled-jobs",
    slug: "scheduled-jobs",
    label: "Scheduled Jobs",
    definition:
      "Scheduled jobs are tasks that run on a calendar or interval, such as backups, reports, and cron workers, and need proof that they finished on time.",
    whyItMatters:
      "A job that never starts fails silently. Heartbeat monitoring expects a periodic signal and alerts when the signal is late or missing.",
    learningOrder: [
      "cron-job",
      "heartbeat-monitoring",
      "grace-period",
      "missed-heartbeat",
      "dead-mans-switch",
    ],
    foundationalSlugs: [
      "cron-job",
      "heartbeat-monitoring",
      "heartbeat-url",
      "grace-period",
      "missed-heartbeat",
    ],
    advancedSlugs: [
      "late-heartbeat",
      "dead-mans-switch",
      "background-job-monitoring",
      "scheduled-task",
    ],
    documentationLinks: [
      { href: "/docs/monitors/heartbeat-monitoring", label: "Heartbeat monitoring" },
    ],
    productLinks: [
      { href: "/features/cron-monitoring", label: "Cron monitoring" },
    ],
    order: 90,
  },
  "teams-operations": {
    id: "teams-operations",
    slug: "teams-operations",
    label: "Teams and Operations",
    definition:
      "Teams and operations terms cover ownership, maintenance, audit trails, and the habits that keep reliability work coordinated across people.",
    whyItMatters:
      "Tools alone do not keep systems healthy. Clear ownership, maintenance windows, and audit history keep changes accountable when pressure rises.",
    learningOrder: [
      "maintenance-window",
      "scheduled-maintenance",
      "operational-status",
      "incident-acknowledgment",
      "incident-assignment",
    ],
    foundationalSlugs: [
      "maintenance-window",
      "scheduled-maintenance",
      "operational-status",
      "incident-acknowledgment",
    ],
    advancedSlugs: ["incident-assignment", "incident-recap"],
    documentationLinks: [
      { href: "/docs/maintenance/create", label: "Create maintenance" },
      { href: "/docs/teams/roles-and-permissions", label: "Roles and permissions" },
    ],
    productLinks: [
      { href: "/features/status-pages", label: "Status pages" },
    ],
    order: 100,
  },
};

export function orderedCategories(): CategoryMeta[] {
  return Object.values(GLOSSARY_CATEGORY_META).sort((a, b) => a.order - b.order);
}
