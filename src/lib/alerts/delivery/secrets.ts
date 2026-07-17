import "server-only";

import { decryptSecret } from "@/lib/monitoring/secret-crypto";
import { serviceClient } from "@/lib/supabase/service";

/**
 * Worker-side credential resolution. Decrypts a channel's active secrets into
 * memory at send time only. Callers must never log, persist, or return these
 * values. Retired/revoked secrets are ignored.
 */

export interface WebhookCredentials {
  url: string;
  headerValues: Record<string, string>;
  signing: { keyId: string; secret: string } | null;
}

async function activeSecretValue(
  channelId: string,
  secretType: string,
): Promise<string | null> {
  const db = serviceClient();
  const { data, error } = await db
    .from("alert_channel_secrets")
    .select("encrypted_payload")
    .eq("channel_id", channelId)
    .eq("secret_type", secretType)
    .eq("status", "active")
    .order("created_at", { ascending: false })
    .limit(1)
    .maybeSingle();
  if (error) throw error;
  if (!data) return null;
  return decryptSecret(data.encrypted_payload);
}

export async function resolveChatWebhookUrl(
  channelId: string,
  provider: "slack" | "discord",
): Promise<string | null> {
  const type = provider === "slack" ? "slack_webhook_url" : "discord_webhook_url";
  return activeSecretValue(channelId, type);
}

export async function resolveWebhookCredentials(
  channelId: string,
): Promise<WebhookCredentials | null> {
  const db = serviceClient();
  const url = await activeSecretValue(channelId, "webhook_url");
  if (!url) return null;

  const { data: headerRows, error: headerErr } = await db
    .from("alert_channel_secrets")
    .select("header_name, encrypted_payload")
    .eq("channel_id", channelId)
    .eq("secret_type", "webhook_header_value")
    .eq("status", "active");
  if (headerErr) throw headerErr;

  const headerValues: Record<string, string> = {};
  for (const row of headerRows ?? []) {
    if (row.header_name) headerValues[row.header_name] = decryptSecret(row.encrypted_payload);
  }

  // Sign with the active key; retiring keys stay valid on the receiver side
  // during the overlap but we only ever produce one signature.
  const { data: keyRow, error: keyErr } = await db
    .from("alert_webhook_signing_keys")
    .select("key_id, secret_id")
    .eq("channel_id", channelId)
    .eq("status", "active")
    .order("created_at", { ascending: false })
    .limit(1)
    .maybeSingle();
  if (keyErr) throw keyErr;

  let signing: { keyId: string; secret: string } | null = null;
  if (keyRow?.secret_id) {
    const { data: secretRow, error: secErr } = await db
      .from("alert_channel_secrets")
      .select("encrypted_payload")
      .eq("id", keyRow.secret_id)
      .maybeSingle();
    if (secErr) throw secErr;
    if (secretRow) signing = { keyId: keyRow.key_id, secret: decryptSecret(secretRow.encrypted_payload) };
  }

  return { url, headerValues, signing };
}

export async function resolveVerifiedEmailRecipients(channelId: string): Promise<string[]> {
  const db = serviceClient();
  const { data, error } = await db
    .from("alert_email_recipients")
    .select("email, organization_id")
    .eq("channel_id", channelId)
    .eq("verification_status", "verified")
    .is("removed_at", null);
  if (error) throw error;
  if (!data || data.length === 0) return [];

  // Drop any address on the org suppression list (bounce/complaint).
  const orgId = data[0].organization_id;
  const { data: suppressed, error: supErr } = await db
    .from("alert_email_suppressions")
    .select("email")
    .eq("organization_id", orgId);
  if (supErr) throw supErr;
  const blocked = new Set((suppressed ?? []).map((s) => s.email.toLowerCase()));
  return data.map((r) => r.email).filter((e) => !blocked.has(e.toLowerCase()));
}
