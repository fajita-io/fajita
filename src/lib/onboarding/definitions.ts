/**
 * Versioned onboarding definitions for Fajita.
 *
 * The definition registry lives in code (like the feature registry and the
 * alert event registry) so TypeScript, tests, and the database agree on the
 * step vocabulary. The database stores per-organization state, never the
 * definitions themselves.
 *
 * Version 1 is the Phase 3 workspace checklist (account, organization,
 * timezone, context, invite, notifications). Version 2 is the activation
 * journey: monitor -> first real result -> alert path -> status page ->
 * component mapping. A version-1 completion timestamp is historical and is
 * never overwritten by version 2 (see onboarding-versioning doc).
 *
 * Pure module: safe to import on client and server.
 */

export const CURRENT_ONBOARDING_VERSION = 2;

export type OnboardingStepKind = "core" | "optional";

export interface OnboardingStepDefinition {
  /** Stable step key stored in organization_onboarding_steps. */
  key: string;
  version: number;
  kind: OnboardingStepKind;
  order: number;
  title: string;
  description: string;
  /** Where the step is completed. Null for derived-only steps. */
  href: string | null;
  /** Permission required to act on the step (null = any member). */
  permission:
    | "monitors:manage"
    | "integrations:manage"
    | "status_pages:manage"
    | "members:invite"
    | null;
}

/**
 * Version 2: the first-five-minute activation journey. Completion of every
 * core step is derived from real product state on the server; steps are never
 * marked complete from button clicks alone.
 */
export const ONBOARDING_V2_STEPS: readonly OnboardingStepDefinition[] = [
  {
    key: "organization",
    version: 2,
    kind: "core",
    order: 1,
    title: "Create your organization",
    description: "This space holds your monitors, team, and status pages.",
    href: null,
    permission: null,
  },
  {
    key: "first_monitor",
    version: 2,
    kind: "core",
    order: 2,
    title: "Create and activate your first monitor",
    description: "Start with a website, API, certificate, or scheduled job. Fajita tests the setup before monitoring begins.",
    href: "/app/monitors/new",
    permission: "monitors:manage",
  },
  {
    key: "first_result",
    version: 2,
    kind: "core",
    order: 3,
    title: "Receive the first scheduled result",
    description: "The first real check confirms Fajita can reach your endpoint on schedule. A manual test does not count.",
    href: "/app/monitors",
    permission: null,
  },
  {
    key: "alert_channel",
    version: 2,
    kind: "core",
    order: 4,
    title: "Connect an alert channel",
    description: "A monitor can find the problem. An alert channel makes sure your team hears about it.",
    href: "/app/integrations/new",
    permission: "integrations:manage",
  },
  {
    key: "routing_rule",
    version: 2,
    kind: "core",
    order: 5,
    title: "Activate an alert rule",
    description: "Decide which incident events reach the channel. The default rule covers confirmed incidents and recovery.",
    href: "/app/integrations/rules",
    permission: "integrations:manage",
  },
  {
    key: "status_page",
    version: 2,
    kind: "core",
    order: 6,
    title: "Publish a status page",
    description: "Give customers one place to check. Hosted subdomain included; a custom domain can wait.",
    href: "/app/status-pages/new",
    permission: "status_pages:manage",
  },
  {
    key: "component_mapped",
    version: 2,
    kind: "core",
    order: 7,
    title: "Map a monitor to a public component",
    description: "Public components use names your customers understand. Internal monitor names stay private.",
    href: "/app/status-pages",
    permission: "status_pages:manage",
  },
  // Optional steps. Skippable, never required for product access.
  {
    key: "use_case",
    version: 2,
    kind: "optional",
    order: 8,
    title: "Tell us what you're responsible for",
    description: "A couple of quick questions so setup guidance fits your work.",
    href: "/app/onboarding",
    permission: null,
  },
  {
    key: "invite",
    version: 2,
    kind: "optional",
    order: 9,
    title: "Invite a teammate",
    description: "Bring in the people who should hear about incidents.",
    href: "/app/team",
    permission: "members:invite",
  },
  {
    key: "notifications",
    version: 2,
    kind: "optional",
    order: 10,
    title: "Review email preferences",
    description: "Choose which setup guidance and reports you receive.",
    href: "/app/settings/notifications",
    permission: null,
  },
  {
    key: "ssl_monitor",
    version: 2,
    kind: "optional",
    order: 11,
    title: "Add an SSL certificate monitor",
    description: "Hear about an expiring certificate weeks before it becomes an outage.",
    href: "/app/monitors/new/ssl",
    permission: "monitors:manage",
  },
  {
    key: "heartbeat_monitor",
    version: 2,
    kind: "optional",
    order: 12,
    title: "Add a heartbeat monitor",
    description: "Catch the scheduled job that quietly stopped running.",
    href: "/app/monitors/new/heartbeat",
    permission: "monitors:manage",
  },
] as const;

