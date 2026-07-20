import "server-only";

import { appUrl } from "@/lib/env";
import { DEFAULT_APPEARANCE } from "@/lib/status-pages/appearance";
import { PUBLIC_SNAPSHOT_SCHEMA_VERSION } from "@/lib/status-pages/config";
import type { OverallState } from "@/lib/status-pages/constants";
import { getPublicSnapshotBySlug } from "@/lib/status-pages/projection";
import type { PublicSnapshotData } from "@/lib/status-pages/snapshot-types";
import { componentSlug } from "@/lib/status-pages/slug";

import { FAJITA_STATUS_COMPONENTS } from "./self-monitoring";

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

async function probeWebHealth(): Promise<boolean> {
  try {
    const res = await fetch(`${appUrl}/api/health`, {
      cache: "no-store",
      signal: AbortSignal.timeout(4_000),
    });
    if (!res.ok) return false;
    const body = (await res.json()) as { ok?: boolean };
    return body.ok === true;
  } catch {
    return false;
  }
}

function buildFallbackServiceStatus(webHealthy: boolean): FajitaServiceStatus {
  const now = new Date().toISOString();
  const overall: OverallState = webHealthy ? "operational" : "partial_outage";

  return {
    source: "fallback",
    data: {
      schemaVersion: PUBLIC_SNAPSHOT_SCHEMA_VERSION,
      page: {
        name: "Fajita",
        title: "Fajita Service Status",
        description:
          "Current status of Fajita services: website, application, monitoring, alerts, status pages, billing, and support.",
        headline: null,
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
        showIncidentHistory: false,
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
          components: FAJITA_STATUS_COMPONENTS.map((item) => ({
            slug: componentSlug(item.key),
            name: item.name,
            description: item.description,
            state:
              item.key === "website" && !webHealthy
                ? ("partial_outage" as const)
                : ("operational" as const),
            showUptime: false,
            uptime: null,
            responseMs: null,
          })),
        },
      ],
      ungrouped: [],
      activeIncidents: [],
      notices: webHealthy
        ? [
            {
              slug: "monitoring-rollout",
              title: "Monitoring is expanding",
              bodyHtml:
                "<p>Component uptime history and incident timelines appear here as self-monitors go live. Website availability reflects this page and our health endpoint.</p>",
              type: "notice" as const,
              startsAt: now,
              endsAt: null,
            },
          ]
        : [
            {
              slug: "web-degraded",
              title: "Website health check failing",
              bodyHtml:
                "<p>Our public health endpoint did not respond normally. If you cannot reach Fajita, <a href=\"/contact?topic=support\">contact support</a>.</p>",
              type: "investigating" as const,
              startsAt: now,
              endsAt: null,
            },
          ],
      activeMaintenance: [],
      upcomingMaintenance: [],
      recentIncidents: [],
      generatedAt: now,
      lastUpdatedAt: now,
    },
    generatedAt: now,
    overallStatus: overall,
  };
}

/**
 * Load Fajita's public service status for fajita.io/status. Uses the published
 * status-page snapshot when FAJITA_SERVICE_STATUS_SLUG is set and the page is
 * public; otherwise returns an honest fallback built from platform definitions.
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

  const webHealthy = await probeWebHealth();
  return buildFallbackServiceStatus(webHealthy);
}
