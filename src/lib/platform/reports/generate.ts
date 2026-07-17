import "server-only";

import { loadCommandCenter } from "../command-center/load";
import { resolveDateRange, type DatePreset } from "../dates";
import { loadRevenueDashboard } from "../revenue/dashboard";
import { platformDb } from "../db";
import { logPlatformAdminAction } from "../logging";

export type ReportType =
  | "daily_brief"
  | "weekly_review"
  | "monthly_review"
  | "revenue"
  | "customer_health"
  | "reliability"
  | "support"
  | "affiliate"
  | "content"
  | "security"
  | "acquisition_diligence";

export async function generateReport(input: {
  reportType: ReportType;
  actorUserId: string;
  preset?: DatePreset;
}): Promise<{ id: string } | { error: string }> {
  const range = resolveDateRange(input.preset ?? "last_7_days");
  const db = platformDb();

  const { data: row, error } = await db
    .from("platform_reports")
    .insert({
      report_type: input.reportType,
      period_start: range.start.toISOString(),
      period_end: range.end.toISOString(),
      state: "generating",
      generated_by: input.actorUserId,
      filters: { preset: range.preset },
      calculation_version: "1",
      expires_at: new Date(Date.now() + 7 * 24 * 3600 * 1000).toISOString(),
    })
    .select("id")
    .single();

  if (error || !row) return { error: error?.message ?? "insert_failed" };
  const id = (row as { id: string }).id;

  try {
    const [cc, revenue] = await Promise.all([
      loadCommandCenter(range),
      loadRevenueDashboard(range),
    ]);

    const payload = {
      reportType: input.reportType,
      generatedAt: new Date().toISOString(),
      range: range.label,
      partial: range.partial,
      commandCenter: {
        platformHealth: cc.platformHealth,
        business: cc.business,
        customers: cc.customers,
        product: cc.product,
        attention: cc.attention,
      },
      revenue: {
        mrrCents: revenue.mrrCents,
        arrCents: revenue.arrCents,
        completeness: revenue.completeness,
        movementCompleteness: revenue.movementCompleteness,
        newMrrCents: revenue.newMrrCents,
        churnedMrrCents: revenue.churnedMrrCents,
      },
      notes: "Operator-authored interpretation is separate from these deterministic numbers.",
    };

    await db
      .from("platform_reports")
      .update({
        state: "ready",
        payload,
        completed_at: new Date().toISOString(),
      })
      .eq("id", id);

    await logPlatformAdminAction({
      action: "platform.report.generated",
      actorUserId: input.actorUserId,
      resourceType: "platform_report",
      resourceId: id,
      summary: `Generated ${input.reportType}`,
    });

    return { id };
  } catch (e) {
    await db
      .from("platform_reports")
      .update({
        state: "failed",
        error_message: e instanceof Error ? e.message : "generation_failed",
      })
      .eq("id", id);
    return { error: "generation_failed" };
  }
}

export async function listReports(limit = 30) {
  const db = platformDb();
  const { data, error } = await db
    .from("platform_reports")
    .select(
      "id, report_type, state, period_start, period_end, created_at, completed_at, expires_at",
    )
    .order("created_at", { ascending: false })
    .limit(limit);
  if (error) return [];
  return data ?? [];
}
