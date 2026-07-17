import "server-only";

import { serviceClient } from "@/lib/supabase/service";
import { CONSENT_TEXT_VERSION } from "./constants";
import { hashToken } from "./tokens";
import { signPreferenceToken } from "./signing";

/**
 * Double opt-in confirmation. Verifies a raw confirmation token by its hash,
 * checks expiry and subscriber state, flips the subscriber to confirmed, issues
 * a preference-access token, and records consent completion. The confirmation
 * token is single use: it is cleared on success so a reused link cannot
 * re-confirm. Responses never reveal whether an unrelated address exists.
 */

export type ConfirmResult =
  | { kind: "confirmed"; subscriberId: string; statusPageId: string; statusPageSlug: string; preferenceToken: string }
  | { kind: "already_confirmed"; statusPageSlug: string | null; subscriberId?: string; preferenceToken?: string }
  | { kind: "expired" }
  | { kind: "invalid" }
  | { kind: "unavailable"; reason: string };

export async function confirmSubscription(rawToken: string): Promise<ConfirmResult> {
  if (!rawToken || rawToken.length < 16) return { kind: "invalid" };
  const db = serviceClient();
  const tokenHash = hashToken(rawToken);

  const { data: sub } = await db
    .from("status_page_subscribers")
    .select("id, status, status_page_id, organization_id, confirmation_expires_at, link_token_version")
    .eq("confirmation_token_hash", tokenHash)
    .is("deleted_at", null)
    .maybeSingle();

  if (!sub) {
    // No live token. It may have been used already (cleared on confirm) or be
    // bogus. We cannot tell the two apart without leaking, so return invalid.
    return { kind: "invalid" };
  }

  // Guard on page availability.
  const { data: page } = await db
    .from("status_pages")
    .select("id, slug, status, subscriptions_enabled")
    .eq("id", sub.status_page_id)
    .is("deleted_at", null)
    .maybeSingle();
  if (!page || ["suspended", "pending_deletion", "deleted"].includes(page.status)) {
    return { kind: "unavailable", reason: "This status page is not available." };
  }

  if (["unsubscribed"].includes(sub.status)) {
    return { kind: "unavailable", reason: "This subscription was unsubscribed. Subscribe again to receive updates." };
  }
  if (["bounced", "complained", "suppressed", "pending_deletion", "deleted"].includes(sub.status)) {
    return { kind: "unavailable", reason: "This address can no longer be subscribed to this page." };
  }
  if (sub.status === "confirmed") {
    return { kind: "already_confirmed", statusPageSlug: page.slug, subscriberId: sub.id };
  }

  if (sub.confirmation_expires_at && new Date(sub.confirmation_expires_at).getTime() < Date.now()) {
    return { kind: "expired" };
  }

  // Confirm and clear the confirmation token so it is single use.
  const { error } = await db
    .from("status_page_subscribers")
    .update({
      status: "confirmed",
      confirmed_at: new Date().toISOString(),
      confirmation_token_hash: null,
      confirmation_expires_at: null,
    })
    .eq("id", sub.id)
    .eq("status", "pending"); // guard against a concurrent confirm race
  if (error) throw error;

  const preferenceToken = signPreferenceToken(sub.id, sub.link_token_version ?? 1);

  await db.from("status_page_subscriber_consent_records").insert({
    subscriber_id: sub.id,
    status_page_id: sub.status_page_id,
    organization_id: sub.organization_id,
    event: "confirmed",
    consent_text_version: CONSENT_TEXT_VERSION,
    policy_version: CONSENT_TEXT_VERSION,
  });

  return {
    kind: "confirmed",
    subscriberId: sub.id,
    statusPageId: sub.status_page_id,
    statusPageSlug: page.slug,
    preferenceToken,
  };
}
