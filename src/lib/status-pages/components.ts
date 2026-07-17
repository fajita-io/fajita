import "server-only";

import { serviceClient } from "@/lib/supabase/service";
import type { ComponentCalculationMode, PublicComponentState } from "./constants";
import { componentSlug } from "./slug";

/**
 * Component and component-group data layer. Organization-scoped; callers verify
 * status_page.component.manage before mutating. Monitor mappings are validated
 * to belong to the same organization so a component can never reference another
 * tenant's monitor.
 */

export interface ComponentGroupRecord {
  id: string;
  name: string;
  description: string | null;
  position: number;
  collapsedByDefault: boolean;
  isHidden: boolean;
}

export interface ComponentMonitorMapping {
  monitorId: string;
  monitorName: string | null;
  isCritical: boolean;
  isPrimary: boolean;
  includeInUptime: boolean;
}

export interface ComponentRecord {
  id: string;
  groupId: string | null;
  name: string;
  description: string | null;
  slug: string;
  position: number;
  calculationMode: ComponentCalculationMode;
  manualStatus: PublicComponentState | null;
  manualStatusReason: string | null;
  manualStatusUntil: string | null;
  visibility: "visible" | "hidden";
  showUptime: boolean;
  showResponseTime: boolean;
  isArchived: boolean;
  monitors: ComponentMonitorMapping[];
}

export async function listComponentGroups(
  statusPageId: string,
): Promise<ComponentGroupRecord[]> {
  const db = serviceClient();
  const { data, error } = await db
    .from("status_page_component_groups")
    .select("id, name, description, position, collapsed_by_default, is_hidden")
    .eq("status_page_id", statusPageId)
    .is("deleted_at", null)
    .order("position", { ascending: true });
  if (error) throw error;
  return (data ?? []).map((g) => ({
    id: g.id,
    name: g.name,
    description: g.description,
    position: g.position,
    collapsedByDefault: g.collapsed_by_default,
    isHidden: g.is_hidden,
  }));
}

export async function listComponents(
  statusPageId: string,
  opts: { includeArchived?: boolean; includeHidden?: boolean } = {},
): Promise<ComponentRecord[]> {
  const db = serviceClient();
  let q = db
    .from("status_page_components")
    .select(
      "id, group_id, name, description, slug, position, status_calculation_mode, manual_status, manual_status_reason, manual_status_until, visibility, show_uptime, show_response_time, is_archived",
    )
    .eq("status_page_id", statusPageId)
    .is("deleted_at", null)
    .order("position", { ascending: true });
  if (!opts.includeArchived) q = q.eq("is_archived", false);
  if (!opts.includeHidden) {
    // keep hidden for management; renderer filters separately
  }
  const { data, error } = await q;
  if (error) throw error;
  const rows = data ?? [];
  const ids = rows.map((r) => r.id);
  const mappings = await loadMappings(ids);

  return rows.map((r) => ({
    id: r.id,
    groupId: r.group_id,
    name: r.name,
    description: r.description,
    slug: r.slug,
    position: r.position,
    calculationMode: r.status_calculation_mode as ComponentCalculationMode,
    manualStatus: (r.manual_status as PublicComponentState | null) ?? null,
    manualStatusReason: r.manual_status_reason,
    manualStatusUntil: r.manual_status_until,
    visibility: r.visibility as "visible" | "hidden",
    showUptime: r.show_uptime,
    showResponseTime: r.show_response_time,
    isArchived: r.is_archived,
    monitors: mappings.get(r.id) ?? [],
  }));
}

async function loadMappings(
  componentIds: string[],
): Promise<Map<string, ComponentMonitorMapping[]>> {
  const map = new Map<string, ComponentMonitorMapping[]>();
  if (componentIds.length === 0) return map;
  const db = serviceClient();
  const { data } = await db
    .from("status_page_component_monitors")
    .select("component_id, monitor_id, is_critical, is_primary, include_in_uptime, monitor:monitors(name)")
    .in("component_id", componentIds);
  for (const row of data ?? []) {
    const monitor = row.monitor as { name: string | null } | null;
    const list = map.get(row.component_id) ?? [];
    list.push({
      monitorId: row.monitor_id,
      monitorName: monitor?.name ?? null,
      isCritical: row.is_critical,
      isPrimary: row.is_primary,
      includeInUptime: row.include_in_uptime,
    });
    map.set(row.component_id, list);
  }
  return map;
}

/* ------------------------------------------------------------------ */
/* Group mutations                                                     */
/* ------------------------------------------------------------------ */

