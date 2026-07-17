import "server-only";

import { serviceClient } from "@/lib/supabase/service";
import { getStatusPageOverview } from "@/lib/status-pages/status-pages";
import { createLifecycleIntent } from "@/lib/lifecycle/intents";
import { dedupKeys } from "@/lib/lifecycle/messages";

/**
 * Weekly reliability report generation.
 *
 * Reports are generated asynchronously (never during a customer page
 * request), from bounded SQL aggregates (never full check-history scans),
 * into immutable snapshots (historical reports never shift as data changes).
 * Every metric definition is centralized here and documented in
 * /docs/engineering/weekly-report-generation.md.
 *
 * Metric definitions (v1):
 * - Check success rate: successful eligible scheduled checks divided by
 *   finalized eligible scheduled checks in the period. Manual tests,
 *   test-before-save, and blocked executions are excluded.
 * - Incident count: incidents opened during the period.
 * - Incident duration: opened_at to resolved_at.
 * - Average response time: mean total_ms of successful checks.
 * - Slowest monitor: highest p95 of successful checks (labeled p95).
 */

export const METRICS_VERSION = 1;

/* ------------------------------------------------------------------ */
/* Reporting period                                                    */
/* ------------------------------------------------------------------ */

export interface ReportPeriod {
  /** Inclusive first day (date string, org timezone). */
  periodStart: string;
  /** Inclusive last day (date string, org timezone). */
  periodEnd: string;
  /** UTC instants bounding [from, to). */
  fromUtc: Date;
  toUtc: Date;
  timezone: string;
  /** Exact human label: "July 6 through July 12, 2026". */
  label: string;
}

function tzDateString(date: Date, timeZone: string): string {
  return new Intl.DateTimeFormat("en-CA", {
    timeZone,
    year: "numeric",
    month: "2-digit",
    day: "2-digit",
  }).format(date);
}

function tzWeekday(date: Date, timeZone: string): number {
  const name = new Intl.DateTimeFormat("en-US", {
    timeZone,
    weekday: "short",
  }).format(date);
  return ["Sun", "Mon", "Tue", "Wed", "Thu", "Fri", "Sat"].indexOf(name);
}

/** UTC instant of midnight (00:00) for a date string in a timezone. */
export function tzMidnightUtc(dateStr: string, timeZone: string): Date {
  // Start from UTC midnight and correct by the zone offset at that moment.
  // A second pass handles DST transitions near midnight.
  let guess = new Date(`${dateStr}T00:00:00Z`);
  for (let i = 0; i < 2; i += 1) {
    const parts = new Intl.DateTimeFormat("en-US", {
      timeZone,
      hour12: false,
      year: "numeric",
      month: "2-digit",
      day: "2-digit",
      hour: "2-digit",
      minute: "2-digit",
      second: "2-digit",
    }).formatToParts(guess);
    const get = (type: string) =>
      Number(parts.find((p) => p.type === type)?.value ?? "0");
    const rendered = Date.UTC(
      get("year"),
      get("month") - 1,
      get("day"),
      get("hour") % 24,
      get("minute"),
      get("second"),
    );
    const target = Date.parse(`${dateStr}T00:00:00Z`);
    const diff = rendered - target;
    if (diff === 0) break;
    guess = new Date(guess.getTime() - diff);
  }
  return guess;
}

function addDays(dateStr: string, days: number): string {
  const d = new Date(`${dateStr}T12:00:00Z`);
  d.setUTCDate(d.getUTCDate() + days);
  return d.toISOString().slice(0, 10);
}

function labelForPeriod(start: string, end: string): string {
  const fmt = (s: string, opts: Intl.DateTimeFormatOptions) =>
    new Intl.DateTimeFormat("en-US", { timeZone: "UTC", ...opts }).format(
      new Date(`${s}T12:00:00Z`),
    );
  const sameYear = start.slice(0, 4) === end.slice(0, 4);
  const startLabel = fmt(start, {
    month: "long",
    day: "numeric",
    ...(sameYear ? {} : { year: "numeric" }),
  });
  const endLabel = fmt(end, { month: "long", day: "numeric", year: "numeric" });
  return `${startLabel} through ${endLabel}`;
}

/**
 * The most recent complete seven-day period ending at the last week-start
 * boundary in the organization timezone. Never uses the browser timezone.
 */
