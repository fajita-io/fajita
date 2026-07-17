import "server-only";

import { serviceClient } from "@/lib/supabase/service";
import { CONSENT_TEXT_VERSION } from "./constants";
import { emailHash, encryptEmail } from "./email-crypto";
import { normalizeEmail, isValidEmail, suggestCorrection } from "./normalize";
import { issueConfirmationToken } from "./tokens";
import { expandSimpleChoice, writeComponentSelection, writeEventPreferences, type SimplePreferenceChoice } from "./prefs";

/**
 * Record a public subscription request under double opt-in. This function is
 * enumeration-safe by design: the outward result never reveals whether an
 * address already exists, is pending, confirmed, unsubscribed, or suppressed.
 * The caller (public route) always renders the same neutral message.
 *
 * When `send` is true the caller must send exactly one confirmation email to
 * `email` with `confirmationToken`. No operational updates are ever sent before
 * confirmation. A suppressed or complained address produces `send: false` and
 * no record change, so a hostile actor cannot re-trigger email to a suppressed
 * inbox.
 */

export interface SubscribeInput {
  organizationId: string;
  statusPageId: string;
  email: string;
  choice: SimplePreferenceChoice;
  consentSource: string;
  ipHash?: string | null;
  userAgentSummary?: string | null;
}

export type SubscribeOutcome =
  | { kind: "invalid"; message: string; suggestion?: string }
  | { kind: "accepted"; send: boolean; email: string; confirmationToken?: string };

export async function recordSubscriptionRequest(input: SubscribeInput): Promise<SubscribeOutcome> {
  const email = normalizeEmail(input.email);
  if (!isValidEmail(email)) {
    const suggestion = suggestCorrection(email);
    return {
      kind: "invalid",
      message: "Enter a valid email address.",
      ...(suggestion ? { suggestion } : {}),
    };
  }

  const db = serviceClient();
  const hash = emailHash(email);

  // Durable suppression wins over everything. Neutral, no record, no email.
  const { data: suppression } = await db
    .from("status_page_subscriber_suppressions")
    .select("id")
    .eq("status_page_id", input.statusPageId)
    .eq("email_hash", hash)
    .is("removed_at", null)
    .maybeSingle();
  if (suppression) {
    return { kind: "accepted", send: false, email };
  }

  const { data: existing } = await db
    .from("status_page_subscribers")
    .select("id, status")
    .eq("status_page_id", input.statusPageId)
    .eq("email_hash", hash)
    .is("deleted_at", null)
    .maybeSingle();

  // Confirmed already: neutral success, send nothing. Do not disturb prefs from
  // an unauthenticated request; the subscriber uses the preference center.
  if (existing && existing.status === "confirmed") {
    return { kind: "accepted", send: false, email };
  }
  // Bounced/complained/suppressed at the subscriber level: never re-email.
  if (existing && ["bounced", "complained", "suppressed", "pending_deletion", "deleted"].includes(existing.status)) {
    return { kind: "accepted", send: false, email };
  }

  const token = issueConfirmationToken();
  const prefs = expandSimpleChoice(input.choice);
  let subscriberId: string;

  if (existing) {
    // pending or unsubscribed -> (re)issue confirmation, refresh consent+prefs.
    subscriberId = existing.id;
    await db
      .from("status_page_subscribers")
      .update({
        status: "pending",
        consent_source: input.consentSource,
        consent_text_version: CONSENT_TEXT_VERSION,
        consent_timestamp: new Date().toISOString(),
        consent_ip_hash: input.ipHash ?? null,
        consent_user_agent_summary: input.userAgentSummary ?? null,
        confirmation_token_hash: token.tokenHash,
        confirmation_expires_at: token.expiresAt,
        confirmation_sent_at: new Date().toISOString(),
        unsubscribed_at: null,
      })
      .eq("id", subscriberId);
  } else {
    const enc = encryptEmail(email);
    const { data: created, error } = await db
      .from("status_page_subscribers")
      .insert({
        organization_id: input.organizationId,
        status_page_id: input.statusPageId,
        email_normalized: email,
        email_hash: hash,
        encrypted_email: enc.envelope,
        encryption_key_version: enc.keyVersion,
        status: "pending",
        source: input.consentSource === "import" ? "import" : "public_form",
        consent_source: input.consentSource,
        consent_text_version: CONSENT_TEXT_VERSION,
        consent_timestamp: new Date().toISOString(),
        consent_ip_hash: input.ipHash ?? null,
        consent_user_agent_summary: input.userAgentSummary ?? null,
        confirmation_token_hash: token.tokenHash,
        confirmation_expires_at: token.expiresAt,
        confirmation_sent_at: new Date().toISOString(),
      })
      .select("id")
      .single();
    if (error) throw error;
    subscriberId = created.id;
  }

  await writeEventPreferences(subscriberId, input.statusPageId, input.organizationId, prefs);
  await writeComponentSelection(
    subscriberId,
    input.statusPageId,
    input.organizationId,
    input.choice.allComponents,
    input.choice.componentIds,
  );

  await db.from("status_page_subscriber_consent_records").insert({
    subscriber_id: subscriberId,
    status_page_id: input.statusPageId,
    organization_id: input.organizationId,
    event: existing && existing.status === "unsubscribed" ? "resubscribe_requested" : "subscribe_requested",
    consent_text_version: CONSENT_TEXT_VERSION,
    consent_source: input.consentSource,
    policy_version: CONSENT_TEXT_VERSION,
    selected_scope: input.choice.allComponents ? "all_components" : "selected_components",
    ip_hash: input.ipHash ?? null,
    user_agent_summary: input.userAgentSummary ?? null,
  });

  return { kind: "accepted", send: true, email, confirmationToken: token.token };
}

/**
 * Re-send a confirmation email for a pending subscriber. Enumeration-safe and
 * cooldown-limited. Returns whether a send should occur and the fresh token.
 */
export async function requestConfirmationResend(input: {
  organizationId: string;
  statusPageId: string;
  email: string;
  cooldownMs: number;
}): Promise<{ send: boolean; email: string; confirmationToken?: string }> {
  const email = normalizeEmail(input.email);
  if (!isValidEmail(email)) return { send: false, email };
  const db = serviceClient();
  const hash = emailHash(email);
  const { data: sub } = await db
    .from("status_page_subscribers")
    .select("id, status, last_confirmation_resend_at, confirmation_resend_count")
    .eq("status_page_id", input.statusPageId)
    .eq("email_hash", hash)
    .is("deleted_at", null)
    .maybeSingle();
  if (!sub || sub.status !== "pending") return { send: false, email };

  if (sub.last_confirmation_resend_at) {
    const elapsed = Date.now() - new Date(sub.last_confirmation_resend_at).getTime();
    if (elapsed < input.cooldownMs) return { send: false, email };
  }

  const token = issueConfirmationToken();
  await db
    .from("status_page_subscribers")
    .update({
      confirmation_token_hash: token.tokenHash,
      confirmation_expires_at: token.expiresAt,
      confirmation_sent_at: new Date().toISOString(),
      last_confirmation_resend_at: new Date().toISOString(),
      confirmation_resend_count: (sub.confirmation_resend_count ?? 0) + 1,
    })
    .eq("id", sub.id);
  return { send: true, email, confirmationToken: token.token };
}
