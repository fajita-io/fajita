import "server-only";

import { encryptSecret, maskSecret } from "@/lib/monitoring/secret-crypto";
import { serviceClient } from "@/lib/supabase/service";
import type { Json } from "@/lib/supabase/types";
import { validateUrl } from "@/lib/monitoring/destination";
import { generateSigningKey } from "@/lib/alerts/signing";
import { ALERT_LIMITS, BLOCKED_WEBHOOK_HEADERS, type AlertProvider } from "@/lib/alerts/constants";
import { emailMatchesOrgMember } from "@/lib/alerts/recipients";

/**
 * Alert-channel data layer. Provider credentials are envelope-encrypted (Phase
 * 4 keyring) before storage and never returned in full. Every material change
 * creates a new immutable version; delivery intents pin the version they used.
 * All writes run through the service role after an explicit permission check in
 * the action layer.
 */


/**
 * Org members are verified through membership. The create form always sends
 * isMember=false, so create and test both resolve membership on the server
 * instead of trusting the client.
 */
export async function verifyPendingMemberRecipients(params: {
  organizationId: string;
  channelId: string;
  memberEmails: Iterable<string>;
}): Promise<number> {
  const emails = [
    ...new Set(
      Array.from(params.memberEmails)
        .map((e) => e.trim().toLowerCase())
        .filter(Boolean),
    ),
  ];
  if (emails.length === 0) return 0;
  const db = serviceClient();
  const { data, error } = await db
    .from("alert_email_recipients")
    .select("id, email, verification_status")
    .eq("channel_id", params.channelId)
    .eq("organization_id", params.organizationId)
    .is("removed_at", null);
  if (error) throw error;
  const ids = (data ?? [])
    .filter(
      (row) =>
        row.verification_status !== "verified" &&
        emailMatchesOrgMember(String(row.email), emails),
    )
    .map((row) => row.id);
  if (ids.length === 0) return 0;
  const { error: updateError } = await db
    .from("alert_email_recipients")
    .update({
      verification_status: "verified",
      is_organization_member: true,
      verified_at: new Date().toISOString(),
    })
    .in("id", ids);
  if (updateError) throw updateError;
  return ids.length;
}

export interface CustomHeaderInput {
  name: string;
  value: string;
  secret: boolean;
}

interface NewChannelBase {
  organizationId: string;
  actorProfileId: string;
  name: string;
  description?: string | null;
}

async function insertChannel(params: {
  organizationId: string;
  actorProfileId: string;
  name: string;
  provider: AlertProvider;
  description?: string | null;
  providerMetadata: Record<string, unknown>;
}): Promise<string> {
  const db = serviceClient();
  const { data, error } = await db
    .from("alert_channels")
    .insert({
      organization_id: params.organizationId,
      name: params.name,
      provider: params.provider,
      description: params.description ?? null,
      status: "draft",
      verification_status: "unverified",
      health_status: "unverified",
      provider_metadata: params.providerMetadata as Json,
      current_version: 1,
      created_by_user_id: params.actorProfileId,
      updated_by_user_id: params.actorProfileId,
    })
    .select("id")
    .single();
  if (error) throw error;
  return data.id;
}

async function insertVersion(params: {
  channelId: string;
  organizationId: string;
  version: number;
  configuration: Record<string, unknown>;
  changeReason: string;
  actorProfileId: string;
}): Promise<void> {
  const db = serviceClient();
  const { error } = await db.from("alert_channel_versions").insert({
    channel_id: params.channelId,
    organization_id: params.organizationId,
    version: params.version,
    configuration: params.configuration as Json,
    change_reason: params.changeReason,
    created_by_user_id: params.actorProfileId,
  });
  if (error) throw error;
}

