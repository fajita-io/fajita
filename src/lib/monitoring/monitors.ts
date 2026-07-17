import "server-only";

import { serviceClient } from "@/lib/supabase/service";
import { buildConfigSnapshot, type MonitorConfig } from "@/lib/monitoring/config";
import { validateUrl } from "@/lib/monitoring/destination";

/**
 * Monitor data layer. Every function is organization-scoped and assumes the
 * caller has already verified authentication and the `monitors:manage`
 * permission. Writes go through the service role after that explicit check, as
 * Phase 3 established. Result status is worker-owned and never set here.
 */

export interface MonitorSummary {
  id: string;
  name: string;
  monitorType: string;
  status: string;
  targetUrl: string | null;
  checkIntervalSeconds: number;
  lastResultStatus: string | null;
  lastCheckAt: string | null;
  nextCheckAt: string | null;
  updatedAt: string;
}

export interface MonitorDetail extends MonitorSummary {
  description: string | null;
  httpMethod: string;
  timeoutMs: number;
  retryCount: number;
  followRedirects: boolean;
  maxRedirects: number;
  expectedStatusCodes: number[];
  currentVersionId: string | null;
  versionNumber: number | null;
  assertions: Array<{
    id: string;
    assertionType: string;
    fieldPath: string | null;
    operator: string | null;
    expectedValue: string | null;
    expectedValueType: string;
    caseSensitive: boolean;
    position: number;
  }>;
}

/** Small startup jitter so activated monitors do not synchronize. */
function jitteredNext(intervalSeconds: number): string {
  const jitterMs = Math.floor(Math.random() * Math.min(15000, intervalSeconds * 100));
  return new Date(Date.now() + jitterMs).toISOString();
}

function normalizedFor(config: MonitorConfig): string | null {
  if (!config.target_url) return null;
  const v = validateUrl(config.target_url);
  return v.ok ? v.normalized : config.target_url;
}

interface CreateResult {
  monitorId: string;
  versionId: string;
}

/** Create a draft monitor with its first version and assertions. */
export async function createDraftMonitor(params: {
  organizationId: string;
  actorProfileId: string;
  config: MonitorConfig;
  secretIds?: string[];
}): Promise<CreateResult> {
  const db = serviceClient();
  const { organizationId, actorProfileId, config } = params;
  const secretIds = params.secretIds ?? [];

  const { data: monitor, error: mErr } = await db
    .from("monitors")
    .insert({
      organization_id: organizationId,
      name: config.name,
      description: config.description || null,
      monitor_type: config.monitor_type,
      status: "draft",
      target_url: config.target_url ?? null,
      normalized_url: normalizedFor(config),
      http_method: config.http_method,
      check_interval_seconds: config.check_interval_seconds,
      timeout_ms: config.timeout_ms,
      retry_count: config.retry_count,
      retry_delay_ms: config.retry_delay_ms,
      follow_redirects: config.follow_redirects,
      max_redirects: config.max_redirects,
      expected_status_codes: config.expected_status_codes,
      response_time_threshold_ms: config.response_time_threshold_ms ?? null,
      body_size_limit_bytes: config.body_size_limit_bytes,
      created_by_user_id: actorProfileId,
      updated_by_user_id: actorProfileId,
    })
    .select("id")
    .single();
  if (mErr) throw mErr;

  const versionId = await createVersionRow({
    monitorId: monitor.id,
    organizationId,
    actorProfileId,
    versionNumber: 1,
    config,
    secretIds,
    changeSummary: "Initial configuration",
  });

  const { error: cvErr } = await db
    .from("monitors")
    .update({ current_version_id: versionId })
    .eq("id", monitor.id)
    .eq("organization_id", organizationId);
  if (cvErr) throw cvErr;

  return { monitorId: monitor.id, versionId };
}