export const CORE_STEP_KEYS: readonly string[] = ONBOARDING_V2_STEPS.filter(
  (s) => s.kind === "core",
).map((s) => s.key);

export const OPTIONAL_STEP_KEYS: readonly string[] = ONBOARDING_V2_STEPS.filter(
  (s) => s.kind === "optional",
).map((s) => s.key);

const STEP_BY_KEY = new Map(ONBOARDING_V2_STEPS.map((s) => [s.key, s]));

export function onboardingStep(key: string): OnboardingStepDefinition | undefined {
  return STEP_BY_KEY.get(key);
}

export function isKnownStepKey(key: string): boolean {
  return STEP_BY_KEY.has(key);
}

/* ------------------------------------------------------------------ */
/* Use case, first concern, responsibility                            */
/* ------------------------------------------------------------------ */

export const USE_CASE_OPTIONS = [
  "A SaaS product",
  "An API",
  "Client websites",
  "Internal jobs",
  "An ecommerce site",
  "A personal project",
  "Something else",
] as const;

export const FIRST_CONCERN_OPTIONS = [
  { key: "website_outage", label: "Website outage" },
  { key: "api_failure", label: "API failure" },
  { key: "slow_response", label: "Slow response" },
  { key: "ssl_expiry", label: "Expiring SSL certificate" },
  { key: "missed_cron", label: "Missed cron job" },
  { key: "incident_comms", label: "Customer-facing incident communication" },
] as const;
export type FirstConcernKey = (typeof FIRST_CONCERN_OPTIONS)[number]["key"];

export const RESPONSIBILITY_ROLES = [
  { key: "founder", label: "Founder or owner" },
  { key: "developer", label: "Developer" },
  { key: "operations", label: "Operations" },
  { key: "support", label: "Support" },
  { key: "agency", label: "Agency" },
  { key: "other", label: "Other" },
] as const;
export type ResponsibilityRole = (typeof RESPONSIBILITY_ROLES)[number]["key"];

/* ------------------------------------------------------------------ */
/* Template recommendation                                             */
/* ------------------------------------------------------------------ */

export interface MonitorRecommendation {
  /** Route under /app/monitors/new. */
  monitorType: "https" | "api" | "ssl" | "heartbeat";
  title: string;
  reason: string;
}

/**
 * Recommend a first-monitor type from the selected first concern. Falls back
 * to a website monitor: it has the smallest setup burden and the fastest path
 * to a first real result. Never fabricates destination URLs or credentials.
 */
export function recommendMonitor(
  concern: string | null,
  useCase: string | null,
): MonitorRecommendation {
  switch (concern) {
    case "api_failure":
      return {
        monitorType: "api",
        title: "API health endpoint",
        reason: "Checks a JSON endpoint and asserts on the response.",
      };
    case "ssl_expiry":
      return {
        monitorType: "ssl",
        title: "SSL certificate",
        reason: "Warns 30 days before expiry, critical at 7 days.",
      };
    case "missed_cron":
      return {
        monitorType: "heartbeat",
        title: "Scheduled job heartbeat",
        reason: "Your job checks in; Fajita alerts when it goes quiet.",
      };
    case "slow_response":
      return {
        monitorType: "https",
        title: "Website with a response-time threshold",
        reason: "A slow page is a problem before it is an outage.",
      };
    default:
      break;
  }
  if (useCase === "An API") {
    return {
      monitorType: "api",
      title: "API health endpoint",
      reason: "Checks a JSON endpoint and asserts on the response.",
    };
  }
  if (useCase === "Internal jobs") {
    return {
      monitorType: "heartbeat",
      title: "Scheduled job heartbeat",
      reason: "Your job checks in; Fajita alerts when it goes quiet.",
    };
  }
  return {
    monitorType: "https",
    title: "Website monitor",
    reason: "A GET request every five minutes, redirects followed, one retry.",
  };
}

