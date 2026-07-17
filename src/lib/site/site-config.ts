/**
 * Central public-site configuration. Every customer-facing constant that
 * could otherwise scatter across components lives here: URLs, CTA labels,
 * launch state, and contact routing.
 *
 * Docs: /docs/website/public-copy-system.md
 */

export const siteUrl =
  process.env.NEXT_PUBLIC_APP_URL?.replace(/\/$/, "") ?? "https://fajita.io";

/**
 * Launch state. When true, primary CTAs route to signup and the site may
 * invite visitors to create an account. Product access still follows feature
 * flags and billing entitlements.
 */
export const accountsOpen = true;

export const cta = {
  /** The one dominant action across the site. */
  primary: {
    label: accountsOpen ? "Start monitoring" : "Get early access",
    href: accountsOpen ? "/signup" : "/early-access",
  },
  secondary: {
    label: "See how it works",
    href: "/#how-it-works",
  },
} as const;

export const company = {
  name: "Fajita",
  addressLines: ["Fajita", "1001 S Main St, Ste 600", "Kalispell, MT 59901"],
  addressSingleLine: "Fajita · 1001 S Main St, Ste 600, Kalispell, MT 59901",
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
