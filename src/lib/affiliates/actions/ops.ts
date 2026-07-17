"use server";

import { revalidatePath } from "next/cache";
import { z } from "zod";

import {
  requirePlatformAdmin,
  requireStepUpAuthentication,
} from "@/lib/auth/context";
import { toActionError, type ActionResult } from "@/lib/app/actions/shared";

import { applyCommissionAdjustment, type AdjustmentType } from "../adjustments";
import {
  assertFraudDecision,
  escalateAffiliateFraud,
  resolveFraudReview,
  type FraudReviewDecision,
} from "../fraud";
import {
  reconcileAttributions,
  reconcileCommissions,
  reconcilePayouts,
  type ReconciliationReport,
} from "../reconciliation";

const uuid = z.string().uuid();

const fraudSchema = z.object({
  affiliateId: uuid,
  decision: z.enum([
    "clear",
    "hold",
    "suspend",
    "terminate",
    "reverse",
    "request_information",
    "escalate",
  ]),
  reason: z.string().trim().max(1000).optional(),
});

/** Resolve a fraud review. Platform admin + step-up for destructive decisions. */
export async function resolveFraudReviewAction(
  input: z.input<typeof fraudSchema>,
): Promise<ActionResult<{ fraudState: string }>> {
  try {
    const admin = await requirePlatformAdmin();
    const parsed = fraudSchema.parse(input);
    assertFraudDecision(parsed.decision);

    const destructive = ["suspend", "terminate", "reverse"].includes(
      parsed.decision,
    );
    if (destructive) await requireStepUpAuthentication();

    const result = await resolveFraudReview({
      affiliateId: parsed.affiliateId,
      decision: parsed.decision as FraudReviewDecision,
      reason: parsed.reason ?? null,
      reviewerUserId: admin.id,
    });

    revalidatePath("/internal/affiliates");
    revalidatePath("/internal/affiliates/fraud");
    revalidatePath(`/internal/affiliates/directory/${parsed.affiliateId}`);
    return { ok: true, data: { fraudState: result.fraudState } };
  } catch (error) {
    return toActionError(error);
  }
}

const escalateSchema = z.object({
  affiliateId: uuid,
  reason: z.string().trim().max(1000).optional(),
});

export async function escalateFraudAction(
  input: z.input<typeof escalateSchema>,
): Promise<ActionResult> {
  try {
    const admin = await requirePlatformAdmin();
    const parsed = escalateSchema.parse(input);
    await escalateAffiliateFraud({
      affiliateId: parsed.affiliateId,
      actorUserId: admin.id,
      reason: parsed.reason ?? null,
    });
    revalidatePath("/internal/affiliates/fraud");
    revalidatePath(`/internal/affiliates/directory/${parsed.affiliateId}`);
    return { ok: true };
  } catch (error) {
    return toActionError(error);
  }
}

const adjustSchema = z.object({
  affiliateId: uuid,
  amountCents: z.number().int().refine((n) => n !== 0),
  adjustmentType: z.enum([
    "correction",
    "goodwill",
    "fraud_reversal",
    "refund_correction",
    "payout_correction",
    "tax_withholding_correction",
    "currency_correction",
  ]),
  reason: z.string().trim().min(3).max(1000),
  commissionId: uuid.optional(),
});

/** Apply a signed commission adjustment. Platform admin + step-up. */
export async function adjustCommissionAction(
  input: z.input<typeof adjustSchema>,
): Promise<ActionResult<{ adjustmentId: string }>> {
  try {
    const admin = await requirePlatformAdmin();
    await requireStepUpAuthentication();
    const parsed = adjustSchema.parse(input);
    const result = await applyCommissionAdjustment({
      affiliateId: parsed.affiliateId,
      amountCents: parsed.amountCents,
      adjustmentType: parsed.adjustmentType as AdjustmentType,
      reason: parsed.reason,
      commissionId: parsed.commissionId ?? null,
      actorUserId: admin.id,
    });
    revalidatePath(`/internal/affiliates/directory/${parsed.affiliateId}`);
    return { ok: true, data: result };
  } catch (error) {
    return toActionError(error);
  }
}

const reconcileSchema = z.object({
  kind: z.enum(["commission", "payout", "attribution"]),
  dryRun: z.boolean().default(true),
});

/** Run a reconciliation pass. Live (non-dry) requires step-up. */
export async function runReconciliationAction(
  input: z.input<typeof reconcileSchema>,
): Promise<ActionResult<ReconciliationReport>> {
  try {
    await requirePlatformAdmin();
    const parsed = reconcileSchema.parse(input);
    if (!parsed.dryRun) await requireStepUpAuthentication();

    let report: ReconciliationReport;
    if (parsed.kind === "commission") {
      report = await reconcileCommissions(parsed.dryRun);
    } else if (parsed.kind === "payout") {
      report = await reconcilePayouts(parsed.dryRun);
    } else {
      report = await reconcileAttributions(parsed.dryRun);
    }

    revalidatePath("/internal/affiliates/ops");
    return { ok: true, data: report };
  } catch (error) {
    return toActionError(error);
  }
}