async function insertSecret(params: {
  channelId: string;
  organizationId: string;
  actorProfileId: string;
  secretType:
    | "slack_webhook_url"
    | "slack_bot_token"
    | "discord_webhook_url"
    | "webhook_url"
    | "webhook_header_value"
    | "webhook_signing_secret";
  headerName?: string | null;
  value: string;
}): Promise<string> {
  const db = serviceClient();
  const { envelope, keyVersion } = encryptSecret(params.value);
  const { data, error } = await db
    .from("alert_channel_secrets")
    .insert({
      channel_id: params.channelId,
      organization_id: params.organizationId,
      secret_type: params.secretType,
      header_name: params.headerName ?? null,
      encrypted_payload: envelope,
      encryption_key_version: keyVersion,
      masked_label: maskSecret(params.value),
      created_by_user_id: params.actorProfileId,
    })
    .select("id")
    .single();
  if (error) throw error;
  return data.id;
}

function validateCustomHeaders(headers: CustomHeaderInput[]): void {
  if (headers.length > ALERT_LIMITS.maxCustomHeaders) {
    throw new Error(`A webhook may define at most ${ALERT_LIMITS.maxCustomHeaders} custom headers.`);
  }
  const seen = new Set<string>();
  for (const h of headers) {
    const lower = h.name.trim().toLowerCase();
    if (!/^[a-z0-9-]{1,64}$/.test(lower)) {
      throw new Error(`Header name "${h.name}" is not allowed.`);
    }
    if (BLOCKED_WEBHOOK_HEADERS.has(lower)) {
      throw new Error(`The "${h.name}" header is reserved and cannot be set.`);
    }
    if (seen.has(lower)) throw new Error(`Duplicate header "${h.name}".`);
    seen.add(lower);
    if (h.value.length > ALERT_LIMITS.maxHeaderValueLength) {
      throw new Error(`The value for "${h.name}" is too long.`);
    }
  }
}

// ---------------------------------------------------------------------------
// Provider-specific creation
// ---------------------------------------------------------------------------

export async function createEmailChannel(
  params: NewChannelBase & {
    recipients: Array<{ email: string; label?: string | null; isMember: boolean }>;
  },
): Promise<{ channelId: string }> {
  if (params.recipients.length === 0) {
    throw new Error("Add at least one recipient.");
  }
  if (params.recipients.length > ALERT_LIMITS.maxEmailRecipientsPerChannel) {
    throw new Error(`An email channel supports at most ${ALERT_LIMITS.maxEmailRecipientsPerChannel} recipients.`);
  }
  const db = serviceClient();
  const channelId = await insertChannel({
    organizationId: params.organizationId,
    actorProfileId: params.actorProfileId,
    name: params.name,
    provider: "email",
    description: params.description,
    providerMetadata: { recipient_count: params.recipients.length },
  });

  const rows = params.recipients.map((r) => ({
    channel_id: channelId,
    organization_id: params.organizationId,
    email: r.email.trim().toLowerCase(),
    label: r.label ?? null,
    // Org members are considered verified through the organization; external
    // addresses start pending until confirmed.
    verification_status: r.isMember ? "verified" : "pending",
    is_organization_member: r.isMember,
    verified_at: r.isMember ? new Date().toISOString() : null,
    created_by_user_id: params.actorProfileId,
  }));
  const { error } = await db.from("alert_email_recipients").insert(rows);
  if (error) throw error;

  await insertVersion({
    channelId,
    organizationId: params.organizationId,
    version: 1,
    configuration: { provider: "email", recipient_count: params.recipients.length },
    changeReason: "Channel created",
    actorProfileId: params.actorProfileId,
  });
  return { channelId };
}

