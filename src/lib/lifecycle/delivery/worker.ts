import "server-only";

import { randomUUID } from "node:crypto";

import { serviceClient } from "@/lib/supabase/service";
import { renderLifecycleEmail } from "../emails/templates";
import { checkRecipientEligibility } from "../preferences";
import { sendLifecycleEmail } from "./sender";

/**
 * Lifecycle delivery worker.
 *
 * Mirrors the Phase 7 alert worker: lease due intents (SKIP LOCKED), re-check
 * eligibility at send time, render the versioned template, send through the
 * shared transactional stream, and record the attempt through the SQL engine
 * (which owns retry backoff and dead-letter transitions).
 *
 * Never called from a customer browser action. Driven by the internal run
 * endpoint or a scheduled trigger.
 */

export interface LifecyclePassResult {
  leased: number;
  delivered: number;
  suppressed: number;
  retried: number;
  deadLettered: number;
  expiredLeases: number;
}

export async function runLifecycleDeliveryPass(options?: {
  max?: number;
  leaseSeconds?: number;
}): Promise<LifecyclePassResult> {
  const db = serviceClient();
  const workerId = `lifecycle-${randomUUID().slice(0, 8)}`;

  const { data: expired } = await db.rpc("expire_stale_lifecycle_leases");
  const result: LifecyclePassResult = {
    leased: 0,
    delivered: 0,
    suppressed: 0,
    retried: 0,
    deadLettered: 0,
    expiredLeases: expired ?? 0,
  };

  const { data: intents, error } = await db.rpc("lease_lifecycle_deliveries", {
    p_worker: workerId,
    p_max: options?.max ?? 20,
    p_lease_seconds: options?.leaseSeconds ?? 60,
  });
  if (error) throw error;
  if (!intents || intents.length === 0) return result;
  result.leased = intents.length;

  for (const intent of intents) {
    try {
      const outcome = await deliverIntent(intent);
      if (outcome === "delivered") result.delivered += 1;
      else if (outcome === "suppressed") result.suppressed += 1;
      else if (outcome === "pending") result.retried += 1;
      else result.deadLettered += 1;
    } catch (error) {
      console.error("[lifecycle] delivery failed", intent.id, error);
      await db.rpc("record_lifecycle_attempt", {
        p_intent_id: intent.id,
        p_result: "error",
        p_error_category: "unknown_provider_error",
        p_safe_summary: "Unexpected worker error",
        p_http_status: undefined,
        p_provider_message_id: undefined,
        p_duration_ms: 0,
      });
    }
  }

  return result;
}

interface LeasedIntent {
  id: string;
  organization_id: string | null;
  user_id: string;
  message_key: string;
  message_class: string;
  template_version: number;
  payload: unknown;
  attempt_count: number;
  max_attempts: number;
}

async function deliverIntent(intent: LeasedIntent): Promise<string> {
  const db = serviceClient();

  // Eligibility can change between intent creation and send time
  // (preference disabled, member removed, suppression recorded).
  const verdict = await checkRecipientEligibility(intent.message_key, {
    userId: intent.user_id,
    organizationId: intent.organization_id,
  });
  if (!verdict.eligible) {
    const { data } = await db.rpc("record_lifecycle_attempt", {
      p_intent_id: intent.id,
      p_result: "suppressed",
      p_error_category: undefined,
      p_safe_summary: verdict.reason,
      p_http_status: undefined,
      p_provider_message_id: undefined,
      p_duration_ms: 0,
      p_suppression_reason: verdict.reason,
    });
    return data ?? "suppressed";
  }

  const { data: profile } = await db
    .from("user_profiles")
    .select("primary_email")
    .eq("id", intent.user_id)
    .maybeSingle();
  if (!profile?.primary_email) {
    const { data } = await db.rpc("record_lifecycle_attempt", {
      p_intent_id: intent.id,
      p_result: "suppressed",
      p_error_category: undefined,
      p_safe_summary: "Recipient has no email address",
      p_http_status: undefined,
      p_provider_message_id: undefined,
      p_duration_ms: 0,
      p_suppression_reason: "Recipient has no email address",
    });
    return data ?? "suppressed";
  }

  const email = renderLifecycleEmail(
    intent.message_key,
    intent.template_version,
    (intent.payload ?? {}) as Record<string, unknown>,
  );
  if (!email) {
    const { data } = await db.rpc("record_lifecycle_attempt", {
      p_intent_id: intent.id,
      p_result: "permanent_failure",
      p_error_category: "configuration_error",
      p_safe_summary: `No template for ${intent.message_key} v${intent.template_version}`,
      p_http_status: undefined,
      p_provider_message_id: undefined,
      p_duration_ms: 0,
    });
    return data ?? "dead_letter";
  }

  const outcome = await sendLifecycleEmail({
    to: profile.primary_email,
    messageKey: intent.message_key,
    email,
  });

  const { data } = await db.rpc("record_lifecycle_attempt", {
    p_intent_id: intent.id,
    p_result: outcome.result,
    p_error_category: outcome.errorCategory ?? undefined,
    p_safe_summary: outcome.safeSummary,
    p_http_status: outcome.httpStatus ?? undefined,
    p_provider_message_id: outcome.providerMessageId ?? undefined,
    p_duration_ms: outcome.durationMs,
  });
  return data ?? outcome.result;
}