export async function createComponentGroup(input: {
  organizationId: string;
  statusPageId: string;
  name: string;
  description?: string | null;
}): Promise<string> {
  const db = serviceClient();
  const position = await nextPosition("status_page_component_groups", input.statusPageId);
  const { data, error } = await db
    .from("status_page_component_groups")
    .insert({
      organization_id: input.organizationId,
      status_page_id: input.statusPageId,
      name: input.name,
      description: input.description ?? null,
      position,
    })
    .select("id")
    .single();
  if (error) throw error;
  return data.id;
}

export async function updateComponentGroup(input: {
  organizationId: string;
  groupId: string;
  patch: { name?: string; description?: string | null; collapsedByDefault?: boolean; isHidden?: boolean };
}): Promise<void> {
  const db = serviceClient();
  const update: Record<string, unknown> = {};
  if (input.patch.name !== undefined) update.name = input.patch.name;
  if (input.patch.description !== undefined) update.description = input.patch.description;
  if (input.patch.collapsedByDefault !== undefined) update.collapsed_by_default = input.patch.collapsedByDefault;
  if (input.patch.isHidden !== undefined) update.is_hidden = input.patch.isHidden;
  if (Object.keys(update).length === 0) return;
  const { error } = await db
    .from("status_page_component_groups")
    .update(update as never)
    .eq("id", input.groupId)
    .eq("organization_id", input.organizationId);
  if (error) throw error;
}

/** Deleting a group never deletes its components: it moves them to ungrouped. */
export async function deleteComponentGroup(input: {
  organizationId: string;
  statusPageId: string;
  groupId: string;
}): Promise<void> {
  const db = serviceClient();
  await db
    .from("status_page_components")
    .update({ group_id: null })
    .eq("status_page_id", input.statusPageId)
    .eq("group_id", input.groupId);
  const { error } = await db
    .from("status_page_component_groups")
    .update({ deleted_at: new Date().toISOString() })
    .eq("id", input.groupId)
    .eq("organization_id", input.organizationId);
  if (error) throw error;
}

/* ------------------------------------------------------------------ */
/* Component mutations                                                  */
/* ------------------------------------------------------------------ */

async function nextPosition(table: string, statusPageId: string): Promise<number> {
  const db = serviceClient();
  const { data } = await db
    .from(table as never)
    .select("position")
    .eq("status_page_id", statusPageId)
    .is("deleted_at", null)
    .order("position", { ascending: false })
    .limit(1)
    .maybeSingle();
  const row = data as { position?: number } | null;
  return (row?.position ?? -1) + 1;
}

async function uniqueComponentSlug(
  statusPageId: string,
  name: string,
  excludeId?: string,
): Promise<string> {
  const db = serviceClient();
  const base = componentSlug(name);
  let candidate = base;
  let n = 1;
  // Bounded loop; component counts per page are small.
  for (let i = 0; i < 50; i += 1) {
    const { data } = await db
      .from("status_page_components")
      .select("id")
      .eq("status_page_id", statusPageId)
      .eq("slug", candidate)
      .is("deleted_at", null)
      .maybeSingle();
    if (!data || data.id === excludeId) return candidate;
    n += 1;
    candidate = `${base}-${n}`;
  }
  return `${base}-${Date.now()}`;
}

export async function createComponent(input: {
  organizationId: string;
  statusPageId: string;
  name: string;
  description?: string | null;
  groupId?: string | null;
  calculationMode?: ComponentCalculationMode;
  monitorIds?: string[];
  showUptime?: boolean;
  showResponseTime?: boolean;
}): Promise<string> {
  const db = serviceClient();
  const slug = await uniqueComponentSlug(input.statusPageId, input.name);
  const position = await nextPosition("status_page_components", input.statusPageId);
  const { data, error } = await db
    .from("status_page_components")
    .insert({
      organization_id: input.organizationId,
      status_page_id: input.statusPageId,
      group_id: input.groupId ?? null,
      name: input.name,
      description: input.description ?? null,
      slug,
      position,
      status_calculation_mode: input.calculationMode ?? "any_critical",
      show_uptime: input.showUptime ?? true,
      show_response_time: input.showResponseTime ?? false,
    })
    .select("id")
    .single();
  if (error) throw error;
  if (input.monitorIds && input.monitorIds.length > 0) {
    await setComponentMonitors({
      organizationId: input.organizationId,
      statusPageId: input.statusPageId,
      componentId: data.id,
      monitorIds: input.monitorIds,
    });
  }
  return data.id;
}

