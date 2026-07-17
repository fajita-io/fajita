import "server-only";

import { serviceClient } from "@/lib/supabase/service";
import type { Database } from "@/lib/supabase/types";
import type {
  AutoPublishMode,
  IncidentHistoryWindow,
  StatusPageStatus,
  StatusPageTheme,
  StatusPageVisibility,
} from "./constants";
import { coerceAppearance, type Appearance } from "./appearance";

/**
 * Status-page record data layer. Organization-scoped; callers must have
 * verified the relevant status_pages permission before mutating. All writes
 * go through the service role (RLS forbids customer writes). No secrets are
 * ever returned to the client from these shapes.
 */

type StatusPageRow = Database["public"]["Tables"]["status_pages"]["Row"];
type StatusPageUpdate = Database["public"]["Tables"]["status_pages"]["Update"];

export interface StatusPageRecord {
  id: string;
  organizationId: string;
  name: string;
  slug: string;
  status: StatusPageStatus;
  visibility: StatusPageVisibility;
  title: string | null;
  description: string | null;
  headline: string | null;
  supportUrl: string | null;
  websiteUrl: string | null;
  timezone: string;
  locale: string;
  themeKey: StatusPageTheme;
  appearance: Appearance;
  logoAssetId: string | null;
  faviconAssetId: string | null;
  showUptimeHistory: boolean;
  showResponseTime: boolean;
  showIncidentHistory: boolean;
  showScheduledMaintenance: boolean;
  showComponentDescriptions: boolean;
  showSubscriberForm: boolean;
  poweredByVisible: boolean;
  searchIndexingEnabled: boolean;
  indexIncidentArchive: boolean;
  indexIndividualIncidents: boolean;
  incidentHistoryWindow: IncidentHistoryWindow;
  uptimeHistoryDays: number;
  autoPublishIncidents: AutoPublishMode;
  publicStateDelaySeconds: number;
  hasPassword: boolean;
  hasPrivateLink: boolean;
  publishedVersionId: string | null;
  draftVersionId: string | null;
  primaryDomainId: string | null;
  publishedAt: string | null;
  createdAt: string;
  updatedAt: string;
}

function toRecord(row: StatusPageRow): StatusPageRecord {
  return {
    id: row.id,
    organizationId: row.organization_id,
    name: row.name,
    slug: row.slug,
    status: row.status as StatusPageStatus,
    visibility: row.visibility as StatusPageVisibility,
    title: row.title,
    description: row.description,
    headline: row.headline,
    supportUrl: row.support_url,
    websiteUrl: row.website_url,
    timezone: row.timezone,
    locale: row.locale,
    themeKey: row.theme_key as StatusPageTheme,
    appearance: coerceAppearance(row.appearance),
    logoAssetId: row.logo_asset_id,
    faviconAssetId: row.favicon_asset_id,
    showUptimeHistory: row.show_uptime_history,
    showResponseTime: row.show_response_time,
    showIncidentHistory: row.show_incident_history,
    showScheduledMaintenance: row.show_scheduled_maintenance,
    showComponentDescriptions: row.show_component_descriptions,
    showSubscriberForm: row.show_subscriber_form,
    poweredByVisible: row.powered_by_visible,
    searchIndexingEnabled: row.search_indexing_enabled,
    indexIncidentArchive: row.index_incident_archive,
    indexIndividualIncidents: row.index_individual_incidents,
    incidentHistoryWindow: row.incident_history_window as IncidentHistoryWindow,
    uptimeHistoryDays: row.uptime_history_days,
    autoPublishIncidents: row.auto_publish_incidents as AutoPublishMode,
    publicStateDelaySeconds: row.public_state_delay_seconds,
    hasPassword: row.password_hash != null,
    hasPrivateLink: row.private_link_token_hash != null,
    publishedVersionId: row.published_version_id,
    draftVersionId: row.draft_version_id,
    primaryDomainId: row.primary_domain_id,
    publishedAt: row.published_at,
    createdAt: row.created_at,
    updatedAt: row.updated_at,
  };
}

/** Is a slug available across the whole platform (case-insensitive)? */
export async function isSlugAvailable(slug: string): Promise<boolean> {
  const db = serviceClient();
  const { data } = await db
    .from("status_pages")
    .select("id")
    .eq("slug", slug)
    .is("deleted_at", null)
    .maybeSingle();
  return !data;
}

