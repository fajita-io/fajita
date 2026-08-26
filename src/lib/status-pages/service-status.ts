import "server-only";

import { appUrl } from "@/lib/env";
import { DEFAULT_APPEARANCE } from "@/lib/status-pages/appearance";
import { PUBLIC_SNAPSHOT_SCHEMA_VERSION } from "@/lib/status-pages/config";
import type { OverallState } from "@/lib/status-pages/constants";
import { getPublicSnapshotBySlug } from "@/lib/status-pages/projection";
import type { PublicSnapshotData } from "@/lib/status-pages/snapshot-types";
import { componentSlug } from "@/lib/status-pages/slug";

import {
  FAJITA_COMPONENT_HEALTH_PATHS,
  FAJITA_STATUS_COMPONENTS,
} from "./self-monitoring";

export interface FajitaServiceStatus {
  source: "snapshot" | "fallback";
  subscribeSlug?: string;
  statusPageId?: string;
  organizationId?: string;
  slug?: string;
  data: PublicSnapshotData;
  generatedAt: string;
  overallStatus: OverallState;
}

function serviceStatusSlug(): string | null {
  const raw = process.env.FAJITA_SERVICE_STATUS_SLUG?.trim();
  return raw || null;
}

async function probePath(path: string): Promise<boolean> {
  try {
    const res = await fetch(`${appUrl}${path}`, {
      cache: "no-store",
      signal: AbortSignal.timeout(4_000),
      redirect: "follow",
    });
    if (!res.ok) return false;
    if (path === "/api/health") {
      const body = (await res.json()) as { ok?: boolean };
      return body.ok === true;
    }
    return true;
  } catch {
    return false;
  }
}

async function probeMonitoredComponents(): Promise<Map<string, boolean>> {
  const probed = FAJITA_STATUS_COMPONENTS.filter(
    (item) => FAJITA_COMPONENT_HEALTH_PATHS[item.key],
  );

  const results = await Promise.all(
    probed.map(async (item) => {
      const path = FAJITA_COMPONENT_HEALTH_PATHS[item.key]!;
      const healthy = await probePath(path);
      return [item.key, healthy] as const;
    }),
  );

  return new Map(results);
}

function computeOverallFromProbes(probes: Map<string, boolean>): OverallState {
  const values = [...probes.values()];
  if (values.length === 0) return "partial_outage";
  if (values.every(Boolean)) return "operational";
  if (values.every((v) => !v)) return "major_outage";
  return "partial_outage";
}

function buildFallbackServiceStatus(
  probes: Map<string, boolean>,
  generatedAt: string,
): FajitaServiceStatus {
  const overall = computeOverallFromProbes(probes);
  const monitored = FAJITA_STATUS_COMPONENTS.filter(
    (item) => probes.has(item.key),
  );

  return {
    source: "fallback",
    data: {
      schemaVersion: PUBLIC_SNAPSHOT_SCHEMA_VERSION,
      page: {
        name: "Fajita",
        title: "Fajita Service Status",
        description:
          "Current availability for Fajita's production services. Each component is checked against its production health path.",
        headline: "All systems, accounted for.",
        supportUrl: `${appUrl}/contact?topic=support`,
        websiteUrl: appUrl,
        timezone: "America/Denver",
        locale: "en",
      },
      theme: {
        key: "signal",
        appearance: DEFAULT_APPEARANCE,
        logoUrl: null,
      },
      seo: {
        indexing: true,
        indexIncidentArchive: true,
        indexIndividualIncidents: false,
      },
      display: {
        showUptimeHistory: false,
        showResponseTime: false,
        showIncidentHistory: true,
        showScheduledMaintenance: true,
        showComponentDescriptions: true,
        showSubscriberForm: false,
        poweredByVisible: false,
        uptimeHistoryDays: 90,
      },
      overall,
      groups: [
        {
          name: "Platform",
          description: null,
          collapsedByDefault: false,
          components: monitored.map((item) => {
            const healthy = probes.get(item.key) ?? false;
            return {
              slug: componentSlug(item.key),
              name: item.name,
              description: item.description,
              state: healthy ? ("operational" as const) : ("partial_outage" as const),
              showUptime: false,
              uptime: null,
              responseMs: null,
            };
          }),
        },
      ],
      ungrouped: [],
      activeIncidents: [],
      notices:
        overall === "operational"
          ? [
              {
                slug: "self-monitoring",
                title: "Fajita monitors its own production services, too.",
                bodyHtml:
                  "<p>Component health on this page reflects live production health paths. Uptime history and incident timelines accumulate as monitoring runs.</p>",
                type: "notice" as const,
                startsAt: generatedAt,
                endsAt: null,
              },
            ]
          : [
              {
                slug: "web-degraded",
                title: "One or more health checks are failing",
                bodyHtml:
                  '<p>At least one production health path did not respond normally. If you cannot reach Fajita, <a href="/contact?topic=support">contact support</a>.</p>',
                type: "investigating" as const,
                startsAt: generatedAt,
                endsAt: null,
              },
            ],
      activeMaintenance: [],
      upcomingMaintenance: [],
      recentIncidents: [],
      generatedAt,
      lastUpdatedAt: generatedAt,
    },
    generatedAt,
    overallStatus: overall,
  };
}

/**
 * Load Fajita's public service status for fajita.io/status. Uses the published
 * status-page snapshot when FAJITA_SERVICE_STATUS_SLUG is set and the page is
 * public; otherwise returns an honest fallback built from production health paths.
 */
export async function loadFajitaServiceStatus(): Promise<FajitaServiceStatus> {
  const slug = serviceStatusSlug();
  if (slug) {
    const snapshot = await getPublicSnapshotBySlug(slug);
    if (snapshot && snapshot.visibility === "public") {
      return {
        source: "snapshot",
        subscribeSlug: slug,
        statusPageId: snapshot.statusPageId,
        organizationId: snapshot.organizationId,
        slug,
        data: snapshot.data,
        generatedAt: snapshot.generatedAt,
        overallStatus: snapshot.overallStatus,
      };
    }
  }

  const generatedAt = new Date().toISOString();
  const probes = await probeMonitoredComponents();
  return buildFallbackServiceStatus(probes, generatedAt);
}
