import "server-only";

import { serviceClient } from "@/lib/supabase/service";
import { PUBLIC_SNAPSHOT_SCHEMA_VERSION } from "./config";
import type {
  InternalOperationalState,
  OverallState,
  PublicComponentState,
} from "./constants";
import {
  computeComponentState,
  computeOverallState,
  type MappedMonitorState,
} from "./public-state";
import { renderSafeRichText } from "./sanitize";
import { getStatusPage, type StatusPageRecord } from "./status-pages";
import { listComponentGroups, listComponents } from "./components";
import type {
  PublicComponent,
  PublicComponentGroup,
  PublicDailyUptime,
  PublicIncident,
  PublicMaintenance,
  PublicNotice,
  PublicSnapshotData,
} from "./snapshot-types";

/**
 * Public-safe projection builder. Assembles the single materialized snapshot
 * the public renderer reads, from monitors, incidents, and maintenance. This
 * is the enforcement point for the public/private boundary: only allowlisted
 * fields leave the internal tables. Rebuildable at any time; never mutated in
 * place by the renderer.
 */

function dayKey(d: Date): string {
  return d.toISOString().slice(0, 10);
}

function worstFromFraction(fraction: number | null): PublicComponentState | "no_data" {
  if (fraction === null) return "no_data";
  if (fraction >= 0.9995) return "operational";
  if (fraction >= 0.99) return "degraded_performance";
  if (fraction >= 0.9) return "partial_outage";
  return "major_outage";
}

/** Load current internal operational state for a set of monitors. */
async function loadMonitorStates(
  organizationId: string,
  monitorIds: string[],
): Promise<Map<string, InternalOperationalState>> {
  const map = new Map<string, InternalOperationalState>();
  if (monitorIds.length === 0) return map;
  const db = serviceClient();
  const { data } = await db
    .from("monitor_operational_states")
    .select("monitor_id, state")
    .eq("organization_id", organizationId)
    .in("monitor_id", monitorIds);
  for (const row of data ?? []) {
    map.set(row.monitor_id, row.state as InternalOperationalState);
  }
  return map;
}

/** Daily uptime for a component from the centralized rollup RPC. */
async function componentDailyUptime(
  organizationId: string,
  monitorIds: string[],
  windowDays: number,
): Promise<{ fraction: number | null; days: PublicDailyUptime[]; avgMs: number | null }> {
  if (monitorIds.length === 0) {
    return { fraction: null, days: [], avgMs: null };
  }
  const db = serviceClient();
  const since = new Date(Date.now() - windowDays * 24 * 60 * 60 * 1000);
  const { data, error } = await db.rpc("status_page_component_uptime", {
    p_org: organizationId,
    p_monitor_ids: monitorIds,
    p_since: since.toISOString(),
  });
  if (error) throw error;

  const byDay = new Map<string, { passed: number; total: number; avg: number | null }>();
  let passedTotal = 0;
  let consideredTotal = 0;
  let weightedMs = 0;
  let weight = 0;
  for (const row of (data ?? []) as unknown as Array<{ day: string; passed: number; total: number; avg_ms: number | null }>) {
    const key = String(row.day).slice(0, 10);
    const passed = Number(row.passed ?? 0);
    const total = Number(row.total ?? 0);
    byDay.set(key, { passed, total, avg: row.avg_ms === null ? null : Number(row.avg_ms) });
    passedTotal += passed;
    consideredTotal += total;
    if (row.avg_ms !== null && passed > 0) {
      weightedMs += Number(row.avg_ms) * passed;
      weight += passed;
    }
  }

  const days: PublicDailyUptime[] = [];
  for (let i = windowDays - 1; i >= 0; i -= 1) {
    const d = new Date(Date.now() - i * 24 * 60 * 60 * 1000);
    const key = dayKey(d);
    const bucket = byDay.get(key);
    const fraction = bucket && bucket.total > 0 ? bucket.passed / bucket.total : null;
    days.push({ date: key, fraction, worst: worstFromFraction(fraction) });
  }

  const fraction = consideredTotal > 0 ? passedTotal / consideredTotal : null;
  const avgMs = weight > 0 ? Math.round(weightedMs / weight) : null;
  return { fraction, days, avgMs };
}

