import "server-only";

import { serviceClient } from "@/lib/supabase/service";
import type { Database } from "@/lib/supabase/types";
import type { MaintenanceStatus, SuppressionPolicy } from "./constants";

type MaintenanceWindowUpdate =
  Database["public"]["Tables"]["maintenance_windows"]["Update"];
type MaintenanceOccurrenceUpdate =
  Database["public"]["Tables"]["maintenance_occurrences"]["Update"];

/**
 * Maintenance window data layer. Organization-scoped; callers must have
 * verified maintenance:manage for mutations. Phase 6 ships reliable one-time
 * windows: creating a window materializes exactly one occurrence. Recurrence is
 * scaffolded in the schema but not generated (documented deferral).
 */

export interface MaintenanceWindowInput {
  name: string;
  description?: string | null;
  internalNotes?: string | null;
  publicSummary?: string | null;
  timezone: string;
  startsAt: string;
  endsAt: string;
  suppressionPolicy: SuppressionPolicy;
  monitorIds: string[];
}

export interface MaintenanceListItem {
  id: string;
  name: string;
  status: MaintenanceStatus;
  timezone: string;
  startsAt: string;
  endsAt: string;
  suppressionPolicy: SuppressionPolicy;
  monitorCount: number;
}

export async function createMaintenanceWindow(input: {
  organizationId: string;
  actorProfileId: string;
  data: MaintenanceWindowInput;
}): Promise<string> {
  const db = serviceClient();
  const { data: win, error } = await db
    .from("maintenance_windows")
    .insert({
      organization_id: input.organizationId,
      name: input.data.name,
      description: input.data.description ?? null,
      internal_notes: input.data.internalNotes ?? null,
      public_summary: input.data.publicSummary ?? null,
      timezone: input.data.timezone,
      starts_at: input.data.startsAt,
      ends_at: input.data.endsAt,
      suppression_policy: input.data.suppressionPolicy,
      status: "scheduled",
      recurrence: "none",
      created_by_user_id: input.actorProfileId,
    })
    .select("id")
    .single();
  if (error) throw error;
  const windowId = win.id;

  // Validate all monitors belong to the org, then link them (tenant isolation).
  const monitorIds = [...new Set(input.data.monitorIds)];
  if (monitorIds.length > 0) {
    const { data: owned } = await db
      .from("monitors")
      .select("id")
      .eq("organization_id", input.organizationId)
      .in("id", monitorIds);
    const validIds = new Set((owned ?? []).map((m) => m.id));
    const links = monitorIds
      .filter((id) => validIds.has(id))
      .map((monitorId) => ({
        maintenance_window_id: windowId,
        organization_id: input.organizationId,
        monitor_id: monitorId,
      }));
    if (links.length > 0) {
      await db.from("maintenance_monitor_links").insert(links);
    }
  }

  // Materialize the single occurrence.
  await db.from("maintenance_occurrences").insert({
    maintenance_window_id: windowId,
    organization_id: input.organizationId,
    starts_at: input.data.startsAt,
    ends_at: input.data.endsAt,
    status: "scheduled",
  });

  return windowId;
}

export async function updateMaintenanceWindow(input: {
  organizationId: string;
  windowId: string;
  data: Partial<MaintenanceWindowInput>;
}): Promise<void> {
  const db = serviceClient();
  const patch: MaintenanceWindowUpdate = {};
  const d = input.data;
  if (d.name !== undefined) patch.name = d.name;
  if (d.description !== undefined) patch.description = d.description;
  if (d.internalNotes !== undefined) patch.internal_notes = d.internalNotes;
  if (d.publicSummary !== undefined) patch.public_summary = d.publicSummary;
  if (d.timezone !== undefined) patch.timezone = d.timezone;
  if (d.startsAt !== undefined) patch.starts_at = d.startsAt;
  if (d.endsAt !== undefined) patch.ends_at = d.endsAt;
  if (d.suppressionPolicy !== undefined) patch.suppression_policy = d.suppressionPolicy;

  if (Object.keys(patch).length > 0) {
    const { error } = await db
      .from("maintenance_windows")
      .update(patch)
      .eq("id", input.windowId)
      .eq("organization_id", input.organizationId)
      .in("status", ["scheduled", "active"]);
    if (error) throw error;
  }

  // Keep the scheduled occurrence in sync with time changes.
  if (d.startsAt !== undefined || d.endsAt !== undefined) {
    const occPatch: MaintenanceOccurrenceUpdate = {};
    if (d.startsAt !== undefined) occPatch.starts_at = d.startsAt;
    if (d.endsAt !== undefined) occPatch.ends_at = d.endsAt;
    await db
      .from("maintenance_occurrences")
      .update(occPatch)
      .eq("maintenance_window_id", input.windowId)
      .eq("status", "scheduled");
  }

  if (d.monitorIds !== undefined) {
    await db.from("maintenance_monitor_links").delete().eq("maintenance_window_id", input.windowId);
    const monitorIds = [...new Set(d.monitorIds)];
    if (monitorIds.length > 0) {
      const { data: owned } = await db
        .from("monitors")
        .select("id")
        .eq("organization_id", input.organizationId)
        .in("id", monitorIds);
      const validIds = new Set((owned ?? []).map((m) => m.id));
      const links = monitorIds
        .filter((id) => validIds.has(id))
        .map((monitorId) => ({
          maintenance_window_id: input.windowId,
          organization_id: input.organizationId,
          monitor_id: monitorId,
        }));
      if (links.length > 0) await db.from("maintenance_monitor_links").insert(links);
    }
  }
}

