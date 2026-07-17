import "server-only";

import { serviceClient } from "@/lib/supabase/service";

/**
 * Resolve which status-page components an event affects, so component-aware
 * fan-out can match subscribers who selected specific components. The mapping
 * is monitor-driven: an incident or maintenance window is tied to monitors, and
 * status_page_component_monitors links monitors to the components shown on this
 * page. We return only component ids that belong to this status page.
 *
 * An empty result means "page-wide": the event could not be attributed to a
 * specific component (or none was mapped), so every eligible subscriber sees it.
 */

async function componentsForMonitors(
  statusPageId: string,
  monitorIds: string[],
): Promise<string[]> {
  if (monitorIds.length === 0) return [];
  const db = serviceClient();

  const { data: pageComponents } = await db
    .from("status_page_components")
    .select("id")
    .eq("status_page_id", statusPageId);
  const pageComponentIds = new Set((pageComponents ?? []).map((c) => c.id));
  if (pageComponentIds.size === 0) return [];

  const { data: links } = await db
    .from("status_page_component_monitors")
    .select("component_id, monitor_id")
    .in("monitor_id", monitorIds);

  const result = new Set<string>();
  for (const link of links ?? []) {
    if (pageComponentIds.has(link.component_id)) result.add(link.component_id);
  }
  return [...result];
}

export async function incidentAffectedComponents(
  statusPageId: string,
  incidentId: string,
  primaryMonitorId: string | null,
): Promise<string[]> {
  const db = serviceClient();
  const { data: rows } = await db
    .from("incident_monitors")
    .select("monitor_id")
    .eq("incident_id", incidentId);
  const monitorIds = new Set<string>((rows ?? []).map((r) => r.monitor_id));
  if (primaryMonitorId) monitorIds.add(primaryMonitorId);
  return componentsForMonitors(statusPageId, [...monitorIds]);
}

export async function maintenanceAffectedComponents(
  statusPageId: string,
  maintenanceWindowId: string,
): Promise<string[]> {
  const db = serviceClient();
  const { data: rows } = await db
    .from("maintenance_monitor_links")
    .select("monitor_id")
    .eq("maintenance_window_id", maintenanceWindowId);
  const monitorIds = (rows ?? []).map((r) => r.monitor_id);
  return componentsForMonitors(statusPageId, monitorIds);
}

/** Map component ids to their public display names on this status page. */
export async function componentNames(
  statusPageId: string,
  componentIds: string[],
): Promise<string[]> {
  if (componentIds.length === 0) return [];
  const db = serviceClient();
  const { data } = await db
    .from("status_page_components")
    .select("name")
    .eq("status_page_id", statusPageId)
    .in("id", componentIds);
  return (data ?? []).map((c) => c.name);
}
