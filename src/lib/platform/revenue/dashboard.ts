import "server-only";

import {
  computeRevenueTotals,
  formatUsdCents,
  subscriptionMrrCents,
} from "@/lib/billing/mrr";
import { serviceClient } from "@/lib/supabase/service";
import type { DateRange } from "../dates";
import type { DataCompleteness } from "../metrics/definitions";
import { platformDb } from "../db";

export interface RevenueDashboard {
  completeness: DataCompleteness;
  rangeLabel: string;
  mrrCents: number;
  arrCents: number;
  payingOrganizations: number;
  arpaCents: number;
  monthlyCount: number;
  annualCount: number;
  planMix: Record<string, number>;
  newMrrCents: number;
  expansionMrrCents: number;
  contractionMrrCents: number;
  churnedMrrCents: number;
  reactivationMrrCents: number;
  movementCompleteness: DataCompleteness;
  recoveryOpen: number;
  cancelScheduled: number;
}

export async function loadRevenueDashboard(
  range: DateRange,
): Promise<RevenueDashboard> {
  const db = serviceClient();
  const { data: subs, error } = await db
    .from("billing_subscriptions")
    .select(
      "status, plan_key, billing_interval, recurring_amount_cents, access_state, cancel_at_period_end",
    )
    .limit(5000);

  if (error) {
    return {
      completeness: "unavailable",
      rangeLabel: range.label,
      mrrCents: 0,
      arrCents: 0,
      payingOrganizations: 0,
      arpaCents: 0,
      monthlyCount: 0,
      annualCount: 0,
      planMix: {},
      newMrrCents: 0,
      expansionMrrCents: 0,
      contractionMrrCents: 0,
      churnedMrrCents: 0,
      reactivationMrrCents: 0,
      movementCompleteness: "unavailable",
      recoveryOpen: 0,
      cancelScheduled: 0,
    };
  }

  const rows = (subs ?? []).map((r) => ({
    status: r.status as never,
    interval: (r.billing_interval ?? "month") as "month" | "year",
    recurringAmountCents: Number(r.recurring_amount_cents ?? 0),
    planKey: String(r.plan_key ?? "unknown"),
  }));
  const totals = computeRevenueTotals(rows);

  let recoveryOpen = 0;
  let cancelScheduled = 0;
  for (const r of subs ?? []) {
    if (["past_due", "grace_period", "restricted"].includes(r.status) ||
        ["restricted", "grace"].includes(r.access_state)) {
      recoveryOpen += 1;
    }
    if (r.cancel_at_period_end || r.status === "cancellation_scheduled") {
      cancelScheduled += 1;
    }
  }

  let movementCompleteness: DataCompleteness = "complete";
  let newMrrCents = 0;
  let expansionMrrCents = 0;
  let contractionMrrCents = 0;
  let churnedMrrCents = 0;
  let reactivationMrrCents = 0;

  try {
    const pdb = platformDb();
    const { data: movements, error: mErr } = await pdb
      .from("platform_mrr_movements")
      .select("movement_type, difference_cents")
      .gte("effective_date", range.start.toISOString().slice(0, 10))
      .lte("effective_date", range.end.toISOString().slice(0, 10))
      .limit(10000);
    if (mErr) movementCompleteness = "unavailable";
    else {
      for (const m of movements ?? []) {
        const row = m as { movement_type: string; difference_cents: number };
        const abs = Math.abs(Number(row.difference_cents ?? 0));
        switch (row.movement_type) {
          case "new":
            newMrrCents += abs;
            break;
          case "expansion":
            expansionMrrCents += abs;
            break;
          case "contraction":
            contractionMrrCents += abs;
            break;
          case "churn":
            churnedMrrCents += abs;
            break;
          case "reactivation":
            reactivationMrrCents += abs;
            break;
        }
      }
      if ((movements ?? []).length === 0) movementCompleteness = "partial";
    }
  } catch {
    movementCompleteness = "unavailable";
  }

  // Ensure MRR helper stays referenced for unit tests / future cash rows.
  void subscriptionMrrCents;
  void formatUsdCents;

  return {
    completeness: "complete",
    rangeLabel: range.label,
    ...totals,
    newMrrCents,
    expansionMrrCents,
    contractionMrrCents,
    churnedMrrCents,
    reactivationMrrCents,
    movementCompleteness,
    recoveryOpen,
    cancelScheduled,
  };
}