export async function cancelMaintenanceWindow(input: {
  organizationId: string;
  windowId: string;
  actorProfileId: string;
}): Promise<void> {
  const db = serviceClient();
  await db
    .from("maintenance_windows")
    .update({
      status: "canceled",
      canceled_at: new Date().toISOString(),
      canceled_by_user_id: input.actorProfileId,
    })
    .eq("id", input.windowId)
    .eq("organization_id", input.organizationId)
    .in("status", ["scheduled", "active"]);
  await db
    .from("maintenance_occurrences")
    .update({ status: "canceled" })
    .eq("maintenance_window_id", input.windowId)
    .in("status", ["scheduled", "active"]);
}

export async function runMaintenanceTick(organizationId?: string): Promise<Record<string, unknown>> {
  const db = serviceClient();
  const { data, error } = await db.rpc("maintenance_tick", {
    p_organization_id: organizationId ?? undefined,
  });
  if (error) throw error;
  return (data as Record<string, unknown>) ?? {};
}

export async function listMaintenanceWindows(
  organizationId: string,
  status?: MaintenanceStatus,
): Promise<MaintenanceListItem[]> {
  const db = serviceClient();
  let q = db
    .from("maintenance_windows")
    .select("id, name, status, timezone, starts_at, ends_at, suppression_policy, links:maintenance_monitor_links(count)")
    .eq("organization_id", organizationId)
    .order("starts_at", { ascending: false })
    .limit(200);
  if (status) q = q.eq("status", status);
  const { data, error } = await q;
  if (error) throw error;
  return (data ?? []).map((r) => {
    const row = r as Record<string, unknown>;
    const links = row.links as { count: number }[] | null;
    return {
      id: row.id as string,
      name: row.name as string,
      status: row.status as MaintenanceStatus,
      timezone: row.timezone as string,
      startsAt: row.starts_at as string,
      endsAt: row.ends_at as string,
      suppressionPolicy: row.suppression_policy as SuppressionPolicy,
      monitorCount: links?.[0]?.count ?? 0,
    };
  });
}

export interface MaintenanceDetail extends MaintenanceListItem {
  description: string | null;
  internalNotes: string | null;
  publicSummary: string | null;
  monitors: { id: string; name: string | null }[];
}

export async function getMaintenanceWindow(
  organizationId: string,
  windowId: string,
): Promise<MaintenanceDetail | null> {
  const db = serviceClient();
  const { data, error } = await db
    .from("maintenance_windows")
    .select(
      "id, name, status, timezone, starts_at, ends_at, suppression_policy, description, internal_notes, public_summary",
    )
    .eq("organization_id", organizationId)
    .eq("id", windowId)
    .maybeSingle();
  if (error) throw error;
  if (!data) return null;

  const { data: links } = await db
    .from("maintenance_monitor_links")
    .select("monitor_id, monitor:monitors(name)")
    .eq("maintenance_window_id", windowId);

  const monitors = (links ?? []).map((l) => {
    const row = l as Record<string, unknown>;
    const monitor = row.monitor as { name: string | null } | null;
    return { id: row.monitor_id as string, name: monitor?.name ?? null };
  });

  return {
    id: data.id,
    name: data.name,
    status: data.status as MaintenanceStatus,
    timezone: data.timezone,
    startsAt: data.starts_at,
    endsAt: data.ends_at,
    suppressionPolicy: data.suppression_policy as SuppressionPolicy,
    description: data.description,
    internalNotes: data.internal_notes,
    publicSummary: data.public_summary,
    monitorCount: monitors.length,
    monitors,
  };
}
