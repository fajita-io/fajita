import type { BlogCategory } from "./schema";

export interface BlogCategoryMeta {
  id: BlogCategory;
  slug: BlogCategory;
  label: string;
  introduction: string;
  productCapability?: { href: string; label: string };
}

export const BLOG_CATEGORY_META: Record<BlogCategory, BlogCategoryMeta> = {
  monitoring: {
    id: "monitoring",
    slug: "monitoring",
    label: "Monitoring",
    introduction:
      "How to check websites and APIs on a schedule, confirm failures before paging anyone, and keep monitoring signals honest.",
    productCapability: {
      href: "/features/uptime-monitoring",
      label: "Uptime monitoring",
    },
  },
  "incident-response": {
    id: "incident-response",
    slug: "incident-response",
    label: "Incident Response",
    introduction:
      "Writing public updates, separating internal notes from customer language, and closing incidents without improvising under pressure.",
    productCapability: {
      href: "/features/incident-communication",
      label: "Incident communication",
    },
  },
  "status-pages": {
    id: "status-pages",
    slug: "status-pages",
    label: "Status Pages",
    introduction:
      "What belongs on a customer-facing status page, how to name components, and how to keep the page current during maintenance.",
    productCapability: {
      href: "/features/status-pages",
      label: "Status pages",
    },
  },
  "alerts-integrations": {
    id: "alerts-integrations",
    slug: "alerts-integrations",
    label: "Alerts and Integrations",
    introduction:
      "Routing alerts to email, Slack, Discord, and webhooks without turning every blip into overnight noise.",
    productCapability: {
      href: "/integrations",
      label: "Integrations",
    },
  },
  "apis-webhooks": {
    id: "apis-webhooks",
    slug: "apis-webhooks",
    label: "APIs and Webhooks",
    introduction:
      "Health endpoints, status codes, JSON assertions, authenticated checks, and signed webhook delivery.",
    productCapability: {
      href: "/features/api-monitoring",
      label: "API monitoring",
    },
  },
  "ssl-dns": {
    id: "ssl-dns",
    slug: "ssl-dns",
    label: "SSL and DNS",
    introduction:
      "Certificate expiration windows, hostname mismatches, and DNS failures that look like downtime.",
    productCapability: {
      href: "/features/ssl-monitoring",
      label: "SSL monitoring",
    },
  },
  "cron-scheduled-jobs": {
    id: "cron-scheduled-jobs",
    slug: "cron-scheduled-jobs",
    label: "Cron and Scheduled Jobs",
    introduction:
      "Heartbeat monitoring for cron, backups, and scheduled tasks that fail silently when nobody is watching.",
    productCapability: {
      href: "/features/cron-monitoring",
      label: "Cron monitoring",
    },
  },
  "reliability-metrics": {
    id: "reliability-metrics",
    slug: "reliability-metrics",
    label: "Reliability Metrics",
    introduction:
      "Uptime math, maintenance treatment, and the difference between a percentage and a promise.",
  },
  "founder-operations": {
    id: "founder-operations",
    slug: "founder-operations",
    label: "Founder Operations",
    introduction:
      "The smallest reliability stack that still protects a solo founder or tiny team before and after launch.",
  },
  research: {
    id: "research",
    slug: "research",
    label: "Research",
    introduction:
      "Original, privacy-safe findings published only when methodology and cohort thresholds are met.",
  },
};

export function orderedBlogCategories(): BlogCategoryMeta[] {
  return Object.values(BLOG_CATEGORY_META);
}
