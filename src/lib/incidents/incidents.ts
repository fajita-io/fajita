import "server-only";

import { serviceClient } from "@/lib/supabase/service";
import type { Database } from "@/lib/supabase/types";
import type { Severity, UpdateType, UpdateVisibility } from "./constants";

/**
 * Incident write layer. Every mutation goes through a public SECURITY DEFINER
 * wrapper (granted to service_role only) so the data, timeline event, outbox,
 * and projection stay consistent in a single atomic call. Callers must have
 * already verified the incidents:manage permission and org scope. Audit and
 * analytics are recorded by the action layer.
 */

type FnName = keyof Database["public"]["Functions"];

/**
 * Typed RPC helper. The function name is checked against the generated schema;
 * argument shape is intentionally loosened because several wrappers accept SQL
 * NULL for optional fields (assignee, opened-at, summaries) that the type
 * generator, lacking parameter defaults, reports as non-null. The strong type
 * boundary is each exported function's own signature.
 */
async function callRpc<T>(fn: FnName, args: Record<string, unknown>): Promise<T> {
  const db = serviceClient();
  const { data, error } = await db.rpc(fn, args as never);
  if (error) throw new Error(error.message);
  return data as T;
}

export async function createManualIncident(input: {
  organizationId: string;
  actorProfileId: string;
  title: string;
  severity: Severity;
  operationalStatus: string;
  internalSummary?: string | null;
  publicSummary?: string | null;
  publicVisibility?: string;
  assigneeUserId?: string | null;
  openedAt?: string | null;
}): Promise<string> {
  return callRpc<string>("incident_create_manual", {
    p_organization_id: input.organizationId,
    p_actor_user_id: input.actorProfileId,
    p_title: input.title,
    p_severity: input.severity,
    p_operational_status: input.operationalStatus,
    p_internal_summary: input.internalSummary ?? null,
    p_public_summary: input.publicSummary ?? null,
    p_public_visibility: input.publicVisibility ?? "internal",
    p_assignee_user_id: input.assigneeUserId ?? null,
    p_opened_at: input.openedAt ?? null,
  });
}

export async function attachMonitor(input: {
  organizationId: string;
  incidentId: string;
  monitorId: string;
  actorProfileId: string;
  relationship?: "primary" | "affected";
  note?: string | null;
}): Promise<void> {
  await callRpc<null>("incident_attach_monitor", {
    p_organization_id: input.organizationId,
    p_incident_id: input.incidentId,
    p_monitor_id: input.monitorId,
    p_actor_user_id: input.actorProfileId,
    p_relationship: input.relationship ?? "affected",
    p_note: input.note ?? null,
  });
}

export async function removeMonitor(input: {
  organizationId: string;
  incidentId: string;
  monitorId: string;
  actorProfileId: string;
}): Promise<void> {
  await callRpc<null>("incident_remove_monitor", {
    p_organization_id: input.organizationId,
    p_incident_id: input.incidentId,
    p_monitor_id: input.monitorId,
    p_actor_user_id: input.actorProfileId,
  });
}

export async function acknowledgeIncident(input: {
  organizationId: string;
  incidentId: string;
  actorProfileId: string;
  acknowledge: boolean;
  note?: string | null;
}): Promise<void> {
  await callRpc<null>("incident_acknowledge", {
    p_organization_id: input.organizationId,
    p_incident_id: input.incidentId,
    p_actor_user_id: input.actorProfileId,
    p_acknowledge: input.acknowledge,
    p_note: input.note ?? null,
  });
}

export async function assignIncident(input: {
  organizationId: string;
  incidentId: string;
  assigneeUserId: string | null;
  actorProfileId: string;
}): Promise<void> {
  await callRpc<null>("incident_assign", {
    p_organization_id: input.organizationId,
    p_incident_id: input.incidentId,
    p_assignee_user_id: input.assigneeUserId,
    p_actor_user_id: input.actorProfileId,
  });
}

export async function changeSeverity(input: {
  organizationId: string;
  incidentId: string;
  actorProfileId: string;
  severity: Severity;
}): Promise<void> {
  await callRpc<null>("incident_change_severity", {
    p_organization_id: input.organizationId,
    p_incident_id: input.incidentId,
    p_actor_user_id: input.actorProfileId,
    p_severity: input.severity,
  });
}

export async function addUpdate(input: {
  organizationId: string;
  incidentId: string;
  actorProfileId: string;
  updateType: UpdateType;
  visibility: UpdateVisibility;
  body: string;
}): Promise<string> {
  return callRpc<string>("incident_add_update", {
    p_organization_id: input.organizationId,
    p_incident_id: input.incidentId,
    p_actor_user_id: input.actorProfileId,
    p_update_type: input.updateType,
    p_visibility: input.visibility,
    p_body: input.body,
  });
}

export async function addNote(input: {
  organizationId: string;
  incidentId: string;
  actorProfileId: string;
  body: string;
}): Promise<string> {
  return callRpc<string>("incident_add_note", {
    p_organization_id: input.organizationId,
    p_incident_id: input.incidentId,
    p_actor_user_id: input.actorProfileId,
    p_body: input.body,
  });
}

export async function resolveIncident(input: {
  organizationId: string;
  incidentId: string;
  actorProfileId: string;
  resolutionSummary?: string | null;
  suppressReopenSeconds?: number;
}): Promise<void> {
  await callRpc<null>("incident_resolve", {
    p_organization_id: input.organizationId,
    p_incident_id: input.incidentId,
    p_actor_user_id: input.actorProfileId,
    p_resolution_summary: input.resolutionSummary ?? null,
    p_suppress_reopen_seconds: input.suppressReopenSeconds ?? 0,
  });
}

export async function cancelIncident(input: {
  organizationId: string;
  incidentId: string;
  actorProfileId: string;
  reason: string;
}): Promise<void> {
  await callRpc<null>("incident_cancel", {
    p_organization_id: input.organizationId,
    p_incident_id: input.incidentId,
    p_actor_user_id: input.actorProfileId,
    p_reason: input.reason,
  });
}

/** Drive the evaluation queue (used by the internal lab and admin tooling). */
export async function processEvaluations(limit = 200): Promise<number> {
  return (await callRpc<number>("process_incident_evaluations", { p_limit: limit })) ?? 0;
}

export async function detectMissedHeartbeats(): Promise<number> {
  return (await callRpc<number>("detect_missed_heartbeats", {})) ?? 0;
}

export async function reconcileIncidentState(
  dryRun = true,
): Promise<Record<string, unknown>> {
  return (
    (await callRpc<Record<string, unknown>>("reconcile_incident_state", {
      p_dry_run: dryRun,
    })) ?? {}
  );
}