export async function createStatusPage(input: {
  organizationId: string;
  actorProfileId: string;
  name: string;
  slug: string;
  timezone: string;
}): Promise<string> {
  const db = serviceClient();
  const { data, error } = await db
    .from("status_pages")
    .insert({
      organization_id: input.organizationId,
      name: input.name,
      slug: input.slug,
      timezone: input.timezone,
      status: "draft",
      created_by_user_id: input.actorProfileId,
      updated_by_user_id: input.actorProfileId,
    })
    .select("id")
    .single();
  if (error) throw error;

  // Materialize the hosted-subdomain domain row (verified: we own the zone).
  await db.from("status_page_domains").insert({
    status_page_id: data.id,
    organization_id: input.organizationId,
    domain: input.slug,
    kind: "hosted_subdomain",
    is_primary: true,
    verification_status: "verified",
    tls_status: "active",
    verified_at: new Date().toISOString(),
    tls_activated_at: new Date().toISOString(),
    created_by_user_id: input.actorProfileId,
  });

  return data.id;
}

export async function getStatusPage(
  organizationId: string,
  statusPageId: string,
): Promise<StatusPageRecord | null> {
  const db = serviceClient();
  const { data, error } = await db
    .from("status_pages")
    .select("*")
    .eq("organization_id", organizationId)
    .eq("id", statusPageId)
    .is("deleted_at", null)
    .maybeSingle();
  if (error) throw error;
  return data ? toRecord(data) : null;
}

/** Public lookup by slug used by the projection builder (any org). */
export async function getStatusPageBySlug(
  slug: string,
): Promise<StatusPageRecord | null> {
  const db = serviceClient();
  const { data, error } = await db
    .from("status_pages")
    .select("*")
    .eq("slug", slug)
    .is("deleted_at", null)
    .maybeSingle();
  if (error) throw error;
  return data ? toRecord(data) : null;
}

export interface StatusPageListItem {
  id: string;
  name: string;
  slug: string;
  status: StatusPageStatus;
  visibility: StatusPageVisibility;
  publishedAt: string | null;
  updatedAt: string;
  componentCount: number;
  overallStatus: string | null;
  primaryDomain: string | null;
  primaryDomainVerified: boolean;
  tlsActive: boolean;
}

export async function listStatusPages(
  organizationId: string,
): Promise<StatusPageListItem[]> {
  const db = serviceClient();
  const { data, error } = await db
    .from("status_pages")
    .select(
      "id, name, slug, status, visibility, published_at, updated_at, primary_domain_id, components:status_page_components(count)",
    )
    .eq("organization_id", organizationId)
    .is("deleted_at", null)
    .order("created_at", { ascending: false });
  if (error) throw error;

  const rows = data ?? [];
  const ids = rows.map((r) => r.id);
  const snapshots = await loadSnapshotStatuses(ids);
  const domains = await loadPrimaryDomains(rows.map((r) => ({ id: r.id, primary: r.primary_domain_id })));

  return rows.map((r) => {
    const comp = (r.components as { count: number }[] | null)?.[0]?.count ?? 0;
    const dom = domains.get(r.id) ?? null;
    return {
      id: r.id,
      name: r.name,
      slug: r.slug,
      status: r.status as StatusPageStatus,
      visibility: r.visibility as StatusPageVisibility,
      publishedAt: r.published_at,
      updatedAt: r.updated_at,
      componentCount: comp,
      overallStatus: snapshots.get(r.id) ?? null,
      primaryDomain: dom?.domain ?? null,
      primaryDomainVerified: dom?.verified ?? false,
      tlsActive: dom?.tlsActive ?? false,
    };
  });
}

async function loadSnapshotStatuses(ids: string[]): Promise<Map<string, string>> {
  const map = new Map<string, string>();
  if (ids.length === 0) return map;
  const db = serviceClient();
  const { data } = await db
    .from("status_page_public_snapshots")
    .select("status_page_id, overall_status")
    .in("status_page_id", ids);
  for (const row of data ?? []) map.set(row.status_page_id, row.overall_status);
  return map;
}

