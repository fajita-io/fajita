import "server-only";

import { serviceClient } from "@/lib/supabase/service";
import { safeDestination } from "@/lib/monitoring/url-privacy";
import { EMPTY_STATS, type ResultStats } from "@/lib/monitoring/uptime";
import type { MonitorConfigSnapshot } from "@contracts/contract";

/**
 * Customer-facing read layer for monitors. Every function is organization
 * scoped and assumes the caller has already verified membership. Secrets, full
 * response bodies, and worker internals are never returned. URLs are redacted
 * to safe destinations except where an explicit permissioned detail path asks
 * for the full value.
 */

/* ------------------------------------------------------------------ */
/* Shared shapes                                                       */
/* ------------------------------------------------------------------ */

export interface TlsSummary {
  subject: string | null;
  issuer: string | null;
  notBefore: string | null;
  notAfter: string | null;
  daysRemaining: number | null;
  hostnameMatch: boolean | null;
  chainValid: boolean | null;
  tlsVersion: string | null;
}

function parseTls(raw: unknown): TlsSummary | null {
  if (!raw || typeof raw !== "object") return null;
  const o = raw as Record<string, unknown>;
  const num = (v: unknown) => (typeof v === "number" ? v : null);
  const str = (v: unknown) => (typeof v === "string" ? v : null);
  const bool = (v: unknown) => (typeof v === "boolean" ? v : null);
  return {
    subject: str(o.subject),
    issuer: str(o.issuer),
    notBefore: str(o.not_before),
    notAfter: str(o.not_after),
    daysRemaining: num(o.days_remaining),
    hostnameMatch: bool(o.hostname_match),
    chainValid: bool(o.chain_valid),
    tlsVersion: str(o.tls_version),
  };
}

export interface TagView {
  id: string;
  name: string;
  colorToken: string;
}

export interface MonitorListItem {
  id: string;
  name: string;
  monitorType: string;
  status: string;
  safeDestination: string;
  checkIntervalSeconds: number;
  lastResultStatus: string | null;
  lastResponseTimeMs: number | null;
  lastCheckAt: string | null;
  nextCheckAt: string | null;
  region: string;
  groupId: string | null;
  groupName: string | null;
  tags: TagView[];
  archivedAt: string | null;
  sslDaysRemaining: number | null;
  heartbeatState: string | null;
  heartbeatLastAt: string | null;
  stats24h: ResultStats;
}

export interface MonitorListResult {
  items: MonitorListItem[];
  total: number;
  page: number;
  pageSize: number;
}

export interface MonitorQueryOptions {
  search?: string;
  type?: string;
  status?: string;
  result?: string;
  groupId?: string;
  tagId?: string;
  intervalSeconds?: number;
  sort?: string;
  page?: number;
  pageSize?: number;
  includeArchived?: boolean;
}

/* ------------------------------------------------------------------ */
/* Stats via the centralized aggregate                                 */
/* ------------------------------------------------------------------ */

interface RawStatRow {
  monitor_id: string;
  total_considered: number;
  passed: number;
  failed: number;
  errored: number;
  timed_out: number;
  blocked: number;
  avg_total_ms: number | null;
  last_checked_at: string | null;
}

function toStats(r: RawStatRow | undefined): ResultStats {
  if (!r) return { ...EMPTY_STATS };
  return {
    totalConsidered: Number(r.total_considered ?? 0),
    passed: Number(r.passed ?? 0),
    failed: Number(r.failed ?? 0),
    errored: Number(r.errored ?? 0),
    timedOut: Number(r.timed_out ?? 0),
    blocked: Number(r.blocked ?? 0),
    avgTotalMs: r.avg_total_ms === null ? null : Number(r.avg_total_ms),
    lastCheckedAt: r.last_checked_at,
  };
}

/** Result stats for every monitor in an org since a time, keyed by monitor id. */
export async function statsByMonitor(
  organizationId: string,
  since: Date,
): Promise<Map<string, ResultStats>> {
  const db = serviceClient();
  const { data, error } = await db.rpc("monitor_result_stats", {
    p_org: organizationId,
    p_since: since.toISOString(),
    p_monitor: undefined,
  });
  if (error) throw error;
  const map = new Map<string, ResultStats>();
  for (const row of (data ?? []) as RawStatRow[]) {
    map.set(row.monitor_id, toStats(row));
  }
  return map;
}

