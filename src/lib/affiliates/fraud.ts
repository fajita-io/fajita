import "server-only";

import { serviceClient } from "@/lib/supabase/service";
import { NotFound } from "@/lib/auth/errors";
import { recordAuditEvent } from "@/lib/app/audit";

import { setMembershipState } from "./provisioning";
import {
  assertFraudDecision,
  type FraudReviewDecision,
  type FraudState,
  type MembershipState,
} from "./states";

export type { FraudReviewDecision };
export { assertFraudDecision };

/**
 * Affiliate fraud detection and review.
 *
 * Detection is heuristic and coarse: it opens flags with non-sensitive evidence
 * enums (counts, ratios, reasons), never IPs, emails, customer ids, or raw
 * payloads. Review decisions can clear, hold payouts, suspend, or terminate.
 * Confirmed fraud can reverse standing unpaid commissions via a ledger write.
 *
 * Evidence in `affiliate_fraud_flags.evidence` must stay coarse: never store
 * customer identity, full URLs with PII, or payment instrument data.
 */

export type FraudFlagType =
  | "self_referral_suspected"
  | "velocity_clicks"
  | "velocity_conversions"
  | "high_refund_rate"
  | "manual_escalation";

export type FraudSeverity = "low" | "medium" | "high" | "critical";

export interface FraudFlagView {
  id: string;
  affiliateId: string;
  defaultCode: string | null;
  flagType: string;
  severity: FraudSeverity;
  reviewState: string;
  createdAt: string;
}

/** Open a fraud flag idempotently for an affiliate (dedupe open same type). */
export async function openFraudFlag(input: {
  affiliateId: string;
  flagType: FraudFlagType;
  severity: FraudSeverity;
  source?: string;
  evidence?: Record<string, unknown>;
  conversionId?: string | null;
}): Promise<{ id: string; created: boolean }> {
  const db = serviceClient();

  const { data: existing } = await db
    .from("affiliate_fraud_flags")
    .select("id")
    .eq("affiliate_id", input.affiliateId)
    .eq("flag_type", input.flagType)
    .in("review_state", ["open", "reviewing"])
    .maybeSingle();
  if (existing) return { id: existing.id, created: false };

  const { data, error } = await db
    .from("affiliate_fraud_flags")
    .insert({
      affiliate_id: input.affiliateId,
      conversion_id: input.conversionId ?? null,
      flag_type: input.flagType,
      severity: input.severity,
      source: input.source ?? "system",
      evidence: (input.evidence ?? {}) as never,
      review_state: "open",
    })
    .select("id")
    .single();
  if (error) throw error;

  // Escalate affiliate fraud_state when a new open flag lands.
  await db
    .from("affiliates")
    .update({ fraud_state: "review" } as never)
    .eq("id", input.affiliateId)
    .eq("fraud_state", "clear");

  await recordAuditEvent({
    organizationId: null,
    actorUserId: null,
    actorType: "system",
    action: "affiliate.fraud_review_opened",
    targetType: "affiliate",
    targetId: input.affiliateId,
    summary: `Fraud flag opened: ${input.flagType}`,
    metadata: { severity: input.severity, flagType: input.flagType },
  });

  return { id: data.id, created: true };
}

/**
 * Scan for heuristic fraud signals. Bounded and idempotent (open flags do not
 * duplicate). Intended for the internal worker. Returns flags opened.
 */