export function computeReportPeriod(
  timezone: string,
  weekStart: "monday" | "sunday",
  reference: Date = new Date(),
): ReportPeriod {
  const tz = timezone || "UTC";
  const targetWeekday = weekStart === "sunday" ? 0 : 1;

  // Walk back from today (org tz) to the most recent week-start boundary.
  let boundary = tzDateString(reference, tz);
  let probe = reference;
  while (tzWeekday(probe, tz) !== targetWeekday) {
    probe = new Date(probe.getTime() - 24 * 60 * 60 * 1000);
    boundary = tzDateString(probe, tz);
  }
  boundary = tzDateString(probe, tz);

  const periodStart = addDays(boundary, -7);
  const periodEndInclusive = addDays(boundary, -1);
  return {
    periodStart,
    periodEnd: periodEndInclusive,
    fromUtc: tzMidnightUtc(periodStart, tz),
    toUtc: tzMidnightUtc(boundary, tz),
    timezone: tz,
    label: labelForPeriod(periodStart, periodEndInclusive),
  };
}

/* ------------------------------------------------------------------ */
/* Snapshot shape                                                      */
/* ------------------------------------------------------------------ */

export interface WeeklyReportSnapshot {
  metricsVersion: number;
  organizationName: string;
  periodLabel: string;
  checks: {
    totalConsidered: number;
    passed: number;
    failed: number;
    errored: number;
    timedOut: number;
    successRate: number | null;
    successRateLabel: string;
    avgResponseMs: number | null;
  };
  monitors: {
    activeCount: number;
    pausedCount: number;
    withFailures: Array<{ name: string; failed: number; total: number }>;
    slowest: Array<{ name: string; p95Ms: number }>;
  };
  incidents: {
    openedCount: number;
    resolvedCount: number;
    bySeverity: Record<string, number>;
    items: Array<{
      title: string;
      severity: string;
      openedAt: string;
      resolvedAt: string | null;
      durationMinutes: number | null;
    }>;
  };
  certificates: {
    expiringWithin30: Array<{ name: string; daysRemaining: number }>;
    criticalWithin7: Array<{ name: string; daysRemaining: number }>;
    expired: Array<{ name: string; daysRemaining: number }>;
  };
  heartbeats: {
    monitorsWithMisses: Array<{ name: string; failed: number }>;
  };
  alerts: {
    delivered: number;
    failed: number;
    retrying: number;
    deadLettered: number;
  };
  statusPages: {
    publishedCount: number;
    activePublicIncidents: number;
    domainsNeedingAttention: number;
    tlsIssues: number;
  };
  warnings: string[];
  recommendedActions: string[];
}

/* ------------------------------------------------------------------ */
/* Generation                                                          */
/* ------------------------------------------------------------------ */

export type WeeklyReportResult =
  | { generated: true; reportId: string; recipients: number }
  | {
      generated: false;
      reason:
        | "disabled"
        | "already_generated"
        | "no_active_monitors"
        | "no_meaningful_data"
        | "organization_not_found";
    };

