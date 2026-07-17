import "server-only";

import { subscriptionMrrCents } from "@/lib/billing/mrr";
import { serviceClient } from "@/lib/supabase/service";
import { platformDb } from "../db";

export interface CustomerDirectoryRow {
  id: string;
  name: string;
  slug: string;
  createdAt: string;
  planKey: string | null;
  billingState: string | null;
  activationState: string | null;
  healthState: string | null;
  activeMonitors: number;
  openIncidents: number;
  mrrCents: number;
  lastActivityAt: string | null;
}

export async function listCustomerDirectory(opts: {
  q?: string;
  health?: string;
  plan?: string;
  limit?: number;
  offset?: number;
}): Promise<{ rows: CustomerDirectoryRow[]; completeness: "complete" | "partial" | "unavailable" }> {
  const db = serviceClient();
  const limit = Math.min(opts.limit ?? 50, 100);
  const offset = opts.offset ?? 0;

  let orgQuery = db
    .from("organizations")
    .select("id, name, slug, created_at, status")
    .neq("status", "deleted")
    .order("created_at", { ascending: false })
    .range(offset, offset + limit - 1);

  if (opts.q?.trim()) {
    const q = opts.q.trim();
    orgQuery = orgQuery.or(`name.ilike.%${q}%,slug.ilike.%${q}%,id.eq.${q}`);
  }

  const { data: orgs, error } = await orgQuery;
  if (error) return { rows: [], completeness: "unavailable" };
  if (!orgs?.length) return { rows: [], completeness: "complete" };

  const ids = orgs.map((o) => o.id);

  const [subs, lifecycle, health, monitors, incidents] = await Promise.all([
    db
      .from("billing_subscriptions")
      .select("organization_id, status, plan_key, billing_interval, recurring_amount_cents, access_state")
      .in("organization_id", ids),
    db.from("lifecycle_states").select("organization_id, state").in("organization_id", ids),
    (async () => {
      try {
        return await platformDb()
          .from("platform_org_health_snapshots")
          .select("organization_id, health_state, last_meaningful_activity_at, active_monitors, open_incidents, mrr_cents")
          .in("organization_id", ids);
      } catch {
        return { data: null, error: true };
      }
    })(),
    db
      .from("monitors")
      .select("organization_id")
      .in("organization_id", ids)
      .limit(5000),
    db
      .from("incidents")
      .select("organization_id, lifecycle_status")
      .in("organization_id", ids)
      .is("deleted_at", null)
      .limit(5000),
  ]);

  const subByOrg = new Map(
    (subs.data ?? []).map((s) => [s.organization_id, s]),
  );
  const lifeByOrg = new Map(
    (lifecycle.data ?? []).map((s) => [s.organization_id, s.state]),
  );
  const healthByOrg = new Map(
    ((health.data ?? []) as Array<{
      organization_id: string;
      health_state: string;
      last_meaningful_activity_at: string | null;
      active_monitors: number;
      open_incidents: number;
      mrr_cents: number;
    }>).map((h) => [h.organization_id, h]),
  );

  const monitorCounts = new Map<string, number>();
  for (const m of monitors.data ?? []) {
    monitorCounts.set(
      m.organization_id,
      (monitorCounts.get(m.organization_id) ?? 0) + 1,
    );
  }

  const incidentCounts = new Map<string, number>();
  for (const i of incidents.data ?? []) {
    if (["resolved", "canceled"].includes(String(i.lifecycle_status))) continue;
    incidentCounts.set(
      i.organization_id,
      (incidentCounts.get(i.organization_id) ?? 0) + 1,
    );
  }

  let rows: CustomerDirectoryRow[] = orgs.map((o) => {
    const sub = subByOrg.get(o.id);
    const snap = healthByOrg.get(o.id);
    const mrr = sub
      ? subscriptionMrrCents({
          status: sub.status as never,
          interval: (sub.billing_interval ?? "month") as "month" | "year",
          recurringAmountCents: sub.recurring_amount_cents ?? 0,
        })
      : snap?.mrr_cents ?? 0;

    return {
      id: o.id,
      name: o.name,
      slug: o.slug,
      createdAt: o.created_at,
      planKey: sub?.plan_key ?? null,
      billingState: sub?.access_state ?? sub?.status ?? null,
      activationState: lifeByOrg.get(o.id) ?? null,
      healthState: snap?.health_state ?? lifeByOrg.get(o.id) ?? null,
      activeMonitors: snap?.active_monitors ?? monitorCounts.get(o.id) ?? 0,
      openIncidents: snap?.open_incidents ?? incidentCounts.get(o.id) ?? 0,
      mrrCents: mrr,
      lastActivityAt: snap?.last_meaningful_activity_at ?? null,
    };
  });

  if (opts.health) {
    rows = rows.filter((r) => r.healthState === opts.health);
  }
  if (opts.plan) {
    rows = rows.filter((r) => r.planKey === opts.plan);
  }

  return {
    rows,
    completeness: health.error ? "partial" : "complete",
  };
}
