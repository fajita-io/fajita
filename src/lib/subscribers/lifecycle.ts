import "server-only";

import { serviceClient } from "@/lib/supabase/service";
import { subscriberIdForToken } from "./preferences";

/**
 * Unsubscribe, one-click unsubscribe, and deletion. All are passwordless and
 * login-free, validated only by a hashed token. Unsubscribe is immediate and
 * idempotent, cancels pending future delivery, preserves past delivery history,
 * and never requires a survey. Resubscribe always goes back through the public
 * form and double opt-in (handled by subscribe.ts), never a page view.
 */

export type UnsubscribeResult =
  | { ok: true; statusPageSlug: string | null; alreadyUnsubscribed: boolean }
  | { ok: false; reason: string };

export async function unsubscribeByToken(rawToken: string, source: string): Promise<UnsubscribeResult> {
  const resolved = await subscriberIdForToken(rawToken);
  if (!resolved) return { ok: false, reason: "This unsubscribe link is no longer valid." };
  const db = serviceClient();

  const { data: sub } = await db
    .from("status_page_subscribers")
    .select("id, status, status_page_id")
    .eq("id", resolved.subscriberId)
    .maybeSingle();
  if (!sub) return { ok: false, reason: "This subscription no longer exists." };

  const { data: page } = await db
    .from("status_pages")
    .select("slug")
    .eq("id", sub.status_page_id)
    .maybeSingle();
  const slug = page?.slug ?? null;

  if (sub.status === "unsubscribed") {
    return { ok: true, statusPageSlug: slug, alreadyUnsubscribed: true };
  }
  // A complained/bounced/suppressed subscriber is already off; treat as done.
  if (["complained", "bounced", "suppressed", "deleted", "pending_deletion"].includes(sub.status)) {
    return { ok: true, statusPageSlug: slug, alreadyUnsubscribed: true };
  }

  await db
    .from("status_page_subscribers")
    .update({ status: "unsubscribed", unsubscribed_at: new Date().toISOString() })
    .eq("id", sub.id);

  // Cancel any pending/scheduled future deliveries. Past attempts are kept.
  await db.rpc("cancel_pending_subscriber_intents", { p_subscriber_id: sub.id });

  // Record the unsubscribe with its source (email link, one-click, or the
  // preference center) as consent-trail evidence.
  await db.from("status_page_subscriber_consent_records").insert({
    subscriber_id: sub.id,
    status_page_id: sub.status_page_id,
    organization_id: resolved.organizationId,
    event: "unsubscribed",
    consent_source: source,
  });

  return { ok: true, statusPageSlug: slug, alreadyUnsubscribed: false };
}

export type DeletionResult =
  | { ok: true }
  | { ok: false; reason: string };

/**
 * Request subscriber-data deletion. Stops future delivery immediately, moves
 * the record to pending_deletion, and revokes preference tokens. The actual
 * erasure/anonymization runs in the deletion sweep (documented retention), and
 * a suppression hash is preserved so a deleted address is not accidentally
 * re-subscribed through import.
 */
export async function requestDeletionByToken(rawToken: string): Promise<DeletionResult> {
  const resolved = await subscriberIdForToken(rawToken);
  if (!resolved) return { ok: false, reason: "This link is no longer valid." };
  const db = serviceClient();

  const { data: sub } = await db
    .from("status_page_subscribers")
    .select("id, status, link_token_version")
    .eq("id", resolved.subscriberId)
    .maybeSingle();
  if (!sub) return { ok: false, reason: "This subscription no longer exists." };
  if (["deleted"].includes(sub.status)) return { ok: true };

  await db
    .from("status_page_subscribers")
    .update({
      status: "pending_deletion",
      deletion_requested_at: new Date().toISOString(),
      unsubscribed_at: sub.status === "confirmed" ? new Date().toISOString() : undefined,
      // Rotate the link token version so previously issued preference/unsubscribe
      // links stop resolving immediately.
      link_token_version: (sub.link_token_version ?? 1) + 1,
    })
    .eq("id", sub.id);

  await db.rpc("cancel_pending_subscriber_intents", { p_subscriber_id: sub.id });

  return { ok: true };
}