/** Insert a version row plus its assertion rows. Returns the version id. */
async function createVersionRow(params: {
  monitorId: string;
  organizationId: string;
  actorProfileId: string;
  versionNumber: number;
  config: MonitorConfig;
  secretIds: string[];
  changeSummary: string;
}): Promise<string> {
  const db = serviceClient();
  const snapshot = buildConfigSnapshot(params.config, params.secretIds);

  const { data: version, error: vErr } = await db
    .from("monitor_versions")
    .insert({
      monitor_id: params.monitorId,
      organization_id: params.organizationId,
      version_number: params.versionNumber,
      configuration_snapshot: snapshot as never,
      change_summary: params.changeSummary,
      created_by_user_id: params.actorProfileId,
    })
    .select("id")
    .single();
  if (vErr) throw vErr;

  if (params.config.assertions.length > 0) {
    const rows = params.config.assertions.map((a, i) => ({
      monitor_id: params.monitorId,
      monitor_version_id: version.id,
      organization_id: params.organizationId,
      assertion_type: a.assertion_type,
      field_path: a.field_path ?? null,
      operator: a.operator ?? null,
      expected_value: a.expected_value ?? null,
      expected_value_type: a.expected_value_type,
      case_sensitive: a.case_sensitive,
      position: a.position ?? i,
    }));
    const { error: aErr } = await db.from("monitor_assertions").insert(rows);
    if (aErr) throw aErr;
  }
  return version.id;
}

/** Next version number for a monitor. */
async function nextVersionNumber(
  monitorId: string,
  organizationId: string,
): Promise<number> {
  const db = serviceClient();
  const { data, error } = await db
    .from("monitor_versions")
    .select("version_number")
    .eq("monitor_id", monitorId)
    .eq("organization_id", organizationId)
    .order("version_number", { ascending: false })
    .limit(1);
  if (error) throw error;
  return (data?.[0]?.version_number ?? 0) + 1;
}

/**
 * Update a monitor by creating a new immutable version and repointing the head.
 * Historical configuration is never mutated. If the monitor is active, its
 * schedule is repointed to the new version and its generation bumped so an
 * in-flight execution finishes against the version it started with.
 */
export async function updateMonitor(params: {
  organizationId: string;
  actorProfileId: string;
  monitorId: string;
  config: MonitorConfig;
  secretIds?: string[];
  changeSummary?: string;
}): Promise<{ versionId: string; versionNumber: number }> {
  const db = serviceClient();
  const { organizationId, actorProfileId, monitorId, config } = params;

  const existing = await getMonitorRow(organizationId, monitorId);
  if (!existing) throw new Error("Monitor not found.");

  const versionNumber = await nextVersionNumber(monitorId, organizationId);
  const versionId = await createVersionRow({
    monitorId,
    organizationId,
    actorProfileId,
    versionNumber,
    config,
    secretIds: params.secretIds ?? [],
    changeSummary: params.changeSummary || `Updated to version ${versionNumber}`,
  });

  const { error: uErr } = await db
    .from("monitors")
    .update({
      name: config.name,
      description: config.description || null,
      monitor_type: config.monitor_type,
      target_url: config.target_url ?? null,
      normalized_url: normalizedFor(config),
      http_method: config.http_method,
      check_interval_seconds: config.check_interval_seconds,
      timeout_ms: config.timeout_ms,
      retry_count: config.retry_count,
      retry_delay_ms: config.retry_delay_ms,
      follow_redirects: config.follow_redirects,
      max_redirects: config.max_redirects,
      expected_status_codes: config.expected_status_codes,
      response_time_threshold_ms: config.response_time_threshold_ms ?? null,
      body_size_limit_bytes: config.body_size_limit_bytes,
      current_version_id: versionId,
      updated_by_user_id: actorProfileId,
    })
    .eq("id", monitorId)
    .eq("organization_id", organizationId);
  if (uErr) throw uErr;

  if (existing.status === "active" && config.monitor_type !== "heartbeat") {
    const { error: sErr } = await db
      .from("check_schedules")
      .update({
        monitor_version_id: versionId,
        interval_seconds: config.check_interval_seconds,
      })
      .eq("monitor_id", monitorId);
    if (sErr) throw sErr;
    // Bump generation so leases from the prior generation are ignored.
    await bumpScheduleGeneration(monitorId);
  }

  return { versionId, versionNumber };
}

async function bumpScheduleGeneration(monitorId: string): Promise<void> {
  const db = serviceClient();
  const { data } = await db
    .from("check_schedules")
    .select("schedule_generation")
    .eq("monitor_id", monitorId)
    .maybeSingle();
  const next = (data?.schedule_generation ?? 1) + 1;
  await db
    .from("check_schedules")
    .update({ schedule_generation: next })
    .eq("monitor_id", monitorId);
}

