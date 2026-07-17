import "server-only";

import { serviceClient } from "@/lib/supabase/service";
import {
  LIFECYCLE_MESSAGES,
  lifecycleMessage,
  type LifecycleMessageDefinition,
  type LifecyclePreferenceKey,
} from "./messages";

/**
 * Lifecycle email preferences and suppression.
 *
 * Preferences are user-level and gate only optional message classes. Required
 * service messages (deletion scheduled, cancellation confirmation, export
 * ready) ignore preferences by design. Suppression (hard bounce, complaint,
 * manual) silences every optional message regardless of preference.
 */

export interface LifecyclePreferences {
  setup_guidance: boolean;
  weekly_report: boolean;
  incident_recaps: boolean;
  usage_notices: boolean;
  reactivation_reminders: boolean;
}

export const DEFAULT_LIFECYCLE_PREFERENCES: LifecyclePreferences = {
  setup_guidance: true,
  weekly_report: true,
  incident_recaps: true,
  usage_notices: true,
  reactivation_reminders: true,
};

/** Read preferences with defaults (a missing row means all defaults). */
export async function getLifecyclePreferences(
  userId: string,
): Promise<LifecyclePreferences> {
  const { data } = await serviceClient()
    .from("lifecycle_email_preferences")
    .select(
      "setup_guidance, weekly_report, incident_recaps, usage_notices, reactivation_reminders",
    )
    .eq("user_id", userId)
    .maybeSingle();
  return data ?? DEFAULT_LIFECYCLE_PREFERENCES;
}

export interface SuppressionState {
  suppressed: boolean;
  reasons: string[];
}

/** Bounce/complaint/manual suppression for a user. */
export async function getSuppressionState(
  userId: string,
): Promise<SuppressionState> {
  const { data } = await serviceClient()
    .from("lifecycle_suppressions")
    .select("reason")
    .eq("user_id", userId);
  const reasons = (data ?? []).map((r) => r.reason);
  return { suppressed: reasons.length > 0, reasons };
}

export type EligibilityVerdict =
  | { eligible: true }
  | { eligible: false; reason: string };

export interface RecipientContext {
  userId: string;
  organizationId: string | null;
}

/**
 * Full recipient eligibility for one message key, checked both at intent
 * creation and again at send time (state can change in between):
 *
 * 1. The user profile exists, is not deleted or suspended, has an email.
 * 2. For org-scoped messages, the user is still an active member.
 * 3. No bounce/complaint/manual suppression (optional classes only).
 * 4. The message's preference is enabled (optional classes only).
 */
export async function checkRecipientEligibility(
  messageKey: string,
  recipient: RecipientContext,
): Promise<EligibilityVerdict> {
  const definition = lifecycleMessage(messageKey);
  if (!definition) return { eligible: false, reason: "Unknown message key" };

  const db = serviceClient();
  const { data: profile } = await db
    .from("user_profiles")
    .select("id, primary_email, deleted_at, suspended_at")
    .eq("id", recipient.userId)
    .maybeSingle();

  if (!profile) return { eligible: false, reason: "User not found" };
  if (profile.deleted_at) return { eligible: false, reason: "User deleted" };
  if (profile.suspended_at)
    return { eligible: false, reason: "User suspended" };
  if (!profile.primary_email)
    return { eligible: false, reason: "User has no verified email" };

  if (recipient.organizationId) {
    const { data: membership } = await db
      .from("organization_members")
      .select("id, status")
      .eq("organization_id", recipient.organizationId)
      .eq("user_id", recipient.userId)
      .eq("status", "active")
      .maybeSingle();
    if (!membership)
      return { eligible: false, reason: "User is not an active member" };
  }

  // Required service messages bypass suppression and preferences by policy.
  if (definition.class === "required") return { eligible: true };

  const suppression = await getSuppressionState(recipient.userId);
  if (suppression.suppressed) {
    return {
      eligible: false,
      reason: `Recipient suppressed (${suppression.reasons.join(", ")})`,
    };
  }

  if (definition.preference) {
    const prefs = await getLifecyclePreferences(recipient.userId);
    if (!prefs[definition.preference]) {
      return {
        eligible: false,
        reason: `Preference disabled (${definition.preference})`,
      };
    }
  }

  return { eligible: true };
}

/** Update one or more preference toggles (creates the row when missing). */
export async function updateLifecyclePreferences(
  userId: string,
  patch: Partial<LifecyclePreferences>,
): Promise<void> {
  const current = await getLifecyclePreferences(userId);
  const next = { ...current, ...patch };
  const { error } = await serviceClient()
    .from("lifecycle_email_preferences")
    .upsert(
      { user_id: userId, ...next, updated_at: new Date().toISOString() },
      { onConflict: "user_id" },
    );
  if (error) throw error;
}

/** Record a suppression (idempotent per user + reason). */
export async function recordSuppression(
  userId: string,
  reason: "hard_bounce" | "complaint" | "manual",
  providerEventId?: string,
): Promise<void> {
  await serviceClient()
    .from("lifecycle_suppressions")
    .upsert(
      {
        user_id: userId,
        reason,
        provider_event_id: providerEventId ?? null,
      },
      { onConflict: "user_id,reason", ignoreDuplicates: true },
    );
}

/** Message keys gated by a given preference (for cancel-on-disable). */
export function messageKeysForPreference(
  preference: LifecyclePreferenceKey,
): string[] {
  return Object.entries(
    LIFECYCLE_MESSAGES as Record<string, LifecycleMessageDefinition>,
  )
    .filter(([, def]) => def.preference === preference)
    .map(([key]) => key);
}