interface ComponentWork {
  slug: string;
  name: string;
  description: string | null;
  groupId: string | null;
  state: PublicComponentState;
  showUptime: boolean;
  showResponseTime: boolean;
  uptimeMonitorIds: string[];
}

/** Build the full public snapshot payload for a page. */
export async function buildSnapshotData(
  organizationId: string,
  statusPageId: string,
): Promise<{ data: PublicSnapshotData; overall: OverallState } | null> {
  const page = await getStatusPage(organizationId, statusPageId);
  if (!page) return null;

  const [groups, components] = await Promise.all([
    listComponentGroups(statusPageId),
    listComponents(statusPageId, { includeArchived: false }),
  ]);
  const visible = components.filter((c) => c.visibility === "visible");

  const allMonitorIds = [
    ...new Set(visible.flatMap((c) => c.monitors.map((m) => m.monitorId))),
  ];
  const states = await loadMonitorStates(organizationId, allMonitorIds);

  const now = Date.now();
  const work: ComponentWork[] = visible.map((c) => {
    const monitors: MappedMonitorState[] = c.monitors.map((m) => ({
      internalState: states.get(m.monitorId) ?? "unknown",
      isCritical: m.isCritical,
      hasData: states.has(m.monitorId),
    }));
    const manualActive =
      c.manualStatus != null &&
      (c.manualStatusUntil == null || new Date(c.manualStatusUntil).getTime() > now);
    const state = computeComponentState({
      mode: c.calculationMode,
      monitors,
      manualStatus: manualActive ? c.manualStatus : null,
    });
    return {
      slug: c.slug,
      name: c.name,
      description: page.showComponentDescriptions ? c.description : null,
      groupId: c.groupId,
      state,
      showUptime: c.showUptime && page.showUptimeHistory,
      showResponseTime: c.showResponseTime && page.showResponseTime,
      uptimeMonitorIds: c.monitors.filter((m) => m.includeInUptime).map((m) => m.monitorId),
    };
  });

  // Uptime is computed only for components that display it (bounded work).
  const uptimeByComponent = new Map<string, Awaited<ReturnType<typeof componentDailyUptime>>>();
  await Promise.all(
    work
      .filter((c) => c.showUptime)
      .map(async (c) => {
        uptimeByComponent.set(
          c.slug,
          await componentDailyUptime(organizationId, c.uptimeMonitorIds, page.uptimeHistoryDays),
        );
      }),
  );

  const toPublicComponent = (c: ComponentWork): PublicComponent => {
    const uptime = c.showUptime ? uptimeByComponent.get(c.slug) ?? null : null;
    return {
      slug: c.slug,
      name: c.name,
      description: c.description,
      state: c.state,
      showUptime: c.showUptime,
      uptime: uptime
        ? { windowDays: page.uptimeHistoryDays, fraction: uptime.fraction, days: uptime.days }
        : null,
      responseMs: c.showResponseTime ? (uptime?.avgMs ?? null) : null,
    };
  };

  const groupedComponents = new Map<string | null, PublicComponent[]>();
  for (const c of work) {
    const list = groupedComponents.get(c.groupId) ?? [];
    list.push(toPublicComponent(c));
    groupedComponents.set(c.groupId, list);
  }

  const publicGroups: PublicComponentGroup[] = groups
    .filter((g) => !g.isHidden)
    .map((g) => ({
      name: g.name,
      description: g.description,
      collapsedByDefault: g.collapsedByDefault,
      components: groupedComponents.get(g.id) ?? [],
    }))
    .filter((g) => g.components.length > 0);
  const ungrouped = groupedComponents.get(null) ?? [];

  const [incidents, maintenance, notices, recentIncidents] = await Promise.all([
    loadPublishedIncidents(organizationId, statusPageId),
    loadPublishedMaintenance(organizationId, statusPageId),
    loadPublishedNotices(statusPageId),
    loadRecentIncidents(organizationId, statusPageId, page),
  ]);

  const activeMaintenance = maintenance.filter((m) => m.state === "in_progress");
  const upcomingMaintenance = maintenance.filter((m) => m.state === "scheduled");

  const overall = computeOverallState({
    componentStates: work.map((c) => c.state),
    hasActiveMaintenance: activeMaintenance.length > 0,
  });

  const logoUrl = await loadLogoUrl(statusPageId, page.logoAssetId);

  const data: PublicSnapshotData = {
    schemaVersion: PUBLIC_SNAPSHOT_SCHEMA_VERSION,
    page: {
      name: page.name,
      title: page.title,
      description: page.description,
      headline: page.headline,
      supportUrl: page.supportUrl,
      websiteUrl: page.websiteUrl,
      timezone: page.timezone,
      locale: page.locale,
    },
    theme: { key: page.themeKey, appearance: page.appearance, logoUrl },
    seo: {
      indexing: page.searchIndexingEnabled && page.visibility === "public",
      indexIncidentArchive: page.indexIncidentArchive,
      indexIndividualIncidents: page.indexIndividualIncidents,
    },
    display: {
      showUptimeHistory: page.showUptimeHistory,
      showResponseTime: page.showResponseTime,
      showIncidentHistory: page.showIncidentHistory,
      showScheduledMaintenance: page.showScheduledMaintenance,
      showComponentDescriptions: page.showComponentDescriptions,
      showSubscriberForm: page.showSubscriberForm,
      poweredByVisible: page.poweredByVisible,
      uptimeHistoryDays: page.uptimeHistoryDays,
    },
    overall,
    groups: publicGroups,
    ungrouped,
    activeIncidents: incidents.filter((i) => i.status !== "resolved"),
    notices,
    activeMaintenance,
    upcomingMaintenance,
    recentIncidents,
    generatedAt: new Date().toISOString(),
    lastUpdatedAt: latestTimestamp(incidents, maintenance, notices) ?? new Date().toISOString(),
  };

  return { data, overall };
}

