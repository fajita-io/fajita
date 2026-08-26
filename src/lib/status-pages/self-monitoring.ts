/** Fajita-on-Fajita monitoring definitions for the public /status page. */

export const FAJITA_STATUS_COMPONENTS = [
  { key: "website", name: "Website", description: "Public marketing site" },
  {
    key: "app",
    name: "Authenticated application",
    description: "Signed-in product shell",
  },
  {
    key: "monitoring_checks",
    name: "Monitoring checks",
    description: "Scheduler and worker check execution",
  },
  {
    key: "alert_delivery",
    name: "Alert delivery",
    description: "Email, Slack, Discord, and webhook delivery",
  },
  {
    key: "public_status_pages",
    name: "Public status pages",
    description: "Customer status pages and custom domains",
  },
  { key: "billing", name: "Billing", description: "Checkout and Stripe webhooks" },
  {
    key: "support_chat",
    name: "Support chat",
    description: "Ask Fajita support path",
  },
] as const;

/** Production health paths used by the /status fallback when no snapshot slug is set. */
export const FAJITA_COMPONENT_HEALTH_PATHS: Partial<
  Record<(typeof FAJITA_STATUS_COMPONENTS)[number]["key"], string>
> = {
  website: "/api/health",
  app: "/login",
  public_status_pages: "/status",
};

export const FAJITA_SELF_MONITORS = [
  { key: "homepage", path: "/", kind: "http" as const },
  { key: "pricing", path: "/pricing", kind: "http" as const },
  { key: "health_app", path: "/api/health", kind: "http" as const },
  { key: "status_surface", path: "/status", kind: "http" as const },
  { key: "llms", path: "/llms.txt", kind: "http" as const },
] as const;
