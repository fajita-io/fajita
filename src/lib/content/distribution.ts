/**
 * Source-controlled distribution assets for approved articles.
 * Human review required before any social or email send.
 * No automated posting in this phase.
 */

export interface DistributionAsset {
  contentSlug: string;
  xPost: string;
  linkedInPost: string;
  shortSummary: string;
  threadOutline: string[];
  emailSummary: {
    subject: string;
    preview: string;
    insight: string;
    points: string[];
    audience: string;
  };
  affiliateSnippet: string;
  founderNote: string;
  reviewed: boolean;
}

export const DISTRIBUTION_ASSETS: DistributionAsset[] = [
  {
    contentSlug: "why-one-failed-check-is-not-downtime",
    reviewed: true,
    xPost:
      "One failed request should not automatically become a customer-facing incident. The safer sequence is retry, verification, confirmation, and recovery. We mapped the process here: https://fajita.io/blog/why-one-failed-check-is-not-downtime",
    linkedInPost:
      "A single failed probe is evidence about that probe, not proof customers are down. Confirmation turns blips into incidents. New guide for small teams: https://fajita.io/blog/why-one-failed-check-is-not-downtime",
    shortSummary:
      "Why confirmation exists, how to set a Blip Budget, and when a single failure should still page.",
    threadOutline: [
      "One failed check is not downtime",
      "Blip Budget depends on interval and customer pain",
      "Confirm before public incidents",
      "Link to the guide",
    ],
    emailSummary: {
      subject: "One failed check is not downtime",
      preview: "Confirmation protects sleep without hiding real outages.",
      insight:
        "Treat a single failed probe as uncertain until retries and consecutive failures confirm it.",
      points: [
        "Document your confirmation delay",
        "Believe customer reports even while verifying",
        "Align uptime math with confirmed downtime only",
      ],
      audience: "Founders and on-call engineers",
    },
    affiliateSnippet:
      "Fajita guide: why one failed check should not mean downtime. Useful for teams drowning in false positives. Disclose affiliate relationships where required.",
    founderNote:
      "We wrote this because alert fatigue kills response quality faster than most outages do.",
  },
];

export function distributionFor(slug: string): DistributionAsset | undefined {
  return DISTRIBUTION_ASSETS.find((a) => a.contentSlug === slug && a.reviewed);
}
