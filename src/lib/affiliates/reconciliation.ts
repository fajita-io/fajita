import "server-only";

import { serviceClient } from "@/lib/supabase/service";
import { recordAuditEvent } from "@/lib/app/audit";

/**
 * Affiliate reconciliation. Compares commission standing, ledger balances, and
 * payout reservations. Runs dry-run by default; repair mode only fixes known
 * safe drifts (e.g. releasing stranded scheduled commissions whose payout item
 * is failed/canceled). Never invents money; never deletes ledger rows.
 */

export interface ReconciliationReport {
  kind: "commission" | "payout" | "attribution";
  dryRun: boolean;
  checked: number;
  differencesFound: number;
  differencesRepaired: number;
  samples: {
    affiliateId: string;
    issue: string;
    detail: Record<string, number | string | null>;
  }[];
}

async function recordRun(
  report: ReconciliationReport,
): Promise<string> {
  const db = serviceClient();
  const { data } = await db
    .from("affiliate_reconciliation_runs")
    .insert({
      kind: report.kind,
      dry_run: report.dryRun,
      checked: report.checked,
      differences_found: report.differencesFound,
      differences_repaired: report.differencesRepaired,
      finished_at: new Date().toISOString(),
      report: {
        samples: report.samples.slice(0, 50),
      } as never,
    })
    .select("id")
    .single();
  return data?.id ?? "";
}

/**
 * Commission reconciliation: for each affiliate, compare sum of standing
 * unpaid commissions (holding/payable/approved/scheduled/fraud_hold) to the
 * net ledger balance (excluding paid-out zeros). Reports mismatches; repair
 * does not auto-rewrite balances (those need human review).
 */
export async function reconcileCommissions(
  dryRun = true,
  limit = 500,
): Promise<ReconciliationReport> {
  const db = serviceClient();
  const { data: affiliates } = await db
    .from("affiliates")
    .select("id")
    .limit(limit);

  const report: ReconciliationReport = {
    kind: "commission",
    dryRun,
    checked: 0,
    differencesFound: 0,
    differencesRepaired: 0,
    samples: [],
  };

  for (const affiliate of affiliates ?? []) {
    report.checked += 1;
    const { data: commissions } = await db
      .from("affiliate_commissions")
      .select("commission_amount_cents, reversed_cents, state")
      .eq("affiliate_id", affiliate.id)
      .limit(5000);

    let standingUnpaid = 0;
    let paidStanding = 0;
    for (const c of commissions ?? []) {
      const standing = Math.max(
        0,
        c.commission_amount_cents - c.reversed_cents,
      );
      if (
        c.state === "holding" ||
        c.state === "payable" ||
        c.state === "approved" ||
        c.state === "scheduled" ||
        c.state === "fraud_hold"
      ) {
        standingUnpaid += standing;
      } else if (c.state === "paid") {
        paidStanding += standing;
      }
    }

    const { data: ledger } = await db
      .from("affiliate_commission_ledger")
      .select("amount_cents")
      .eq("affiliate_id", affiliate.id)
      .limit(20000);
    const balance = (ledger ?? []).reduce((s, e) => s + e.amount_cents, 0);

    // After payouts, balance ≈ standing unpaid. Accrual - reversals - paid.
    // Allow a small drift window of 0; any mismatch is reported.
    if (balance !== standingUnpaid) {
      report.differencesFound += 1;
      if (report.samples.length < 50) {
        report.samples.push({
          affiliateId: affiliate.id,
          issue: "ledger_vs_standing_mismatch",
          detail: {
            ledgerBalanceCents: balance,
            standingUnpaidCents: standingUnpaid,
            paidStandingCents: paidStanding,
          },
        });
      }
    }
  }

  const runId = await recordRun(report);
  await recordAuditEvent({
    organizationId: null,
    actorUserId: null,
    actorType: "system",
    action: "affiliate.reconciliation_run",
    targetType: "affiliate_reconciliation_run",
    targetId: runId || undefined,
    summary: `Commission reconciliation (${dryRun ? "dry" : "live"})`,
    metadata: {
      checked: report.checked,
      differencesFound: report.differencesFound,
      dryRun,
    },
  });
  return report;
}

/**
 * Payout reconciliation: find commissions stuck in `scheduled` whose payout
 * item is failed/canceled/returned, and (when not dry-run) release them back
 * to payable so they can enter a later batch.
 */