export async function scanAffiliateFraudSignals(
  limit = 200,
): Promise<{ opened: number; checked: number }> {
  const db = serviceClient();
  const dayAgo = new Date(Date.now() - 24 * 60 * 60 * 1000).toISOString();
  let opened = 0;
  let checked = 0;

  // Velocity: many eligible clicks in 24h from one affiliate.
  const { data: clickRows } = await db
    .from("affiliate_clicks")
    .select("affiliate_id")
    .eq("attribution_eligible", true)
    .gte("occurred_at", dayAgo)
    .limit(10000);
  const clickCounts = new Map<string, number>();
  for (const row of clickRows ?? []) {
    clickCounts.set(
      row.affiliate_id,
      (clickCounts.get(row.affiliate_id) ?? 0) + 1,
    );
  }
  for (const [affiliateId, count] of clickCounts) {
    checked += 1;
    if (count < 200) continue;
    const result = await openFraudFlag({
      affiliateId,
      flagType: "velocity_clicks",
      severity: count >= 1000 ? "high" : "medium",
      evidence: { clicks24h: count },
    });
    if (result.created) opened += 1;
  }

  // Velocity: many conversions created recently for one affiliate.
  const weekAgo = new Date(Date.now() - 7 * 24 * 60 * 60 * 1000).toISOString();
  const { data: conversions } = await db
    .from("affiliate_conversions")
    .select("affiliate_id")
    .gte("created_at", weekAgo)
    .limit(5000);
  const convCounts = new Map<string, number>();
  for (const row of conversions ?? []) {
    convCounts.set(
      row.affiliate_id,
      (convCounts.get(row.affiliate_id) ?? 0) + 1,
    );
  }
  for (const [affiliateId, count] of convCounts) {
    checked += 1;
    if (count < 10) continue;
    const result = await openFraudFlag({
      affiliateId,
      flagType: "velocity_conversions",
      severity: count >= 25 ? "high" : "medium",
      evidence: { conversions7d: count },
    });
    if (result.created) opened += 1;
  }

  // High refund rate: affiliates with many refund_reversal ledger entries vs accruals.
  const { data: affiliates } = await db
    .from("affiliates")
    .select("id")
    .eq("membership_state", "active")
    .limit(limit);
  for (const affiliate of affiliates ?? []) {
    checked += 1;
    const { data: ledger } = await db
      .from("affiliate_commission_ledger")
      .select("entry_type, amount_cents")
      .eq("affiliate_id", affiliate.id)
      .limit(5000);
    let accrued = 0;
    let refunded = 0;
    for (const e of ledger ?? []) {
      if (e.entry_type === "commission_accrued") accrued += e.amount_cents;
      if (e.entry_type === "refund_reversal") refunded += Math.abs(e.amount_cents);
    }
    if (accrued < 5000) continue; // need meaningful volume
    const rate = refunded / accrued;
    if (rate < 0.4) continue;
    const result = await openFraudFlag({
      affiliateId: affiliate.id,
      flagType: "high_refund_rate",
      severity: rate >= 0.7 ? "critical" : "high",
      evidence: {
        accruedCents: accrued,
        refundedCents: refunded,
        rateBps: Math.round(rate * 10_000),
      },
    });
    if (result.created) opened += 1;
  }

  return { opened, checked };
}

export async function listOpenFraudFlags(
  limit = 50,
): Promise<FraudFlagView[]> {
  const db = serviceClient();
  const { data } = await db
    .from("affiliate_fraud_flags")
    .select("id, affiliate_id, flag_type, severity, review_state, created_at")
    .in("review_state", ["open", "reviewing"])
    .order("created_at", { ascending: false })
    .limit(limit);
  if (!data || data.length === 0) return [];

  const ids = [...new Set(data.map((f) => f.affiliate_id))];
  const { data: codes } = await db
    .from("affiliate_codes")
    .select("affiliate_id, code")
    .in("affiliate_id", ids)
    .eq("is_default", true);
  const codeById = new Map((codes ?? []).map((c) => [c.affiliate_id, c.code]));

  return data.map((f) => ({
    id: f.id,
    affiliateId: f.affiliate_id,
    defaultCode: codeById.get(f.affiliate_id) ?? null,
    flagType: f.flag_type,
    severity: f.severity as FraudSeverity,
    reviewState: f.review_state,
    createdAt: f.created_at,
  }));
}

/**
 * Resolve a fraud review for an affiliate. Applies membership / payout hold /
 * commission freeze effects based on the decision. Platform-admin only at the
 * action layer.
 */