/** Activate a monitor: set status active and (for non-heartbeat) schedule it. */
export async function activateMonitor(params: {
  organizationId: string;
  actorProfileId: string;
  monitorId: string;
}): Promise<void> {
  const db = serviceClient();
  const { organizationId, actorProfileId, monitorId } = params;

  const monitor = await getMonitorRow(organizationId, monitorId);
  if (!monitor) throw new Error("Monitor not found.");
  if (!monitor.current_version_id) throw new Error("Monitor has no version.");

  const { error: uErr } = await db
    .from("monitors")
    .update({
      status: "active",
      paused_at: null,
      next_check_at:
        monitor.monitor_type === "heartbeat"
          ? null
          : jitteredNext(monitor.check_interval_seconds),
      updated_by_user_id: actorProfileId,
    })
    .eq("id", monitorId)
    .eq("organization_id", organizationId);
  if (uErr) throw uErr;

  if (monitor.monitor_type !== "heartbeat") {
    const { error: sErr } = await db.from("check_schedules").upsert(
      {
        monitor_id: monitorId,
        organization_id: organizationId,
        monitor_version_id: monitor.current_version_id,
        interval_seconds: monitor.check_interval_seconds,
        next_check_at: jitteredNext(monitor.check_interval_seconds),
        enabled: true,
        locked_at: null,
        locked_by_worker_id: null,
        lease_expires_at: null,
      },
      { onConflict: "monitor_id" },
    );
    if (sErr) throw sErr;
  }
}

/** Pause a monitor: stop new leases, preserve history. */
export async function pauseMonitor(params: {
  organizationId: string;
  actorProfileId: string;
  monitorId: string;
}): Promise<void> {
  const db = serviceClient();
  const { organizationId, actorProfileId, monitorId } = params;

  const { error } = await db
    .from("monitors")
    .update({
      status: "paused",
      paused_at: new Date().toISOString(),
      updated_by_user_id: actorProfileId,
    })
    .eq("id", monitorId)
    .eq("organization_id", organizationId);
  if (error) throw error;

  await db
    .from("check_schedules")
    .update({ enabled: false })
    .eq("monitor_id", monitorId);
}

/** Resume a paused monitor with a safe next check time. */
export async function resumeMonitor(params: {
  organizationId: string;
  actorProfileId: string;
  monitorId: string;
}): Promise<void> {
  const db = serviceClient();
  const { organizationId, actorProfileId, monitorId } = params;

  const monitor = await getMonitorRow(organizationId, monitorId);
  if (!monitor) throw new Error("Monitor not found.");

  const { error } = await db
    .from("monitors")
    .update({
      status: "active",
      paused_at: null,
      next_check_at:
        monitor.monitor_type === "heartbeat"
          ? null
          : jitteredNext(monitor.check_interval_seconds),
      updated_by_user_id: actorProfileId,
    })
    .eq("id", monitorId)
    .eq("organization_id", organizationId);
  if (error) throw error;

  if (monitor.monitor_type !== "heartbeat") {
    await db
      .from("check_schedules")
      .update({
        enabled: true,
        next_check_at: jitteredNext(monitor.check_interval_seconds),
      })
      .eq("monitor_id", monitorId);
  }
}

/** Soft-delete a monitor and disable its schedule. */
export async function softDeleteMonitor(params: {
  organizationId: string;
  actorProfileId: string;
  monitorId: string;
}): Promise<void> {
  const db = serviceClient();
  const { organizationId, actorProfileId, monitorId } = params;

  const { error } = await db
    .from("monitors")
    .update({
      status: "deleted",
      deleted_at: new Date().toISOString(),
      updated_by_user_id: actorProfileId,
    })
    .eq("id", monitorId)
    .eq("organization_id", organizationId);
  if (error) throw error;

  await db
    .from("check_schedules")
    .update({ enabled: false })
    .eq("monitor_id", monitorId);
}

interface MonitorRow {
  id: string;
  monitor_type: string;
  status: string;
  check_interval_seconds: number;
  current_version_id: string | null;
}

async function getMonitorRow(
  organizationId: string,
  monitorId: string,
): Promise<MonitorRow | null> {
  const db = serviceClient();
  const { data, error } = await db
    .from("monitors")
    .select("id, monitor_type, status, check_interval_seconds, current_version_id")
    .eq("id", monitorId)
    .eq("organization_id", organizationId)
    .is("deleted_at", null)
    .maybeSingle();
  if (error) throw error;
  return data;
}

