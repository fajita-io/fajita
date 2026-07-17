import "server-only";

import { serviceClient } from "@/lib/supabase/service";
import { recordAuditEvent } from "@/lib/app/audit";
import { syncActivationMilestones } from "@/lib/onboarding/activation";

/**
 * Onboarding and lifecycle reconciliation.
 *
 * Detects and repairs drift between real product state and derived state:
 * milestones that were reached but not recorded (worker missed a beat),
 * reminder intents that are stale because the step completed, and delivery
 * rows stuck in processing. Everything is bounded, idempotent, and audited.
 * Historical completion timestamps are never erased; repair only fills
 * forward.
 */

export interface OnboardingReconcileResult {
  organizationsChecked: number;
  milestonesRepaired: number;
  staleIntentsCanceled: number;
  dryRun: boolean;
}

const REMINDER_GUARDS: Array<{
  messageKey: string;
  /** Returns true when the reminder is stale for this organization. */
  stale: (signals: Awaited<ReturnType<typeof syncActivationMilestones>>) => boolean;
}> = [
  { messageKey: "setup_reminder", stale: (s) => s.activeMonitorCount > 0 },
  {
    messageKey: "alert_channel_reminder",
    stale: (s) => Boolean(s.alertPathReadyAt),
  },
  {
    messageKey: "status_page_reminder",
    stale: (s) => Boolean(s.statusPageReadyAt),
  },
];

export async function reconcileOnboardingBatch(
  max = 100,
  dryRun = false,
): Promise<OnboardingReconcileResult> {
  const db = serviceClient();

  // Organizations that are not yet activated and were touched recently.
  const since = new Date(Date.now() - 30 * 24 * 60 * 60 * 1000).toISOString();
  const { data: rows } = await db
    .from("organization_onboarding")
    .select("organization_id, activated_at, updated_at")
    .is("activated_at", null)
    .gte("updated_at", since)
    .limit(Math.max(1, Math.min(max, 500)));

  let milestonesRepaired = 0;
  let staleIntentsCanceled = 0;

  for (const row of rows ?? []) {
    const before = row.activated_at;
    // syncActivationMilestones is the repair: it persists any milestone that
    // is true in the product but missing in onboarding state, and completes
    // the matching step rows. Idempotent by construction.
    const signals = dryRun
      ? null
      : await syncActivationMilestones(row.organization_id);
    if (!signals) continue;
    if (!before && signals.activatedAt) milestonesRepaired += 1;

    // Cancel reminder intents that are stale now that the step is done.
    for (const guard of REMINDER_GUARDS) {
      if (!guard.stale(signals)) continue;
      const { data: pending } = await db
        .from("lifecycle_delivery_intents")
        .select("id, user_id")
        .eq("organization_id", row.organization_id)
        .eq("message_key", guard.messageKey)
        .in("status", ["pending", "scheduled"]);
      for (const intent of pending ?? []) {
        const { error } = await db
          .from("lifecycle_delivery_intents")
          .update({
            status: "canceled",
            suppression_reason: "step_completed",
            completed_at: new Date().toISOString(),
            updated_at: new Date().toISOString(),
          })
          .eq("id", intent.id)
          .in("status", ["pending", "scheduled"]);
        if (!error) staleIntentsCanceled += 1;
      }
    }
  }

  if (!dryRun && (milestonesRepaired > 0 || staleIntentsCanceled > 0)) {
    await recordAuditEvent({
      organizationId: null,
      actorUserId: null,
      actorType: "system",
      action: "onboarding.reconciled",
      summary: `Onboarding reconciliation repaired ${milestonesRepaired} activations and canceled ${staleIntentsCanceled} stale reminders.`,
      metadata: {
        organizations_checked: (rows ?? []).length,
        milestones_repaired: milestonesRepaired,
        stale_intents_canceled: staleIntentsCanceled,
      },
    });
  }

  return {
    organizationsChecked: (rows ?? []).length,
    milestonesRepaired,
    staleIntentsCanceled,
    dryRun,
  };
}

export interface LifecycleReconcileResult {
  dryRun: boolean;
  staleLeases: number;
  stuckProcessing: number;
  pendingNoAttempt: number;
}

/** Delivery-queue reconciliation via the SQL primitive. */
export async function reconcileLifecycleDelivery(
  dryRun = true,
): Promise<LifecycleReconcileResult> {
  const db = serviceClient();
  const { data, error } = await db.rpc("reconcile_lifecycle_delivery", {
    p_dry_run: dryRun,
    p_limit: 500,
  });
  if (error) throw error;
  const result = (data ?? {}) as Record<string, unknown>;

  if (!dryRun) {
    await recordAuditEvent({
      organizationId: null,
      actorUserId: null,
      actorType: "system",
      action: "lifecycle.reconciled",
      summary: "Lifecycle delivery reconciliation ran.",
      metadata: result,
    });
  }

  return {
    dryRun,
    staleLeases: Number(result.stale_leases ?? 0),
    stuckProcessing: Number(result.stuck_processing ?? 0),
    pendingNoAttempt: Number(result.pending_no_attempt ?? 0),
  };
}