export async function reconcilePayouts(
  dryRun = true,
  limit = 500,
): Promise<ReconciliationReport> {
  const db = serviceClient();
  const report: ReconciliationReport = {
    kind: "payout",
    dryRun,
    checked: 0,
    differencesFound: 0,
    differencesRepaired: 0,
    samples: [],
  };

  const { data: stranded } = await db
    .from("affiliate_commissions")
    .select("id, affiliate_id, payout_item_id")
    .eq("state", "scheduled")
    .not("payout_item_id", "is", null)
    .limit(limit);

  for (const row of stranded ?? []) {
    report.checked += 1;
    if (!row.payout_item_id) continue;
    const { data: item } = await db
      .from("affiliate_payout_items")
      .select("id, status")
      .eq("id", row.payout_item_id)
      .maybeSingle();
    if (!item) {
      report.differencesFound += 1;
      if (report.samples.length < 50) {
        report.samples.push({
          affiliateId: row.affiliate_id,
          issue: "scheduled_without_item",
          detail: { commissionId: row.id },
        });
      }
      if (!dryRun) {
        await db
          .from("affiliate_commissions")
          .update({ state: "payable", payout_item_id: null } as never)
          .eq("id", row.id)
          .eq("state", "scheduled");
        report.differencesRepaired += 1;
      }
      continue;
    }
    if (
      item.status === "failed" ||
      item.status === "canceled" ||
      item.status === "returned"
    ) {
      report.differencesFound += 1;
      if (report.samples.length < 50) {
        report.samples.push({
          affiliateId: row.affiliate_id,
          issue: "scheduled_on_failed_item",
          detail: { commissionId: row.id, itemStatus: item.status },
        });
      }
      if (!dryRun) {
        await db
          .from("affiliate_commissions")
          .update({ state: "payable", payout_item_id: null } as never)
          .eq("id", row.id)
          .eq("state", "scheduled");
        report.differencesRepaired += 1;
      }
    }
  }

  const runId = await recordRun(report);
  await recordAuditEvent({
    organizationId: null,
    actorUserId: null,
    actorType: "system",
    action: "affiliate.reconciliation_run",
    targetType: "affiliate_reconciliation_run",
    targetId: runId || undefined,
    summary: `Payout reconciliation (${dryRun ? "dry" : "live"})`,
    metadata: {
      checked: report.checked,
      differencesFound: report.differencesFound,
      differencesRepaired: report.differencesRepaired,
      dryRun,
    },
  });
  return report;
}

/**
 * Attribution reconciliation: orgs with more than one eligible/locked
 * attribution (should be impossible via unique index, but report if found),
 * and locked attributions with no conversion.
 */
export async function reconcileAttributions(
  dryRun = true,
  limit = 500,
): Promise<ReconciliationReport> {
  const db = serviceClient();
  const report: ReconciliationReport = {
    kind: "attribution",
    dryRun,
    checked: 0,
    differencesFound: 0,
    differencesRepaired: 0,
    samples: [],
  };

  const { data: locked } = await db
    .from("affiliate_attributions")
    .select("id, organization_id, affiliate_id")
    .eq("eligibility_status", "locked")
    .limit(limit);

  for (const row of locked ?? []) {
    report.checked += 1;
    const { data: conversion } = await db
      .from("affiliate_conversions")
      .select("id")
      .eq("organization_id", row.organization_id)
      .maybeSingle();
    if (!conversion) {
      report.differencesFound += 1;
      if (report.samples.length < 50) {
        report.samples.push({
          affiliateId: row.affiliate_id,
          issue: "locked_without_conversion",
          detail: {
            attributionId: row.id,
            organizationId: row.organization_id,
          },
        });
      }
      // Repair: unlock back to eligible so a later invoice can confirm.
      if (!dryRun) {
        await db
          .from("affiliate_attributions")
          .update({
            eligibility_status: "eligible",
            locked_at: null,
          } as never)
          .eq("id", row.id)
          .eq("eligibility_status", "locked");
        report.differencesRepaired += 1;
      }
    }
  }

  const runId = await recordRun(report);
  await recordAuditEvent({
    organizationId: null,
    actorUserId: null,
    actorType: "system",
    action: "affiliate.reconciliation_run",
    targetType: "affiliate_reconciliation_run",
    targetId: runId || undefined,
    summary: `Attribution reconciliation (${dryRun ? "dry" : "live"})`,
    metadata: {
      checked: report.checked,
      differencesFound: report.differencesFound,
      differencesRepaired: report.differencesRepaired,
      dryRun,
    },
  });
  return report;
}

export async function listRecentReconciliationRuns(limit = 20): Promise<
  {
    id: string;
    kind: string;
    dryRun: boolean;
    checked: number;
    differencesFound: number;
    differencesRepaired: number;
    startedAt: string;
    finishedAt: string | null;
  }[]
> {
  const db = serviceClient();
  const { data } = await db
    .from("affiliate_reconciliation_runs")
    .select(
      "id, kind, dry_run, checked, differences_found, differences_repaired, started_at, finished_at",
    )
    .order("started_at", { ascending: false })
    .limit(limit);
  return (data ?? []).map((r) => ({
    id: r.id,
    kind: r.kind,
    dryRun: r.dry_run,
    checked: r.checked,
    differencesFound: r.differences_found,
    differencesRepaired: r.differences_repaired,
    startedAt: r.started_at,
    finishedAt: r.finished_at,
  }));
}