export async function createSlackChannel(
  params: NewChannelBase & { webhookUrl: string; workspaceHint?: string; channelHint?: string },
): Promise<{ channelId: string }> {
  if (!/^https:\/\/hooks\.slack\.com\/services\/[A-Za-z0-9/_-]+$/.test(params.webhookUrl)) {
    throw new Error("Enter a valid Slack incoming webhook URL (https://hooks.slack.com/services/...).");
  }
  const summary =
    [params.channelHint, params.workspaceHint].filter(Boolean).join(" in ") || "Slack workspace";
  const channelId = await insertChannel({
    organizationId: params.organizationId,
    actorProfileId: params.actorProfileId,
    name: params.name,
    provider: "slack",
    description: params.description,
    providerMetadata: { summary, method: "incoming_webhook" },
  });
  await insertSecret({
    channelId,
    organizationId: params.organizationId,
    actorProfileId: params.actorProfileId,
    secretType: "slack_webhook_url",
    value: params.webhookUrl,
  });
  await insertVersion({
    channelId,
    organizationId: params.organizationId,
    version: 1,
    configuration: { provider: "slack", summary },
    changeReason: "Channel created",
    actorProfileId: params.actorProfileId,
  });
  return { channelId };
}

export async function createDiscordChannel(
  params: NewChannelBase & { webhookUrl: string; serverHint?: string },
): Promise<{ channelId: string }> {
  if (!/^https:\/\/(discord|discordapp)\.com\/api\/webhooks\/\d+\/[A-Za-z0-9._-]+$/.test(params.webhookUrl)) {
    throw new Error("Enter a valid Discord webhook URL (https://discord.com/api/webhooks/...).");
  }
  const summary = params.serverHint || "Discord webhook";
  const channelId = await insertChannel({
    organizationId: params.organizationId,
    actorProfileId: params.actorProfileId,
    name: params.name,
    provider: "discord",
    description: params.description,
    providerMetadata: { summary },
  });
  await insertSecret({
    channelId,
    organizationId: params.organizationId,
    actorProfileId: params.actorProfileId,
    secretType: "discord_webhook_url",
    value: params.webhookUrl,
  });
  await insertVersion({
    channelId,
    organizationId: params.organizationId,
    version: 1,
    configuration: { provider: "discord", summary },
    changeReason: "Channel created",
    actorProfileId: params.actorProfileId,
  });
  return { channelId };
}

export async function createWebhookChannel(
  params: NewChannelBase & {
    url: string;
    signingEnabled: boolean;
    customHeaders: CustomHeaderInput[];
    timeoutMs?: number;
  },
): Promise<{ channelId: string; signingSecret?: string; signingKeyId?: string }> {
  const v = validateUrl(params.url);
  if (!v.ok) throw new Error(v.message);
  if (v.scheme !== "https") throw new Error("Webhook endpoints must use HTTPS.");
  validateCustomHeaders(params.customHeaders);

  const headerNames = params.customHeaders.map((h) => h.name);
  const channelId = await insertChannel({
    organizationId: params.organizationId,
    actorProfileId: params.actorProfileId,
    name: params.name,
    provider: "webhook",
    description: params.description,
    providerMetadata: {
      host: v.host,
      header_names: headerNames,
      signing_enabled: params.signingEnabled,
      timeout_ms: params.timeoutMs ?? ALERT_LIMITS.webhookTimeoutMs,
    },
  });

  await insertSecret({
    channelId,
    organizationId: params.organizationId,
    actorProfileId: params.actorProfileId,
    secretType: "webhook_url",
    value: params.url,
  });

  for (const h of params.customHeaders.filter((x) => x.secret)) {
    await insertSecret({
      channelId,
      organizationId: params.organizationId,
      actorProfileId: params.actorProfileId,
      secretType: "webhook_header_value",
      headerName: h.name,
      value: h.value,
    });
  }
  // Non-secret static headers are stored in the version config (no values here
  // if secret). Static values are safe to store; secret ones stay encrypted.
  const staticHeaders = params.customHeaders
    .filter((x) => !x.secret)
    .map((h) => ({ name: h.name, value: h.value }));

  let signingSecret: string | undefined;
  let signingKeyId: string | undefined;
  if (params.signingEnabled) {
    const key = generateSigningKey();
    signingSecret = key.secret;
    signingKeyId = key.keyId;
    const secretId = await insertSecret({
      channelId,
      organizationId: params.organizationId,
      actorProfileId: params.actorProfileId,
      secretType: "webhook_signing_secret",
      value: key.secret,
    });
    const db = serviceClient();
    const { error } = await db.from("alert_webhook_signing_keys").insert({
      channel_id: channelId,
      organization_id: params.organizationId,
      key_id: key.keyId,
      secret_id: secretId,
      status: "active",
      created_by_user_id: params.actorProfileId,
    });
    if (error) throw error;
  }

  await insertVersion({
    channelId,
    organizationId: params.organizationId,
    version: 1,
    configuration: {
      provider: "webhook",
      host: v.host,
      signing_enabled: params.signingEnabled,
      timeout_ms: params.timeoutMs ?? ALERT_LIMITS.webhookTimeoutMs,
      static_headers: staticHeaders,
      header_names: headerNames,
    },
    changeReason: "Channel created",
    actorProfileId: params.actorProfileId,
  });

  return { channelId, signingSecret, signingKeyId };
}

