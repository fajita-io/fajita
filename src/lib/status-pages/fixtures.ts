/**
 * Deterministic status-page fixtures. These drive the internal status-page lab
 * and automated tests. Everything is synthetic and clearly not a real customer:
 * a fictional company "Northwind" with plausible components. No real customer
 * data ever reaches these. Client-safe (pure data, fixed timestamps).
 */

import { DEFAULT_APPEARANCE, type Appearance } from "./appearance";
import type { OverallState, PublicComponentState, StatusPageTheme } from "./constants";
import { PUBLIC_SNAPSHOT_SCHEMA_VERSION } from "./config";
import type {
  PublicComponent,
  PublicComponentGroup,
  PublicDailyUptime,
  PublicIncident,
  PublicMaintenance,
  PublicSnapshotData,
} from "./snapshot-types";

const BASE = new Date("2026-07-15T12:00:00.000Z");

function iso(offsetMinutes: number): string {
  return new Date(BASE.getTime() + offsetMinutes * 60_000).toISOString();
}

function day(offsetDays: number): string {
  const d = new Date(BASE.getTime() + offsetDays * 86_400_000);
  return d.toISOString().slice(0, 10);
}

/**
 * Deterministic daily uptime series. A seeded pattern so the same fixture
 * always renders the same bars: mostly operational with a couple of dips.
 */
function uptimeDays(
  windowDays: number,
  dips: Record<number, { worst: PublicComponentState; fraction: number }> = {},
): PublicDailyUptime[] {
  const out: PublicDailyUptime[] = [];
  for (let i = windowDays - 1; i >= 0; i -= 1) {
    const dip = dips[i];
    out.push({
      date: day(-i),
      fraction: dip ? dip.fraction : 1,
      worst: dip ? dip.worst : "operational",
    });
  }
  return out;
}

function component(
  slug: string,
  name: string,
  state: PublicComponentState,
  opts: {
    description?: string | null;
    showUptime?: boolean;
    fraction?: number | null;
    responseMs?: number | null;
    windowDays?: number;
    dips?: Record<number, { worst: PublicComponentState; fraction: number }>;
    noData?: boolean;
  } = {},
): PublicComponent {
  const windowDays = opts.windowDays ?? 90;
  return {
    slug,
    name,
    description: opts.description ?? null,
    state,
    showUptime: opts.showUptime ?? true,
    uptime:
      opts.showUptime === false
        ? null
        : {
            windowDays,
            fraction: opts.noData ? null : opts.fraction ?? 0.999,
            days: opts.noData ? [] : uptimeDays(windowDays, opts.dips),
          },
    responseMs: opts.responseMs ?? null,
  };
}

function group(name: string, components: PublicComponent[], description: string | null = null): PublicComponentGroup {
  return { name, description, collapsedByDefault: false, components };
}

interface BaseOptions {
  theme?: StatusPageTheme;
  appearance?: Appearance;
  overall: OverallState;
  groups: PublicComponentGroup[];
  ungrouped?: PublicComponent[];
  activeIncidents?: PublicIncident[];
  activeMaintenance?: PublicMaintenance[];
  upcomingMaintenance?: PublicMaintenance[];
  recentIncidents?: PublicSnapshotData["recentIncidents"];
  showResponseTime?: boolean;
  showSubscriberForm?: boolean;
  poweredByVisible?: boolean;
  logoUrl?: string | null;
  lastUpdatedAt?: string;
}