/** Result stats for one monitor since a time. */
export async function statsForMonitor(
  organizationId: string,
  monitorId: string,
  since: Date,
): Promise<ResultStats> {
  const db = serviceClient();
  const { data, error } = await db.rpc("monitor_result_stats", {
    p_org: organizationId,
    p_since: since.toISOString(),
    p_monitor: monitorId,
  });
  if (error) throw error;
  return toStats(((data ?? []) as RawStatRow[])[0]);
}

/* ------------------------------------------------------------------ */
/* Overview / summary metrics (org-wide, truthful, no fabrication)     */
/* ------------------------------------------------------------------ */

export interface MonitorMetrics {
  activeMonitors: number;
  pausedMonitors: number;
  draftMonitors: number;
  totalMonitors: number;
  checksToday: number;
  successToday: number;
  failedToday: number;
  avgResponseMs: number | null;
  certsExpiringSoon: number;
  lateHeartbeats: number;
}

export async function getMonitorMetrics(
  organizationId: string,
): Promise<MonitorMetrics> {
  const db = serviceClient();

  const [statusRes, stats, sslDays, hbStates] = await Promise.all([
    db
      .from("monitors")
      .select("status")
      .eq("organization_id", organizationId)
      .is("deleted_at", null),
    statsByMonitor(organizationId, startOfUtcDay()),
    (async () => {
      const { data } = await db
        .from("monitors")
        .select("id, monitor_type")
        .eq("organization_id", organizationId)
        .is("deleted_at", null)
        .eq("monitor_type", "ssl");
      return loadLatestSslDays(
        organizationId,
        (data ?? []).map((m) => ({ id: m.id, monitor_type: m.monitor_type })),
      );
    })(),
    db
      .from("heartbeat_tokens")
      .select("state")
      .eq("organization_id", organizationId)
      .is("revoked_at", null),
  ]);

  let active = 0;
  let paused = 0;
  let draft = 0;
  let total = 0;
  for (const row of statusRes.data ?? []) {
    total += 1;
    if (row.status === "active") active += 1;
    else if (row.status === "paused") paused += 1;
    else if (row.status === "draft") draft += 1;
  }

  let checksToday = 0;
  let successToday = 0;
  let failedToday = 0;
  let weightedMs = 0;
  let weight = 0;
  for (const s of stats.values()) {
    checksToday += s.totalConsidered;
    successToday += s.passed;
    failedToday += s.failed + s.errored + s.timedOut;
    if (s.avgTotalMs !== null && s.passed > 0) {
      weightedMs += s.avgTotalMs * s.passed;
      weight += s.passed;
    }
  }

  let certsExpiringSoon = 0;
  for (const days of sslDays.values()) if (days <= 30) certsExpiringSoon += 1;

  let lateHeartbeats = 0;
  for (const row of hbStates.data ?? []) {
    if (row.state === "late" || row.state === "missed") lateHeartbeats += 1;
  }

  return {
    activeMonitors: active,
    pausedMonitors: paused,
    draftMonitors: draft,
    totalMonitors: total,
    checksToday,
    successToday,
    failedToday,
    avgResponseMs: weight > 0 ? weightedMs / weight : null,
    certsExpiringSoon,
    lateHeartbeats,
  };
}

function startOfUtcDay(): Date {
  const now = new Date();
  return new Date(Date.UTC(now.getUTCFullYear(), now.getUTCMonth(), now.getUTCDate()));
}

/* ------------------------------------------------------------------ */
/* Monitor list                                                        */
/* ------------------------------------------------------------------ */

const SORT_COLUMNS: Record<string, { col: string; ascending: boolean }> = {
  name: { col: "name", ascending: true },
  updated: { col: "updated_at", ascending: false },
  created: { col: "created_at", ascending: false },
  last_checked: { col: "last_check_at", ascending: false },
  response_time: { col: "last_response_time_ms", ascending: false },
  next_check: { col: "next_check_at", ascending: true },
};