/** Generate the report for the most recent complete period, idempotently. */
export async function generateWeeklyReport(
  organizationId: string,
): Promise<WeeklyReportResult> {
  const db = serviceClient();

  const [{ data: org }, { data: settings }] = await Promise.all([
    db
      .from("organizations")
      .select("id, name, default_timezone, owner_user_id, deleted_at")
      .eq("id", organizationId)
      .maybeSingle(),
    db
      .from("organization_report_settings")
      .select("enabled, week_start")
      .eq("organization_id", organizationId)
      .maybeSingle(),
  ]);

  if (!org || org.deleted_at) {
    return { generated: false, reason: "organization_not_found" };
  }
  if (settings && !settings.enabled) {
    return { generated: false, reason: "disabled" };
  }

  const weekStart = settings?.week_start === "sunday" ? "sunday" : "monday";
  const period = computeReportPeriod(org.default_timezone, weekStart);

  const { data: existing } = await db
    .from("weekly_reports")
    .select("id")
    .eq("organization_id", organizationId)
    .eq("period_start", period.periodStart)
    .maybeSingle();
  if (existing) return { generated: false, reason: "already_generated" };

  const { data: monitors } = await db
    .from("monitors")
    .select("id, name, status, monitor_type, paused_at")
    .eq("organization_id", organizationId)
    .is("deleted_at", null);
  const monitorList = monitors ?? [];
  const activeMonitors = monitorList.filter((m) => m.status === "active");
  if (activeMonitors.length === 0) {
    return { generated: false, reason: "no_active_monitors" };
  }
  const nameById = new Map(monitorList.map((m) => [m.id, m.name]));

  const [statsRes, incidentsRes, alertsRes, statusPages, sslRes] =
    await Promise.all([
      db.rpc("report_check_stats", {
        p_org: organizationId,
        p_from: period.fromUtc.toISOString(),
        p_to: period.toUtc.toISOString(),
      }),
      db
        .from("incidents")
        .select("id, title, severity, opened_at, resolved_at, lifecycle_status")
        .eq("organization_id", organizationId)
        .is("deleted_at", null)
        .gte("opened_at", period.fromUtc.toISOString())
        .lt("opened_at", period.toUtc.toISOString())
        .order("opened_at", { ascending: true })
        .limit(50),
      db
        .from("alert_delivery_intents")
        .select("status")
        .eq("organization_id", organizationId)
        .gte("created_at", period.fromUtc.toISOString())
        .lt("created_at", period.toUtc.toISOString())
        .limit(2000),
      getStatusPageOverview(organizationId),
      db
        .from("check_results")
        .select("monitor_id, tls_summary, checked_at")
        .eq("organization_id", organizationId)
        .in(
          "monitor_id",
          monitorList
            .filter((m) => m.monitor_type === "ssl")
            .map((m) => m.id)
            .concat("00000000-0000-0000-0000-000000000000"),
        )
        .order("checked_at", { ascending: false })
        .limit(60),
    ]);

  const stats = statsRes.data ?? [];
  const totals = stats.reduce(
    (acc, s) => {
      acc.total += Number(s.total_considered ?? 0);
      acc.passed += Number(s.passed ?? 0);
      acc.failed += Number(s.failed ?? 0);
      acc.errored += Number(s.errored ?? 0);
      acc.timedOut += Number(s.timed_out ?? 0);
      return acc;
    },
    { total: 0, passed: 0, failed: 0, errored: 0, timedOut: 0 },
  );

  if (totals.total === 0) {
    return { generated: false, reason: "no_meaningful_data" };
  }

  const successRate = totals.passed / totals.total;
  const successRateLabel = `${(successRate * 100).toFixed(2).replace(/\.00$/, "")}%`;

  // Weighted average response time across monitors.
  let weightedMs = 0;
  let weightedCount = 0;
  for (const s of stats) {
    const avg = s.avg_success_ms == null ? null : Number(s.avg_success_ms);
    const passed = Number(s.passed ?? 0);
    if (avg != null && passed > 0) {
      weightedMs += avg * passed;
      weightedCount += passed;
    }
  }
  const avgResponseMs =
    weightedCount > 0 ? Math.round(weightedMs / weightedCount) : null;

  const withFailures = stats
    .filter((s) => Number(s.failed ?? 0) + Number(s.errored ?? 0) + Number(s.timed_out ?? 0) > 0)
    .map((s) => ({
      name: nameById.get(s.monitor_id) ?? "Removed monitor",
      failed:
        Number(s.failed ?? 0) + Number(s.errored ?? 0) + Number(s.timed_out ?? 0),
      total: Number(s.total_considered ?? 0),
    }))
    .sort((a, b) => b.failed - a.failed)
    .slice(0, 10);

  const slowest = stats
    .filter((s) => s.p95_success_ms != null && Number(s.passed ?? 0) > 0)
    .map((s) => ({
      name: nameById.get(s.monitor_id) ?? "Removed monitor",
      p95Ms: Math.round(Number(s.p95_success_ms)),
    }))
    .sort((a, b) => b.p95Ms - a.p95Ms)
    .slice(0, 5);

  const incidents = incidentsRes.data ?? [];
  const bySeverity: Record<string, number> = {};
  const incidentItems = incidents.map((i) => {
    bySeverity[i.severity] = (bySeverity[i.severity] ?? 0) + 1;
    const durationMinutes = i.resolved_at
      ? Math.round(
          (new Date(i.resolved_at).getTime() - new Date(i.opened_at).getTime()) /
            60_000,
        )
      : null;
    return {
      title: i.title,
      severity: i.severity,
      openedAt: i.opened_at,
      resolvedAt: i.resolved_at,
      durationMinutes,
    };
  });

  // Certificates: latest tls_summary per ssl monitor.
  const sslDays = new Map<string, number>();
  for (const row of sslRes.data ?? []) {
    if (sslDays.has(row.monitor_id)) continue;
    const raw = row.tls_summary as { days_remaining?: unknown } | null;
    const days =
      raw && typeof raw.days_remaining === "number" ? raw.days_remaining : null;
    if (days != null) sslDays.set(row.monitor_id, days);
  }
  const certBuckets = {
    expiringWithin30: [] as Array<{ name: string; daysRemaining: number }>,
    criticalWithin7: [] as Array<{ name: string; daysRemaining: number }>,
    expired: [] as Array<{ name: string; daysRemaining: number }>,
  };
  for (const [monitorId, days] of sslDays) {
    const entry = {
      name: nameById.get(monitorId) ?? "SSL monitor",
      daysRemaining: days,
    };
    if (days < 0) certBuckets.expired.push(entry);
    else if (days <= 7) certBuckets.criticalWithin7.push(entry);
    else if (days <= 30) certBuckets.expiringWithin30.push(entry);
  }

  // Heartbeats: failures recorded against heartbeat monitors in the period.
  const heartbeatIds = new Set(
    monitorList.filter((m) => m.monitor_type === "heartbeat").map((m) => m.id),
  );
  const monitorsWithMisses = stats
    .filter(
      (s) => heartbeatIds.has(s.monitor_id) && Number(s.failed ?? 0) > 0,
    )
    .map((s) => ({
      name: nameById.get(s.monitor_id) ?? "Heartbeat monitor",
      failed: Number(s.failed ?? 0),
    }));

  const alertRows = alertsRes.data ?? [];
  const alertSummary = {
    delivered: alertRows.filter((a) => a.status === "delivered").length,
    failed: alertRows.filter((a) => a.status === "failed").length,
    retrying: alertRows.filter((a) => a.status === "pending" || a.status === "processing").length,
    deadLettered: alertRows.filter((a) => a.status === "dead_letter").length,
  };

  /* Warnings and deterministic recommendations. */
  const warnings: string[] = [];
  const actions: string[] = [];
  for (const c of certBuckets.expired) {
    warnings.push(`Certificate for ${c.name} has expired.`);
    actions.push(`Renew the certificate for ${c.name}.`);
  }
  for (const c of certBuckets.criticalWithin7) {
    warnings.push(`Certificate for ${c.name} expires in ${c.daysRemaining} days.`);
    actions.push(`Renew the certificate for ${c.name} this week.`);
  }
  for (const c of certBuckets.expiringWithin30) {
    warnings.push(`Certificate for ${c.name} expires in ${c.daysRemaining} days.`);
  }
  if (alertSummary.deadLettered > 0) {
    warnings.push(
      `${alertSummary.deadLettered} alert ${alertSummary.deadLettered === 1 ? "delivery" : "deliveries"} could not be completed.`,
    );
    actions.push("Review failed alert deliveries and the affected channels.");
  }
  for (const h of monitorsWithMisses) {
    warnings.push(`${h.name} missed ${h.failed} expected ${h.failed === 1 ? "check-in" : "check-ins"}.`);
  }
  const pausedCount = monitorList.filter((m) => m.status === "paused").length;
  if (pausedCount > 0) {
    actions.push(
      `${pausedCount} ${pausedCount === 1 ? "monitor is" : "monitors are"} paused. Resume or remove ${pausedCount === 1 ? "it" : "them"} if no longer needed.`,
    );
  }
  if (statusPages.componentsWithoutMonitor > 0) {
    actions.push(
      `Map a monitor to ${statusPages.componentsWithoutMonitor} unmapped public ${statusPages.componentsWithoutMonitor === 1 ? "component" : "components"}.`,
    );
  }
  if (statusPages.domainsNeedingAttention > 0) {
    actions.push("Finish custom domain verification for your status page.");
  }

  const snapshot: WeeklyReportSnapshot = {
    metricsVersion: METRICS_VERSION,
    organizationName: org.name,
    periodLabel: period.label,
    checks: {
      totalConsidered: totals.total,
      passed: totals.passed,
      failed: totals.failed,
      errored: totals.errored,
      timedOut: totals.timedOut,
      successRate,
      successRateLabel,
      avgResponseMs,
    },
    monitors: {
      activeCount: activeMonitors.length,
      pausedCount,
      withFailures,
      slowest,
    },
    incidents: {
      openedCount: incidents.length,
      resolvedCount: incidents.filter((i) => i.resolved_at).length,
      bySeverity,
      items: incidentItems,
    },
    certificates: certBuckets,
    heartbeats: { monitorsWithMisses },
    alerts: alertSummary,
    statusPages: {
      publishedCount: statusPages.publishedCount,
      activePublicIncidents: statusPages.activePublicIncidents,
      domainsNeedingAttention: statusPages.domainsNeedingAttention,
      tlsIssues: statusPages.tlsIssues,
    },
    warnings,
    recommendedActions: actions,
  };

  // Insert-once: the unique (organization_id, period_start) constraint is the
  // concurrency guard. A second generator racing us loses cleanly.
  const { data: inserted, error } = await db
    .from("weekly_reports")
    .insert({
      organization_id: organizationId,
      period_start: period.periodStart,
      period_end: period.periodEnd,
      timezone: period.timezone,
      metrics_version: METRICS_VERSION,
      data_completeness: "complete",
      snapshot: snapshot as never,
    })
    .select("id")
    .maybeSingle();
  if (error) {
    if (error.code === "23505") {
      return { generated: false, reason: "already_generated" };
    }
    throw error;
  }
  if (!inserted) return { generated: false, reason: "already_generated" };

  const recipients = await resolveReportRecipients(organizationId, org.owner_user_id);
  let queued = 0;
  for (const userId of recipients) {
    const result = await createLifecycleIntent({
      organizationId,
      userId,
      messageKey: "weekly_report",
      dedupKey: dedupKeys.weeklyReport(organizationId, period.periodStart, userId),
      payload: {
        organization_name: org.name,
        period_label: period.label,
        report_id: inserted.id,
        success_rate_label: successRateLabel,
        checks_completed: totals.total,
        active_monitors: activeMonitors.length,
        monitors_with_failures: withFailures.length,
        incident_count: incidents.length,
        avg_response_ms: avgResponseMs ?? 0,
        data_completeness: "complete",
        warnings: warnings.slice(0, 5),
        recommended_actions: actions.slice(0, 5),
      },
      relatedType: "weekly_report",
      relatedId: inserted.id,
    });
    if (result.created) queued += 1;
  }

  return { generated: true, reportId: inserted.id, recipients: queued };
}

