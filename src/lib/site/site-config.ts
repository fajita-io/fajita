/**
 * Central public-site configuration. Every customer-facing constant that
 * could otherwise scatter across components lives here: URLs, CTA labels,
 * and contact routing.
 *
 * Docs: /docs/website/public-copy-system.md
 */

import {
  OSS_GITHUB_URL,
  OSS_ROUTES,
  ossGitHubVisible,
} from "./oss-config";

export const siteUrl =
  process.env.NEXT_PUBLIC_APP_URL?.replace(/\/$/, "") ?? "https://fajita.io";

export const cta = {
  /** The one dominant action across the site (Fajita Cloud). */
  primary: {
    label: "Start with Fajita Cloud",
    href: "/signup",
  },
  secondary: {
    label: "See how it works",
    href: "/#how-it-works",
  },
  github: {
    label: "View on GitHub",
    href: OSS_GITHUB_URL,
  },
  selfHost: {
    label: "Self-host Fajita",
    href: OSS_ROUTES.selfHost,
  },
  selfHostGuide: {
    label: "View self-hosting guide",
    href: OSS_ROUTES.selfHostDocs,
  },
  openSource: {
    label: "Open source",
    href: OSS_ROUTES.openSource,
  },
} as const;

/** Hero and footer CTA pairs respect OSS launch visibility. */
export function heroCtas() {
  if (ossGitHubVisible()) {
    return {
      primary: cta.primary,
      secondary: cta.github,
      tertiary: cta.selfHost,
    };
  }
  return {
    primary: cta.primary,
    secondary: cta.secondary,
    tertiary: null,
  };
}

export const company = {
  name: "Fajita",
  addressLines: ["Fajita", "1001 S Main St, Ste 600", "Kalispell, MT 59901"],
  addressSingleLine: "Fajita · 1001 S Main St, Ste 600, Kalispell, MT 59901",
} as const;

export const social = {
  linkedIn: "https://www.linkedin.com/company/fajita-io",
  x: "https://x.com/fajita_io",
} as const;

/**
 * Contact routing. No public inboxes are configured yet, so the contact
 * form (with a topic selector) is the single published route. Do not
 * publish email addresses here until real inboxes exist.
 */
export const contactTopics = [
  { id: "product", label: "Product question" },
  { id: "support", label: "Support" },
  { id: "security", label: "Security report" },
  { id: "partnership", label: "Partnership" },
  { id: "acquisition", label: "Acquisition inquiry" },
] as const;

export type ContactTopicId = (typeof contactTopics)[number]["id"];

export function isContactTopicId(value: string): value is ContactTopicId {
  return contactTopics.some((t) => t.id === value);
}
