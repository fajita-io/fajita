/**
 * Conversion corridors: educational intent → product action.
 * Nonmanipulative, measurable, versioned. No forced redirects.
 */

export interface ConversionCorridor {
  id: string;
  name: string;
  steps: { kind: string; href: string; label: string }[];
  version: string;
}

export const CONVERSION_CORRIDORS: ConversionCorridor[] = [
  {
    id: "monitoring",
    name: "Monitoring corridor",
    version: "1",
    steps: [
      {
        kind: "article",
        href: "/blog/monitor-api-without-alert-noise",
        label: "How to Monitor an API Without Creating Alert Noise",
      },
      {
        kind: "glossary",
        href: "/glossary/api-monitoring",
        label: "API monitoring",
      },
      {
        kind: "docs",
        href: "/docs/monitors/api-monitoring",
        label: "API monitoring docs",
      },
      {
        kind: "tool",
        href: "/tools/uptime-calculator",
        label: "Uptime calculator",
      },
      {
        kind: "product",
        href: "/features/api-monitoring",
        label: "API monitoring",
      },
      { kind: "pricing", href: "/pricing", label: "Pricing" },
    ],
  },
  {
    id: "incident-communication",
    name: "Incident communication corridor",
    version: "1",
    steps: [
      {
        kind: "article",
        href: "/blog/write-useful-incident-update",
        label: "How to Write a Useful Incident Update",
      },
      { kind: "glossary", href: "/glossary/incident", label: "Incident" },
      {
        kind: "docs",
        href: "/docs/status-pages/create",
        label: "Create a status page",
      },
      {
        kind: "tool",
        href: "/tools/status-page-checklist",
        label: "Status-page checklist",
      },
      {
        kind: "product",
        href: "/features/status-pages",
        label: "Status pages",
      },
      { kind: "pricing", href: "/pricing", label: "Pricing" },
    ],
  },
  {
    id: "heartbeat",
    name: "Heartbeat corridor",
    version: "1",
    steps: [
      {
        kind: "article",
        href: "/blog/heartbeat-monitoring-for-cron-jobs",
        label: "Heartbeat Monitoring for Cron Jobs",
      },
      {
        kind: "glossary",
        href: "/glossary/heartbeat-monitoring",
        label: "Heartbeat monitoring",
      },
      {
        kind: "docs",
        href: "/docs/monitors/heartbeat-monitoring",
        label: "Heartbeat setup",
      },
      {
        kind: "tool",
        href: "/tools/cron-expression-explainer",
        label: "Cron expression explainer",
      },
      {
        kind: "product",
        href: "/features/cron-monitoring",
        label: "Cron monitoring",
      },
      { kind: "pricing", href: "/pricing", label: "Pricing" },
    ],
  },
];