export async function listMonitorViews(
  organizationId: string,
  opts: MonitorQueryOptions = {},
): Promise<MonitorListResult> {
  const db = serviceClient();
  const page = Math.max(1, opts.page ?? 1);
  const pageSize = Math.min(100, Math.max(5, opts.pageSize ?? 25));
  const from = (page - 1) * pageSize;
  const to = from + pageSize - 1;

  let q = db
    .from("monitors")
    .select(
      "id, name, monitor_type, status, target_url, check_interval_seconds, last_result_status, last_response_time_ms, last_check_at, next_check_at, region_policy, group_id, archived_at",
      { count: "exact" },
    )
    .eq("organization_id", organizationId)
    .is("deleted_at", null);

  if (!opts.includeArchived) q = q.is("archived_at", null);
  if (opts.type) q = q.eq("monitor_type", opts.type);
  if (opts.status) q = q.eq("status", opts.status);
  if (opts.result) q = q.eq("last_result_status", opts.result);
  if (opts.groupId) q = q.eq("group_id", opts.groupId);
  if (opts.intervalSeconds) q = q.eq("check_interval_seconds", opts.intervalSeconds);
  if (opts.search) {
    const s = opts.search.replace(/[%,]/g, "").trim();
    if (s) q = q.or(`name.ilike.%${s}%,normalized_url.ilike.%${s}%`);
  }

  // Tag filter needs the assignment set first.
  if (opts.tagId) {
    const { data: assigned } = await db
      .from("monitor_tag_assignments")
      .select("monitor_id")
      .eq("organization_id", organizationId)
      .eq("tag_id", opts.tagId);
    const ids = (assigned ?? []).map((a) => a.monitor_id);
    if (ids.length === 0) {
      return { items: [], total: 0, page, pageSize };
    }
    q = q.in("id", ids);
  }

  const sort = SORT_COLUMNS[opts.sort ?? "updated"] ?? SORT_COLUMNS.updated;
  q = q
    .order(sort.col, { ascending: sort.ascending, nullsFirst: false })
    .range(from, to);

  const { data: rows, error, count } = await q;
  if (error) throw error;
  const monitors = rows ?? [];
  const ids = monitors.map((m) => m.id);

  // Enrichment queries run in parallel; none fans out per monitor.
  const [groupsMap, tagsMap, hbMap, sslMap, stats] = await Promise.all([
    loadGroupsMap(organizationId),
    loadTagsForMonitors(organizationId, ids),
    loadHeartbeatStates(organizationId, ids),
    loadLatestSslDays(organizationId, monitors),
    statsByMonitor(organizationId, since24h()),
  ]);

  const items: MonitorListItem[] = monitors.map((m) => ({
    id: m.id,
    name: m.name,
    monitorType: m.monitor_type,
    status: m.status,
    safeDestination: safeDestination(m.target_url),
    checkIntervalSeconds: m.check_interval_seconds,
    lastResultStatus: m.last_result_status,
    lastResponseTimeMs: m.last_response_time_ms,
    lastCheckAt: m.last_check_at,
    nextCheckAt: m.next_check_at,
    region: m.region_policy === "specific" ? "Selected region" : "US East",
    groupId: m.group_id,
    groupName: m.group_id ? (groupsMap.get(m.group_id) ?? null) : null,
    tags: tagsMap.get(m.id) ?? [],
    archivedAt: m.archived_at,
    sslDaysRemaining: sslMap.get(m.id) ?? null,
    heartbeatState: hbMap.get(m.id)?.state ?? null,
    heartbeatLastAt: hbMap.get(m.id)?.lastAt ?? null,
    stats24h: stats.get(m.id) ?? { ...EMPTY_STATS },
  }));

  return { items, total: count ?? items.length, page, pageSize };
}

function since24h(): Date {
  return new Date(Date.now() - 24 * 60 * 60 * 1000);
}

async function loadGroupsMap(
  organizationId: string,
): Promise<Map<string, string>> {
  const db = serviceClient();
  const { data } = await db
    .from("monitor_groups")
    .select("id, name")
    .eq("organization_id", organizationId)
    .is("deleted_at", null);
  const map = new Map<string, string>();
  for (const g of data ?? []) map.set(g.id, g.name);
  return map;
}

async function loadTagsForMonitors(
  organizationId: string,
  monitorIds: string[],
): Promise<Map<string, TagView[]>> {
  const map = new Map<string, TagView[]>();
  if (monitorIds.length === 0) return map;
  const db = serviceClient();
  const { data } = await db
    .from("monitor_tag_assignments")
    .select("monitor_id, monitor_tags(id, name, color_token)")
    .eq("organization_id", organizationId)
    .in("monitor_id", monitorIds);
  for (const row of data ?? []) {
    const tag = row.monitor_tags as unknown as {
      id: string;
      name: string;
      color_token: string;
    } | null;
    if (!tag) continue;
    const list = map.get(row.monitor_id) ?? [];
    list.push({ id: tag.id, name: tag.name, colorToken: tag.color_token });
    map.set(row.monitor_id, list);
  }
  return map;
}