function latestTimestamp(
  incidents: PublicIncident[],
  maintenance: PublicMaintenance[],
  notices: PublicNotice[],
): string | null {
  const times: number[] = [];
  for (const i of incidents) {
    times.push(new Date(i.startedAt).getTime());
    for (const u of i.updates) times.push(new Date(u.publishedAt).getTime());
    if (i.resolvedAt) times.push(new Date(i.resolvedAt).getTime());
  }
  for (const m of maintenance) times.push(new Date(m.startsAt).getTime());
  for (const n of notices) times.push(new Date(n.startsAt).getTime());
  if (times.length === 0) return null;
  return new Date(Math.max(...times)).toISOString();
}

async function loadLogoUrl(statusPageId: string, logoAssetId: string | null): Promise<string | null> {
  if (!logoAssetId) return null;
  const db = serviceClient();
  const { data } = await db
    .from("status_page_brand_assets")
    .select("public_url")
    .eq("id", logoAssetId)
    .eq("status_page_id", statusPageId)
    .is("deleted_at", null)
    .maybeSingle();
  return data?.public_url ?? null;
}

/* ------------------------------------------------------------------ */
/* Incidents (allowlisted public content only)                         */
/* ------------------------------------------------------------------ */

async function componentNamesForMonitors(
  statusPageId: string,
  monitorIds: string[],
): Promise<string[]> {
  if (monitorIds.length === 0) return [];
  const db = serviceClient();
  const { data } = await db
    .from("status_page_component_monitors")
    .select("component:status_page_components(name, visibility, deleted_at)")
    .eq("status_page_id", statusPageId)
    .in("monitor_id", monitorIds);
  const names = new Set<string>();
  for (const row of data ?? []) {
    const c = row.component as { name: string; visibility: string; deleted_at: string | null } | null;
    if (c && c.visibility === "visible" && !c.deleted_at) names.add(c.name);
  }
  return [...names];
}