/** List monitor summaries for an organization, newest first. */
export async function listMonitors(
  organizationId: string,
  limit = 100,
): Promise<MonitorSummary[]> {
  const db = serviceClient();
  const { data, error } = await db
    .from("monitors")
    .select(
      "id, name, monitor_type, status, target_url, check_interval_seconds, last_result_status, last_check_at, next_check_at, updated_at",
    )
    .eq("organization_id", organizationId)
    .is("deleted_at", null)
    .order("updated_at", { ascending: false })
    .limit(limit);
  if (error) throw error;
  return (data ?? []).map((r) => ({
    id: r.id,
    name: r.name,
    monitorType: r.monitor_type,
    status: r.status,
    targetUrl: r.target_url,
    checkIntervalSeconds: r.check_interval_seconds,
    lastResultStatus: r.last_result_status,
    lastCheckAt: r.last_check_at,
    nextCheckAt: r.next_check_at,
    updatedAt: r.updated_at,
  }));
}

/**
 * Archive a monitor: stop scheduling, keep history, remove from default views.
 * Distinct from deletion. The monitor can be restored to a paused state.
 */
export async function archiveMonitor(params: {
  organizationId: string;
  actorProfileId: string;
  monitorId: string;
}): Promise<void> {
  const db = serviceClient();
  const { organizationId, actorProfileId, monitorId } = params;
  const { error } = await db
    .from("monitors")
    .update({
      status: "archived",
      archived_at: new Date().toISOString(),
      paused_at: new Date().toISOString(),
      updated_by_user_id: actorProfileId,
    })
    .eq("id", monitorId)
    .eq("organization_id", organizationId)
    .is("deleted_at", null);
  if (error) throw error;
  await db
    .from("check_schedules")
    .update({ enabled: false })
    .eq("monitor_id", monitorId);
}

/** Restore an archived monitor to a paused state. Checks do not auto-resume. */
export async function restoreMonitor(params: {
  organizationId: string;
  actorProfileId: string;
  monitorId: string;
}): Promise<void> {
  const db = serviceClient();
  const { organizationId, actorProfileId, monitorId } = params;
  const { error } = await db
    .from("monitors")
    .update({
      status: "paused",
      archived_at: null,
      updated_by_user_id: actorProfileId,
    })
    .eq("id", monitorId)
    .eq("organization_id", organizationId)
    .is("deleted_at", null);
  if (error) throw error;
}

/**
 * Request a manual check by advancing the monitor's next scheduled check to now
 * so the next available worker leases it promptly. This never runs a check in
 * the browser or the web process and never fabricates a result: the worker
 * produces the result, and the UI reflects it when it arrives. Heartbeat
 * monitors have no outbound check to run.
 */
export async function requestManualCheck(params: {
  organizationId: string;
  monitorId: string;
}): Promise<{ queued: boolean; reason?: string }> {
  const db = serviceClient();
  const { organizationId, monitorId } = params;
  const monitor = await getMonitorRow(organizationId, monitorId);
  if (!monitor) throw new Error("Monitor not found.");
  if (monitor.monitor_type === "heartbeat") {
    return { queued: false, reason: "Heartbeat monitors receive pings; there is no outbound check to run." };
  }
  if (monitor.status !== "active") {
    return { queued: false, reason: "Activate the monitor before running a check." };
  }
  const { data: schedule } = await db
    .from("check_schedules")
    .select("monitor_id, enabled")
    .eq("monitor_id", monitorId)
    .maybeSingle();
  if (!schedule) {
    return { queued: false, reason: "This monitor has no active schedule yet." };
  }
  const { error } = await db
    .from("check_schedules")
    .update({ next_check_at: new Date().toISOString(), enabled: true })
    .eq("monitor_id", monitorId)
    .eq("organization_id", organizationId)
    .is("locked_at", null);
  if (error) throw error;
  return { queued: true };
}

/**
 * Duplicate a monitor as a new draft. Copies type, request configuration,
 * assertions, timing, group, and tags. Secrets are NOT copied: the duplicate
 * requires credential re-entry, so a secret can never silently follow a copy.
 */