async function loadHeartbeatStates(
  organizationId: string,
  monitorIds: string[],
): Promise<Map<string, { state: string; lastAt: string | null }>> {
  const map = new Map<string, { state: string; lastAt: string | null }>();
  if (monitorIds.length === 0) return map;
  const db = serviceClient();
  const { data } = await db
    .from("heartbeat_tokens")
    .select("monitor_id, state, last_heartbeat_at")
    .eq("organization_id", organizationId)
    .in("monitor_id", monitorIds)
    .is("revoked_at", null);
  for (const row of data ?? []) {
    if (!map.has(row.monitor_id)) {
      map.set(row.monitor_id, {
        state: row.state,
        lastAt: row.last_heartbeat_at,
      });
    }
  }
  return map;
}

/** Latest SSL days-remaining per ssl monitor, from recent results. Bounded. */
async function loadLatestSslDays(
  organizationId: string,
  monitors: Array<{ id: string; monitor_type: string }>,
): Promise<Map<string, number>> {
  const map = new Map<string, number>();
  const sslIds = monitors
    .filter((m) => m.monitor_type === "ssl")
    .map((m) => m.id);
  if (sslIds.length === 0) return map;
  const db = serviceClient();
  const { data } = await db
    .from("check_results")
    .select("monitor_id, tls_summary, checked_at")
    .eq("organization_id", organizationId)
    .in("monitor_id", sslIds)
    .order("checked_at", { ascending: false })
    .limit(sslIds.length * 3);
  for (const row of data ?? []) {
    if (map.has(row.monitor_id)) continue; // first is latest
    const tls = parseTls(row.tls_summary);
    if (tls?.daysRemaining != null) map.set(row.monitor_id, tls.daysRemaining);
  }
  return map;
}

/* ------------------------------------------------------------------ */
/* Monitor detail                                                      */
/* ------------------------------------------------------------------ */

export interface AssertionView {
  id: string;
  assertionType: string;
  fieldPath: string | null;
  operator: string | null;
  expectedValue: string | null;
  expectedValueType: string;
  caseSensitive: boolean;
  position: number;
}

export interface SecretView {
  id: string;
  secretType: string;
  headerName: string | null;
  maskedLabel: string;
  createdAt: string;
  rotatedAt: string | null;
}

export interface LatestResultView {
  status: string;
  failureCategory: string | null;
  httpStatus: number | null;
  totalMs: number | null;
  checkedAt: string;
  tls: TlsSummary | null;
  safeErrorMessage: string | null;
}

export interface MonitorDetailView {
  id: string;
  name: string;
  description: string | null;
  monitorType: string;
  status: string;
  safeDestination: string;
  fullTargetUrl: string | null;
  httpMethod: string;
  checkIntervalSeconds: number;
  timeoutMs: number;
  retryCount: number;
  retryDelayMs: number;
  followRedirects: boolean;
  maxRedirects: number;
  expectedStatusCodes: number[];
  responseTimeThresholdMs: number | null;
  regionPolicy: string;
  region: string;
  groupId: string | null;
  groupName: string | null;
  tags: TagView[];
  archivedAt: string | null;
  pausedAt: string | null;
  lastCheckAt: string | null;
  nextCheckAt: string | null;
  currentVersionId: string | null;
  versionNumber: number | null;
  assertions: AssertionView[];
  secrets: SecretView[];
  latestResult: LatestResultView | null;
  updatedByName: string | null;
  updatedAt: string;
}

export async function getMonitorDetail(
  organizationId: string,
  monitorId: string,
): Promise<MonitorDetailView | null> {
  const db = serviceClient();
  const { data: m, error } = await db
    .from("monitors")
    .select(
      "id, name, description, monitor_type, status, target_url, http_method, check_interval_seconds, timeout_ms, retry_count, retry_delay_ms, follow_redirects, max_redirects, expected_status_codes, response_time_threshold_ms, region_policy, group_id, archived_at, paused_at, last_check_at, next_check_at, current_version_id, updated_at, updated_by_user_id",
    )
    .eq("id", monitorId)
    .eq("organization_id", organizationId)
    .is("deleted_at", null)
    .maybeSingle();
  if (error) throw error;
  if (!m) return null;

  const [
    version,
    assertions,
    secrets,
    groupsMap,
    tagsMap,
    latest,
    updatedBy,
  ] = await Promise.all([
    m.current_version_id ? loadVersionNumber(m.current_version_id) : null,
    loadAssertions(organizationId, m.current_version_id),
    loadSecrets(organizationId, monitorId),
    loadGroupsMap(organizationId),
    loadTagsForMonitors(organizationId, [monitorId]),
    loadLatestResult(organizationId, monitorId),
    m.updated_by_user_id ? loadProfileName(m.updated_by_user_id) : null,
  ]);

  return {
    id: m.id,
    name: m.name,
    description: m.description,
    monitorType: m.monitor_type,
    status: m.status,
    safeDestination: safeDestination(m.target_url),
    fullTargetUrl: m.target_url,
    httpMethod: m.http_method,
    checkIntervalSeconds: m.check_interval_seconds,
    timeoutMs: m.timeout_ms,
    retryCount: m.retry_count,
    retryDelayMs: m.retry_delay_ms,
    followRedirects: m.follow_redirects,
    maxRedirects: m.max_redirects,
    expectedStatusCodes: m.expected_status_codes ?? [],
    responseTimeThresholdMs: m.response_time_threshold_ms,
    regionPolicy: m.region_policy,
    region: m.region_policy === "specific" ? "Selected region" : "US East",
    groupId: m.group_id,
    groupName: m.group_id ? (groupsMap.get(m.group_id) ?? null) : null,
    tags: tagsMap.get(monitorId) ?? [],
    archivedAt: m.archived_at,
    pausedAt: m.paused_at,
    lastCheckAt: m.last_check_at,
    nextCheckAt: m.next_check_at,
    currentVersionId: m.current_version_id,
    versionNumber: version,
    assertions,
    secrets,
    latestResult: latest,
    updatedByName: updatedBy,
    updatedAt: m.updated_at,
  };
}

