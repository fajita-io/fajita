import "server-only";

import { formatUsdCents, computeRevenueTotals } from "@/lib/billing/mrr";
import { serviceClient } from "@/lib/supabase/service";
import type { DateRange } from "../dates";
import type { DataCompleteness } from "../metrics/definitions";
import { platformDb } from "../db";

export type PlatformState =
  | "operational"
  | "degraded"
  | "partial_outage"
  | "major_outage"
  | "maintenance"
  | "unknown";

export interface MetricCell {
  key: string;
  label: string;
  value: string | number | null;
  completeness: DataCompleteness;
  basis?: string;
  source: string;
  definitionKey?: string;
}

export interface AttentionItem {
  id: string;
  severity: "critical" | "high" | "medium" | "low";
  title: string;
  href: string;
  category: string;
}

export interface CommandCenterData {
  refreshedAt: string;
  rangeLabel: string;
  platformHealth: {
    overall: PlatformState;
    monitoring: PlatformState;
    alerts: PlatformState;
    statusPages: PlatformState;
    providers: PlatformState;
    database: PlatformState;
    workers: PlatformState;
  };
  business: MetricCell[];
  customers: MetricCell[];
  product: MetricCell[];
  attention: AttentionItem[];
  recentChanges: Array<{
    id: string;
    kind: string;
    title: string;
    at: string;
    href?: string;
  }>;
  activePlatformIncidents: number;
  approvalBacklog: number;
}

function worst(...states: PlatformState[]): PlatformState {
  const rank: Record<PlatformState, number> = {
    major_outage: 5,
    partial_outage: 4,
    degraded: 3,
    maintenance: 2,
    unknown: 1,
    operational: 0,
  };
  return states.reduce((a, b) => (rank[b] > rank[a] ? b : a), "operational");
}

async function safeCount(
  table: string,
): Promise<{ count: number; completeness: DataCompleteness }> {
  try {
    const db = serviceClient();
    const { count, error } = await db
      .from(table as never)
      .select("id", { count: "exact", head: true });
    if (error) return { count: 0, completeness: "unavailable" };
    return { count: count ?? 0, completeness: "complete" };
  } catch {
    return { count: 0, completeness: "unavailable" };
  }
}

async function countActiveOrgs(): Promise<{
  count: number;
  completeness: DataCompleteness;
}> {
  try {
    const db = serviceClient();
    const { count, error } = await db
      .from("organizations")
      .select("id", { count: "exact", head: true })
      .eq("status", "active");
    if (error) return { count: 0, completeness: "unavailable" };
    return { count: count ?? 0, completeness: "complete" };
  } catch {
    return { count: 0, completeness: "unavailable" };
  }
}

async function countOpenIncidents(): Promise<{
  count: number;
  completeness: DataCompleteness;
}> {
  try {
    const db = serviceClient();
    const { count, error } = await db
      .from("incidents")
      .select("id", { count: "exact", head: true })
      .in("lifecycle_status", ["open", "monitoring"])
      .is("deleted_at", null);
    if (error) return { count: 0, completeness: "unavailable" };
    return { count: count ?? 0, completeness: "complete" };
  } catch {
    return { count: 0, completeness: "unavailable" };
  }
}