async function loadPublishedIncidents(
  organizationId: string,
  statusPageId: string,
): Promise<PublicIncident[]> {
  const db = serviceClient();
  const { data: links } = await db
    .from("status_page_incidents")
    .select("incident_id, public_slug")
    .eq("status_page_id", statusPageId)
    .eq("publication_state", "published");
  const rows = links ?? [];
  if (rows.length === 0) return [];

  const incidentIds = rows.map((r) => r.incident_id);
  const slugById = new Map(rows.map((r) => [r.incident_id, r.public_slug]));

  const { data: incidents } = await db
    .from("incidents")
    .select(
      "id, public_title, public_summary, severity, lifecycle_status, opened_at, resolved_at",
    )
    .eq("organization_id", organizationId)
    .in("id", incidentIds)
    .is("deleted_at", null);

  const result: PublicIncident[] = [];
  for (const inc of incidents ?? []) {
    const [updates, monitorRows] = await Promise.all([
      db
        .from("incident_updates")
        .select("update_type, body, created_at")
        .eq("incident_id", inc.id)
        .eq("visibility", "public_ready")
        .order("created_at", { ascending: true }),
      db
        .from("incident_monitors")
        .select("monitor_id")
        .eq("incident_id", inc.id)
        .is("removed_at", null),
    ]);

    const affected = await componentNamesForMonitors(
      statusPageId,
      (monitorRows.data ?? []).map((m) => m.monitor_id),
    );

    const publicUpdates = (updates.data ?? []).map((u) => ({
      type: u.update_type as PublicIncident["updates"][number]["type"],
      bodyHtml: renderSafeRichText(u.body, 4000),
      publishedAt: u.created_at,
    }));

    const lastType = publicUpdates.at(-1)?.type;
    const status: PublicIncident["status"] =
      inc.lifecycle_status === "resolved"
        ? "resolved"
        : lastType === "identified" || lastType === "monitoring" || lastType === "resolved"
          ? lastType
          : "investigating";

    result.push({
      slug: slugById.get(inc.id) ?? inc.id,
      title: inc.public_title ?? "Service disruption",
      summaryHtml: inc.public_summary ? renderSafeRichText(inc.public_summary, 2000) : null,
      status,
      severity: (inc.severity as PublicIncident["severity"]) ?? null,
      affectedComponents: affected,
      startedAt: inc.opened_at,
      resolvedAt: inc.resolved_at,
      updates: publicUpdates,
    });
  }
  // Newest first for the active list.
  result.sort((a, b) => new Date(b.startedAt).getTime() - new Date(a.startedAt).getTime());
  return result;
}

async function loadRecentIncidents(
  organizationId: string,
  statusPageId: string,
  page: StatusPageRecord,
): Promise<PublicSnapshotData["recentIncidents"]> {
  if (!page.showIncidentHistory) return [];
  const db = serviceClient();
  const { data: links } = await db
    .from("status_page_incidents")
    .select("incident_id, public_slug")
    .eq("status_page_id", statusPageId)
    .eq("publication_state", "published");
  const rows = links ?? [];
  if (rows.length === 0) return [];
  const slugById = new Map(rows.map((r) => [r.incident_id, r.public_slug]));
  const { data: incidents } = await db
    .from("incidents")
    .select("id, public_title, severity, opened_at, resolved_at, lifecycle_status")
    .eq("organization_id", organizationId)
    .in("id", rows.map((r) => r.incident_id))
    .eq("lifecycle_status", "resolved")
    .is("deleted_at", null)
    .order("opened_at", { ascending: false })
    .limit(10);
  return (incidents ?? []).map((inc) => ({
    slug: slugById.get(inc.id) ?? inc.id,
    title: inc.public_title ?? "Service disruption",
    severity: (inc.severity as PublicIncident["severity"]) ?? null,
    startedAt: inc.opened_at,
    resolvedAt: inc.resolved_at,
  }));
}

