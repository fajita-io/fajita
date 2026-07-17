import "server-only";

import { getStripe } from "@/lib/stripe/server";
import { serviceClient } from "@/lib/supabase/service";
import { recordAuditEvent } from "@/lib/app/audit";

import { activeTerms } from "./config";
import {
  resolvePayoutStatus,
  type PayoutStatus,
  type TaxStatus,
} from "./payout-eligibility";
import { getPayoutProfileView } from "./payout-provider";
import { queueAffiliateNotification } from "./notifications";
import type { MembershipState } from "./states";

function formatUsd(cents: number): string {
  return `$${(cents / 100).toLocaleString("en-US", {
    minimumFractionDigits: cents % 100 === 0 ? 0 : 2,
    maximumFractionDigits: 2,
  })}`;
}

/**
 * Payout operations. Turns matured, payable commission into money paid to
 * affiliates through Stripe Connect transfers, with a manual fallback.
 *
 * Money invariants:
 *   - Every amount is integer cents.
 *   - A commission is reserved (payable -> scheduled) when it enters a batch
 *     item, so it can never be double-counted across concurrent batches.
 *   - A transfer is paid at most once: the transfer uses an idempotency key per
 *     item, and item state transitions guard reprocessing.
 *   - On payout, we write a `commission_paid` ledger entry per commission that
 *     zeroes its contribution to the balance. Failures revert reservations.
 */

interface PayableAffiliate {
  affiliateId: string;
  membershipState: MembershipState;
  grossPayableCents: number;
}

/** Sum of standing (amount - reversed) commission in the `payable` state. */
async function payableAffiliates(): Promise<PayableAffiliate[]> {
  const db = serviceClient();
  const { data } = await db
    .from("affiliate_commissions")
    .select("affiliate_id, commission_amount_cents, reversed_cents")
    .eq("state", "payable")
    .limit(20000);

  const byAffiliate = new Map<string, number>();
  for (const row of data ?? []) {
    const standing = Math.max(
      0,
      row.commission_amount_cents - row.reversed_cents,
    );
    if (standing <= 0) continue;
    byAffiliate.set(
      row.affiliate_id,
      (byAffiliate.get(row.affiliate_id) ?? 0) + standing,
    );
  }
  if (byAffiliate.size === 0) return [];

  const ids = [...byAffiliate.keys()];
  const { data: affiliates } = await db
    .from("affiliates")
    .select("id, membership_state")
    .in("id", ids);
  const stateById = new Map(
    (affiliates ?? []).map((a) => [a.id, a.membership_state as MembershipState]),
  );

  return ids.map((id) => ({
    affiliateId: id,
    membershipState: stateById.get(id) ?? "active",
    grossPayableCents: byAffiliate.get(id) ?? 0,
  }));
}

async function taxStatusFor(affiliateId: string): Promise<TaxStatus> {
  const db = serviceClient();
  const { data } = await db
    .from("affiliate_tax_profiles")
    .select("status")
    .eq("affiliate_id", affiliateId)
    .maybeSingle();
  return (data?.status as TaxStatus | undefined) ?? "not_started";
}

export interface GenerateBatchResult {
  batchId: string;
  periodLabel: string;
  readyCount: number;
  readyTotalCents: number;
  skipped: { affiliateId: string; status: PayoutStatus; grossCents: number }[];
}

/**
 * Build a payout batch in `review`. Reserves ready commissions (payable ->
 * scheduled) and records a payout item per affiliate with a resolved status.
 * No money moves here.
 */