// ---------------------------------------------------------------------------
// Lifecycle
// ---------------------------------------------------------------------------

async function bumpVersion(params: {
  channelId: string;
  organizationId: string;
  configuration: Record<string, unknown>;
  changeReason: string;
  actorProfileId: string;
}): Promise<number> {
  const db = serviceClient();
  const { data: chan, error: e1 } = await db
    .from("alert_channels")
    .select("current_version")
    .eq("id", params.channelId)
    .eq("organization_id", params.organizationId)
    .single();
  if (e1) throw e1;
  const next = (chan.current_version ?? 1) + 1;
  await insertVersion({ ...params, version: next });
  const { error: e2 } = await db
    .from("alert_channels")
    .update({ current_version: next, updated_by_user_id: params.actorProfileId })
    .eq("id", params.channelId)
    .eq("organization_id", params.organizationId);
  if (e2) throw e2;
  return next;
}

export async function activateChannel(organizationId: string, channelId: string): Promise<void> {
  const db = serviceClient();
  // Only a verified channel can activate.
  const { data, error } = await db
    .from("alert_channels")
    .select("verification_status")
    .eq("id", channelId)
    .eq("organization_id", organizationId)
    .single();
  if (error) throw error;
  if (data.verification_status !== "verified") {
    throw new Error("Run a successful test before activating this channel.");
  }
  const { error: e2 } = await db
    .from("alert_channels")
    .update({ status: "active", health_status: "healthy", paused_at: null, paused_reason: null })
    .eq("id", channelId)
    .eq("organization_id", organizationId);
  if (e2) throw e2;
}

export async function pauseChannel(organizationId: string, channelId: string, reason?: string): Promise<void> {
  const db = serviceClient();
  const { error } = await db
    .from("alert_channels")
    .update({ status: "paused", paused_at: new Date().toISOString(), paused_reason: reason ?? "Paused by an operator.", health_status: "paused" })
    .eq("id", channelId)
    .eq("organization_id", organizationId)
    .in("status", ["active", "degraded", "testing"]);
  if (error) throw error;
}

export async function resumeChannel(organizationId: string, channelId: string): Promise<void> {
  const db = serviceClient();
  const { error } = await db
    .from("alert_channels")
    .update({ status: "active", paused_at: null, paused_reason: null, health_status: "healthy", consecutive_failures: 0 })
    .eq("id", channelId)
    .eq("organization_id", organizationId)
    .eq("status", "paused");
  if (error) throw error;
}

export async function softDeleteChannel(organizationId: string, channelId: string): Promise<void> {
  const db = serviceClient();
  const now = new Date().toISOString();
  // Cancel pending/scheduled deliveries for this channel; keep history.
  await db
    .from("alert_delivery_intents")
    .update({ status: "canceled", suppression_reason: "channel_deleted", completed_at: now })
    .eq("channel_id", channelId)
    .eq("organization_id", organizationId)
    .in("status", ["pending", "scheduled", "processing"]);
  // Disable rules-channel links so routing stops selecting it.
  await db.from("alert_rule_channels").delete().eq("channel_id", channelId).eq("organization_id", organizationId);
  const { error } = await db
    .from("alert_channels")
    .update({ status: "deleted", health_status: "disabled", deleted_at: now, default_for_organization: false })
    .eq("id", channelId)
    .eq("organization_id", organizationId);
  if (error) throw error;
}