/* ------------------------------------------------------------------ */
/* Maintenance                                                         */
/* ------------------------------------------------------------------ */

async function loadPublishedMaintenance(
  organizationId: string,
  statusPageId: string,
): Promise<PublicMaintenance[]> {
  const db = serviceClient();
  const { data: links } = await db
    .from("status_page_maintenance")
    .select("maintenance_window_id, public_slug")
    .eq("status_page_id", statusPageId)
    .eq("publication_state", "published");
  const rows = links ?? [];
  if (rows.length === 0) return [];
  const slugById = new Map(rows.map((r) => [r.maintenance_window_id, r.public_slug]));

  const { data: windows } = await db
    .from("maintenance_windows")
    .select("id, name, public_summary, timezone, starts_at, ends_at, status")
    .eq("organization_id", organizationId)
    .in("id", rows.map((r) => r.maintenance_window_id))
    .neq("status", "canceled");

  const result: PublicMaintenance[] = [];
  for (const w of windows ?? []) {
    const { data: monitorRows } = await db
      .from("maintenance_monitor_links")
      .select("monitor_id")
      .eq("maintenance_window_id", w.id);
    const affected = await componentNamesForMonitors(
      statusPageId,
      (monitorRows ?? []).map((m) => m.monitor_id),
    );
    const state: PublicMaintenance["state"] =
      w.status === "active" ? "in_progress" : w.status === "completed" ? "completed" : "scheduled";
    result.push({
      slug: slugById.get(w.id) ?? w.id,
      title: w.name,
      summaryHtml: w.public_summary ? renderSafeRichText(w.public_summary, 2000) : null,
      state,
      startsAt: w.starts_at,
      endsAt: w.ends_at,
      timezone: w.timezone,
      affectedComponents: affected,
    });
  }
  result.sort((a, b) => new Date(a.startsAt).getTime() - new Date(b.startsAt).getTime());
  return result;
}

async function loadPublishedNotices(statusPageId: string): Promise<PublicNotice[]> {
  const db = serviceClient();
  const nowIso = new Date().toISOString();
  const { data } = await db
    .from("status_page_manual_messages")
    .select("public_slug, title, body, notice_type, starts_at, ends_at")
    .eq("status_page_id", statusPageId)
    .eq("publication_state", "published")
    .lte("starts_at", nowIso)
    .or(`ends_at.is.null,ends_at.gte.${nowIso}`)
    .order("starts_at", { ascending: false })
    .limit(10);
  return (data ?? []).map((n) => ({
    slug: n.public_slug,
    title: n.title,
    bodyHtml: renderSafeRichText(n.body, 4000),
    type: n.notice_type as PublicNotice["type"],
    startsAt: n.starts_at,
    endsAt: n.ends_at,
  }));
}

/* ------------------------------------------------------------------ */
/* Snapshot write + read                                               */
/* ------------------------------------------------------------------ */

/**
 * Rebuild and persist the public snapshot for a page. This is the cache
 * invalidation primitive: any change that affects public state calls it.
 */
export async function refreshSnapshot(
  organizationId: string,
  statusPageId: string,
): Promise<OverallState | null> {
  const built = await buildSnapshotData(organizationId, statusPageId);
  if (!built) return null;
  const page = await getStatusPage(organizationId, statusPageId);
  if (!page) return null;

  const db = serviceClient();
  const content = JSON.stringify(built.data);
  await db.from("status_page_public_snapshots").upsert(
    {
      status_page_id: statusPageId,
      organization_id: organizationId,
      slug: page.slug,
      version_id: page.publishedVersionId,
      visibility: page.visibility,
      overall_status: built.overall,
      data: built.data as never,
      content_hash: simpleHash(content),
      generated_at: new Date().toISOString(),
      source_refreshed_at: new Date().toISOString(),
      published_at: page.publishedAt,
    },
    { onConflict: "status_page_id" },
  );
  return built.overall;
}