export async function generatePayoutBatch(input: {
  periodLabel: string;
  actorUserId: string;
}): Promise<GenerateBatchResult> {
  const db = serviceClient();
  const terms = activeTerms();
  const candidates = await payableAffiliates();

  const { data: batch, error: batchError } = await db
    .from("affiliate_payout_batches")
    .insert({
      period_label: input.periodLabel,
      currency: terms.currency,
      status: "review",
      created_by_user_id: input.actorUserId,
    })
    .select("id")
    .single();
  if (batchError) throw batchError;

  let readyCount = 0;
  let readyTotalCents = 0;
  const skipped: GenerateBatchResult["skipped"] = [];

  for (const candidate of candidates) {
    const profile = await getPayoutProfileView(candidate.affiliateId);
    const taxStatus = await taxStatusFor(candidate.affiliateId);
    const status = resolvePayoutStatus({
      membershipState: candidate.membershipState,
      payoutHold: profile.payoutHold,
      grossPayableCents: candidate.grossPayableCents,
      thresholdCents: terms.minimumPayoutThresholdCents,
      provider: profile.provider,
      accountEnabled: profile.enabled,
      taxStatus,
    });

    const isReady = status === "ready";
    const net = isReady ? candidate.grossPayableCents : 0;

    const { data: item, error: itemError } = await db
      .from("affiliate_payout_items")
      .insert({
        batch_id: batch.id,
        affiliate_id: candidate.affiliateId,
        currency: terms.currency,
        gross_payable_cents: candidate.grossPayableCents,
        net_payout_cents: net,
        status,
      })
      .select("id")
      .single();
    if (itemError) throw itemError;

    if (isReady) {
      // Reserve the commissions for this item.
      await db
        .from("affiliate_commissions")
        .update({ state: "scheduled", payout_item_id: item.id } as never)
        .eq("affiliate_id", candidate.affiliateId)
        .eq("state", "payable");
      readyCount += 1;
      readyTotalCents += net;
    } else {
      skipped.push({
        affiliateId: candidate.affiliateId,
        status,
        grossCents: candidate.grossPayableCents,
      });
    }
  }

  await db
    .from("affiliate_payout_batches")
    .update({
      affiliate_count: readyCount,
      total_amount_cents: readyTotalCents,
    } as never)
    .eq("id", batch.id);

  await recordAuditEvent({
    organizationId: null,
    actorUserId: input.actorUserId,
    actorType: "platform_admin",
    action: "affiliate.payout_batch_created",
    targetType: "affiliate_payout_batch",
    targetId: batch.id,
    summary: `Payout batch created (${readyCount} ready)`,
    metadata: { readyCount, readyTotalCents },
  });

  return {
    batchId: batch.id,
    periodLabel: input.periodLabel,
    readyCount,
    readyTotalCents,
    skipped,
  };
}

/** Approve a batch for processing. Review -> approved. */
export async function approvePayoutBatch(
  batchId: string,
  approverUserId: string,
): Promise<void> {
  const db = serviceClient();
  const { data: updated } = await db
    .from("affiliate_payout_batches")
    .update({
      status: "approved",
      approved_by_user_id: approverUserId,
      approved_at: new Date().toISOString(),
    } as never)
    .eq("id", batchId)
    .eq("status", "review")
    .select("id")
    .maybeSingle();
  if (!updated) {
    throw new Error("Batch is not in review, or does not exist.");
  }

  await recordAuditEvent({
    organizationId: null,
    actorUserId: approverUserId,
    actorType: "platform_admin",
    action: "affiliate.payout_batch_approved",
    targetType: "affiliate_payout_batch",
    targetId: batchId,
    summary: "Payout batch approved",
  });
}

/** Write a payout ledger entry, idempotent by key. */
async function writePayoutLedger(entry: {
  affiliateId: string;
  commissionId: string;
  amountCents: number;
  idempotencyKey: string;
}): Promise<void> {
  const db = serviceClient();
  await db
    .from("affiliate_commission_ledger")
    .upsert(
      {
        affiliate_id: entry.affiliateId,
        commission_id: entry.commissionId,
        amount_cents: entry.amountCents,
        entry_type: "commission_paid",
        idempotency_key: entry.idempotencyKey,
        source_event: "payout",
        created_by: "system",
      } as never,
      { onConflict: "idempotency_key", ignoreDuplicates: true },
    );
}

async function generateStatement(input: {
  affiliateId: string;
  batchId: string;
  periodLabel: string;
  currency: string;
  paidCents: number;
}): Promise<void> {
  const db = serviceClient();
  const { data: ledger } = await db
    .from("affiliate_commission_ledger")
    .select("amount_cents")
    .eq("affiliate_id", input.affiliateId)
    .limit(20000);
  const closing = (ledger ?? []).reduce((s, e) => s + e.amount_cents, 0);
  await db.from("affiliate_payout_statements").insert({
    affiliate_id: input.affiliateId,
    batch_id: input.batchId,
    period_label: input.periodLabel,
    currency: input.currency,
    opening_balance_cents: closing + input.paidCents,
    paid_cents: input.paidCents,
    closing_balance_cents: closing,
  });
}

export interface ProcessBatchResult {
  batchId: string;
  paidCount: number;
  paidTotalCents: number;
  failedCount: number;
}

