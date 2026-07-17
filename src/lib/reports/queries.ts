import "server-only";

import { serviceClient } from "@/lib/supabase/service";
import type { WeeklyReportSnapshot } from "@/lib/reports/weekly";
import type { IncidentRecapSnapshot } from "@/lib/reports/incident-recaps";

/**
 * Read queries for weekly reports and incident recaps. Callers are app pages
 * that already verified organization membership (requireActiveContext), so
 * every query is scoped by organization_id.
 */

export interface WeeklyReportListItem {
  id: string;
  periodStart: string;
  periodEnd: string;
  timezone: string;
  dataCompleteness: string;
  generatedAt: string;
  periodLabel: string;
  successRateLabel: string | null;
  incidentCount: number | null;
}

export async function listWeeklyReports(
  organizationId: string,
  limit = 26,
  before?: string,
): Promise<WeeklyReportListItem[]> {
  const db = serviceClient();
  let q = db
    .from("weekly_reports")
    .select("id, period_start, period_end, timezone, data_completeness, generated_at, snapshot")
    .eq("organization_id", organizationId)
    .order("period_start", { ascending: false })
    .limit(limit);
  if (before) q = q.lt("period_start", before);
  const { data } = await q;
  return (data ?? []).map((row) => {
    const snapshot = row.snapshot as unknown as WeeklyReportSnapshot;
    return {
      id: row.id,
      periodStart: row.period_start,
      periodEnd: row.period_end,
      timezone: row.timezone,
      dataCompleteness: row.data_completeness,
      generatedAt: row.generated_at,
      periodLabel: snapshot?.periodLabel ?? `${row.period_start} to ${row.period_end}`,
      successRateLabel: snapshot?.checks?.successRateLabel ?? null,
      incidentCount: snapshot?.incidents?.openedCount ?? null,
    };
  });
}

export interface WeeklyReportDetail {
  id: string;
  periodStart: string;
  periodEnd: string;
  timezone: string;
  metricsVersion: number;
  dataCompleteness: string;
  generatedAt: string;
  snapshot: WeeklyReportSnapshot;
}

export async function getWeeklyReport(
  organizationId: string,
  reportId: string,
): Promise<WeeklyReportDetail | null> {
  const db = serviceClient();
  const { data } = await db
    .from("weekly_reports")
    .select("*")
    .eq("organization_id", organizationId)
    .eq("id", reportId)
    .maybeSingle();
  if (!data) return null;
  return {
    id: data.id,
    periodStart: data.period_start,
    periodEnd: data.period_end,
    timezone: data.timezone,
    metricsVersion: data.metrics_version,
    dataCompleteness: data.data_completeness,
    generatedAt: data.generated_at,
    snapshot: data.snapshot as unknown as WeeklyReportSnapshot,
  };
}

export interface ReportSettings {
  enabled: boolean;
  weekStart: "monday" | "sunday";
}

export async function getReportSettings(
  organizationId: string,
): Promise<ReportSettings> {
  const db = serviceClient();
  const { data } = await db
    .from("organization_report_settings")
    .select("enabled, week_start")
    .eq("organization_id", organizationId)
    .maybeSingle();
  return {
    enabled: data?.enabled ?? true,
    weekStart: data?.week_start === "sunday" ? "sunday" : "monday",
  };
}

export interface ReportRecipient {
  userId: string;
  displayName: string | null;
  addedAt: string;
}

export async function listReportRecipients(
  organizationId: string,
): Promise<ReportRecipient[]> {
  const db = serviceClient();
  const { data } = await db
    .from("weekly_report_recipients")
    .select("user_id, created_at, profile:user_profiles!weekly_report_recipients_user_id_fkey(display_name)")
    .eq("organization_id", organizationId)
    .order("created_at", { ascending: true });
  return (data ?? []).map((row) => ({
    userId: row.user_id,
    displayName:
      (row.profile as { display_name: string | null } | null)?.display_name ??
      null,
    addedAt: row.created_at,
  }));
}

/* ------------------------------------------------------------------ */
/* Incident recaps                                                     */
/* ------------------------------------------------------------------ */

export interface IncidentRecapDetail {
  id: string;
  incidentId: string;
  snapshot: IncidentRecapSnapshot;
  generatedAt: string;
  rootCause: string | null;
  rootCauseUpdatedAt: string | null;
  reviewedAt: string | null;
  reviewedByName: string | null;
  revision: number;
}

export async function getIncidentRecap(
  organizationId: string,
  incidentId: string,
): Promise<IncidentRecapDetail | null> {
  const db = serviceClient();
  const { data } = await db
    .from("incident_recaps")
    .select(
      "id, incident_id, snapshot, generated_at, root_cause, root_cause_updated_at, reviewed_at, revision, reviewer:user_profiles!incident_recaps_reviewed_by_user_id_fkey(display_name)",
    )
    .eq("organization_id", organizationId)
    .eq("incident_id", incidentId)
    .maybeSingle();
  if (!data) return null;
  return {
    id: data.id,
    incidentId: data.incident_id,
    snapshot: data.snapshot as unknown as IncidentRecapSnapshot,
    generatedAt: data.generated_at,
    rootCause: data.root_cause,
    rootCauseUpdatedAt: data.root_cause_updated_at,
    reviewedAt: data.reviewed_at,
    reviewedByName:
      (data.reviewer as { display_name: string | null } | null)?.display_name ??
      null,
    revision: data.revision,
  };
}

export interface FollowUpAction {
  id: string;
  title: string;
  description: string | null;
  ownerName: string | null;
  ownerUserId: string | null;
  dueDate: string | null;
  status: "open" | "completed" | "dropped";
  createdAt: string;
  completedAt: string | null;
}

export async function listFollowUpActions(
  organizationId: string,
  incidentId: string,
): Promise<FollowUpAction[]> {
  const db = serviceClient();
  const { data } = await db
    .from("incident_follow_up_actions")
    .select(
      "id, title, description, owner_user_id, due_date, status, created_at, completed_at, owner:user_profiles!incident_follow_up_actions_owner_user_id_fkey(display_name)",
    )
    .eq("organization_id", organizationId)
    .eq("incident_id", incidentId)
    .order("created_at", { ascending: true })
    .limit(50);
  return (data ?? []).map((row) => ({
    id: row.id,
    title: row.title,
    description: row.description,
    ownerUserId: row.owner_user_id,
    ownerName:
      (row.owner as { display_name: string | null } | null)?.display_name ??
      null,
    dueDate: row.due_date,
    status: row.status as FollowUpAction["status"],
    createdAt: row.created_at,
    completedAt: row.completed_at,
  }));
}
