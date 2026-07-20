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
    id: "accounts-open",
    date: "2026-07-17",
    title: "Accounts are open",
    tag: "announcement",
    body: [
      "You can create a Fajita account, add monitors for websites, APIs, SSL certificates, and cron heartbeats, and route verified alerts to email, Slack, Discord, and webhooks.",
      "Starter, Pro, and Business pricing is published. Plans, limits, and checkout amounts live on the pricing page before anyone is asked to pay.",
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
      "You can walk through the product story, see how detection and alerting work, and read exactly what is committed. Nothing on this site claims to be live before it is.",
    ],
  },
];

export const changeTagLabels: Record<ChangeTag, string> = {
  feature: "Feature",
  improvement: "Improvement",
  fix: "Fix",
  announcement: "Announcement",
};