/**
 * Process an approved batch. For Stripe Connect items, create a transfer to the
 * connected account (idempotent per item), mark the item paid, move reserved
 * commissions to paid, and zero their ledger balance. Manual-provider items are
 * left `scheduled` for an operator to settle. Failures revert the reservation.
 */
export async function processPayoutBatch(
  batchId: string,
  actorUserId: string,
): Promise<ProcessBatchResult> {
  const db = serviceClient();

  const { data: batch } = await db
    .from("affiliate_payout_batches")
    .select("id, status, period_label, currency")
    .eq("id", batchId)
    .maybeSingle();
  if (!batch) throw new Error("Batch not found.");
  if (batch.status !== "approved" && batch.status !== "processing") {
    throw new Error("Batch must be approved before processing.");
  }

  await db
    .from("affiliate_payout_batches")
    .update({ status: "processing", processing_at: new Date().toISOString() } as never)
    .eq("id", batchId)
    .in("status", ["approved", "processing"]);

  const { data: items } = await db
    .from("affiliate_payout_items")
    .select("id, affiliate_id, net_payout_cents, currency, status")
    .eq("batch_id", batchId)
    .in("status", ["ready", "scheduled", "processing"]);

  let paidCount = 0;
  let paidTotalCents = 0;
  let failedCount = 0;
  const stripe = getStripe();

  for (const item of items ?? []) {
    const profile = await getPayoutProfileView(item.affiliate_id);

    // Manual provider: leave scheduled for operator settlement.
    if (profile.provider === "manual" || !profile.connectedAccountId) {
      await db
        .from("affiliate_payout_items")
        .update({ status: "scheduled" } as never)
        .eq("id", item.id)
        .in("status", ["ready", "processing"]);
      continue;
    }

    if (!profile.enabled) {
      await db
        .from("affiliate_payout_items")
        .update({
          status: "payout_setup_required",
          failure_reason: "Payout account is not enabled.",
        } as never)
        .eq("id", item.id);
      // Release the reservation so a later batch can retry.
      await db
        .from("affiliate_commissions")
        .update({ state: "payable", payout_item_id: null } as never)
        .eq("payout_item_id", item.id)
        .eq("state", "scheduled");
      failedCount += 1;
      continue;
    }

    try {
      const transfer = await stripe.transfers.create(
        {
          amount: item.net_payout_cents,
          currency: item.currency,
          destination: profile.connectedAccountId,
          metadata: { affiliate_id: item.affiliate_id, payout_item_id: item.id },
        },
        { idempotencyKey: `payout_item:${item.id}` },
      );

      // Mark commissions paid and zero their ledger contribution.
      const { data: commissions } = await db
        .from("affiliate_commissions")
        .select("id, commission_amount_cents, reversed_cents")
        .eq("payout_item_id", item.id)
        .eq("state", "scheduled");
      for (const c of commissions ?? []) {
        const standing = Math.max(0, c.commission_amount_cents - c.reversed_cents);
        await db
          .from("affiliate_commissions")
          .update({ state: "paid" } as never)
          .eq("id", c.id)
          .eq("state", "scheduled");
        await writePayoutLedger({
          affiliateId: item.affiliate_id,
          commissionId: c.id,
          amountCents: -standing,
          idempotencyKey: `paid:${item.id}:${c.id}`,
        });
      }

      await db
        .from("affiliate_payout_items")
        .update({
          status: "paid",
          provider_reference: transfer.id,
          paid_at: new Date().toISOString(),
        } as never)
        .eq("id", item.id);

      await generateStatement({
        affiliateId: item.affiliate_id,
        batchId,
        periodLabel: batch.period_label,
        currency: item.currency,
        paidCents: item.net_payout_cents,
      });

      await queueAffiliateNotification({
        affiliateId: item.affiliate_id,
        kind: "payout_sent",
        payload: { amount: formatUsd(item.net_payout_cents) },
        dedupeKey: `payout_sent:${item.id}`,
      });

      await recordAuditEvent({
        organizationId: null,
        actorUserId: actorUserId,
        actorType: "platform_admin",
        action: "affiliate.payout_processed",
        targetType: "affiliate_payout_item",
        targetId: item.id,
        summary: "Affiliate payout transferred",
        metadata: { amountCents: item.net_payout_cents },
      });

      paidCount += 1;
      paidTotalCents += item.net_payout_cents;
    } catch (error) {
      await db
        .from("affiliate_payout_items")
        .update({
          status: "failed",
          failure_reason: "Transfer failed.",
        } as never)
        .eq("id", item.id);
      // Revert the reservation so the balance is not stranded.
      await db
        .from("affiliate_commissions")
        .update({ state: "payable", payout_item_id: null } as never)
        .eq("payout_item_id", item.id)
        .eq("state", "scheduled");

      await recordAuditEvent({
        organizationId: null,
        actorUserId: actorUserId,
        actorType: "platform_admin",
        action: "affiliate.payout_failed",
        targetType: "affiliate_payout_item",
        targetId: item.id,
        summary: "Affiliate payout transfer failed",
      });
      console.error("[affiliates] transfer failed", item.id, error);
      failedCount += 1;
    }
  }

  // Finalize batch status.
  const { count: outstanding } = await db
    .from("affiliate_payout_items")
    .select("id", { count: "exact", head: true })
    .eq("batch_id", batchId)
    .in("status", ["ready", "processing"]);

  const nowIso = new Date().toISOString();
  let finalStatus: string;
  if ((outstanding ?? 0) > 0) {
    finalStatus = "processing";
  } else if (failedCount > 0 && paidCount === 0) {
    finalStatus = "failed";
  } else if (failedCount > 0) {
    finalStatus = "partially_completed";
  } else {
    finalStatus = "completed";
  }

  await db
    .from("affiliate_payout_batches")
    .update({
      status: finalStatus,
      completed_at: finalStatus === "completed" ? nowIso : null,
      failed_at: finalStatus === "failed" ? nowIso : null,
    } as never)
    .eq("id", batchId);

  return { batchId, paidCount, paidTotalCents, failedCount };
}