async function loadVersionNumber(versionId: string): Promise<number | null> {
  const db = serviceClient();
  const { data } = await db
    .from("monitor_versions")
    .select("version_number")
    .eq("id", versionId)
    .maybeSingle();
  return data?.version_number ?? null;
}

async function loadAssertions(
  organizationId: string,
  versionId: string | null,
): Promise<AssertionView[]> {
  if (!versionId) return [];
  const db = serviceClient();
  const { data } = await db
    .from("monitor_assertions")
    .select(
      "id, assertion_type, field_path, operator, expected_value, expected_value_type, case_sensitive, position",
    )
    .eq("organization_id", organizationId)
    .eq("monitor_version_id", versionId)
    .order("position", { ascending: true });
  return (data ?? []).map((a) => ({
    id: a.id,
    assertionType: a.assertion_type,
    fieldPath: a.field_path,
    operator: a.operator,
    expectedValue: a.expected_value,
    expectedValueType: a.expected_value_type,
    caseSensitive: a.case_sensitive,
    position: a.position,
  }));
}

async function loadSecrets(
  organizationId: string,
  monitorId: string,
): Promise<SecretView[]> {
  const db = serviceClient();
  const { data } = await db
    .from("monitor_secrets")
    .select("id, secret_type, header_name, masked_label, created_at, rotated_at")
    .eq("organization_id", organizationId)
    .eq("monitor_id", monitorId)
    .is("deleted_at", null)
    .order("created_at", { ascending: false });
  return (data ?? []).map((s) => ({
    id: s.id,
    secretType: s.secret_type,
    headerName: s.header_name,
    maskedLabel: s.masked_label,
    createdAt: s.created_at,
    rotatedAt: s.rotated_at,
  }));
}

async function loadLatestResult(
  organizationId: string,
  monitorId: string,
): Promise<LatestResultView | null> {
  const db = serviceClient();
  const { data } = await db
    .from("check_results")
    .select(
      "status, failure_category, http_status, total_ms, checked_at, tls_summary, safe_error_message",
    )
    .eq("organization_id", organizationId)
    .eq("monitor_id", monitorId)
    .order("checked_at", { ascending: false })
    .limit(1)
    .maybeSingle();
  if (!data) return null;
  return {
    status: data.status,
    failureCategory: data.failure_category,
    httpStatus: data.http_status,
    totalMs: data.total_ms,
    checkedAt: data.checked_at,
    tls: parseTls(data.tls_summary),
    safeErrorMessage: data.safe_error_message,
  };
}

async function loadProfileName(profileId: string): Promise<string | null> {
  const db = serviceClient();
  const { data } = await db
    .from("user_profiles")
    .select("display_name")
    .eq("id", profileId)
    .maybeSingle();
  return data?.display_name ?? null;
}

/** The version's stored configuration snapshot (for the configuration tab). */
export async function getVersionSnapshot(
  organizationId: string,
  versionId: string,
): Promise<MonitorConfigSnapshot | null> {
  const db = serviceClient();
  const { data } = await db
    .from("monitor_versions")
    .select("configuration_snapshot")
    .eq("organization_id", organizationId)
    .eq("id", versionId)
    .maybeSingle();
  return (data?.configuration_snapshot as unknown as MonitorConfigSnapshot) ?? null;
}

/* ------------------------------------------------------------------ */
/* Check history                                                       */
/* ------------------------------------------------------------------ */

