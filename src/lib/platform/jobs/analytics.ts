import "server-only";

import { computeRevenueTotals } from "@/lib/billing/mrr";
import { serviceClient } from "@/lib/supabase/service";
import { platformDb } from "../db";

/**
 * Bounded analytics jobs. Never run expensive analytics on customer requests.
 * Idempotent daily health rebuild for a single day.
 */
export async function rebuildPlatformDailyHealth(
  day = new Date(),
): Promise<{ ok: true; day: string } | { error: string }> {
  const dayKey = day.toISOString().slice(0, 10);
  const db = serviceClient();
  const pdb = platformDb();

  const [orgs, monitors, subs, approvals, security] = await Promise.all([
    db
      .from("organizations")
      .select("id", { count: "exact", head: true })
      .eq("status", "active"),
    db
      .from("monitors")
      .select("id", { count: "exact", head: true })
      .eq("status", "active"),
    db
      .from("billing_subscriptions")
      .select("status, plan_key, billing_interval, recurring_amount_cents")
      .limit(5000),
    pdb
      .from("platform_approvals")
      .select("id", { count: "exact", head: true })
      .in("state", ["submitted", "under_review"]),
    pdb
      .from("platform_security_events")
      .select("id", { count: "exact", head: true })
      .eq("severity", "critical")
      .in("status", ["new", "triaged", "investigating", "contained"]),
  ]);

  const totals = computeRevenueTotals(
    (subs.data ?? []).map((r) => ({
      status: r.status as never,
      interval: (r.billing_interval ?? "month") as "month" | "year",
      recurringAmountCents: Number(r.recurring_amount_cents ?? 0),
      planKey: String(r.plan_key ?? "unknown"),
    })),
  );

  const { error } = await pdb.from("platform_daily_health").upsert(
    {
      day: dayKey,
      overall_state: "operational",
      monitoring_state: "operational",
      alert_state: "unknown",
      status_page_state: "unknown",
      provider_state: "unknown",
      database_state: "operational",
      worker_state: "unknown",
      active_monitors: monitors.count ?? 0,
      active_organizations: orgs.count ?? 0,
      mrr_cents: totals.mrrCents,
      approval_backlog: approvals.count ?? 0,
      critical_security_events: security.count ?? 0,
      completeness: subs.error ? "partial" : "complete",
      calculation_version: "1",
      refreshed_at: new Date().toISOString(),
    },
    { onConflict: "day" },
  );

  if (error) return { error: error.message };
  return { ok: true, day: dayKey };
}

export async function snapshotOrganizationHealth(
  limit = 100,
): Promise<{ updated: number }> {
  const db = serviceClient();
  const pdb = platformDb();
  const { data: orgs } = await db
    .from("organizations")
    .select("id")
    .eq("status", "active")
    .limit(limit);

  let updated = 0;
  for (const org of orgs ?? []) {
    const [{ data: life }, { data: sub }, { count: monitorCount }] =
      await Promise.all([
        db
          .from("lifecycle_states")
          .select("state")
          .eq("organization_id", org.id)
          .maybeSingle(),
        db
          .from("billing_subscriptions")
          .select("status, plan_key, billing_interval, recurring_amount_cents, access_state")
          .eq("organization_id", org.id)
          .maybeSingle(),
        db
          .from("monitors")
          .select("id", { count: "exact", head: true })
          .eq("organization_id", org.id)
          .eq("status", "active"),
      ]);

    const healthState = life?.state ?? "new";
    const mrr = sub
      ? computeRevenueTotals([
          {
            status: sub.status as never,
            interval: (sub.billing_interval ?? "month") as "month" | "year",
            recurringAmountCents: Number(sub.recurring_amount_cents ?? 0),
            planKey: String(sub.plan_key ?? "unknown"),
          },
        ]).mrrCents
      : 0;

    await pdb.from("platform_org_health_snapshots").upsert(
      {
        organization_id: org.id,
        health_state: healthState,
        activation_state: life?.state ?? null,
        billing_state: sub?.access_state ?? sub?.status ?? null,
        plan_key: sub?.plan_key ?? null,
        mrr_cents: mrr,
        active_monitors: monitorCount ?? 0,
        evidence: { source: "lifecycle_states", rule_version: "1" },
        rule_version: "1",
        evaluated_at: new Date().toISOString(),
      },
      { onConflict: "organization_id" },
    );
    updated += 1;
  }

  return { updated };
}
