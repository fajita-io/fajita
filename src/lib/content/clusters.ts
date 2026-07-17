/**
 * Editorial topic clusters. Pillars and supporting titles are planned here.
 * Articles publish individually after research and review. Empty hubs stay unpublished.
 */

export interface TopicCluster {
  id: string;
  name: string;
  pillarSlug: string | null;
  pillarTitle: string;
  supportingTitles: string[];
  relatedGlossary: string[];
  relatedDocs: { href: string; label: string }[];
  relatedTools: string[];
  productHref: string;
  productLabel: string;
  /** Hub page is public only when enough published articles exist. */
  hubPublished: boolean;
}

export const TOPIC_CLUSTERS: TopicCluster[] = [
  {
    id: "uptime-monitoring",
    name: "Uptime monitoring",
    pillarSlug: null,
    pillarTitle: "The Complete Guide to Uptime Monitoring for Small Software Teams",
    supportingTitles: [
      "How Often Should You Check a Website?",
      "Why One Failed Check Should Not Mean Downtime",
      "Uptime Monitoring Versus Performance Monitoring",
      "How to Monitor an Authenticated API",
      "How to Reduce Uptime-Monitoring False Positives",
      "What Should an API Health Endpoint Return?",
      "How to Choose Monitoring Regions",
      "How to Calculate Uptime Correctly",
    ],
    relatedGlossary: ["uptime-monitoring", "monitoring-interval", "retry", "uptime-percentage"],
    relatedDocs: [
      { href: "/docs/getting-started/create-your-first-monitor", label: "Create your first monitor" },
      { href: "/docs/monitors/website-monitoring", label: "Website monitoring" },
    ],
    relatedTools: ["uptime-calculator"],
    productHref: "/features/uptime-monitoring",
    productLabel: "Uptime monitoring",
    hubPublished: false,
  },
  {
    id: "incident-communication",
    name: "Incident communication",
    pillarSlug: null,
    pillarTitle: "How to Communicate a Software Incident Without Making It Worse",
    supportingTitles: [
      "How to Write the First Incident Update",
      "Identified Versus Monitoring Versus Resolved",
      "How Often Should You Update a Status Page?",
      "What Customers Actually Need During an Outage",
      "Internal Incident Notes Versus Public Updates",
      "How to Write an Honest Resolution Summary",
      "When to Publish a Minor Incident",
      "How to Handle a Reopened Incident",
    ],
    relatedGlossary: ["incident", "incident-update", "status-page"],
    relatedDocs: [
      { href: "/docs/incidents/timeline", label: "Incident timeline" },
      { href: "/docs/status-pages/create", label: "Create a status page" },
    ],
    relatedTools: ["status-page-checklist"],
    productHref: "/features/incident-communication",
    productLabel: "Incident communication",
    hubPublished: false,
  },
  {
    id: "status-pages",
    name: "Status pages",
    pillarSlug: null,
    pillarTitle: "The Complete Guide to Customer-Facing Status Pages",
    supportingTitles: [
      "What Should Go on a Status Page?",
      "How to Name Status-Page Components",
      "Hosted Status Page Versus Custom Domain",
      "Should Response Time Be Public?",
      "How to Display Maintenance",
      "How Status-Page Subscribers Should Work",
      "How to Avoid a Stale Status Page",
      "Status Page Versus Support Page",
    ],
    relatedGlossary: ["status-page", "status-page-component", "maintenance-window"],
    relatedDocs: [
      { href: "/docs/status-pages/create", label: "Create a status page" },
    ],
    relatedTools: ["status-page-checklist"],
    productHref: "/features/status-pages",
    productLabel: "Status pages",
    hubPublished: false,
  },
  {
    id: "api-reliability",
    name: "API reliability",
    pillarSlug: null,
    pillarTitle: "API Monitoring for Founders and Small Engineering Teams",
    supportingTitles: [
      "How to Design an API Health Endpoint",
      "Which HTTP Status Codes Should Your Monitor Accept?",
      "JSON Assertions for API Monitoring",
      "API Monitoring With Authentication",
      "How to Monitor a Slow API",
      "Webhook Delivery Versus API Monitoring",
      "Idempotency for Alert Webhooks",
      "Why Monitoring Your Homepage Is Not Enough",
    ],
    relatedGlossary: ["api-monitoring", "health-endpoint", "webhook-signature"],
    relatedDocs: [
      { href: "/docs/monitors/api-monitoring", label: "API monitoring" },
      { href: "/docs/webhooks/signatures", label: "Webhook signatures" },
    ],
    relatedTools: ["webhook-signature-generator"],
    productHref: "/features/api-monitoring",
    productLabel: "API monitoring",
    hubPublished: false,
  },
  {
    id: "cron-heartbeat",
    name: "Cron and heartbeat monitoring",
    pillarSlug: "heartbeat-monitoring-for-cron-jobs",
    pillarTitle: "Heartbeat Monitoring for Cron Jobs and Scheduled Tasks",
    supportingTitles: [
      "How Heartbeat Monitoring Works",
      "How to Choose a Heartbeat Grace Period",
      "Late Job Versus Missed Job",
      "Monitoring GitHub Actions",
      "Monitoring Serverless Scheduled Jobs",
      "Preventing Silent Backup Failures",
      "Heartbeat URL Security",
      "Cron Monitoring Without Installing an Agent",
    ],
    relatedGlossary: ["heartbeat-monitoring", "grace-period", "cron-job"],
    relatedDocs: [
      { href: "/docs/monitors/heartbeat-monitoring", label: "Heartbeat monitoring" },
    ],
    relatedTools: ["cron-expression-explainer"],
    productHref: "/features/cron-monitoring",
    productLabel: "Cron monitoring",
    hubPublished: false,
  },
  {
    id: "ssl-dns",
    name: "SSL and DNS",
    pillarSlug: null,
    pillarTitle: "SSL Certificate Monitoring for Small Software Teams",
    supportingTitles: [
      "How Early Should You Alert on Certificate Expiration?",
      "TLS Certificate Versus SSL Certificate",
      "Why a Valid Certificate Can Still Fail",
      "DNS Resolution Failures Explained",
      "CNAME Verification for Status Pages",
      "How Managed TLS Works",
      "Certificate Hostname Mismatch",
      "Monitoring Certificate Renewal",
    ],
    relatedGlossary: ["ssl-certificate-monitoring", "certificate-expiration"],
    relatedDocs: [
      { href: "/docs/monitors/ssl-monitoring", label: "SSL monitoring" },
    ],
    relatedTools: [],
    productHref: "/features/ssl-monitoring",
    productLabel: "SSL monitoring",
    hubPublished: false,
  },
  {
    id: "small-team-reliability",
    name: "Small-team reliability",
    pillarSlug: "minimum-reliability-stack-solo-saas",
    pillarTitle: "The Minimum Reliability Stack for a Solo SaaS Founder",
    supportingTitles: [
      "What to Monitor Before Launch",
      "The First Five Monitors to Create",
      "How Much Monitoring Does a Small SaaS Need?",
      "Monitoring Before Product Hunt",
      "A Reliability Checklist for Weekend Launches",
      "How to Build a Status Page Before You Need It",
      "When Email Alerts Are Enough",
      "When to Add Slack or Webhooks",
    ],
    relatedGlossary: ["uptime-monitoring", "status-page", "alert-routing"],
    relatedDocs: [
      { href: "/docs/getting-started/create-your-first-monitor", label: "Create your first monitor" },
    ],
    relatedTools: ["uptime-calculator", "status-page-checklist"],
    productHref: "/pricing",
    productLabel: "Plans",
    hubPublished: false,
  },
];

const BY_ID = new Map(TOPIC_CLUSTERS.map((c) => [c.id, c]));

export function getCluster(id: string): TopicCluster | undefined {
  return BY_ID.get(id);
}
