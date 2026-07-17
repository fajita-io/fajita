import "server-only";

import { serviceClient } from "@/lib/supabase/service";
import type {
  IncidentLifecycle,
  IncidentOrigin,
  OperationalState,
  Severity,
} from "./constants";

/**
 * Incident read layer. Every function is organization-scoped and assumes the
 * caller already verified membership and the incidents feature. Reads use the
 * service role and always filter by organization_id. Never returns secrets,
 * response bodies, or full target URLs.
 */

export interface IncidentListItem {
  id: string;
  referenceCode: string | null;
  title: string;
  origin: IncidentOrigin;
  lifecycleStatus: IncidentLifecycle;
  operationalStatus: OperationalState;
  severity: Severity;
  primaryMonitorId: string | null;
  affectedMonitorCount: number;
  isFlapping: boolean;
  openedAt: string;
  resolvedAt: string | null;
  lastTransitionAt: string;
  acknowledgedAt: string | null;
  assigneeName: string | null;
  publicVisibility: string;
  activeMaintenanceOccurrenceId: string | null;
}

export interface IncidentListFilters {
  status?: "active" | "resolved" | "canceled" | "all";
  severity?: Severity;
  origin?: IncidentOrigin;
  monitorId?: string;
  assigneeId?: string;
  acknowledged?: boolean;
  limit?: number;
  before?: string;
}

const LIST_SELECT =
  "id, reference_code, title, origin, lifecycle_status, operational_status, severity, primary_monitor_id, affected_monitor_count, is_flapping, opened_at, resolved_at, last_transition_at, acknowledged_at, public_visibility, active_maintenance_occurrence_id, assignee:user_profiles!incidents_current_assignee_user_id_fkey(display_name)";

function mapListRow(row: Record<string, unknown>): IncidentListItem {
  const assignee = row.assignee as { display_name: string | null } | null;
  return {
    id: row.id as string,
    referenceCode: (row.reference_code as string | null) ?? null,
    title: row.title as string,
    origin: row.origin as IncidentOrigin,
    lifecycleStatus: row.lifecycle_status as IncidentLifecycle,
    operationalStatus: row.operational_status as OperationalState,
    severity: row.severity as Severity,
    primaryMonitorId: (row.primary_monitor_id as string | null) ?? null,
    affectedMonitorCount: (row.affected_monitor_count as number) ?? 0,
    isFlapping: Boolean(row.is_flapping),
    openedAt: row.opened_at as string,
    resolvedAt: (row.resolved_at as string | null) ?? null,
    lastTransitionAt: row.last_transition_at as string,
    acknowledgedAt: (row.acknowledged_at as string | null) ?? null,
    assigneeName: assignee?.display_name ?? null,
    publicVisibility: row.public_visibility as string,
    activeMaintenanceOccurrenceId:
      (row.active_maintenance_occurrence_id as string | null) ?? null,
  };
}

export async function listIncidents(
  organizationId: string,
  filters: IncidentListFilters = {},
): Promise<IncidentListItem[]> {
  const db = serviceClient();
  let q = db
    .from("incidents")
    .select(LIST_SELECT)
    .eq("organization_id", organizationId)
    .is("deleted_at", null)
    .order("opened_at", { ascending: false })
    .limit(Math.min(filters.limit ?? 50, 200));

  const status = filters.status ?? "all";
  if (status === "active") q = q.in("lifecycle_status", ["open", "monitoring"]);
  else if (status === "resolved") q = q.eq("lifecycle_status", "resolved");
  else if (status === "canceled") q = q.eq("lifecycle_status", "canceled");

  if (filters.severity) q = q.eq("severity", filters.severity);
  if (filters.origin) q = q.eq("origin", filters.origin);
  if (filters.monitorId) q = q.eq("primary_monitor_id", filters.monitorId);
  if (filters.assigneeId) q = q.eq("current_assignee_user_id", filters.assigneeId);
  if (filters.acknowledged === true) q = q.not("acknowledged_at", "is", null);
  if (filters.acknowledged === false) q = q.is("acknowledged_at", null);
  if (filters.before) q = q.lt("opened_at", filters.before);

  const { data, error } = await q;
  if (error) throw error;
  return (data ?? []).map((r) => mapListRow(r as Record<string, unknown>));
}

export interface IncidentDetail extends IncidentListItem {
  slug: string | null;
  internalSummary: string | null;
  publicSummary: string | null;
  publicTitle: string | null;
  resolutionSummary: string | null;
  cancellationReason: string | null;
  correlationKey: string;
  firstFailureAt: string | null;
  recoveryStartedAt: string | null;
  canceledAt: string | null;
  createdByName: string | null;
  acknowledgedByName: string | null;
  monitors: IncidentMonitorRow[];
}

