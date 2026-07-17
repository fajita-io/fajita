"use server";

import { revalidatePath } from "next/cache";
import { z } from "zod";

import {
  requirePlatformAdmin,
  requireStepUpAuthentication,
} from "@/lib/auth/context";
import { toActionError, type ActionResult } from "@/lib/app/actions/shared";

import {
  approvePayoutBatch,
  generatePayoutBatch,
  markPayoutItemPaidManually,
  processPayoutBatch,
  type GenerateBatchResult,
  type ProcessBatchResult,
} from "../payouts";

const uuid = z.string().uuid();

const periodSchema = z
  .string()
  .trim()
  .regex(/^[0-9A-Za-z \-]{3,40}$/, "Use a short label like 2026-07.");

/** Generate a payout batch for a period label. Platform admin only. */
export async function generatePayoutBatchAction(
  periodLabel: string,
): Promise<ActionResult<GenerateBatchResult>> {
  try {
    const admin = await requirePlatformAdmin();
    const label = periodSchema.parse(periodLabel);
    const result = await generatePayoutBatch({
      periodLabel: label,
      actorUserId: admin.id,
    });
    revalidatePath("/internal/affiliates/payouts");
    return { ok: true, data: result };
  } catch (error) {
    return toActionError(error);
  }
}

/** Approve a batch for processing. Platform admin only. */
export async function approvePayoutBatchAction(
  batchId: string,
): Promise<ActionResult> {
  try {
    const admin = await requirePlatformAdmin();
    await approvePayoutBatch(uuid.parse(batchId), admin.id);
    revalidatePath("/internal/affiliates/payouts");
    revalidatePath(`/internal/affiliates/payouts/${batchId}`);
    return { ok: true };
  } catch (error) {
    return toActionError(error);
  }
}

/** Process an approved batch (moves money). Platform admin + step-up. */
export async function processPayoutBatchAction(
  batchId: string,
): Promise<ActionResult<ProcessBatchResult>> {
  try {
    const admin = await requirePlatformAdmin();
    await requireStepUpAuthentication();
    const result = await processPayoutBatch(uuid.parse(batchId), admin.id);
    revalidatePath("/internal/affiliates/payouts");
    revalidatePath(`/internal/affiliates/payouts/${batchId}`);
    return { ok: true, data: result };
  } catch (error) {
    return toActionError(error);
  }
}

const manualSchema = z.object({
  itemId: uuid,
  providerReference: z.string().trim().max(120).optional(),
});

/** Settle a scheduled manual-payout item by hand. Platform admin + step-up. */
export async function markPayoutItemPaidAction(
  input: z.input<typeof manualSchema>,
): Promise<ActionResult> {
  try {
    const admin = await requirePlatformAdmin();
    await requireStepUpAuthentication();
    const parsed = manualSchema.parse(input);
    await markPayoutItemPaidManually({
      itemId: parsed.itemId,
      providerReference: parsed.providerReference ?? null,
      actorUserId: admin.id,
    });
    revalidatePath("/internal/affiliates/payouts");
    return { ok: true };
  } catch (error) {
    return toActionError(error);
  }
}