/* ------------------------------------------------------------------ */
/* Product tours                                                       */
/* ------------------------------------------------------------------ */

export interface TourStep {
  title: string;
  body: string;
}

export interface TourDefinition {
  key: string;
  title: string;
  /** Where the tour makes sense. */
  route: string;
  steps: readonly TourStep[];
}

/**
 * Short, optional product tours. Maximum five meaningful steps, user
 * initiated, dismissible, never shown on public status pages.
 */
export const PRODUCT_TOURS: readonly TourDefinition[] = [
  {
    key: "monitor_detail",
    title: "Reading a monitor",
    route: "/app/monitors",
    steps: [
      { title: "Lifecycle status", body: "Active means scheduled checks are running. Paused monitors keep their history but stop checking." },
      { title: "Result history", body: "Every scheduled check is recorded with status, response time, and region. Manual tests are kept separate." },
      { title: "Verification, not panic", body: "One failed check starts verification. An incident opens only after the configured number of consecutive failures." },
      { title: "Response time", body: "The chart uses successful checks only, so an outage never distorts the performance picture." },
    ],
  },
  {
    key: "incident_detail",
    title: "Anatomy of an incident",
    route: "/app/incidents",
    steps: [
      { title: "Confirmed states only", body: "An incident exists because consecutive checks failed, or because someone opened one deliberately." },
      { title: "Timeline", body: "Every state change, note, and update lands on an immutable timeline." },
      { title: "Evidence", body: "The failing checks that opened the incident stay linked, so the record explains itself later." },
      { title: "Recovery", body: "Resolution is confirmed by consecutive successful checks, not by hope." },
    ],
  },
  {
    key: "alert_routing",
    title: "How alerts route",
    route: "/app/integrations",
    steps: [
      { title: "Channels", body: "Email, Slack, Discord, or a signed webhook. Every channel is tested before it can carry an alert." },
      { title: "Rules", body: "Rules decide which events and severities reach which channels. The default rule covers confirmed incidents and recovery." },
      { title: "Quiet hours", body: "Route around sleep without missing critical severity." },
      { title: "Delivery log", body: "Every attempt is recorded. Retries and dead letters are visible, never silent." },
    ],
  },
  {
    key: "status_page_editor",
    title: "Publishing a status page",
    route: "/app/status-pages",
    steps: [
      { title: "Components", body: "Public components use names your customers understand. Internal monitor names stay private." },
      { title: "Mapping", body: "A component's state comes from the monitors you map to it." },
      { title: "Publishing", body: "Publishing creates an immutable version. You can roll back." },
      { title: "Subscribers", body: "Optional email updates with double opt-in. Never shared with anything else." },
    ],
  },
  {
    key: "billing_usage",
    title: "Billing and usage",
    route: "/app/settings/billing",
    steps: [
      { title: "Plan and usage", body: "Usage counters show monitors, team members, status pages, and subscribers against plan limits." },
      { title: "Changes", body: "Upgrades apply immediately with proration. Downgrades wait for the period end." },
      { title: "Cancellation", body: "Cancel anytime. Access continues to the period end and your data is preserved for export." },
    ],
  },
] as const;

const TOUR_BY_KEY = new Map(PRODUCT_TOURS.map((t) => [t.key, t]));

export function tourDefinition(key: string): TourDefinition | undefined {
  return TOUR_BY_KEY.get(key);
}

export function isKnownTourKey(key: string): boolean {
  return TOUR_BY_KEY.has(key);
}

/* ------------------------------------------------------------------ */
/* Onboarding event vocabulary                                         */
/* ------------------------------------------------------------------ */

export const ONBOARDING_EVENT_TYPES = [
  "onboarding_started",
  "use_case_selected",
  "role_selected",
  "step_completed",
  "step_skipped",
  "checklist_dismissed",
  "checklist_reopened",
  "onboarding_resumed",
  "tour_started",
  "tour_completed",
  "tour_dismissed",
  "first_monitor_activated",
  "first_real_check_completed",
  "alert_path_ready",
  "status_page_ready",
  "activation_completed",
] as const;
export type OnboardingEventType = (typeof ONBOARDING_EVENT_TYPES)[number];