export interface IncidentMonitorRow {
  monitorId: string;
  monitorName: string | null;
  relationship: string;
  attachOrigin: string;
  relationshipNote: string | null;
  currentState: OperationalState | null;
}

export async function getIncidentDetail(
  organizationId: string,
  incidentId: string,
): Promise<IncidentDetail | null> {
  const db = serviceClient();
  const { data, error } = await db
    .from("incidents")
    .select(
      `${LIST_SELECT}, slug, internal_summary, public_summary, public_title, resolution_summary, cancellation_reason, correlation_key, first_failure_at, recovery_started_at, canceled_at, creator:user_profiles!incidents_created_by_user_id_fkey(display_name), ack:user_profiles!incidents_acknowledged_by_user_id_fkey(display_name)`,
    )
    .eq("organization_id", organizationId)
    .eq("id", incidentId)
    .is("deleted_at", null)
    .maybeSingle();
  if (error) throw error;
  if (!data) return null;

  const row = data as Record<string, unknown>;
  const base = mapListRow(row);
  const creator = row.creator as { display_name: string | null } | null;
  const ack = row.ack as { display_name: string | null } | null;

  const { data: mons } = await db
    .from("incident_monitors")
    .select(
      "monitor_id, monitor_name_snapshot, relationship, attach_origin, relationship_note, monitor:monitors(name), state:monitor_operational_states(state)",
    )
    .eq("incident_id", incidentId)
    .is("removed_at", null);

  const monitors: IncidentMonitorRow[] = (mons ?? []).map((m) => {
    const rec = m as Record<string, unknown>;
    const monitor = rec.monitor as { name: string | null } | null;
    const state = rec.state as { state: OperationalState } | null;
    return {
      monitorId: rec.monitor_id as string,
      monitorName: monitor?.name ?? (rec.monitor_name_snapshot as string | null) ?? null,
      relationship: rec.relationship as string,
      attachOrigin: rec.attach_origin as string,
      relationshipNote: (rec.relationship_note as string | null) ?? null,
      currentState: state?.state ?? null,
    };
  });

  return {
    ...base,
    slug: (row.slug as string | null) ?? null,
    internalSummary: (row.internal_summary as string | null) ?? null,
    publicSummary: (row.public_summary as string | null) ?? null,
    publicTitle: (row.public_title as string | null) ?? null,
    resolutionSummary: (row.resolution_summary as string | null) ?? null,
    cancellationReason: (row.cancellation_reason as string | null) ?? null,
    correlationKey: row.correlation_key as string,
    firstFailureAt: (row.first_failure_at as string | null) ?? null,
    recoveryStartedAt: (row.recovery_started_at as string | null) ?? null,
    canceledAt: (row.canceled_at as string | null) ?? null,
    createdByName: creator?.display_name ?? null,
    acknowledgedByName: ack?.display_name ?? null,
    monitors,
  };
}

export interface IncidentEventRow {
  id: string;
  sequence: number;
  eventType: string;
  title: string;
  description: string | null;
  visibility: string;
  actorKind: string;
  actorName: string | null;
  monitorId: string | null;
  region: string | null;
  evidenceId: string | null;
  occurredAt: string;
}

export async function listIncidentEvents(
  organizationId: string,
  incidentId: string,
  opts: { limit?: number; offset?: number } = {},
): Promise<IncidentEventRow[]> {
  const db = serviceClient();
  const { data, error } = await db
    .from("incident_events")
    .select(
      "id, sequence, event_type, title, description, visibility, actor_kind, monitor_id, region, evidence_id, occurred_at, actor:user_profiles!incident_events_actor_user_id_fkey(display_name)",
    )
    .eq("organization_id", organizationId)
    .eq("incident_id", incidentId)
    .order("sequence", { ascending: false })
    .range(opts.offset ?? 0, (opts.offset ?? 0) + (opts.limit ?? 100) - 1);
  if (error) throw error;
  return (data ?? []).map((r) => {
    const row = r as Record<string, unknown>;
    const actor = row.actor as { display_name: string | null } | null;
    return {
      id: row.id as string,
      sequence: row.sequence as number,
      eventType: row.event_type as string,
      title: row.title as string,
      description: (row.description as string | null) ?? null,
      visibility: row.visibility as string,
      actorKind: row.actor_kind as string,
      actorName: actor?.display_name ?? null,
      monitorId: (row.monitor_id as string | null) ?? null,
      region: (row.region as string | null) ?? null,
      evidenceId: (row.evidence_id as string | null) ?? null,
      occurredAt: row.occurred_at as string,
    };
  });
}

