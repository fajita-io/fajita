import "server-only";

import { serviceClient } from "@/lib/supabase/service";

/**
 * Preference read/write helpers shared by the subscribe flow and the
 * preference center. Event preferences are a single row of structured booleans;
 * component selections are explicit join rows. When the subscriber chooses
 * "all components" we clear the component rows so we never leave a stale
 * selection that contradicts the choice.
 */

export interface EventPreferences {
  allComponents: boolean;
  incidentOpened: boolean;
  incidentUpdates: boolean;
  incidentResolved: boolean;
  incidentReopened: boolean;
  maintenanceScheduled: boolean;
  maintenanceStarted: boolean;
  maintenanceUpdates: boolean;
  maintenanceCompleted: boolean;
  maintenanceCanceled: boolean;
}

/** The simplified public form choices, expanded into granular booleans. */
export interface SimplePreferenceChoice {
  allComponents: boolean;
  componentIds: string[];
  incidentUpdates: boolean;
  maintenanceUpdates: boolean;
}

export function expandSimpleChoice(choice: SimplePreferenceChoice): EventPreferences {
  return {
    allComponents: choice.allComponents,
    incidentOpened: choice.incidentUpdates,
    incidentUpdates: choice.incidentUpdates,
    incidentResolved: choice.incidentUpdates,
    incidentReopened: choice.incidentUpdates,
    maintenanceScheduled: choice.maintenanceUpdates,
    maintenanceStarted: choice.maintenanceUpdates,
    maintenanceUpdates: choice.maintenanceUpdates,
    maintenanceCompleted: choice.maintenanceUpdates,
    maintenanceCanceled: choice.maintenanceUpdates,
  };
}

export async function writeEventPreferences(
  subscriberId: string,
  statusPageId: string,
  organizationId: string,
  prefs: EventPreferences,
): Promise<void> {
  const db = serviceClient();
  await db.from("status_page_subscriber_event_prefs").upsert(
    {
      subscriber_id: subscriberId,
      status_page_id: statusPageId,
      organization_id: organizationId,
      all_components: prefs.allComponents,
      incident_opened: prefs.incidentOpened,
      incident_updates: prefs.incidentUpdates,
      incident_resolved: prefs.incidentResolved,
      incident_reopened: prefs.incidentReopened,
      maintenance_scheduled: prefs.maintenanceScheduled,
      maintenance_started: prefs.maintenanceStarted,
      maintenance_updates: prefs.maintenanceUpdates,
      maintenance_completed: prefs.maintenanceCompleted,
      maintenance_canceled: prefs.maintenanceCanceled,
    },
    { onConflict: "subscriber_id" },
  );
}

/**
 * Replace a subscriber's component selection. Only valid, visible components
 * belonging to this page are stored. When allComponents is true, all rows are
 * removed so preference state is unambiguous.
 */
export async function writeComponentSelection(
  subscriberId: string,
  statusPageId: string,
  organizationId: string,
  allComponents: boolean,
  componentIds: string[],
): Promise<void> {
  const db = serviceClient();
  await db.from("status_page_subscriber_components").delete().eq("subscriber_id", subscriberId);
  if (allComponents || componentIds.length === 0) return;

  // Validate ids against the page's live, visible components.
  const { data: valid } = await db
    .from("status_page_components")
    .select("id")
    .eq("status_page_id", statusPageId)
    .in("id", componentIds.slice(0, 200))
    .is("deleted_at", null);
  const validIds = new Set((valid ?? []).map((c) => c.id));
  const rows = componentIds
    .filter((id) => validIds.has(id))
    .map((id) => ({
      subscriber_id: subscriberId,
      status_page_component_id: id,
      status_page_id: statusPageId,
      organization_id: organizationId,
    }));
  if (rows.length > 0) {
    await db.from("status_page_subscriber_components").insert(rows);
  }
}

export async function readEventPreferences(subscriberId: string): Promise<EventPreferences | null> {
  const db = serviceClient();
  const { data } = await db
    .from("status_page_subscriber_event_prefs")
    .select("*")
    .eq("subscriber_id", subscriberId)
    .maybeSingle();
  if (!data) return null;
  return {
    allComponents: data.all_components,
    incidentOpened: data.incident_opened,
    incidentUpdates: data.incident_updates,
    incidentResolved: data.incident_resolved,
    incidentReopened: data.incident_reopened,
    maintenanceScheduled: data.maintenance_scheduled,
    maintenanceStarted: data.maintenance_started,
    maintenanceUpdates: data.maintenance_updates,
    maintenanceCompleted: data.maintenance_completed,
    maintenanceCanceled: data.maintenance_canceled,
  };
}

export async function readComponentSelection(subscriberId: string): Promise<string[]> {
  const db = serviceClient();
  const { data } = await db
    .from("status_page_subscriber_components")
    .select("status_page_component_id")
    .eq("subscriber_id", subscriberId);
  return (data ?? []).map((r) => r.status_page_component_id);
}