async function loadPrimaryDomains(
  pages: { id: string; primary: string | null }[],
): Promise<Map<string, { domain: string; verified: boolean; tlsActive: boolean }>> {
  const map = new Map<string, { domain: string; verified: boolean; tlsActive: boolean }>();
  const primaryIds = pages.map((p) => p.primary).filter(Boolean) as string[];
  if (primaryIds.length === 0) return map;
  const db = serviceClient();
  const { data } = await db
    .from("status_page_domains")
    .select("id, status_page_id, domain, verification_status, tls_status")
    .in("id", primaryIds);
  for (const d of data ?? []) {
    map.set(d.status_page_id, {
      domain: d.domain,
      verified: d.verification_status === "verified",
      tlsActive: d.tls_status === "active",
    });
  }
  return map;
}

export interface StatusPageOverview {
  publishedCount: number;
  draftCount: number;
  activePublicIncidents: number;
  upcomingMaintenance: number;
  domainsNeedingAttention: number;
  tlsIssues: number;
  pagesNeedingPublication: number;
  componentsWithoutMonitor: number;
}

/**
 * Truthful org-level status-page metrics for the app overview. All counts are
 * derived from real records: no subscriber counts, no view counts, nothing
 * fabricated. Bounded queries, safe to call on the overview page.
 */
export async function getStatusPageOverview(
  organizationId: string,
): Promise<StatusPageOverview> {
  const db = serviceClient();

  const { data: pages } = await db
    .from("status_pages")
    .select("id, status, draft_version_id, published_version_id")
    .eq("organization_id", organizationId)
    .is("deleted_at", null);
  const rows = pages ?? [];
  const pageIds = rows.map((r) => r.id);

  const publishedCount = rows.filter((r) => r.status === "published").length;
  const draftCount = rows.filter((r) => r.status === "draft" || r.status === "unpublished").length;
  // A published page whose draft has diverged from the live version needs a republish.
  const pagesNeedingPublication = rows.filter(
    (r) =>
      r.status === "published" &&
      r.draft_version_id != null &&
      r.draft_version_id !== r.published_version_id,
  ).length;

  let activePublicIncidents = 0;
  let upcomingMaintenance = 0;
  let domainsNeedingAttention = 0;
  let tlsIssues = 0;
  let componentsWithoutMonitor = 0;

  if (pageIds.length > 0) {
    const [incidents, maintenance, domains, components] = await Promise.all([
      db
        .from("status_page_incidents")
        .select("incident_id, publication_state, incident:incidents(lifecycle_status)")
        .in("status_page_id", pageIds)
        .eq("publication_state", "published"),
      db
        .from("status_page_maintenance")
        .select("maintenance_window_id, publication_state, window:maintenance_windows(status)")
        .in("status_page_id", pageIds)
        .eq("publication_state", "published"),
      db
        .from("status_page_domains")
        .select("id, kind, verification_status, tls_status")
        .in("status_page_id", pageIds)
        .is("removed_at", null),
      db
        .from("status_page_components")
        .select("id, monitors:status_page_component_monitors(count)")
        .in("status_page_id", pageIds)
        .is("deleted_at", null)
        .eq("visibility", "visible"),
    ]);

    activePublicIncidents = (incidents.data ?? []).filter((i) => {
      const inc = i.incident as { lifecycle_status?: string } | null;
      return inc?.lifecycle_status && inc.lifecycle_status !== "resolved";
    }).length;

    upcomingMaintenance = (maintenance.data ?? []).filter((m) => {
      const w = m.window as { status?: string } | null;
      return w?.status === "scheduled" || w?.status === "active";
    }).length;

    for (const d of domains.data ?? []) {
      if (d.kind !== "custom") continue;
      if (d.verification_status === "failed" || d.verification_status === "pending_dns") {
        domainsNeedingAttention += 1;
      }
      if (d.tls_status === "failed" || d.tls_status === "renewal_issue") {
        tlsIssues += 1;
      }
    }

    componentsWithoutMonitor = (components.data ?? []).filter((c) => {
      const m = c.monitors as { count: number }[] | null;
      return (m?.[0]?.count ?? 0) === 0;
    }).length;
  }

  return {
    publishedCount,
    draftCount,
    activePublicIncidents,
    upcomingMaintenance,
    domainsNeedingAttention,
    tlsIssues,
    pagesNeedingPublication,
    componentsWithoutMonitor,
  };
}

export interface StatusPageSettingsPatch {
  name?: string;
  title?: string | null;
  description?: string | null;
  headline?: string | null;
  supportUrl?: string | null;
  websiteUrl?: string | null;
  timezone?: string;
  locale?: string;
}

