import { callout, code, h2, p, steps, table, ul } from "../blocks";
import { defineDoc, type DocPage } from "../types";

const REVIEWED = "2026-07-17";
const PRODUCT_VERSION = "2026.07";

const status = {
  category: "status-pages" as const,
  lastReviewedAt: REVIEWED,
  owner: "docs-status",
  reviewers: ["engineering", "product"],
  productVersion: PRODUCT_VERSION,
};

const subs = {
  category: "subscribers" as const,
  lastReviewedAt: REVIEWED,
  owner: "docs-status",
  reviewers: ["engineering", "product", "privacy"],
  productVersion: PRODUCT_VERSION,
};

const maint = {
  category: "maintenance" as const,
  lastReviewedAt: REVIEWED,
  owner: "docs-status",
  reviewers: ["engineering", "product"],
  productVersion: PRODUCT_VERSION,
};

export const statusAndSubscriberPages: DocPage[] = [
  defineDoc({
    meta: {
      ...status,
      slug: "status-pages/create",
      title: "Create a status page",
      description: "Create a public status page on a hosted subdomain and control what customers see.",
      model: "build",
      pageType: "task",
      order: 0,
      requiredPermission: "status_pages:manage",
      productArea: ["status-pages"],
      keywords: ["status page", "create", "public", "subdomain", "hosted"],
      relatedPages: ["status-pages/components", "status-pages/custom-domains"],
    },
    body: [
      h2("Outcome"),
      p("A status page exists and can be published on a hosted subdomain such as `your-page.status.fajita.io`."),
      h2("What customers see"),
      ul([
        "Public component names you choose, not internal monitor names.",
        "An overall status summary.",
        "Public incidents and scheduled maintenance you publish.",
        "Uptime history for a chosen period.",
      ]),
      callout("note", [
        p("Building a page needs `status_pages:manage`. Making it public and publishing updates needs `status_pages:publish`."),
      ]),
    ],
  }),

  defineDoc({
    meta: {
      ...status,
      slug: "status-pages/components",
      title: "Components and state",
      description: "How component state is calculated from monitors, and the public states customers see.",
      model: "learn",
      pageType: "concept",
      order: 1,
      productArea: ["status-pages"],
      keywords: ["component", "state", "operational", "partial outage", "major outage", "calculation"],
      relatedPages: ["status-pages/uptime-history"],
    },
    body: [
      p("A component is the public unit of your service. Fajita calculates its state from the monitors mapped to it."),
      h2("Public component states"),
      table(
        ["State", "Meaning"],
        [
          ["Operational", "All mapped monitors are healthy"],
          ["Degraded performance", "Working but slower than expected"],
          ["Partial outage", "Some capability is failing"],
          ["Major outage", "The component is down"],
          ["Under maintenance", "A maintenance window is active"],
        ],
      ),
      h2("Calculation modes"),
      p("Choose how mapped monitors combine into a component state: any critical monitor, a majority, a primary monitor, or manual control."),
      callout("note", [
        p("An internal monitor name is private. The public component name and the public incident are separate projections you control."),
      ]),
    ],
  }),

  defineDoc({
    meta: {
      ...status,
      slug: "status-pages/uptime-history",
      title: "Uptime history",
      description: "Which checks count toward uptime, how maintenance is represented, and why it is not an SLA.",
      model: "learn",
      pageType: "concept",
      order: 2,
      productArea: ["status-pages"],
      keywords: ["uptime", "history", "percentage", "sla", "maintenance", "paused"],
      relatedPages: ["status-pages/components"],
    },
    body: [
      h2("What counts"),
      ul([
        "Scheduled checks count. Manual tests do not.",
        "Blocked and canceled results are excluded from the ratio.",
        "Time inside a maintenance window is represented separately.",
        "Paused monitors contribute no new data while paused.",
      ]),
      h2("Aggregation"),
      p("Component uptime aggregates daily results into the period you display. Publishing a public incident does not rewrite historical uptime."),
      callout("warning", [
        p("Uptime history is an operational measure, not a service-level agreement, and it is not claimed to be 100 percent accurate."),
      ]),
    ],
  }),

  defineDoc({
    meta: {
      ...status,
      slug: "status-pages/custom-domains",
      title: "Custom domains",
      description: "Serve a status page on your own subdomain with DNS verification and managed TLS.",
      model: "build",
      pageType: "task",
      order: 3,
      requiredPermission: "status_pages:manage",
      requiredRole: "admin",
      productArea: ["status-pages"],
      keywords: ["custom domain", "dns", "cname", "tls", "https", "subdomain"],
      relatedPages: ["troubleshooting/custom-domain"],
    },
    body: [
      h2("Outcome"),
      p("Your status page loads on a domain you own, for example `status.example.com`."),
      h2("Steps"),
      steps([
        {
          title: "Choose a subdomain",
          body: [p("Use a subdomain such as `status.example.com` or `health.example.com`.")],
        },
        {
          title: "Add the DNS records",
          body: [p("Add the verification record and the CNAME that Fajita shows you.")],
        },
        {
          title: "Wait for verification",
          body: [p("Fajita marks the domain active only after DNS routing and HTTPS are verified.")],
        },
      ]),
      code("text", "status.example.com\nhealth.example.com", "Recommended subdomains"),
      callout("note", [
        p("DNS propagation time varies and cannot be promised exactly. Fajita provisions TLS after verification."),
      ]),
    ],
  }),

  defineDoc({
    meta: {
      ...subs,
      slug: "subscribers/double-opt-in",
      title: "Subscribers and double opt-in",
      description: "Let customers subscribe to your status page, with confirmed consent before any email is sent.",
      model: "build",
      pageType: "task",
      order: 0,
      requiredPermission: "subscribers:settings_manage",
      requiredRole: "admin",
      productArea: ["subscribers"],
      keywords: ["subscriber", "double opt-in", "confirm", "consent", "email", "preferences"],
      relatedPages: ["subscribers/import", "privacy/status-page-subscribers"],
      searchBoost: 1,
    },
    body: [
      h2("Outcome"),
      p("Visitors can subscribe to updates, and only confirmed addresses receive email."),
      h2("How confirmation works"),
      ul([
        "A visitor submits an address on your status page.",
        "Fajita sends a confirmation email and holds the subscriber in a pending state.",
        "The subscriber confirms via the link. The confirmation link is single use and expires after a set window.",
        "Only after confirmation does the subscriber receive incident or maintenance email.",
      ]),
      h2("Preferences"),
      p("Confirmed subscribers can choose specific components and whether they want incident updates, maintenance updates, or both."),
      callout("security", [
        p("Status-page subscriber email is operational communication. It must not be used as a marketing list without separate consent."),
      ]),
    ],
  }),

  defineDoc({
    meta: {
      ...subs,
      slug: "subscribers/import",
      title: "Import subscribers",
      description: "Bring confirmed subscribers from another provider without bypassing consent.",
      model: "operate",
      pageType: "task",
      order: 1,
      requiredPermission: "subscribers:import",
      requiredRole: "admin",
      productArea: ["subscribers"],
      keywords: ["import", "csv", "migrate subscribers", "consent"],
      relatedPages: ["subscribers/double-opt-in", "migrations/overview"],
    },
    body: [
      h2("Outcome"),
      p("Subscribers you already have consent for are added to your Fajita status page."),
      h2("Before you import"),
      callout("warning", [
        p("Only import addresses that already gave consent to receive status updates. Do not import a general marketing list. You attest to lawful consent when importing."),
      ]),
      h2("Bounces and complaints"),
      p("Hard bounces and complaints suppress an address automatically. Repeated soft bounces suppress after a threshold. Suppressed addresses do not receive further email."),
    ],
  }),

  defineDoc({
    meta: {
      ...maint,
      slug: "maintenance/create",
      title: "Schedule maintenance",
      description: "Create a maintenance window, suppress alerts, and understand what happens when it ends.",
      model: "operate",
      pageType: "task",
      order: 0,
      requiredPermission: "maintenance:manage",
      requiredRole: "admin",
      productArea: ["maintenance"],
      keywords: ["maintenance", "window", "suppress", "scheduled", "downtime"],
      relatedPages: ["status-pages/uptime-history"],
    },
    body: [
      h2("Outcome"),
      p("A maintenance window is scheduled, affected monitors are known, and alerts behave as you intend during the window."),
      h2("Steps"),
      steps([
        { title: "Set the window", body: [p("Choose the start and end time and the monitors it affects.")] },
        { title: "Choose suppression", body: [p("Decide whether to suppress alerts for the affected monitors during the window.")] },
        { title: "Publish", body: [p("Optionally publish the window to your status page and notify subscribers.")] },
      ]),
      h2("Behavior"),
      callout("note", [
        p("Fajita continues checking during maintenance unless the product explicitly says otherwise. Maintenance does not automatically resolve an existing incident."),
      ]),
      h2("When maintenance ends"),
      p("If a monitor is still failing after the window closes, normal verification resumes and an incident can open."),
    ],
  }),
];