/** Owner-managed recipient list; falls back to the organization owner. */
async function resolveReportRecipients(
  organizationId: string,
  ownerUserId: string,
): Promise<string[]> {
  const db = serviceClient();
  const { data } = await db
    .from("weekly_report_recipients")
    .select("user_id")
    .eq("organization_id", organizationId);
  const listed = (data ?? []).map((r) => r.user_id);
  return listed.length > 0 ? listed : [ownerUserId];
}

/**
 * Batch generation for the worker: organizations with active monitors that
 * do not yet have a report for their current period. Bounded per pass so one
 * pass never monopolizes the database.
 */
export async function generateWeeklyReportsBatch(max = 20): Promise<{
  considered: number;
  generated: number;
  skipped: number;
}> {
  const db = serviceClient();

  const { data: activeOrgRows } = await db
    .from("monitors")
    .select("organization_id")
    .eq("status", "active")
    .is("deleted_at", null)
    .limit(2000);
  const orgIds = [...new Set((activeOrgRows ?? []).map((r) => r.organization_id))];

  let considered = 0;
  let generated = 0;
  let skipped = 0;
  for (const orgId of orgIds) {
    if (generated >= max) break;
    considered += 1;
    try {
      const result = await generateWeeklyReport(orgId);
      if (result.generated) generated += 1;
      else skipped += 1;
    } catch (error) {
      console.error("[reports] weekly generation failed", orgId, error);
      skipped += 1;
    }
  }
  return { considered, generated, skipped };
}