export interface CheckHistoryRow {
  id: string;
  status: string;
  failureCategory: string | null;
  httpStatus: number | null;
  totalMs: number | null;
  region: string | null;
  checkedAt: string;
  safeErrorMessage: string | null;
  executionId: string;
}

export interface CheckHistoryOptions {
  result?: string;
  region?: string;
  since?: Date;
  page?: number;
  pageSize?: number;
}

export async function listCheckHistory(
  organizationId: string,
  monitorId: string,
  opts: CheckHistoryOptions = {},
): Promise<{ rows: CheckHistoryRow[]; total: number; page: number; pageSize: number }> {
  const db = serviceClient();
  const page = Math.max(1, opts.page ?? 1);
  const pageSize = Math.min(100, Math.max(10, opts.pageSize ?? 25));
  const from = (page - 1) * pageSize;
  const to = from + pageSize - 1;

  let q = db
    .from("check_results")
    .select(
      "id, status, failure_category, http_status, total_ms, region, checked_at, safe_error_message, execution_id",
      { count: "exact" },
    )
    .eq("organization_id", organizationId)
    .eq("monitor_id", monitorId);

  if (opts.result) q = q.eq("status", opts.result);
  if (opts.region) q = q.eq("region", opts.region);
  if (opts.since) q = q.gte("checked_at", opts.since.toISOString());

  q = q.order("checked_at", { ascending: false }).range(from, to);

  const { data, error, count } = await q;
  if (error) throw error;
  const rows = (data ?? []).map((r) => ({
    id: r.id,
    status: r.status,
    failureCategory: r.failure_category,
    httpStatus: r.http_status,
    totalMs: r.total_ms,
    region: r.region,
    checkedAt: r.checked_at,
    safeErrorMessage: r.safe_error_message,
    executionId: r.execution_id,
  }));
  return { rows, total: count ?? rows.length, page, pageSize };
}

/* ------------------------------------------------------------------ */
/* Check detail                                                        */
/* ------------------------------------------------------------------ */

export interface AssertionResultView {
  assertionType: string;
  passed: boolean;
  expectedSummary: string | null;
  actualSummary: string | null;
  failureReason: string | null;
  position: number;
}

export interface CheckDetailView {
  id: string;
  status: string;
  failureCategory: string | null;
  httpStatus: number | null;
  finalUrlSafe: string;
  redirectCount: number | null;
  dnsMs: number | null;
  connectMs: number | null;
  tlsMs: number | null;
  ttfbMs: number | null;
  totalMs: number | null;
  region: string | null;
  checkedAt: string;
  tls: TlsSummary | null;
  safeErrorMessage: string | null;
  correlationId: string | null;
  versionNumber: number | null;
  attemptCount: number | null;
  isTest: boolean;
  assertions: AssertionResultView[];
}

export async function getCheckDetail(
  organizationId: string,
  resultId: string,
): Promise<CheckDetailView | null> {
  const db = serviceClient();
  const { data: r } = await db
    .from("check_results")
    .select(
      "id, status, failure_category, http_status, final_url, redirect_count, dns_ms, connect_ms, tls_ms, ttfb_ms, total_ms, region, checked_at, tls_summary, safe_error_message, execution_id, monitor_version_id",
    )
    .eq("organization_id", organizationId)
    .eq("id", resultId)
    .maybeSingle();
  if (!r) return null;

  const [exec, assertions, version] = await Promise.all([
    loadExecution(organizationId, r.execution_id),
    loadAssertionResults(organizationId, resultId),
    loadVersionNumber(r.monitor_version_id),
  ]);

  return {
    id: r.id,
    status: r.status,
    failureCategory: r.failure_category,
    httpStatus: r.http_status,
    finalUrlSafe: safeDestination(r.final_url),
    redirectCount: r.redirect_count,
    dnsMs: r.dns_ms,
    connectMs: r.connect_ms,
    tlsMs: r.tls_ms,
    ttfbMs: r.ttfb_ms,
    totalMs: r.total_ms,
    region: r.region,
    checkedAt: r.checked_at,
    tls: parseTls(r.tls_summary),
    safeErrorMessage: r.safe_error_message,
    correlationId: exec?.correlationId ?? null,
    versionNumber: version,
    attemptCount: exec?.attemptCount ?? null,
    isTest: exec?.isTest ?? false,
    assertions,
  };
}

