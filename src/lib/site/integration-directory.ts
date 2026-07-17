/**
 * Public integration directory entries.
 * Only list native integrations, verified webhook recipes, or verified guides.
 * Never present documentation-only items as native.
 */

export type IntegrationKind =
  | "native"
  | "webhook_recipe"
  | "documentation_guide";

export interface IntegrationDirectoryEntry {
  slug: string;
  name: string;
  kind: IntegrationKind;
  summary: string;
  setupPath: string;
  status: "available" | "guide";
}

export const INTEGRATION_DIRECTORY: IntegrationDirectoryEntry[] = [
  {
    slug: "email",
    name: "Email",
    kind: "native",
    summary: "Incident and recovery alerts to team addresses.",
    setupPath: "/docs",
    status: "available",
  },
  {
    slug: "slack",
    name: "Slack",
    kind: "native",
    summary: "Verified incident alerts in the channel you already watch.",
    setupPath: "/docs",
    status: "available",
  },
  {
    slug: "discord",
    name: "Discord",
    kind: "native",
    summary: "The same verified alerts for Discord teams.",
    setupPath: "/docs",
    status: "available",
  },
  {
    slug: "webhooks",
    name: "Webhooks",
    kind: "native",
    summary: "Signed JSON payloads to any HTTPS endpoint.",
    setupPath: "/docs",
    status: "available",
  },
  {
    slug: "generic-webhook-recipe",
    name: "Generic webhook automation",
    kind: "webhook_recipe",
    summary: "Verified setup pattern for routing signed webhooks into your own automation.",
    setupPath: "/docs",
    status: "guide",
  },
];

export function getIntegrationBySlug(
  slug: string,
): IntegrationDirectoryEntry | undefined {
  return INTEGRATION_DIRECTORY.find((i) => i.slug === slug);
}