export async function resolveFraudReview(input: {
  affiliateId: string;
  decision: FraudReviewDecision;
  reason: string | null;
  reviewerUserId: string;
}): Promise<{ fraudState: FraudState }> {
  const db = serviceClient();
  const { data: affiliate } = await db
    .from("affiliates")
    .select("id, membership_state, fraud_state")
    .eq("id", input.affiliateId)
    .maybeSingle();
  if (!affiliate) throw NotFound("We could not find that affiliate.");

  const { data: review, error: reviewError } = await db
    .from("affiliate_fraud_reviews")
    .insert({
      affiliate_id: input.affiliateId,
      opened_by_user_id: input.reviewerUserId,
      state: "resolved",
      decision: input.decision,
      reason: input.reason,
      resolved_at: new Date().toISOString(),
    })
    .select("id")
    .single();
  if (reviewError) throw reviewError;

  let nextFraud: FraudState = "clear";
  const flagState =
    input.decision === "clear" || input.decision === "request_information"
      ? "cleared"
      : input.decision === "escalate"
        ? "reviewing"
        : "confirmed";

  if (input.decision === "clear" || input.decision === "request_information") {
    nextFraud = "clear";
  } else if (input.decision === "hold" || input.decision === "escalate") {
    nextFraud = "hold";
  } else {
    nextFraud = "confirmed";
  }

  await db
    .from("affiliate_fraud_flags")
    .update({
      review_state: flagState,
      reviewer_user_id: input.reviewerUserId,
      resolution: input.decision,
      resolved_at: new Date().toISOString(),
    } as never)
    .eq("affiliate_id", input.affiliateId)
    .in("review_state", ["open", "reviewing"]);

  await db
    .from("affiliates")
    .update({ fraud_state: nextFraud } as never)
    .eq("id", input.affiliateId);

  // Payout hold for hold/confirmed decisions.
  if (
    input.decision === "hold" ||
    input.decision === "suspend" ||
    input.decision === "terminate" ||
    input.decision === "reverse"
  ) {
    await db
      .from("affiliate_payout_profiles")
      .upsert(
        {
          affiliate_id: input.affiliateId,
          payout_hold: true,
        } as never,
        { onConflict: "affiliate_id" },
      );
  }
  if (input.decision === "clear") {
    await db
      .from("affiliate_payout_profiles")
      .update({ payout_hold: false } as never)
      .eq("affiliate_id", input.affiliateId);
  }

  // Membership transitions.
  const membership = affiliate.membership_state as MembershipState;
  if (input.decision === "suspend" && membership === "active") {
    await setMembershipState(input.affiliateId, "suspended");
  }
  if (
    input.decision === "terminate" &&
    (membership === "active" ||
      membership === "paused" ||
      membership === "suspended")
  ) {
    await setMembershipState(input.affiliateId, "terminated");
  }

  // Reverse standing unpaid commissions on confirmed fraud reverse.
  if (input.decision === "reverse") {
    await reverseUnpaidCommissionsForFraud(
      input.affiliateId,
      input.reviewerUserId,
      review.id,
    );
  }

  // Freeze holding/payable commissions into fraud_hold when holding.
  if (input.decision === "hold" || input.decision === "suspend") {
    await db
      .from("affiliate_commissions")
      .update({ state: "fraud_hold" } as never)
      .eq("affiliate_id", input.affiliateId)
      .in("state", ["holding", "payable", "approved"]);
  }
  if (input.decision === "clear") {
    // Release fraud_hold back to holding so the maturation worker can proceed.
    await db
      .from("affiliate_commissions")
      .update({ state: "holding" } as never)
      .eq("affiliate_id", input.affiliateId)
      .eq("state", "fraud_hold");
  }

  await recordAuditEvent({
    organizationId: null,
    actorUserId: input.reviewerUserId,
    actorType: "platform_admin",
    action: "affiliate.fraud_review_resolved",
    targetType: "affiliate",
    targetId: input.affiliateId,
    summary: `Fraud review: ${input.decision}`,
    metadata: { decision: input.decision },
  });

  await db.from("affiliate_admin_actions").insert({
    actor_user_id: input.reviewerUserId,
    affiliate_id: input.affiliateId,
    action: `fraud.${input.decision}`,
    reason: input.reason,
    metadata: { reviewId: review.id } as never,
  });

  return { fraudState: nextFraud };
}

async function reverseUnpaidCommissionsForFraud(
  affiliateId: string,
  actorUserId: string,
  reviewId: string,
): Promise<void> {
  const db = serviceClient();
  const { data: commissions } = await db
    .from("affiliate_commissions")
    .select(
      "id, commission_amount_cents, reversed_cents, state, conversion_id, stripe_invoice_id",
    )
    .eq("affiliate_id", affiliateId)
    .in("state", [
      "holding",
      "payable",
      "approved",
      "scheduled",
      "fraud_hold",
      "partially_reversed",
    ]);

  for (const c of commissions ?? []) {
    const standing = Math.max(
      0,
      c.commission_amount_cents - c.reversed_cents,
    );
    if (standing <= 0) continue;

    await db
      .from("affiliate_commissions")
      .update({
        reversed_cents: c.commission_amount_cents,
        state: "reversed",
      } as never)
      .eq("id", c.id);

    await db.from("affiliate_commission_ledger").upsert(
      {
        affiliate_id: affiliateId,
        conversion_id: c.conversion_id,
        commission_id: c.id,
        stripe_invoice_id: c.stripe_invoice_id,
        amount_cents: -standing,
        entry_type: "fraud_adjustment",
        idempotency_key: `fraud_reverse:${reviewId}:${c.id}`,
        reason: "Confirmed fraud reversal",
        created_by: actorUserId,
      } as never,
      { onConflict: "idempotency_key", ignoreDuplicates: true },
    );
  }
}

/** Manual escalation from an application review or admin action. */
export async function escalateAffiliateFraud(input: {
  affiliateId: string;
  actorUserId: string;
  reason: string | null;
}): Promise<void> {
  const { data: affiliate } = await serviceClient()
    .from("affiliates")
    .select("id")
    .eq("id", input.affiliateId)
    .maybeSingle();
  if (!affiliate) throw NotFound("We could not find that affiliate.");

  await openFraudFlag({
    affiliateId: input.affiliateId,
    flagType: "manual_escalation",
    severity: "high",
    source: "admin",
    evidence: { hasReason: Boolean(input.reason) },
  });

  await serviceClient().from("affiliate_admin_actions").insert({
    actor_user_id: input.actorUserId,
    affiliate_id: input.affiliateId,
    action: "fraud.escalate",
    reason: input.reason,
  });
}
