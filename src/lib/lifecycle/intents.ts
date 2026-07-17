import "server-only";

import { serviceClient } from "@/lib/supabase/service";
import { checkRecipientEligibility } from "./preferences";
import { lifecycleMessage, type LifecycleMessageKey } from "./messages";

/**
 * Lifecycle delivery intents: typed wrappers over the SQL engine.
 *
 * An intent is created only after an eligibility check passes; eligibility is
 * re-checked at send time by the worker because state can change in between
 * (preference disabled, member removed, step completed). Deduplication is
 * enforced by the unique dedup_key column, never by in-memory state.
 */

export interface CreateIntentInput {
  organizationId: string;
  userId: string;
  messageKey: LifecycleMessageKey;
  dedupKey: string;
  /** Safe, bounded payload for the template. No secrets, no full URLs. */
  payload: Record<string, unknown>;
  scheduledAt?: Date;
  relatedType?: string;
  relatedId?: string;
}

export type CreateIntentResult =
  | { created: true; intentId: string }
  | { created: false; reason: "duplicate" | "ineligible"; detail?: string };

/**
 * Create a delivery intent when the recipient is eligible. Duplicate dedup
 * keys resolve to `{ created: false, reason: "duplicate" }` without error.
 * Ineligible recipients are recorded as suppressed intents so no lifecycle
 * decision disappears silently (see lifecycle suppression doc).
 */
export async function createLifecycleIntent(
  input: CreateIntentInput,
): Promise<CreateIntentResult> {
  const db = serviceClient();
  const definition = lifecycleMessage(input.messageKey);
  if (!definition) {
    return { created: false, reason: "ineligible", detail: "Unknown message" };
  }

  const verdict = await checkRecipientEligibility(input.messageKey, {
    userId: input.userId,
    organizationId: input.organizationId,
  });

  if (!verdict.eligible) {
    // Record the suppressed intent (dedup-safe): auditable, never re-tried.
    await db
      .from("lifecycle_delivery_intents")
      .upsert(
        {
          organization_id: input.organizationId,
          user_id: input.userId,
          message_key: input.messageKey,
          message_class: definition.class,
          template_version: definition.templateVersion,
          dedup_key: input.dedupKey,
          status: "suppressed",
          suppression_reason: verdict.reason,
          payload: input.payload as never,
          related_type: input.relatedType ?? null,
          related_id: input.relatedId ?? null,
          completed_at: new Date().toISOString(),
        },
        { onConflict: "dedup_key", ignoreDuplicates: true },
      );
    return { created: false, reason: "ineligible", detail: verdict.reason };
  }

  const { data, error } = await db.rpc("create_lifecycle_intent", {
    p_organization_id: input.organizationId,
    p_user_id: input.userId,
    p_message_key: input.messageKey,
    p_message_class: definition.class,
    p_template_version: definition.templateVersion,
    p_dedup_key: input.dedupKey,
    p_payload: input.payload as never,
    p_scheduled_at: (input.scheduledAt ?? new Date()).toISOString(),
    p_related_type: input.relatedType,
    p_related_id: input.relatedId,
  });
  if (error) throw error;
  if (!data) return { created: false, reason: "duplicate" };
  return { created: true, intentId: data };
}

/** Cancel pending intents for a user (state changed; message not current). */
export async function cancelLifecycleIntents(
  userId: string,
  messageKeys: string[],
  reason: string,
): Promise<number> {
  const { data, error } = await serviceClient().rpc("cancel_lifecycle_intents", {
    p_user_id: userId,
    p_message_keys: messageKeys,
    p_reason: reason,
  });
  if (error) throw error;
  return data ?? 0;
}