/** Manually settle a scheduled item (manual provider). Marks it paid. */
export async function markPayoutItemPaidManually(input: {
  itemId: string;
  providerReference: string | null;
  actorUserId: string;
}): Promise<void> {
  const db = serviceClient();
  const { data: item } = await db
    .from("affiliate_payout_items")
    .select("id, affiliate_id, net_payout_cents, currency, batch_id, status")
    .eq("id", input.itemId)
    .maybeSingle();
  if (!item) throw new Error("Payout item not found.");
  if (item.status !== "scheduled") {
    throw new Error("Only scheduled items can be settled manually.");
  }

  const { data: commissions } = await db
    .from("affiliate_commissions")
    .select("id, commission_amount_cents, reversed_cents")
    .eq("payout_item_id", item.id)
    .eq("state", "scheduled");
  for (const c of commissions ?? []) {
    const standing = Math.max(0, c.commission_amount_cents - c.reversed_cents);
    await db
      .from("affiliate_commissions")
      .update({ state: "paid" } as never)
      .eq("id", c.id)
      .eq("state", "scheduled");
    await writePayoutLedger({
      affiliateId: item.affiliate_id,
      commissionId: c.id,
      amountCents: -standing,
      idempotencyKey: `paid:${item.id}:${c.id}`,
    });
  }

  await db
    .from("affiliate_payout_items")
    .update({
      status: "paid",
      provider_reference: input.providerReference,
      paid_at: new Date().toISOString(),
    } as never)
    .eq("id", item.id);

  const { data: batch } = await db
    .from("affiliate_payout_batches")
    .select("period_label")
    .eq("id", item.batch_id)
    .maybeSingle();

  await generateStatement({
    affiliateId: item.affiliate_id,
    batchId: item.batch_id,
    periodLabel: batch?.period_label ?? "manual",
    currency: item.currency,
    paidCents: item.net_payout_cents,
  });

  await queueAffiliateNotification({
    affiliateId: item.affiliate_id,
    kind: "payout_sent",
    payload: { amount: formatUsd(item.net_payout_cents) },
    dedupeKey: `payout_sent:${item.id}`,
  });

  await recordAuditEvent({
    organizationId: null,
    actorUserId: input.actorUserId,
    actorType: "platform_admin",
    action: "affiliate.payout_processed",
    targetType: "affiliate_payout_item",
    targetId: item.id,
    summary: "Affiliate payout settled manually",
    metadata: { amountCents: item.net_payout_cents },
  });
}

export interface PayoutBatchSummary {
  id: string;
  periodLabel: string;
  status: string;
  affiliateCount: number;
  totalAmountCents: number;
  createdAt: string;
}

