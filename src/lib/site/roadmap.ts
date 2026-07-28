/**
 * Public roadmap. Restrained categories, no dates, no contractual promises.
 * Excludes security internals, commercial strategy, and unannounced work.
 * Stages must stay consistent with src/lib/site/claims.ts.
 */

export type RoadmapStage = "shipped" | "in-progress" | "planned" | "exploring";

export interface RoadmapItem {
  id: string;
  title: string;
  body: string;
  stage: RoadmapStage;
}

export const roadmapStages: { id: RoadmapStage; label: string; note: string }[] = [
  {
    id: "shipped",
    label: "Shipped",
    note: "Live and public today.",
  },
  {
    id: "in-progress",
    label: "In progress",
    note: "Being built now.",
  },
  {
    id: "planned",
    label: "Planned",
    note: "Committed direction, not yet started.",
  },
  {
    id: "exploring",
    label: "Exploring",
    note: "Under consideration. May change or not happen.",
  },
];

export const roadmapItems: RoadmapItem[] = [
  {
    id: "website",
    title: "Public website, docs, and accounts",
    body: "Product story, honest claims, documentation, glossary, and open signup.",
    stage: "shipped",
  },
  {
    id: "monitoring-core",
    title: "Core monitoring: websites, APIs, SSL, cron",
    body: "Scheduled checks, verification before alerting, and incident records.",
    stage: "shipped",
  },
  {
    id: "alerting",
    title: "Alert channels: email, Slack, Discord, webhooks",
    body: "Verified incidents routed to the channels teams already watch, with recovery notices.",
    stage: "shipped",
  },
  {
    id: "status-pages",
    title: "Public status pages",
    body: "Branded pages with components, incident timelines, maintenance windows, subscribers, and uptime history.",
    stage: "shipped",
  },
  {
    id: "billing",
    title: "Plans and billing",
    body: "Core, Team, and Scale with published pricing and monthly or annual checkout.",
    stage: "shipped",
  },
  {
    id: "multi-region",
    title: "Multi-region verification",
    body: "Confirming failures from more than one place in the world before alerting.",
    stage: "planned",
  },
  {
    id: "teams-integration",
    title: "Microsoft Teams alerts",
    body: "A native Teams channel for verified incidents.",
    stage: "exploring",
  },
  {
    id: "sms",
    title: "SMS and phone-call alerts",
    body: "For the incidents that must wake someone up.",
    stage: "exploring",
  },
  {
    id: "public-api",
    title: "Public API",
    body: "Manage monitors and read incident data programmatically.",
    stage: "exploring",
  },
];
