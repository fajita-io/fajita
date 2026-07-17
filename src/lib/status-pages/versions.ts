import "server-only";

import { serviceClient } from "@/lib/supabase/service";
import { getStatusPage } from "./status-pages";
import { listComponentGroups, listComponents } from "./components";

/**
 * Status-page versioning. Publishing snapshots the full public-facing
 * configuration into an immutable version. Secrets (page password, private-link
 * token) are never included in a version snapshot. The active published version
 * is never mutated in place; rollback creates a new version from an old one.
 */

export interface VersionSnapshot {
  page: Record<string, unknown>;
  groups: Record<string, unknown>[];
  components: Record<string, unknown>[];
  createdAt: string;
}

export interface VersionRecord {
  id: string;
  versionNumber: number;
  contentHash: string | null;
  createdAt: string;
  createdByName: string | null;
}

/** Build an immutable snapshot of the current configuration (no secrets). */
export async function buildVersionSnapshot(
  organizationId: string,
  statusPageId: string,
): Promise<VersionSnapshot> {
  const [page, groups, components] = await Promise.all([
    getStatusPage(organizationId, statusPageId),
    listComponentGroups(statusPageId),
    listComponents(statusPageId, { includeArchived: true }),
  ]);
  if (!page) throw new Error("Status page not found");

  return {
    page: {
      name: page.name,
      slug: page.slug,
      title: page.title,
      description: page.description,
      headline: page.headline,
      supportUrl: page.supportUrl,
      websiteUrl: page.websiteUrl,
      timezone: page.timezone,
      locale: page.locale,
      themeKey: page.themeKey,
      appearance: page.appearance,
      logoAssetId: page.logoAssetId,
      faviconAssetId: page.faviconAssetId,
      visibility: page.visibility,
      showUptimeHistory: page.showUptimeHistory,
      showResponseTime: page.showResponseTime,
      showIncidentHistory: page.showIncidentHistory,
      showScheduledMaintenance: page.showScheduledMaintenance,
      showComponentDescriptions: page.showComponentDescriptions,
      showSubscriberForm: page.showSubscriberForm,
      poweredByVisible: page.poweredByVisible,
      searchIndexingEnabled: page.searchIndexingEnabled,
      indexIncidentArchive: page.indexIncidentArchive,
      indexIndividualIncidents: page.indexIndividualIncidents,
      incidentHistoryWindow: page.incidentHistoryWindow,
      uptimeHistoryDays: page.uptimeHistoryDays,
      autoPublishIncidents: page.autoPublishIncidents,
      publicStateDelaySeconds: page.publicStateDelaySeconds,
    },
    groups: groups.map((g) => ({ ...g })),
    components: components.map((c) => ({
      slug: c.slug,
      name: c.name,
      description: c.description,
      groupId: c.groupId,
      position: c.position,
      calculationMode: c.calculationMode,
      visibility: c.visibility,
      showUptime: c.showUptime,
      showResponseTime: c.showResponseTime,
      isArchived: c.isArchived,
      monitors: c.monitors.map((m) => ({
        monitorId: m.monitorId,
        isCritical: m.isCritical,
        isPrimary: m.isPrimary,
        includeInUptime: m.includeInUptime,
      })),
    })),
    createdAt: new Date().toISOString(),
  };
}

function hashSnapshot(snapshot: VersionSnapshot): string {
  const s = JSON.stringify(snapshot);
  let h = 5381;
  for (let i = 0; i < s.length; i += 1) h = (h * 33) ^ s.charCodeAt(i);
  return (h >>> 0).toString(16);
}

export async function createVersion(input: {
  organizationId: string;
  statusPageId: string;
  actorProfileId: string;
  snapshot?: VersionSnapshot;
}): Promise<{ id: string; versionNumber: number }> {
  const db = serviceClient();
  const snapshot = input.snapshot ?? (await buildVersionSnapshot(input.organizationId, input.statusPageId));

  const { data: last } = await db
    .from("status_page_versions")
    .select("version_number")
    .eq("status_page_id", input.statusPageId)
    .order("version_number", { ascending: false })
    .limit(1)
    .maybeSingle();
  const versionNumber = (last?.version_number ?? 0) + 1;

  const { data, error } = await db
    .from("status_page_versions")
    .insert({
      status_page_id: input.statusPageId,
      organization_id: input.organizationId,
      version_number: versionNumber,
      snapshot: snapshot as never,
      content_hash: hashSnapshot(snapshot),
      created_by_user_id: input.actorProfileId,
    })
    .select("id, version_number")
    .single();
  if (error) throw error;
  return { id: data.id, versionNumber: data.version_number };
}

export async function listVersions(
  organizationId: string,
  statusPageId: string,
): Promise<VersionRecord[]> {
  const db = serviceClient();
  const { data } = await db
    .from("status_page_versions")
    .select("id, version_number, content_hash, created_at, created_by_user_id")
    .eq("organization_id", organizationId)
    .eq("status_page_id", statusPageId)
    .order("version_number", { ascending: false });
  const rows = data ?? [];
  const actorIds = [...new Set(rows.map((r) => r.created_by_user_id).filter(Boolean))] as string[];
  const names = new Map<string, string>();
  if (actorIds.length > 0) {
    const { data: profiles } = await db
      .from("user_profiles")
      .select("id, display_name")
      .in("id", actorIds);
    for (const p of profiles ?? []) if (p.display_name) names.set(p.id, p.display_name);
  }
  return rows.map((r) => ({
    id: r.id,
    versionNumber: r.version_number,
    contentHash: r.content_hash,
    createdAt: r.created_at,
    createdByName: r.created_by_user_id ? (names.get(r.created_by_user_id) ?? null) : null,
  }));
}

export async function getVersion(
  organizationId: string,
  statusPageId: string,
  versionId: string,
): Promise<{ id: string; versionNumber: number; snapshot: VersionSnapshot } | null> {
  const db = serviceClient();
  const { data } = await db
    .from("status_page_versions")
    .select("id, version_number, snapshot")
    .eq("organization_id", organizationId)
    .eq("status_page_id", statusPageId)
    .eq("id", versionId)
    .maybeSingle();
  if (!data) return null;
  return {
    id: data.id,
    versionNumber: data.version_number,
    snapshot: data.snapshot as unknown as VersionSnapshot,
  };
}
