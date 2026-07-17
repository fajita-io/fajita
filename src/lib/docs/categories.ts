import type { DocCategory, DocModel } from "./frontmatter";

export interface CategoryMeta {
  id: DocCategory;
  label: string;
  /** Which mental model the category belongs to in the sidebar. */
  model: DocModel;
  description: string;
  order: number;
}

/** Sidebar and landing grouping. Ordered within each model. */
export const DOC_CATEGORY_META: Record<DocCategory, CategoryMeta> = {
  "getting-started": {
    id: "getting-started",
    label: "Getting started",
    model: "learn",
    description: "Understand Fajita and run the core loop in one session.",
    order: 0,
  },
  monitors: {
    id: "monitors",
    label: "Monitors",
    model: "build",
    description: "Watch websites, APIs, certificates, and cron jobs.",
    order: 10,
  },
  assertions: {
    id: "assertions",
    label: "Assertions",
    model: "build",
    description: "Decide when a response counts as healthy.",
    order: 11,
  },
  alerts: {
    id: "alerts",
    label: "Alerts",
    model: "build",
    description: "Route confirmed incidents to the right channels.",
    order: 12,
  },
  integrations: {
    id: "integrations",
    label: "Integrations",
    model: "build",
    description: "Connect Slack, Discord, email, and webhooks.",
    order: 13,
  },
  "status-pages": {
    id: "status-pages",
    label: "Status pages",
    model: "build",
    description: "Publish a public page and communicate clearly.",
    order: 14,
  },
  subscribers: {
    id: "subscribers",
    label: "Subscribers",
    model: "build",
    description: "Let customers opt in to status updates.",
    order: 15,
  },
  incidents: {
    id: "incidents",
    label: "Incidents",
    model: "operate",
    description: "How failures are confirmed, communicated, and resolved.",
    order: 20,
  },
  maintenance: {
    id: "maintenance",
    label: "Maintenance",
    model: "operate",
    description: "Schedule work and suppress expected noise.",
    order: 21,
  },
  teams: {
    id: "teams",
    label: "Teams",
    model: "operate",
    description: "Members, roles, and permissions.",
    order: 22,
  },
  billing: {
    id: "billing",
    label: "Billing",
    model: "operate",
    description: "Plans, limits, and payment behavior.",
    order: 23,
  },
  affiliates: {
    id: "affiliates",
    label: "Affiliates",
    model: "operate",
    description: "Referrals, commissions, and payouts.",
    order: 24,
  },
  account: {
    id: "account",
    label: "Account",
    model: "operate",
    description: "Export, deletion, and support.",
    order: 25,
  },
  webhooks: {
    id: "webhooks",
    label: "Webhooks",
    model: "reference",
    description: "Event types, payloads, and signature verification.",
    order: 30,
  },
  security: {
    id: "security",
    label: "Security",
    model: "reference",
    description: "Encryption, isolation, and destination safety.",
    order: 31,
  },
  privacy: {
    id: "privacy",
    label: "Privacy",
    model: "reference",
    description: "What data Fajita processes and your responsibilities.",
    order: 32,
  },
  troubleshooting: {
    id: "troubleshooting",
    label: "Troubleshooting",
    model: "reference",
    description: "Symptom-first answers to common failures.",
    order: 33,
  },
  migrations: {
    id: "migrations",
    label: "Migrations",
    model: "reference",
    description: "Move monitoring and status communication into Fajita.",
    order: 34,
  },
  reference: {
    id: "reference",
    label: "Reference",
    model: "reference",
    description: "Stable states, categories, and terminology.",
    order: 35,
  },
};

export const MODEL_LABELS: Record<DocModel, string> = {
  learn: "Learn",
  build: "Build",
  operate: "Operate",
  reference: "Reference",
};

export const MODEL_ORDER: DocModel[] = ["learn", "build", "operate", "reference"];