/** List recent payout batches for the admin console. */
export async function listPayoutBatches(
  limit = 24,
): Promise<PayoutBatchSummary[]> {
  const db = serviceClient();
  const { data } = await db
    .from("affiliate_payout_batches")
    .select("id, period_label, status, affiliate_count, total_amount_cents, created_at")
    .order("created_at", { ascending: false })
    .limit(limit);
  return (data ?? []).map((b) => ({
    id: b.id,
    periodLabel: b.period_label,
    status: b.status,
    affiliateCount: b.affiliate_count,
    totalAmountCents: b.total_amount_cents,
    createdAt: b.created_at,
  }));
}

export interface PayoutBatchItemView {
  id: string;
  anonRef: string;
  grossPayableCents: number;
  netPayoutCents: number;
  status: string;
  failureReason: string | null;
}

export interface PayoutBatchDetail extends PayoutBatchSummary {
  items: PayoutBatchItemView[];
}

/** Full batch view with items for the admin detail page. */
export async function getPayoutBatchDetail(
  batchId: string,
): Promise<PayoutBatchDetail | null> {
  const db = serviceClient();
  const { data: batch } = await db
    .from("affiliate_payout_batches")
    .select("id, period_label, status, affiliate_count, total_amount_cents, created_at")
    .eq("id", batchId)
    .maybeSingle();
  if (!batch) return null;

  const { data: items } = await db
    .from("affiliate_payout_items")
    .select("id, affiliate_id, gross_payable_cents, net_payout_cents, status, failure_reason")
    .eq("batch_id", batchId)
    .order("net_payout_cents", { ascending: false });

  // Show the affiliate's default code as an operator-friendly reference rather
  // than internal ids. Falls back to a short id ref when no code exists.
  const ids = (items ?? []).map((i) => i.affiliate_id);
  const refById = new Map<string, string>();
  if (ids.length > 0) {
    const { data: codes } = await db
      .from("affiliate_codes")
      .select("affiliate_id, code, is_default")
      .in("affiliate_id", ids)
      .eq("is_default", true);
    for (const c of codes ?? []) {
      refById.set(c.affiliate_id, c.code);
    }
  }

  return {
    id: batch.id,
    periodLabel: batch.period_label,
    status: batch.status,
    affiliateCount: batch.affiliate_count,
    totalAmountCents: batch.total_amount_cents,
    createdAt: batch.created_at,
    items: (items ?? []).map((i) => ({
      id: i.id,
      anonRef: refById.get(i.affiliate_id) ?? `#${i.affiliate_id.slice(0, 8)}`,
      grossPayableCents: i.gross_payable_cents,
      netPayoutCents: i.net_payout_cents,
      status: i.status,
      failureReason: i.failure_reason,
    })),
  };
}

export interface AffiliatePayoutOverview {
  payableCents: number;
  thresholdCents: number;
  provider: "stripe_connect" | "manual";
  accountStatus: string;
  payoutSetupComplete: boolean;
  connectConfigured: boolean;
  taxStatus: TaxStatus;
  statements: {
    id: string;
    periodLabel: string;
    paidCents: number;
    generatedAt: string;
  }[];
}

/** Everything the affiliate payouts dashboard needs. */
export async function getPayoutOverview(
  affiliateId: string,
): Promise<AffiliatePayoutOverview> {
  const db = serviceClient();
  const terms = activeTerms();

  const { data: commissions } = await db
    .from("affiliate_commissions")
    .select("commission_amount_cents, reversed_cents")
    .eq("affiliate_id", affiliateId)
    .eq("state", "payable")
    .limit(20000);
  const payableCents = (commissions ?? []).reduce(
    (s, c) => s + Math.max(0, c.commission_amount_cents - c.reversed_cents),
    0,
  );

  const profile = await getPayoutProfileView(affiliateId);
  const taxStatus = await taxStatusFor(affiliateId);

  const { data: statements } = await db
    .from("affiliate_payout_statements")
    .select("id, period_label, paid_cents, generated_at")
    .eq("affiliate_id", affiliateId)
    .order("generated_at", { ascending: false })
    .limit(12);

  return {
    payableCents,
    thresholdCents: terms.minimumPayoutThresholdCents,
    provider: profile.provider,
    accountStatus: profile.accountStatus,
    payoutSetupComplete: profile.enabled,
    connectConfigured: profile.provider === "stripe_connect",
    taxStatus,
    statements: (statements ?? []).map((s) => ({
      id: s.id,
      periodLabel: s.period_label,
      paidCents: s.paid_cents,
      generatedAt: s.generated_at,
    })),
  };
}
