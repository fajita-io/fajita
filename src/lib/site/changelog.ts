/**
 * Public changelog entries. Rules:
 *  - Only truthful, customer-visible progress. Internal engineering phases
 *    do not automatically become entries.
 *  - Never invent past releases.
 *  - Newest first.
 */

export type ChangeTag = "feature" | "improvement" | "fix" | "announcement";

export interface ChangelogEntry {
  /** URL-stable id, also used as the anchor. */
  id: string;
  date: string; // ISO
  title: string;
  tag: ChangeTag;
  body: string[];
}

export const changelog: ChangelogEntry[] = [
  {
    id: "check-based-pricing",
    date: "2026-07-20",
    title: "Check-based pricing",
    tag: "announcement",
    body: [
      "Plans are now Core, Team, and Scale. Each includes a monthly check allowance (100K, 500K, and 2M checks) aligned with how monitoring actually runs.",
      "List prices are $12, $49, and $99 per month. Annual billing saves two months. Scale includes up to 150 monitors.",
      "Your billing usage page shows check consumption for the current period.",
      "When you reach your included checks, scheduled monitoring pauses until you upgrade or your billing period resets. No overage charges.",
    ],
  },
  {
    id: "accounts-open",
    date: "2026-07-17",
    title: "Accounts are open",
    tag: "announcement",
    body: [
      "You can create a Fajita account, add monitors for websites, APIs, SSL certificates, and cron heartbeats, and route verified alerts to email, Slack, Discord, and webhooks.",
      "Core, Team, and Scale pricing is published. Plans, limits, and checkout amounts live on the pricing page before anyone is asked to pay.",
      "Docs, the reliability glossary, and the blog are public for anyone evaluating the product.",
    ],
  },
  {
    id: "public-site",
    date: "2026-07-16",
    title: "The Fajita website opens",
    tag: "announcement",
    body: [
      "Fajita has a public home. The site explains uptime monitoring for websites, APIs, SSL certificates, and cron jobs, with verified alerts and public status pages, built for founders and small software teams.",
      "You can walk through the product story, see how detection and alerting work, and create an account to start monitoring.",
    ],
  },
];

export const changeTagLabels: Record<ChangeTag, string> = {
  feature: "Feature",
  improvement: "Improvement",
  fix: "Fix",
  announcement: "Announcement",
};
