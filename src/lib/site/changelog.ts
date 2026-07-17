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
    id: "public-site",
    date: "2026-07-16",
    title: "The Fajita website opens",
    tag: "announcement",
    body: [
      "Fajita has a public home. The site explains what we are building: uptime monitoring for websites, APIs, SSL certificates, and cron jobs, with verified alerts and public status pages, built for founders and small software teams.",
      "You can walk through the product story, see how detection and alerting will work, and read exactly what is committed for launch. Nothing on this site claims to be live before it is.",
      "Early access is open. Members are invited as accounts open and see pricing first.",
    ],
  },
];

export const changeTagLabels: Record<ChangeTag, string> = {
  feature: "Feature",
  improvement: "Improvement",
  fix: "Fix",
  announcement: "Announcement",
};
