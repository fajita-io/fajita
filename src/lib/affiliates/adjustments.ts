import "server-only";

import { serviceClient } from "@/lib/supabase/service";
import { Conflict, NotFound } from "@/lib/auth/errors";
import { recordAuditEvent } from "@/lib/app/audit";

/**
 * Manual commission adjustments. Platform admins can credit or debit an
 * affiliate with a documented reason. Every adjustment writes an immutable
 * ledger entry. Money is integer cents; amountCents is signed (positive credit,
 * negative debit).
 */

export type AdjustmentType =
  | "correction"
  | "goodwill"
  | "fraud_reversal"
  | "refund_correction"
  | "payout_correction"
  | "tax_withholding_correction"
  | "currency_correction";

export async function applyCommissionAdjustment(input: {
  affiliateId: string;
  amountCents: number;
  adjustmentType: AdjustmentType;
  reason: string;
  commissionId?: string | null;
  actorUserId: string;
}): Promise<{ adjustmentId: string }> {
  const amount = Math.trunc(input.amountCents);
  if (amount === 0) throw Conflict("Adjustment amount cannot be zero.");
  if (!input.reason.trim()) throw Conflict("A reason is required.");

  const db = serviceClient();
  const { data: affiliate } = await db
    .from("affiliates")
    .select("id")
    .eq("id", input.affiliateId)
    .maybeSingle();
  if (!affiliate) throw NotFound("We could not find that affiliate.");

  if (input.commissionId) {
    const { data: commission } = await db
      .from("affiliate_commissions")
      .select("id")
      .eq("id", input.commissionId)
      .eq("affiliate_id", input.affiliateId)
      .maybeSingle();
    if (!commission) throw NotFound("We could not find that commission.");
  }

  const { data: adjustment, error } = await db
    .from("affiliate_commission_adjustments")
    .insert({
      affiliate_id: input.affiliateId,
      commission_id: input.commissionId ?? null,
      adjustment_type: input.adjustmentType,
      amount_cents: amount,
      reason: input.reason.trim().slice(0, 1000),
      created_by_user_id: input.actorUserId,
      approved_by_user_id: input.actorUserId,
    })
    .select("id")
    .single();
  if (error) throw error;

  const entryType =
    input.adjustmentType === "fraud_reversal"
      ? "fraud_adjustment"
      : "manual_correction";

  await db.from("affiliate_commission_ledger").upsert(
    {
      affiliate_id: input.affiliateId,
      commission_id: input.commissionId ?? null,
      amount_cents: amount,
      entry_type: entryType,
      idempotency_key: `adjustment:${adjustment.id}`,
      reason: input.reason.trim().slice(0, 500),
      created_by: input.actorUserId,
    } as never,
    { onConflict: "idempotency_key", ignoreDuplicates: true },
  );

  await recordAuditEvent({
    organizationId: null,
    actorUserId: input.actorUserId,
    actorType: "platform_admin",
    action: "affiliate.commission_adjusted",
    targetType: "affiliate",
    targetId: input.affiliateId,
    summary: "Commission adjusted",
    metadata: {
      amountCents: amount,
      adjustmentType: input.adjustmentType,
    },
  });

  await db.from("affiliate_admin_actions").insert({
    actor_user_id: input.actorUserId,
    affiliate_id: input.affiliateId,
    action: "commission.adjust",
    reason: input.reason.trim().slice(0, 1000),
    metadata: {
      adjustmentId: adjustment.id,
      amountCents: amount,
      adjustmentType: input.adjustmentType,
    } as never,
  });

  return { adjustmentId: adjustment.id };
}