export async function duplicateMonitor(params: {
  organizationId: string;
  actorProfileId: string;
  monitorId: string;
}): Promise<{ monitorId: string }> {
  const db = serviceClient();
  const { organizationId, actorProfileId, monitorId } = params;

  const { data: src, error: sErr } = await db
    .from("monitors")
    .select(
      "name, description, monitor_type, target_url, http_method, check_interval_seconds, timeout_ms, retry_count, retry_delay_ms, follow_redirects, max_redirects, expected_status_codes, response_time_threshold_ms, body_size_limit_bytes, group_id, current_version_id",
    )
    .eq("id", monitorId)
    .eq("organization_id", organizationId)
    .is("deleted_at", null)
    .maybeSingle();
  if (sErr) throw sErr;
  if (!src) throw new Error("Monitor not found.");

  // Copy assertions from the source's active version.
  let assertions: MonitorConfig["assertions"] = [];
  if (src.current_version_id) {
    const { data: aRows } = await db
      .from("monitor_assertions")
      .select("assertion_type, field_path, operator, expected_value, expected_value_type, case_sensitive, position")
      .eq("organization_id", organizationId)
      .eq("monitor_version_id", src.current_version_id)
      .order("position", { ascending: true });
    assertions = (aRows ?? []).map((a) => ({
      assertion_type: a.assertion_type as MonitorConfig["assertions"][number]["assertion_type"],
      field_path: a.field_path ?? null,
      operator: a.operator ?? null,
      expected_value: a.expected_value ?? null,
      expected_value_type: a.expected_value_type as MonitorConfig["assertions"][number]["expected_value_type"],
      case_sensitive: a.case_sensitive,
      position: a.position,
    }));
  }

  const config: MonitorConfig = {
    name: `Copy of ${src.name}`.slice(0, 160),
    description: src.description ?? "",
    monitor_type: src.monitor_type as MonitorConfig["monitor_type"],
    target_url: src.target_url,
    http_method: src.http_method as MonitorConfig["http_method"],
    check_interval_seconds: src.check_interval_seconds,
    timeout_ms: src.timeout_ms,
    retry_count: src.retry_count,
    retry_delay_ms: src.retry_delay_ms,
    follow_redirects: src.follow_redirects,
    max_redirects: src.max_redirects,
    expected_status_codes: src.expected_status_codes ?? [200],
    response_time_threshold_ms: src.response_time_threshold_ms,
    body_size_limit_bytes: src.body_size_limit_bytes,
    assertions,
  };

  const { monitorId: newId } = await createDraftMonitor({
    organizationId,
    actorProfileId,
    config,
  });

  // Carry over group and tags (not secrets).
  if (src.group_id) {
    await db
      .from("monitors")
      .update({ group_id: src.group_id })
      .eq("id", newId)
      .eq("organization_id", organizationId);
  }
  const { data: tagRows } = await db
    .from("monitor_tag_assignments")
    .select("tag_id")
    .eq("organization_id", organizationId)
    .eq("monitor_id", monitorId);
  if (tagRows && tagRows.length > 0) {
    await db.from("monitor_tag_assignments").insert(
      tagRows.map((t) => ({
        organization_id: organizationId,
        monitor_id: newId,
        tag_id: t.tag_id,
      })),
    );
  }

  return { monitorId: newId };
}

/** Recent check results for one monitor. Never returns secrets or bodies. */
export interface CheckResultView {
  id: string;
  status: string;
  failureCategory: string | null;
  httpStatus: number | null;
  totalMs: number | null;
  region: string | null;
  safeErrorMessage: string | null;
  checkedAt: string;
}

export async function listResults(
  organizationId: string,
  monitorId: string,
  limit = 50,
): Promise<CheckResultView[]> {
  const db = serviceClient();
  const { data, error } = await db
    .from("check_results")
    .select(
      "id, status, failure_category, http_status, total_ms, region, safe_error_message, checked_at",
    )
    .eq("organization_id", organizationId)
    .eq("monitor_id", monitorId)
    .order("checked_at", { ascending: false })
    .limit(limit);
  if (error) throw error;
  return (data ?? []).map((r) => ({
    id: r.id,
    status: r.status,
    failureCategory: r.failure_category,
    httpStatus: r.http_status,
    totalMs: r.total_ms,
    region: r.region,
    safeErrorMessage: r.safe_error_message,
    checkedAt: r.checked_at,
  }));
}