async function loadExecution(
  organizationId: string,
  executionId: string,
): Promise<{ correlationId: string | null; attemptCount: number; isTest: boolean } | null> {
  const db = serviceClient();
  const { data } = await db
    .from("check_executions")
    .select("correlation_id, attempt_count, is_test")
    .eq("organization_id", organizationId)
    .eq("id", executionId)
    .maybeSingle();
  if (!data) return null;
  return {
    correlationId: data.correlation_id,
    attemptCount: data.attempt_count,
    isTest: data.is_test,
  };
}

async function loadAssertionResults(
  organizationId: string,
  resultId: string,
): Promise<AssertionResultView[]> {
  const db = serviceClient();
  const { data } = await db
    .from("check_assertion_results")
    .select("assertion_type, passed, expected_summary, actual_summary, failure_reason, position")
    .eq("organization_id", organizationId)
    .eq("result_id", resultId)
    .order("position", { ascending: true });
  return (data ?? []).map((a) => ({
    assertionType: a.assertion_type,
    passed: a.passed,
    expectedSummary: a.expected_summary,
    actualSummary: a.actual_summary,
    failureReason: a.failure_reason,
    position: a.position,
  }));
}

/* ------------------------------------------------------------------ */
/* Response-time series for charts (bounded, downsampled)              */
/* ------------------------------------------------------------------ */

export interface SeriesPoint {
  checkedAt: string;
  status: string;
  totalMs: number | null;
}

export async function getResultSeries(
  organizationId: string,
  monitorId: string,
  since: Date,
  maxPoints = 240,
): Promise<SeriesPoint[]> {
  const db = serviceClient();
  const { data } = await db
    .from("check_results")
    .select("checked_at, status, total_ms")
    .eq("organization_id", organizationId)
    .eq("monitor_id", monitorId)
    .gte("checked_at", since.toISOString())
    .order("checked_at", { ascending: true })
    .limit(2000);
  const rows = (data ?? []).map((r) => ({
    checkedAt: r.checked_at,
    status: r.status,
    totalMs: r.total_ms,
  }));
  if (rows.length <= maxPoints) return rows;
  // Even downsample, preserving chronological order.
  const step = Math.ceil(rows.length / maxPoints);
  const out: SeriesPoint[] = [];
  for (let i = 0; i < rows.length; i += step) out.push(rows[i]);
  return out;
}

/* ------------------------------------------------------------------ */
/* Versions                                                            */
/* ------------------------------------------------------------------ */

export interface VersionView {
  id: string;
  versionNumber: number;
  changeSummary: string | null;
  createdAt: string;
  actorName: string | null;
  isActive: boolean;
}

export async function listVersions(
  organizationId: string,
  monitorId: string,
  activeVersionId: string | null,
): Promise<VersionView[]> {
  const db = serviceClient();
  const { data } = await db
    .from("monitor_versions")
    .select("id, version_number, change_summary, created_at, created_by_user_id")
    .eq("organization_id", organizationId)
    .eq("monitor_id", monitorId)
    .order("version_number", { ascending: false });
  const rows = data ?? [];
  const actorIds = [...new Set(rows.map((r) => r.created_by_user_id).filter(Boolean))] as string[];
  const names = await loadProfileNames(actorIds);
  return rows.map((r) => ({
    id: r.id,
    versionNumber: r.version_number,
    changeSummary: r.change_summary,
    createdAt: r.created_at,
    actorName: r.created_by_user_id ? (names.get(r.created_by_user_id) ?? null) : null,
    isActive: r.id === activeVersionId,
  }));
}

async function loadProfileNames(ids: string[]): Promise<Map<string, string>> {
  const map = new Map<string, string>();
  if (ids.length === 0) return map;
  const db = serviceClient();
  const { data } = await db
    .from("user_profiles")
    .select("id, display_name")
    .in("id", ids);
  for (const p of data ?? []) if (p.display_name) map.set(p.id, p.display_name);
  return map;
}

/* ------------------------------------------------------------------ */
/* Groups and tags (reads)                                             */
/* ------------------------------------------------------------------ */

export interface GroupView {
  id: string;
  name: string;
  description: string | null;
  position: number;
  monitorCount: number;
}

export async function listGroups(
  organizationId: string,
): Promise<GroupView[]> {
  const db = serviceClient();
  const { data } = await db
    .from("monitor_groups")
    .select("id, name, description, position")
    .eq("organization_id", organizationId)
    .is("deleted_at", null)
    .order("position", { ascending: true })
    .order("name", { ascending: true });
  const groups = data ?? [];
  // One grouped count query for all groups.
  const counts = new Map<string, number>();
  const { data: monitorRows } = await db
    .from("monitors")
    .select("group_id")
    .eq("organization_id", organizationId)
    .is("deleted_at", null)
    .is("archived_at", null)
    .not("group_id", "is", null);
  for (const row of monitorRows ?? []) {
    if (row.group_id) counts.set(row.group_id, (counts.get(row.group_id) ?? 0) + 1);
  }
  return groups.map((g) => ({
    id: g.id,
    name: g.name,
    description: g.description,
    position: g.position,
    monitorCount: counts.get(g.id) ?? 0,
  }));
}