export async function updateComponent(input: {
  organizationId: string;
  statusPageId: string;
  componentId: string;
  patch: {
    name?: string;
    description?: string | null;
    groupId?: string | null;
    calculationMode?: ComponentCalculationMode;
    visibility?: "visible" | "hidden";
    showUptime?: boolean;
    showResponseTime?: boolean;
    isArchived?: boolean;
    manualStatus?: PublicComponentState | null;
    manualStatusReason?: string | null;
    manualStatusUntil?: string | null;
  };
}): Promise<void> {
  const db = serviceClient();
  const update: Record<string, unknown> = {};
  const p = input.patch;
  if (p.name !== undefined) {
    update.name = p.name;
    update.slug = await uniqueComponentSlug(input.statusPageId, p.name, input.componentId);
  }
  if (p.description !== undefined) update.description = p.description;
  if (p.groupId !== undefined) update.group_id = p.groupId;
  if (p.calculationMode !== undefined) update.status_calculation_mode = p.calculationMode;
  if (p.visibility !== undefined) update.visibility = p.visibility;
  if (p.showUptime !== undefined) update.show_uptime = p.showUptime;
  if (p.showResponseTime !== undefined) update.show_response_time = p.showResponseTime;
  if (p.isArchived !== undefined) update.is_archived = p.isArchived;
  if (p.manualStatus !== undefined) {
    update.manual_status = p.manualStatus;
    update.manual_status_since = p.manualStatus ? new Date().toISOString() : null;
  }
  if (p.manualStatusReason !== undefined) update.manual_status_reason = p.manualStatusReason;
  if (p.manualStatusUntil !== undefined) update.manual_status_until = p.manualStatusUntil;
  if (Object.keys(update).length === 0) return;
  const { error } = await db
    .from("status_page_components")
    .update(update as never)
    .eq("id", input.componentId)
    .eq("organization_id", input.organizationId)
    .eq("status_page_id", input.statusPageId);
  if (error) throw error;
}

/** Archive preserves historical incident references; hard delete is soft. */
export async function deleteComponent(input: {
  organizationId: string;
  statusPageId: string;
  componentId: string;
}): Promise<void> {
  const db = serviceClient();
  const { error } = await db
    .from("status_page_components")
    .update({ deleted_at: new Date().toISOString(), visibility: "hidden" })
    .eq("id", input.componentId)
    .eq("organization_id", input.organizationId)
    .eq("status_page_id", input.statusPageId);
  if (error) throw error;
}

export async function reorderComponents(input: {
  organizationId: string;
  statusPageId: string;
  orderedIds: string[];
}): Promise<void> {
  const db = serviceClient();
  await Promise.all(
    input.orderedIds.map((id, index) =>
      db
        .from("status_page_components")
        .update({ position: index })
        .eq("id", id)
        .eq("organization_id", input.organizationId)
        .eq("status_page_id", input.statusPageId),
    ),
  );
}

/**
 * Replace a component's monitor mappings. Every monitor id is validated to
 * belong to the same organization; unknown or cross-tenant ids are dropped.
 */
export async function setComponentMonitors(input: {
  organizationId: string;
  statusPageId: string;
  componentId: string;
  monitorIds: string[];
  critical?: Record<string, boolean>;
  primaryId?: string | null;
  includeUptime?: Record<string, boolean>;
}): Promise<void> {
  const db = serviceClient();
  const monitorIds = [...new Set(input.monitorIds)];
  const { data: owned } = await db
    .from("monitors")
    .select("id")
    .eq("organization_id", input.organizationId)
    .in("id", monitorIds.length > 0 ? monitorIds : ["00000000-0000-0000-0000-000000000000"]);
  const valid = new Set((owned ?? []).map((m) => m.id));

  await db
    .from("status_page_component_monitors")
    .delete()
    .eq("component_id", input.componentId)
    .eq("organization_id", input.organizationId);

  const rows = monitorIds
    .filter((id) => valid.has(id))
    .map((monitorId) => ({
      component_id: input.componentId,
      status_page_id: input.statusPageId,
      organization_id: input.organizationId,
      monitor_id: monitorId,
      is_critical: input.critical?.[monitorId] ?? true,
      is_primary: input.primaryId === monitorId,
      include_in_uptime: input.includeUptime?.[monitorId] ?? true,
    }));
  if (rows.length > 0) {
    const { error } = await db.from("status_page_component_monitors").insert(rows);
    if (error) throw error;
  }
}