/** Remove the public snapshot (unpublish). Nothing renders afterward. */
export async function removeSnapshot(statusPageId: string): Promise<void> {
  const db = serviceClient();
  await db.from("status_page_public_snapshots").delete().eq("status_page_id", statusPageId);
}

export interface PublicSnapshot {
  statusPageId: string;
  organizationId: string;
  slug: string;
  visibility: string;
  overallStatus: OverallState;
  data: PublicSnapshotData;
  generatedAt: string;
  publishedAt: string | null;
}

/**
 * Read the public snapshot by slug for the anonymous renderer. Uses the service
 * role and reads ONLY the snapshot table, never the authenticated internal
 * tables. Returns null when the page is not published.
 */
export async function getPublicSnapshotBySlug(slug: string): Promise<PublicSnapshot | null> {
  const db = serviceClient();
  const { data } = await db
    .from("status_page_public_snapshots")
    .select("status_page_id, organization_id, slug, visibility, overall_status, data, generated_at, published_at")
    .eq("slug", slug)
    .maybeSingle();
  if (!data) return null;
  return {
    statusPageId: data.status_page_id,
    organizationId: data.organization_id,
    slug: data.slug,
    visibility: data.visibility,
    overallStatus: data.overall_status as OverallState,
    data: data.data as unknown as PublicSnapshotData,
    generatedAt: data.generated_at,
    publishedAt: data.published_at,
  };
}

/**
 * Full published incident list for the archive and incident-detail routes.
 * Reuses the same allowlisted builder as the live page, so nothing internal
 * leaks. Newest first; resolved and active alike.
 */
export async function listAllPublishedIncidents(
  organizationId: string,
  statusPageId: string,
): Promise<PublicIncident[]> {
  return loadPublishedIncidents(organizationId, statusPageId);
}

export async function getPublishedIncidentBySlug(
  organizationId: string,
  statusPageId: string,
  incidentSlug: string,
): Promise<PublicIncident | null> {
  const all = await loadPublishedIncidents(organizationId, statusPageId);
  return all.find((i) => i.slug === incidentSlug) ?? null;
}

/**
 * Resolve a verified, active custom domain to a published snapshot for the
 * anonymous renderer. Only domains that are verified with active TLS route to a
 * page; anything pending or failed returns null so we never serve over an
 * unverified host. Reads only the snapshot + domain tables with the service role.
 */
export async function getPublicSnapshotByDomain(domain: string): Promise<PublicSnapshot | null> {
  const db = serviceClient();
  const normalized = domain.trim().toLowerCase();
  const { data: mapping } = await db
    .from("status_page_domains")
    .select("status_page_id, verification_status, tls_status")
    .eq("domain", normalized)
    .is("removed_at", null)
    .maybeSingle();
  if (!mapping) return null;
  if (mapping.verification_status !== "verified") return null;
  if (mapping.tls_status !== "active") return null;

  const { data } = await db
    .from("status_page_public_snapshots")
    .select("status_page_id, organization_id, slug, visibility, overall_status, data, generated_at, published_at")
    .eq("status_page_id", mapping.status_page_id)
    .maybeSingle();
  if (!data) return null;
  return {
    statusPageId: data.status_page_id,
    organizationId: data.organization_id,
    slug: data.slug,
    visibility: data.visibility,
    overallStatus: data.overall_status as OverallState,
    data: data.data as unknown as PublicSnapshotData,
    generatedAt: data.generated_at,
    publishedAt: data.published_at,
  };
}

function simpleHash(input: string): string {
  let h = 5381;
  for (let i = 0; i < input.length; i += 1) {
    h = (h * 33) ^ input.charCodeAt(i);
  }
  return (h >>> 0).toString(16);
}