export async function loadCommandCenter(
  range: DateRange,
): Promise<CommandCenterData> {
  const db = serviceClient();
  const pdb = platformDb();
  const rangeStart = range.start.toISOString();

  const [
    orgs,
    monitors,
    openIncidents,
    workers,
    approvals,
    securityCritical,
    platformIncidents,
    subs,
  ] = await Promise.all([
    countActiveOrgs(),
    safeCount("monitors"),
    countOpenIncidents(),
    safeCount("monitor_workers"),
    (async () => {
      try {
        const { count, error } = await pdb
          .from("platform_approvals")
          .select("id", { count: "exact", head: true })
          .in("state", ["submitted", "under_review"]);
        if (error) return { count: 0, completeness: "unavailable" as const };
        return { count: count ?? 0, completeness: "complete" as const };
      } catch {
        return { count: 0, completeness: "unavailable" as const };
      }
    })(),
    (async () => {
      try {
        const { count, error } = await pdb
          .from("platform_security_events")
          .select("id", { count: "exact", head: true })
          .eq("severity", "critical")
          .in("status", ["new", "triaged", "investigating", "contained"]);
        if (error) return { count: 0, completeness: "unavailable" as const };
        return { count: count ?? 0, completeness: "complete" as const };
      } catch {
        return { count: 0, completeness: "unavailable" as const };
      }
    })(),
    (async () => {
      try {
        const { count, error } = await pdb
          .from("platform_incidents")
          .select("id", { count: "exact", head: true })
          .in("state", ["detected", "acknowledged", "investigating", "mitigating"]);
        if (error) return { count: 0, completeness: "unavailable" as const };
        return { count: count ?? 0, completeness: "complete" as const };
      } catch {
        return { count: 0, completeness: "unavailable" as const };
      }
    })(),
    db
      .from("billing_subscriptions")
      .select(
        "status, plan_key, billing_interval, recurring_amount_cents, organization_id",
      )
      .limit(5000),
  ]);

  let revenueCompleteness: DataCompleteness = "complete";
  let totals = {
    mrrCents: 0,
    arrCents: 0,
    payingOrganizations: 0,
    arpaCents: 0,
    monthlyCount: 0,
    annualCount: 0,
    planMix: {} as Record<string, number>,
  };

  if (subs.error) {
    revenueCompleteness = "unavailable";
  } else {
    const rows = (subs.data ?? []).map((r) => ({
      status: r.status as never,
      interval: (r.billing_interval ?? "month") as "month" | "year",
      recurringAmountCents: Number(r.recurring_amount_cents ?? 0),
      planKey: String(r.plan_key ?? "unknown"),
    }));
    totals = computeRevenueTotals(rows);
  }

  let activated = 0;
  let atRisk = 0;
  let lifecycleCompleteness: DataCompleteness = "complete";
  try {
    const { data, error } = await db
      .from("lifecycle_states")
      .select("state")
      .limit(5000);
    if (error) lifecycleCompleteness = "unavailable";
    else {
      for (const row of data ?? []) {
        const s = String(row.state);
        if (["activated", "engaged", "healthy", "first_value"].includes(s)) {
          activated += 1;
        }
        if (["at_risk", "setup_stalled", "payment_issue", "cancellation_scheduled"].includes(s)) {
          atRisk += 1;
        }
      }
    }
  } catch {
    lifecycleCompleteness = "unavailable";
  }

  let providerState: PlatformState = "unknown";
  try {
    const { data } = await pdb.from("platform_provider_health").select("operational_state");
    const states = (data ?? []).map((r: { operational_state: string }) =>
      String(r.operational_state) as PlatformState,
    );
    providerState = states.length ? worst(...states) : "unknown";
  } catch {
    providerState = "unknown";
  }

  const monitoringState: PlatformState =
    workers.completeness === "unavailable" ? "unknown" : "operational";
  const overall = worst(
    monitoringState,
    providerState,
    platformIncidents.count > 0 ? "degraded" : "operational",
    securityCritical.count > 0 ? "degraded" : "operational",
  );

  const attention: AttentionItem[] = [];
  if (platformIncidents.count > 0) {
    attention.push({
      id: "platform-incidents",
      severity: "critical",
      title: `${platformIncidents.count} active platform incident${platformIncidents.count === 1 ? "" : "s"}`,
      href: "/internal/operations/incidents",
      category: "platform",
    });
  }
  if (securityCritical.count > 0) {
    attention.push({
      id: "security-critical",
      severity: "critical",
      title: `${securityCritical.count} critical security event${securityCritical.count === 1 ? "" : "s"}`,
      href: "/internal/security",
      category: "security",
    });
  }
  if (approvals.count > 0) {
    attention.push({
      id: "approvals",
      severity: "high",
      title: `${approvals.count} approval${approvals.count === 1 ? "" : "s"} waiting`,
      href: "/internal/approvals",
      category: "approvals",
    });
  }
  if (atRisk > 0) {
    attention.push({
      id: "at-risk",
      severity: "medium",
      title: `${atRisk} organization${atRisk === 1 ? "" : "s"} at risk or stalled`,
      href: "/internal/customers?health=at_risk",
      category: "customers",
    });
  }
  if (openIncidents.count > 0) {
    attention.push({
      id: "customer-incidents",
      severity: "medium",
      title: `${openIncidents.count} open customer incident${openIncidents.count === 1 ? "" : "s"}`,
      href: "/internal/incidents",
      category: "incidents",
    });
  }

  let recentChanges: CommandCenterData["recentChanges"] = [];
  try {
    const { data } = await pdb
      .from("platform_releases")
      .select("id, release_id, version, environment, status, completed_at, started_at")
      .order("started_at", { ascending: false })
      .limit(8);
    recentChanges = (
      data as Array<{
        id: string;
        release_id: string;
        version: string | null;
        environment: string;
        completed_at: string | null;
        started_at: string | null;
      }> | null
    )?.map((row) => ({
      id: row.id,
      kind: "deployment",
      title: `${row.environment}: ${row.version ?? row.release_id}`,
      at: row.completed_at ?? row.started_at ?? "",
      href: "/internal/releases",
    })) ?? [];
  } catch {
    recentChanges = [];
  }

  // Touch rangeStart so unused-var lint stays clean when payment queries expand.
  void rangeStart;

  return {
    refreshedAt: new Date().toISOString(),
    rangeLabel: range.label,
    platformHealth: {
      overall,
      monitoring: monitoringState,
      alerts: "unknown",
      statusPages: "unknown",
      providers: providerState,
      database: "operational",
      workers: monitoringState,
    },
    business: [
      {
        key: "mrr",
        label: "MRR",
        value: revenueCompleteness === "unavailable" ? null : formatUsdCents(totals.mrrCents),
        completeness: revenueCompleteness,
        basis: "recurring",
        source: "billing_subscriptions",
        definitionKey: "mrr",
      },
      {
        key: "arr",
        label: "ARR",
        value: revenueCompleteness === "unavailable" ? null : formatUsdCents(totals.arrCents),
        completeness: revenueCompleteness,
        basis: "recurring",
        source: "billing_subscriptions",
        definitionKey: "arr",
      },
      {
        key: "paying",
        label: "Paying organizations",
        value: revenueCompleteness === "unavailable" ? null : totals.payingOrganizations,
        completeness: revenueCompleteness,
        source: "billing_subscriptions",
      },
      {
        key: "arpa",
        label: "ARPA",
        value: revenueCompleteness === "unavailable" ? null : formatUsdCents(totals.arpaCents),
        completeness: revenueCompleteness,
        basis: "recurring",
        source: "billing_subscriptions",
      },
    ],
    customers: [
      {
        key: "active_orgs",
        label: "Active organizations",
        value: orgs.completeness === "unavailable" ? null : orgs.count,
        completeness: orgs.completeness,
        source: "organizations",
      },
      {
        key: "activated",
        label: "Activated",
        value: lifecycleCompleteness === "unavailable" ? null : activated,
        completeness: lifecycleCompleteness,
        source: "lifecycle_states",
        definitionKey: "activated_organizations",
      },
      {
        key: "at_risk",
        label: "At risk / stalled",
        value: lifecycleCompleteness === "unavailable" ? null : atRisk,
        completeness: lifecycleCompleteness,
        source: "lifecycle_states",
      },
    ],
    product: [
      {
        key: "monitors",
        label: "Monitors",
        value: monitors.completeness === "unavailable" ? null : monitors.count,
        completeness: monitors.completeness,
        source: "monitors",
        definitionKey: "active_monitors",
      },
      {
        key: "open_incidents",
        label: "Open customer incidents",
        value: openIncidents.completeness === "unavailable" ? null : openIncidents.count,
        completeness: openIncidents.completeness,
        source: "incidents",
      },
      {
        key: "workers",
        label: "Registered workers",
        value: workers.completeness === "unavailable" ? null : workers.count,
        completeness: workers.completeness,
        source: "monitor_workers",
      },
    ],
    attention,
    recentChanges,
    activePlatformIncidents: platformIncidents.count,
    approvalBacklog: approvals.count,
  };
}