function base(opts: BaseOptions): PublicSnapshotData {
  return {
    schemaVersion: PUBLIC_SNAPSHOT_SCHEMA_VERSION,
    page: {
      name: "Northwind",
      title: "Northwind Status",
      description: "Live status for Northwind services.",
      headline: null,
      supportUrl: "https://example.com/support",
      websiteUrl: "https://example.com",
      timezone: "America/Denver",
      locale: "en",
    },
    theme: {
      key: opts.theme ?? "signal",
      appearance: opts.appearance ?? DEFAULT_APPEARANCE,
      logoUrl: opts.logoUrl ?? null,
    },
    seo: { indexing: true, indexIncidentArchive: true, indexIndividualIncidents: false },
    display: {
      showUptimeHistory: true,
      showResponseTime: opts.showResponseTime ?? false,
      showIncidentHistory: true,
      showScheduledMaintenance: true,
      showComponentDescriptions: true,
      showSubscriberForm: opts.showSubscriberForm ?? false,
      poweredByVisible: opts.poweredByVisible ?? true,
      uptimeHistoryDays: 90,
    },
    overall: opts.overall,
    groups: opts.groups,
    ungrouped: opts.ungrouped ?? [],
    activeIncidents: opts.activeIncidents ?? [],
    notices: [],
    activeMaintenance: opts.activeMaintenance ?? [],
    upcomingMaintenance: opts.upcomingMaintenance ?? [],
    recentIncidents: opts.recentIncidents ?? [],
    generatedAt: iso(0),
    lastUpdatedAt: opts.lastUpdatedAt ?? iso(0),
  };
}

function coreGroup(states: {
  website?: PublicComponentState;
  api?: PublicComponentState;
  auth?: PublicComponentState;
  dashboard?: PublicComponentState;
}): PublicComponentGroup {
  return group("Core services", [
    component("website", "Website", states.website ?? "operational", { description: "Marketing site and docs.", responseMs: 182 }),
    component("api", "API", states.api ?? "operational", { description: "Public REST API.", responseMs: 240 }),
    component("auth", "Authentication", states.auth ?? "operational", { description: "Sign-in and sessions." }),
    component("dashboard", "Dashboard", states.dashboard ?? "operational", { description: "Customer dashboard." }),
  ]);
}

const investigatingIncident: PublicIncident = {
  slug: "inc-4821-elevated-api-errors",
  title: "Elevated error rates on the API",
  summaryHtml: "<p>We are seeing elevated error rates on API requests and are investigating.</p>",
  status: "investigating",
  severity: "major",
  affectedComponents: ["API"],
  startedAt: iso(-35),
  resolvedAt: null,
  updates: [
    {
      type: "investigating",
      bodyHtml: "<p>We are investigating elevated error rates affecting the API.</p>",
      publishedAt: iso(-35),
    },
  ],
};

const identifiedIncident: PublicIncident = {
  ...investigatingIncident,
  status: "identified",
  updates: [
    ...investigatingIncident.updates,
    {
      type: "identified",
      bodyHtml: "<p>We identified a database connection issue and are applying a fix.</p>",
      publishedAt: iso(-20),
    },
  ],
};

const monitoringIncident: PublicIncident = {
  ...identifiedIncident,
  status: "monitoring",
  updates: [
    ...identifiedIncident.updates,
    {
      type: "monitoring",
      bodyHtml: "<p>The fix is deployed. Error rates are recovering and we are monitoring.</p>",
      publishedAt: iso(-8),
    },
  ],
};

const resolvedIncident: PublicIncident = {
  ...monitoringIncident,
  status: "resolved",
  resolvedAt: iso(0),
  updates: [
    ...monitoringIncident.updates,
    {
      type: "resolved",
      bodyHtml: "<p>Error rates are back to normal. The incident is resolved.</p>",
      publishedAt: iso(0),
    },
  ],
};

