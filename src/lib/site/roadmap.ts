/**
 * Public roadmap. Restrained categories, no dates, no contractual promises.
 * Excludes security internals, commercial strategy, and unannounced work.
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
    title: "Public website and early access",
    body: "The product story, honest claims, and an early access list that gets invited first.",
    stage: "shipped",
  },
  {
    id: "monitoring-core",
    title: "Core monitoring: websites, APIs, SSL, cron",
    body: "Scheduled checks, verification before alerting, and incident records.",
    stage: "in-progress",
  },
  {
    id: "alerting",
    title: "Alert channels: email, Slack, Discord, webhooks",
    body: "Verified incidents routed to the channels teams already watch, with recovery notices.",
    stage: "in-progress",
  },
  {
    id: "status-pages",
    title: "Public status pages",
    body: "Branded pages with components, incident timelines, maintenance windows, subscribers, and uptime history.",
    stage: "in-progress",
  },
  {
    id: "billing",
    title: "Plans and billing",
    body: "Starter, Pro, and Business plans with published pricing, monthly and annual.",
    stage: "planned",
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
