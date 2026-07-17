/**
 * The public-safe snapshot shape. This is the only data the public renderer
 * consumes. Every field here is deliberately allowlisted: no internal ids, no
 * monitor names, no secrets, no internal notes, no worker detail. Client-safe.
 */

import type {
  OverallState,
  PublicComponentState,
  StatusPageTheme,
} from "./constants";
import type { Appearance } from "./appearance";

export interface PublicDailyUptime {
  date: string;
  fraction: number | null;
  worst: PublicComponentState | "no_data";
}

export interface PublicComponent {
  slug: string;
  name: string;
  description: string | null;
  state: PublicComponentState;
  showUptime: boolean;
  uptime: {
    windowDays: number;
    fraction: number | null;
    days: PublicDailyUptime[];
  } | null;
  responseMs: number | null;
}

export interface PublicComponentGroup {
  name: string;
  description: string | null;
  collapsedByDefault: boolean;
  components: PublicComponent[];
}

export interface PublicIncidentUpdate {
  type: "investigating" | "identified" | "monitoring" | "resolved" | "informational";
  bodyHtml: string;
  publishedAt: string;
}

export interface PublicIncident {
  slug: string;
  title: string;
  summaryHtml: string | null;
  status: "investigating" | "identified" | "monitoring" | "resolved";
  severity: "minor" | "major" | "critical" | "maintenance" | "informational" | null;
  affectedComponents: string[];
  startedAt: string;
  resolvedAt: string | null;
  updates: PublicIncidentUpdate[];
}

export interface PublicMaintenance {
  slug: string;
  title: string;
  summaryHtml: string | null;
  state: "scheduled" | "in_progress" | "completed" | "canceled";
  startsAt: string;
  endsAt: string;
  timezone: string;
  affectedComponents: string[];
}

export interface PublicNotice {
  slug: string;
  title: string;
  bodyHtml: string;
  type: "notice" | "investigating" | "identified" | "monitoring" | "resolved";
  startsAt: string;
  endsAt: string | null;
}

export interface PublicSnapshotData {
  schemaVersion: number;
  page: {
    name: string;
    title: string | null;
    description: string | null;
    headline: string | null;
    supportUrl: string | null;
    websiteUrl: string | null;
    timezone: string;
    locale: string;
  };
  theme: {
    key: StatusPageTheme;
    appearance: Appearance;
    logoUrl: string | null;
  };
  seo: {
    indexing: boolean;
    indexIncidentArchive: boolean;
    indexIndividualIncidents: boolean;
  };
  display: {
    showUptimeHistory: boolean;
    showResponseTime: boolean;
    showIncidentHistory: boolean;
    showScheduledMaintenance: boolean;
    showComponentDescriptions: boolean;
    showSubscriberForm: boolean;
    poweredByVisible: boolean;
    uptimeHistoryDays: number;
  };
  overall: OverallState;
  groups: PublicComponentGroup[];
  ungrouped: PublicComponent[];
  activeIncidents: PublicIncident[];
  notices: PublicNotice[];
  activeMaintenance: PublicMaintenance[];
  upcomingMaintenance: PublicMaintenance[];
  recentIncidents: Array<{
    slug: string;
    title: string;
    severity: PublicIncident["severity"];
    startedAt: string;
    resolvedAt: string | null;
  }>;
  generatedAt: string;
  lastUpdatedAt: string;
}