export interface StatusPageDisplayPatch {
  showUptimeHistory?: boolean;
  showResponseTime?: boolean;
  showIncidentHistory?: boolean;
  showScheduledMaintenance?: boolean;
  showComponentDescriptions?: boolean;
  showSubscriberForm?: boolean;
  poweredByVisible?: boolean;
  uptimeHistoryDays?: number;
  incidentHistoryWindow?: IncidentHistoryWindow;
  autoPublishIncidents?: AutoPublishMode;
  publicStateDelaySeconds?: number;
}

export interface StatusPageSeoPatch {
  searchIndexingEnabled?: boolean;
  indexIncidentArchive?: boolean;
  indexIndividualIncidents?: boolean;
}

export async function updateStatusPage(
  organizationId: string,
  statusPageId: string,
  actorProfileId: string,
  patch: StatusPageSettingsPatch & StatusPageDisplayPatch & StatusPageSeoPatch & {
    themeKey?: StatusPageTheme;
    appearance?: Appearance;
    visibility?: StatusPageVisibility;
    passwordHash?: string | null;
    privateLinkTokenHash?: string | null;
  },
): Promise<void> {
  const db = serviceClient();
  const update: StatusPageUpdate = { updated_by_user_id: actorProfileId };

  const map: Array<[keyof typeof patch, keyof StatusPageUpdate]> = [
    ["name", "name"],
    ["title", "title"],
    ["description", "description"],
    ["headline", "headline"],
    ["supportUrl", "support_url"],
    ["websiteUrl", "website_url"],
    ["timezone", "timezone"],
    ["locale", "locale"],
    ["themeKey", "theme_key"],
    ["visibility", "visibility"],
    ["showUptimeHistory", "show_uptime_history"],
    ["showResponseTime", "show_response_time"],
    ["showIncidentHistory", "show_incident_history"],
    ["showScheduledMaintenance", "show_scheduled_maintenance"],
    ["showComponentDescriptions", "show_component_descriptions"],
    ["showSubscriberForm", "show_subscriber_form"],
    ["poweredByVisible", "powered_by_visible"],
    ["searchIndexingEnabled", "search_indexing_enabled"],
    ["indexIncidentArchive", "index_incident_archive"],
    ["indexIndividualIncidents", "index_individual_incidents"],
    ["incidentHistoryWindow", "incident_history_window"],
    ["uptimeHistoryDays", "uptime_history_days"],
    ["autoPublishIncidents", "auto_publish_incidents"],
    ["publicStateDelaySeconds", "public_state_delay_seconds"],
    ["passwordHash", "password_hash"],
    ["privateLinkTokenHash", "private_link_token_hash"],
  ];
  for (const [from, to] of map) {
    if (patch[from] !== undefined) {
      (update as Record<string, unknown>)[to] = patch[from];
    }
  }
  if (patch.appearance !== undefined) {
    (update as Record<string, unknown>).appearance = patch.appearance;
  }

  const { error } = await db
    .from("status_pages")
    .update(update)
    .eq("id", statusPageId)
    .eq("organization_id", organizationId)
    .is("deleted_at", null);
  if (error) throw error;
}

export async function setStatusPageStatus(
  organizationId: string,
  statusPageId: string,
  status: StatusPageStatus,
  extra?: { publishedAt?: string; publishedVersionId?: string; draftVersionId?: string },
): Promise<void> {
  const db = serviceClient();
  const update: StatusPageUpdate = { status };
  if (extra?.publishedAt !== undefined) update.published_at = extra.publishedAt;
  if (extra?.publishedVersionId !== undefined) update.published_version_id = extra.publishedVersionId;
  if (extra?.draftVersionId !== undefined) update.draft_version_id = extra.draftVersionId;
  const { error } = await db
    .from("status_pages")
    .update(update)
    .eq("id", statusPageId)
    .eq("organization_id", organizationId);
  if (error) throw error;
}

export async function softDeleteStatusPage(
  organizationId: string,
  statusPageId: string,
): Promise<void> {
  const db = serviceClient();
  const now = new Date().toISOString();
  // Unpublish immediately: remove the public snapshot so nothing renders.
  await db.from("status_page_public_snapshots").delete().eq("status_page_id", statusPageId);
  const { error } = await db
    .from("status_pages")
    .update({ status: "deleted", deleted_at: now })
    .eq("id", statusPageId)
    .eq("organization_id", organizationId);
  if (error) throw error;
}
