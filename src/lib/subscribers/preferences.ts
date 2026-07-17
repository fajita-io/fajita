import "server-only";

import { serviceClient } from "@/lib/supabase/service";
import { CONSENT_TEXT_VERSION } from "./constants";
import { decryptEmail } from "./email-crypto";
import { maskEmail } from "./mask";
import { verifyPreferenceTokenSignature } from "./signing";
import {
  expandSimpleChoice,
  readComponentSelection,
  readEventPreferences,
  writeComponentSelection,
  writeEventPreferences,
  type EventPreferences,
  type SimplePreferenceChoice,
} from "./prefs";

/**
 * Passwordless preference center backed by a revocable, hashed access token.
 * The token resolves to exactly one subscriber on one status page. We never
 * expose the full email: the center shows a masked address only. Tokens are
 * validated server-side and never placed in analytics or referrers.
 */

export interface PreferenceView {
  subscriberId: string;
  statusPageId: string;
  statusPageSlug: string;
  statusPageName: string;
  maskedEmail: string;
  status: string;
  allComponents: boolean;
  selectedComponentIds: string[];
  incidentUpdates: boolean;
  maintenanceUpdates: boolean;
  components: { id: string; name: string }[];
}

interface ResolvedToken {
  subscriberId: string;
  statusPageId: string;
  organizationId: string;
}

/**
 * Resolve a stateless signed preference/unsubscribe token. Verifies the HMAC,
 * then loads the subscriber and confirms the token version still matches
 * link_token_version (so a rotated link is rejected) and the record is live.
 */
async function resolveToken(rawToken: string): Promise<ResolvedToken | null> {
  const verified = verifyPreferenceTokenSignature(rawToken);
  if (!verified) return null;
  const db = serviceClient();
  const { data } = await db
    .from("status_page_subscribers")
    .select("id, status_page_id, organization_id, link_token_version, deleted_at")
    .eq("id", verified.subscriberId)
    .maybeSingle();
  if (!data || data.deleted_at) return null;
  if ((data.link_token_version ?? 1) !== verified.version) return null;
  return {
    subscriberId: data.id,
    statusPageId: data.status_page_id,
    organizationId: data.organization_id,
  };
}

export async function loadPreferenceView(rawToken: string): Promise<PreferenceView | null> {
  const resolved = await resolveToken(rawToken);
  if (!resolved) return null;
  const db = serviceClient();

  const { data: sub } = await db
    .from("status_page_subscribers")
    .select("id, status, encrypted_email, email_normalized, deleted_at")
    .eq("id", resolved.subscriberId)
    .maybeSingle();
  if (!sub || sub.deleted_at) return null;

  const { data: page } = await db
    .from("status_pages")
    .select("id, slug, name, title")
    .eq("id", resolved.statusPageId)
    .is("deleted_at", null)
    .maybeSingle();
  if (!page) return null;

  const prefs = await readEventPreferences(resolved.subscriberId);
  const selected = await readComponentSelection(resolved.subscriberId);

  const { data: components } = await db
    .from("status_page_components")
    .select("id, name")
    .eq("status_page_id", resolved.statusPageId)
    .eq("visibility", "visible")
    .is("deleted_at", null)
    .order("position", { ascending: true });

  let masked = "•••";
  const plain = sub.encrypted_email ? safeDecrypt(sub.encrypted_email) : sub.email_normalized;
  if (plain) masked = maskEmail(plain);

  return {
    subscriberId: sub.id,
    statusPageId: page.id,
    statusPageSlug: page.slug,
    statusPageName: page.title || page.name,
    maskedEmail: masked,
    status: sub.status,
    allComponents: prefs?.allComponents ?? true,
    selectedComponentIds: selected,
    incidentUpdates: prefs?.incidentUpdates ?? true,
    maintenanceUpdates: prefs?.maintenanceUpdates ?? true,
    components: (components ?? []).map((c) => ({ id: c.id, name: c.name })),
  };
}

function safeDecrypt(envelope: string): string | null {
  try {
    return decryptEmail(envelope);
  } catch {
    return null;
  }
}

export type UpdatePreferencesResult =
  | { ok: true }
  | { ok: false; reason: string };

export async function updatePreferencesByToken(
  rawToken: string,
  choice: SimplePreferenceChoice,
): Promise<UpdatePreferencesResult> {
  const resolved = await resolveToken(rawToken);
  if (!resolved) return { ok: false, reason: "This preference link is no longer valid." };
  const db = serviceClient();

  const { data: sub } = await db
    .from("status_page_subscribers")
    .select("id, status")
    .eq("id", resolved.subscriberId)
    .maybeSingle();
  if (!sub || sub.status !== "confirmed") {
    return { ok: false, reason: "This subscription is not active." };
  }

  const prefs: EventPreferences = expandSimpleChoice(choice);
  await writeEventPreferences(resolved.subscriberId, resolved.statusPageId, resolved.organizationId, prefs);
  await writeComponentSelection(
    resolved.subscriberId,
    resolved.statusPageId,
    resolved.organizationId,
    choice.allComponents,
    choice.componentIds,
  );

  await db.from("status_page_subscriber_consent_records").insert({
    subscriber_id: resolved.subscriberId,
    status_page_id: resolved.statusPageId,
    organization_id: resolved.organizationId,
    event: "preferences_changed",
    consent_text_version: CONSENT_TEXT_VERSION,
    selected_scope: choice.allComponents ? "all_components" : "selected_components",
  });

  return { ok: true };
}

/** Resolve a token to its subscriber id (used by unsubscribe/deletion). */
export async function subscriberIdForToken(rawToken: string): Promise<ResolvedToken | null> {
  return resolveToken(rawToken);
}