export interface IncidentEvidenceRow {
  id: string;
  monitorId: string | null;
  executionId: string | null;
  role: string;
  resultStatus: string | null;
  failureCategory: string | null;
  httpStatus: number | null;
  responseTimeMs: number | null;
  region: string | null;
  attemptCount: number | null;
  safeFailureSummary: string | null;
  checkedAt: string | null;
}

export async function listIncidentEvidence(
  organizationId: string,
  incidentId: string,
  opts: { monitorId?: string } = {},
): Promise<IncidentEvidenceRow[]> {
  const db = serviceClient();
  let q = db
    .from("incident_evidence")
    .select(
      "id, monitor_id, execution_id, role, result_status, failure_category, http_status, response_time_ms, region, attempt_count, safe_failure_summary, checked_at",
    )
    .eq("organization_id", organizationId)
    .eq("incident_id", incidentId)
    .order("checked_at", { ascending: false })
    .limit(200);
  if (opts.monitorId) q = q.eq("monitor_id", opts.monitorId);
  const { data, error } = await q;
  if (error) throw error;
  return (data ?? []).map((r) => {
    const row = r as Record<string, unknown>;
    return {
      id: row.id as string,
      monitorId: (row.monitor_id as string | null) ?? null,
      executionId: (row.execution_id as string | null) ?? null,
      role: row.role as string,
      resultStatus: (row.result_status as string | null) ?? null,
      failureCategory: (row.failure_category as string | null) ?? null,
      httpStatus: (row.http_status as number | null) ?? null,
      responseTimeMs: (row.response_time_ms as number | null) ?? null,
      region: (row.region as string | null) ?? null,
      attemptCount: (row.attempt_count as number | null) ?? null,
      safeFailureSummary: (row.safe_failure_summary as string | null) ?? null,
      checkedAt: (row.checked_at as string | null) ?? null,
    };
  });
}

export interface IncidentUpdateRow {
  id: string;
  updateType: string;
  visibility: string;
  body: string;
  authorName: string | null;
  createdAt: string;
  supersededAt: string | null;
}

export async function listIncidentUpdates(
  organizationId: string,
  incidentId: string,
): Promise<IncidentUpdateRow[]> {
  const db = serviceClient();
  const { data, error } = await db
    .from("incident_updates")
    .select(
      "id, update_type, visibility, body, created_at, superseded_at, author:user_profiles!incident_updates_author_user_id_fkey(display_name)",
    )
    .eq("organization_id", organizationId)
    .eq("incident_id", incidentId)
    .order("created_at", { ascending: false });
  if (error) throw error;
  return (data ?? []).map((r) => {
    const row = r as Record<string, unknown>;
    const author = row.author as { display_name: string | null } | null;
    return {
      id: row.id as string,
      updateType: row.update_type as string,
      visibility: row.visibility as string,
      body: row.body as string,
      authorName: author?.display_name ?? null,
      createdAt: row.created_at as string,
      supersededAt: (row.superseded_at as string | null) ?? null,
    };
  });
}

export interface IncidentNoteRow {
  id: string;
  body: string;
  authorName: string | null;
  createdAt: string;
  editedAt: string | null;
}

export async function listIncidentNotes(
  organizationId: string,
  incidentId: string,
): Promise<IncidentNoteRow[]> {
  const db = serviceClient();
  const { data, error } = await db
    .from("incident_notes")
    .select(
      "id, body, created_at, edited_at, author:user_profiles!incident_notes_author_user_id_fkey(display_name)",
    )
    .eq("organization_id", organizationId)
    .eq("incident_id", incidentId)
    .is("deleted_at", null)
    .order("created_at", { ascending: false });
  if (error) throw error;
  return (data ?? []).map((r) => {
    const row = r as Record<string, unknown>;
    const author = row.author as { display_name: string | null } | null;
    return {
      id: row.id as string,
      body: row.body as string,
      authorName: author?.display_name ?? null,
      createdAt: row.created_at as string,
      editedAt: (row.edited_at as string | null) ?? null,
    };
  });
}

export interface IncidentOverview {
  activeIncidents: number;
  unacknowledged: number;
  criticalActive: number;
  recovering: number;
  flappingMonitors: number;
  activeMaintenance: number;
  recentlyResolved: number;
  verifying: number;
  degraded: number;
  down: number;
}