const longIncident: PublicIncident = {
  slug: "inc-3990-regional-outage",
  title: "Regional outage in us-east",
  summaryHtml: "<p>A regional provider outage affected multiple services.</p>",
  status: "resolved",
  severity: "critical",
  affectedComponents: ["API", "Dashboard", "Authentication"],
  startedAt: iso(-600),
  resolvedAt: iso(-120),
  updates: [
    { type: "investigating", bodyHtml: "<p>Investigating widespread errors.</p>", publishedAt: iso(-600) },
    { type: "identified", bodyHtml: "<p>Upstream provider outage confirmed in us-east.</p>", publishedAt: iso(-540) },
    { type: "monitoring", bodyHtml: "<p>Provider is recovering. Watching closely.</p>", publishedAt: iso(-300) },
    { type: "monitoring", bodyHtml: "<p>Most services restored. Continuing to monitor.</p>", publishedAt: iso(-200) },
    { type: "resolved", bodyHtml: "<p>All services restored and stable.</p>", publishedAt: iso(-120) },
  ],
};

const scheduledMaintenance: PublicMaintenance = {
  slug: "mnt-db-upgrade",
  title: "Database maintenance",
  summaryHtml: "<p>We will perform a database upgrade. Brief interruptions are possible.</p>",
  state: "scheduled",
  startsAt: iso(2880),
  endsAt: iso(2940),
  timezone: "America/Denver",
  affectedComponents: ["API", "Dashboard"],
};

const activeMaintenance: PublicMaintenance = {
  ...scheduledMaintenance,
  slug: "mnt-db-upgrade-active",
  state: "in_progress",
  startsAt: iso(-15),
  endsAt: iso(45),
};

const recentHistory: PublicSnapshotData["recentIncidents"] = [
  { slug: resolvedIncident.slug, title: resolvedIncident.title, severity: "major", startedAt: iso(-35), resolvedAt: iso(0) },
  { slug: longIncident.slug, title: longIncident.title, severity: "critical", startedAt: iso(-600), resolvedAt: iso(-120) },
];

export type FixtureKey =
  | "all_operational"
  | "one_degraded"
  | "one_down"
  | "multiple_down"
  | "maintenance_active"
  | "maintenance_plus_outage"
  | "incident_investigating"
  | "incident_identified"
  | "incident_monitoring"
  | "incident_resolved"
  | "long_incident"
  | "empty_history"
  | "uptime_30"
  | "uptime_90"
  | "missing_data"
  | "response_time"
  | "theme_ember"
  | "theme_paper"
  | "theme_midnight"
  | "powered_by_hidden";

export interface Fixture {
  key: FixtureKey;
  label: string;
  data: PublicSnapshotData;
}