export interface TagWithCount extends TagView {
  monitorCount: number;
}

export async function listTags(
  organizationId: string,
): Promise<TagWithCount[]> {
  const db = serviceClient();
  const { data } = await db
    .from("monitor_tags")
    .select("id, name, color_token")
    .eq("organization_id", organizationId)
    .is("deleted_at", null)
    .order("name", { ascending: true });
  const tags = data ?? [];
  const counts = new Map<string, number>();
  const { data: assignments } = await db
    .from("monitor_tag_assignments")
    .select("tag_id")
    .eq("organization_id", organizationId);
  for (const a of assignments ?? []) {
    counts.set(a.tag_id, (counts.get(a.tag_id) ?? 0) + 1);
  }
  return tags.map((t) => ({
    id: t.id,
    name: t.name,
    colorToken: t.color_token,
    monitorCount: counts.get(t.id) ?? 0,
  }));
}

/* ------------------------------------------------------------------ */
/* Heartbeat detail                                                    */
/* ------------------------------------------------------------------ */

export interface HeartbeatEventView {
  id: string;
  receivedAt: string;
  source: string | null;
}

export interface HeartbeatTokenView {
  id: string;
  maskedLabel: string;
  state: string;
  expectedIntervalSeconds: number;
  gracePeriodSeconds: number;
  lastHeartbeatAt: string | null;
  nextExpectedAt: string | null;
}

/** The active (non-revoked) heartbeat token for a monitor, if any. */
export async function getHeartbeatToken(
  organizationId: string,
  monitorId: string,
): Promise<HeartbeatTokenView | null> {
  const db = serviceClient();
  const { data } = await db
    .from("heartbeat_tokens")
    .select(
      "id, masked_label, state, expected_interval_seconds, grace_period_seconds, last_heartbeat_at, next_expected_at",
    )
    .eq("organization_id", organizationId)
    .eq("monitor_id", monitorId)
    .is("revoked_at", null)
    .order("created_at", { ascending: false })
    .limit(1)
    .maybeSingle();
  if (!data) return null;
  return {
    id: data.id,
    maskedLabel: data.masked_label,
    state: data.state,
    expectedIntervalSeconds: data.expected_interval_seconds,
    gracePeriodSeconds: data.grace_period_seconds,
    lastHeartbeatAt: data.last_heartbeat_at,
    nextExpectedAt: data.next_expected_at,
  };
}

export async function listHeartbeatEvents(
  organizationId: string,
  monitorId: string,
  limit = 30,
): Promise<HeartbeatEventView[]> {
  const db = serviceClient();
  const { data } = await db
    .from("heartbeat_events")
    .select("id, received_at, event_source")
    .eq("organization_id", organizationId)
    .eq("monitor_id", monitorId)
    .order("received_at", { ascending: false })
    .limit(limit);
  return (data ?? []).map((e) => ({
    id: String(e.id),
    receivedAt: e.received_at,
    source: e.event_source,
  }));
}

/* ------------------------------------------------------------------ */
/* Monitor activity (from the org audit log, scoped to one monitor)    */
/* ------------------------------------------------------------------ */

export interface MonitorActivityRow {
  id: string;
  action: string;
  summary: string | null;
  actorName: string | null;
  createdAt: string;
}

export async function listMonitorActivity(
  organizationId: string,
  monitorId: string,
  limit = 20,
): Promise<MonitorActivityRow[]> {
  const db = serviceClient();
  const { data } = await db
    .from("audit_events")
    .select("id, action, summary, actor_user_id, created_at")
    .eq("organization_id", organizationId)
    .eq("target_type", "monitor")
    .eq("target_id", monitorId)
    .order("created_at", { ascending: false })
    .limit(limit);
  const rows = data ?? [];
  const actorIds = [...new Set(rows.map((r) => r.actor_user_id).filter(Boolean))] as string[];
  const names = await loadProfileNames(actorIds);
  return rows.map((r) => ({
    id: r.id,
    action: r.action,
    summary: r.summary,
    actorName: r.actor_user_id ? (names.get(r.actor_user_id) ?? null) : null,
    createdAt: r.created_at,
  }));
}