export async function setDefaultChannel(organizationId: string, channelId: string): Promise<void> {
  const db = serviceClient();
  await db
    .from("alert_channels")
    .update({ default_for_organization: false })
    .eq("organization_id", organizationId)
    .neq("id", channelId);
  const { error } = await db
    .from("alert_channels")
    .update({ default_for_organization: true })
    .eq("id", channelId)
    .eq("organization_id", organizationId);
  if (error) throw error;
}

// ---------------------------------------------------------------------------
// Credential + signing-key rotation
// ---------------------------------------------------------------------------

/** Replace a channel's primary credential (slack/discord/webhook URL). */
export async function rotateChannelCredential(params: {
  organizationId: string;
  channelId: string;
  actorProfileId: string;
  provider: AlertProvider;
  value: string;
}): Promise<void> {
  const db = serviceClient();
  const secretType =
    params.provider === "slack"
      ? "slack_webhook_url"
      : params.provider === "discord"
        ? "discord_webhook_url"
        : "webhook_url";

  // Retire existing active secret(s) of this type; store the new one.
  await db
    .from("alert_channel_secrets")
    .update({ status: "revoked", revoked_at: new Date().toISOString() })
    .eq("channel_id", params.channelId)
    .eq("organization_id", params.organizationId)
    .eq("secret_type", secretType)
    .eq("status", "active");

  await insertSecret({
    channelId: params.channelId,
    organizationId: params.organizationId,
    actorProfileId: params.actorProfileId,
    secretType,
    value: params.value,
  });

  // A rotated credential must be re-verified before it is trusted again.
  await db
    .from("alert_channels")
    .update({ verification_status: "unverified" })
    .eq("id", params.channelId)
    .eq("organization_id", params.organizationId);

  await bumpVersion({
    channelId: params.channelId,
    organizationId: params.organizationId,
    configuration: { rotated: "credential" },
    changeReason: "Credential replaced",
    actorProfileId: params.actorProfileId,
  });
}

/** Rotate a webhook signing key with a bounded overlap. Returns the new secret once. */
export async function rotateSigningKey(params: {
  organizationId: string;
  channelId: string;
  actorProfileId: string;
  overlapMinutes?: number;
}): Promise<{ keyId: string; secret: string }> {
  const db = serviceClient();
  const overlap = params.overlapMinutes ?? 60 * 24; // 24h default overlap.
  const now = new Date();
  const expiresAt = new Date(now.getTime() + overlap * 60_000).toISOString();

  // Mark current active key retiring with an expiry.
  await db
    .from("alert_webhook_signing_keys")
    .update({ status: "retiring", retiring_at: now.toISOString(), expires_at: expiresAt })
    .eq("channel_id", params.channelId)
    .eq("organization_id", params.organizationId)
    .eq("status", "active");

  const key = generateSigningKey();
  const secretId = await insertSecret({
    channelId: params.channelId,
    organizationId: params.organizationId,
    actorProfileId: params.actorProfileId,
    secretType: "webhook_signing_secret",
    value: key.secret,
  });
  const { error } = await db.from("alert_webhook_signing_keys").insert({
    channel_id: params.channelId,
    organization_id: params.organizationId,
    key_id: key.keyId,
    secret_id: secretId,
    status: "active",
    created_by_user_id: params.actorProfileId,
  });
  if (error) throw error;

  await bumpVersion({
    channelId: params.channelId,
    organizationId: params.organizationId,
    configuration: { rotated: "signing_key", key_id: key.keyId },
    changeReason: "Signing key rotated",
    actorProfileId: params.actorProfileId,
  });
  return key;
}