export const STATUS_PAGE_FIXTURES: Fixture[] = [
  {
    key: "all_operational",
    label: "All operational",
    data: base({ overall: "operational", groups: [coreGroup({})], recentIncidents: recentHistory }),
  },
  {
    key: "one_degraded",
    label: "One degraded component",
    data: base({
      overall: "degraded",
      groups: [coreGroup({ api: "degraded_performance" })],
      recentIncidents: recentHistory,
    }),
  },
  {
    key: "one_down",
    label: "One down component",
    data: base({
      overall: "partial_outage",
      groups: [coreGroup({ api: "major_outage" })],
      activeIncidents: [investigatingIncident],
      recentIncidents: recentHistory,
    }),
  },
  {
    key: "multiple_down",
    label: "Multiple down components",
    data: base({
      overall: "major_outage",
      groups: [coreGroup({ api: "major_outage", auth: "major_outage", dashboard: "partial_outage" })],
      activeIncidents: [identifiedIncident],
      recentIncidents: recentHistory,
    }),
  },
  {
    key: "maintenance_active",
    label: "Active maintenance",
    data: base({
      overall: "maintenance",
      groups: [coreGroup({ api: "under_maintenance", dashboard: "under_maintenance" })],
      activeMaintenance: [activeMaintenance],
    }),
  },
  {
    key: "maintenance_plus_outage",
    label: "Maintenance plus unrelated outage",
    data: base({
      overall: "major_outage",
      groups: [coreGroup({ auth: "major_outage", api: "under_maintenance" })],
      activeIncidents: [investigatingIncident],
      activeMaintenance: [activeMaintenance],
    }),
  },
  {
    key: "incident_investigating",
    label: "Incident: investigating",
    data: base({ overall: "partial_outage", groups: [coreGroup({ api: "partial_outage" })], activeIncidents: [investigatingIncident] }),
  },
  {
    key: "incident_identified",
    label: "Incident: identified",
    data: base({ overall: "partial_outage", groups: [coreGroup({ api: "partial_outage" })], activeIncidents: [identifiedIncident] }),
  },
  {
    key: "incident_monitoring",
    label: "Incident: monitoring",
    data: base({ overall: "degraded", groups: [coreGroup({ api: "degraded_performance" })], activeIncidents: [monitoringIncident] }),
  },
  {
    key: "incident_resolved",
    label: "Incident: resolved",
    data: base({ overall: "operational", groups: [coreGroup({})], recentIncidents: [recentHistory[0]] }),
  },
  {
    key: "long_incident",
    label: "Long incident timeline",
    data: base({ overall: "operational", groups: [coreGroup({})], recentIncidents: [recentHistory[1]] }),
  },
  {
    key: "empty_history",
    label: "Empty incident history",
    data: base({ overall: "operational", groups: [coreGroup({})], recentIncidents: [] }),
  },
  {
    key: "uptime_30",
    label: "30-day uptime",
    data: base({
      overall: "operational",
      groups: [
        group("Core services", [
          component("website", "Website", "operational", { windowDays: 30, fraction: 0.9994, dips: { 12: { worst: "degraded_performance", fraction: 0.97 } } }),
          component("api", "API", "operational", { windowDays: 30, fraction: 0.9981, dips: { 5: { worst: "partial_outage", fraction: 0.88 } } }),
        ]),
      ],
    }),
  },
  {
    key: "uptime_90",
    label: "90-day uptime",
    data: base({
      overall: "operational",
      groups: [
        group("Core services", [
          component("website", "Website", "operational", { windowDays: 90, fraction: 0.9997 }),
          component("api", "API", "operational", { windowDays: 90, fraction: 0.9989, dips: { 40: { worst: "major_outage", fraction: 0.6 }, 41: { worst: "degraded_performance", fraction: 0.95 } } }),
        ]),
      ],
    }),
  },
  {
    key: "missing_data",
    label: "Missing data",
    data: base({
      overall: "operational",
      groups: [
        group("Core services", [
          component("website", "Website", "operational", { fraction: 0.999 }),
          component("newthing", "New service", "operational", { noData: true }),
        ]),
      ],
    }),
  },
  {
    key: "response_time",
    label: "Response time shown",
    data: base({
      overall: "operational",
      showResponseTime: true,
      groups: [
        group("Core services", [
          component("website", "Website", "operational", { responseMs: 172, showUptime: true }),
          component("api", "API", "operational", { responseMs: 264, showUptime: true }),
        ]),
      ],
    }),
  },
  {
    key: "theme_ember",
    label: "Theme: Ember",
    data: base({ theme: "ember", overall: "operational", groups: [coreGroup({})] }),
  },
  {
    key: "theme_paper",
    label: "Theme: Paper",
    data: base({ theme: "paper", overall: "operational", groups: [coreGroup({})] }),
  },
  {
    key: "theme_midnight",
    label: "Theme: Midnight",
    data: base({ theme: "midnight", overall: "major_outage", groups: [coreGroup({ api: "major_outage" })], activeIncidents: [identifiedIncident] }),
  },
  {
    key: "powered_by_hidden",
    label: "Powered by hidden",
    data: base({ overall: "operational", groups: [coreGroup({})], poweredByVisible: false }),
  },
];

export function getFixture(key: string): Fixture | null {
  return STATUS_PAGE_FIXTURES.find((f) => f.key === key) ?? null;
}

export const FIXTURE_INCIDENTS: Record<string, PublicIncident> = {
  investigating: investigatingIncident,
  identified: identifiedIncident,
  monitoring: monitoringIncident,
  resolved: resolvedIncident,
  long: longIncident,
};