/** Truthful counts for the org overview and active command center. */
export async function getIncidentOverview(
  organizationId: string,
): Promise<IncidentOverview> {
  const db = serviceClient();
  const [incidents, states, maintenance, resolved] = await Promise.all([
    db
      .from("incidents")
      .select("severity, acknowledged_at, operational_status, lifecycle_status")
      .eq("organization_id", organizationId)
      .in("lifecycle_status", ["open", "monitoring"])
      .is("deleted_at", null),
    db
      .from("monitor_operational_states")
      .select("state, flapping_since")
      .eq("organization_id", organizationId),
    db
      .from("maintenance_occurrences")
      .select("id")
      .eq("organization_id", organizationId)
      .eq("status", "active"),
    db
      .from("incidents")
      .select("id")
      .eq("organization_id", organizationId)
      .eq("lifecycle_status", "resolved")
      .is("deleted_at", null)
      .gte("resolved_at", new Date(Date.now() - 7 * 86400_000).toISOString()),
  ]);

  const active = incidents.data ?? [];
  const stateRows = states.data ?? [];
  return {
    activeIncidents: active.length,
    unacknowledged: active.filter((i) => !i.acknowledged_at).length,
    criticalActive: active.filter((i) => i.severity === "critical").length,
    recovering: active.filter((i) => i.operational_status === "recovering").length,
    flappingMonitors: stateRows.filter((s) => s.flapping_since != null).length,
    activeMaintenance: (maintenance.data ?? []).length,
    recentlyResolved: (resolved.data ?? []).length,
    verifying: stateRows.filter((s) => s.state === "verifying_failure").length,
    degraded: stateRows.filter((s) => s.state === "degraded").length,
    down: stateRows.filter((s) => s.state === "down").length,
  };
}

export interface MonitorOperationalStateView {
  state: OperationalState;
  stateSince: string;
  activeIncidentId: string | null;
  consecutiveFailures: number;
  consecutiveSuccesses: number;
  verificationStartedAt: string | null;
  recoveryStartedAt: string | null;
  flappingSince: string | null;
}

export async function getMonitorOperationalState(
  organizationId: string,
  monitorId: string,
): Promise<MonitorOperationalStateView | null> {
  const db = serviceClient();
  const { data, error } = await db
    .from("monitor_operational_states")
    .select(
      "state, state_since, active_incident_id, consecutive_eligible_failures, consecutive_eligible_successes, verification_started_at, recovery_started_at, flapping_since",
    )
    .eq("organization_id", organizationId)
    .eq("monitor_id", monitorId)
    .maybeSingle();
  if (error) throw error;
  if (!data) return null;
  return {
    state: data.state as OperationalState,
    stateSince: data.state_since,
    activeIncidentId: data.active_incident_id,
    consecutiveFailures: data.consecutive_eligible_failures,
    consecutiveSuccesses: data.consecutive_eligible_successes,
    verificationStartedAt: data.verification_started_at,
    recoveryStartedAt: data.recovery_started_at,
    flappingSince: data.flapping_since,
  };
}

export async function listMonitorIncidents(
  organizationId: string,
  monitorId: string,
  limit = 20,
): Promise<IncidentListItem[]> {
  return listIncidents(organizationId, { monitorId, limit });
}

export interface OrgMemberOption {
  userId: string;
  name: string;
}

export async function listOrgMembersForSelect(
  organizationId: string,
): Promise<OrgMemberOption[]> {
  const db = serviceClient();
  const { data, error } = await db
    .from("organization_members")
    .select("user_id, profile:user_profiles!organization_members_user_id_fkey(display_name, primary_email)")
    .eq("organization_id", organizationId)
    .eq("status", "active");
  if (error) throw error;
  return (data ?? []).map((r) => {
    const row = r as Record<string, unknown>;
    const p = row.profile as { display_name: string | null; primary_email: string | null } | null;
    return {
      userId: row.user_id as string,
      name: p?.display_name ?? p?.primary_email ?? "Member",
    };
  });
}

export interface MonitorOption {
  id: string;
  name: string;
}

export async function listMonitorsForSelect(
  organizationId: string,
): Promise<MonitorOption[]> {
  const db = serviceClient();
  const { data, error } = await db
    .from("monitors")
    .select("id, name")
    .eq("organization_id", organizationId)
    .is("deleted_at", null)
    .neq("status", "archived")
    .order("name");
  if (error) throw error;
  return (data ?? []).map((r) => ({ id: r.id as string, name: r.name as string }));
}
