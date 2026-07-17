"use server";

import { revalidatePath } from "next/cache";
import { z } from "zod";

import { DataFastGoals } from "@/lib/analytics/goals";
import { trackGoal } from "@/lib/analytics/server";
import { recordAuditEvent } from "@/lib/app/audit";
import { type ActionResult, toActionError } from "@/lib/app/actions/shared";
import { isFeatureEnabled } from "@/lib/app/feature-flags.server";
import { isPlatformAdmin, requireOrganizationPermission } from "@/lib/auth/context";
import { Forbidden, RateLimited } from "@/lib/auth/errors";
import { rateLimit } from "@/lib/site/rate-limit";
import {
  activateChannel,
  createDiscordChannel,
  createEmailChannel,
  createSlackChannel,
  createWebhookChannel,
  pauseChannel,
  resumeChannel,
  rotateChannelCredential,
  rotateSigningKey,
  setDefaultChannel,
  softDeleteChannel,
} from "@/lib/alerts/channels";
import {
  createRecommendedRule,
  createRule,
  deleteRule,
  setRuleStatus,
  updateRule,
  type RuleInput,
} from "@/lib/alerts/rules-write";
import { sendChannelTest } from "@/lib/alerts/delivery/test";
import { dismissDeadLetter, retryDeadLetter } from "@/lib/alerts/deadletters";
import { exportDeliveriesCsv } from "@/lib/alerts/queries";
import { ALERT_SEVERITIES, RECOVERY_BEHAVIORS, QUIET_BEHAVIORS, SCOPE_KINDS } from "@/lib/alerts/constants";
import { SELECTABLE_EVENT_TYPES } from "@/lib/alerts/events";

/**
 * Server actions for alert channels, routing rules, tests, and delivery
 * operations. Every action verifies `integrations:manage`, confirms the feature
 * is available for the org (platform admins bypass during private beta),
 * rate-limits by actor, validates with Zod, and audits. Secrets are returned to
 * the client exactly once (webhook signing) and never logged.
 */

async function requireAlertsAccess(organizationId: string) {
  const access = await requireOrganizationPermission(organizationId, "integrations:manage");
  const admin = await isPlatformAdmin();
  const enabled = await isFeatureEnabled("integrations", organizationId);
  if (!admin && !enabled) throw Forbidden("Alert channels are not available yet.");
  return access;
}

function limitOrThrow(profileId: string, bucket: string, perMinute: number) {
  if (!rateLimit(`alerts:${bucket}:${profileId}`, { limit: perMinute, windowMs: 60_000 })) {
    throw RateLimited();
  }
}

const nameSchema = z.string().trim().min(1).max(120);
const descSchema = z.string().trim().max(500).optional();

/* ------------------------------------------------------------------ */
/* Channel creation                                                    */
/* ------------------------------------------------------------------ */

const emailSchema = z.object({
  name: nameSchema,
  description: descSchema,
  recipients: z
    .array(
      z.object({
        email: z.string().trim().email().max(254),
        label: z.string().trim().max(80).optional(),
        isMember: z.boolean().default(false),
      }),
    )
    .min(1)
    .max(20),
});

export async function createEmailChannelAction(organizationId: string, input: unknown): Promise<ActionResult<{ channelId: string }>> {
  try {
    const access = await requireAlertsAccess(organizationId);
    limitOrThrow(access.profile.id, "create", 20);
    const data = emailSchema.parse(input);
    const { channelId } = await createEmailChannel({
      organizationId,
      actorProfileId: access.profile.id,
      name: data.name,
      description: data.description,
      recipients: data.recipients.map((r) => ({ email: r.email, label: r.label, isMember: r.isMember })),
    });
    await afterCreate(organizationId, access.profile.id, channelId, "email", data.name);
    return { ok: true, data: { channelId } };
  } catch (error) {
    return toActionError(error);
  }
}

const slackSchema = z.object({
  name: nameSchema,
  description: descSchema,
  webhookUrl: z.string().trim().url().max(2048),
  workspaceHint: z.string().trim().max(80).optional(),
  channelHint: z.string().trim().max(80).optional(),
});

export async function createSlackChannelAction(organizationId: string, input: unknown): Promise<ActionResult<{ channelId: string }>> {
  try {
    const access = await requireAlertsAccess(organizationId);
    limitOrThrow(access.profile.id, "create", 20);
    const data = slackSchema.parse(input);
    const { channelId } = await createSlackChannel({
      organizationId,
      actorProfileId: access.profile.id,
      name: data.name,
      description: data.description,
      webhookUrl: data.webhookUrl,
      workspaceHint: data.workspaceHint,
      channelHint: data.channelHint,
    });
    await afterCreate(organizationId, access.profile.id, channelId, "slack", data.name);
    return { ok: true, data: { channelId } };
  } catch (error) {
    return toActionError(error);
  }
}

const discordSchema = z.object({
  name: nameSchema,
  description: descSchema,
  webhookUrl: z.string().trim().url().max(2048),
  serverHint: z.string().trim().max(80).optional(),
});

export async function createDiscordChannelAction(organizationId: string, input: unknown): Promise<ActionResult<{ channelId: string }>> {
  try {
    const access = await requireAlertsAccess(organizationId);
    limitOrThrow(access.profile.id, "create", 20);
    const data = discordSchema.parse(input);
    const { channelId } = await createDiscordChannel({
      organizationId,
      actorProfileId: access.profile.id,
      name: data.name,
      description: data.description,
      webhookUrl: data.webhookUrl,
      serverHint: data.serverHint,
    });
    await afterCreate(organizationId, access.profile.id, channelId, "discord", data.name);
    return { ok: true, data: { channelId } };
  } catch (error) {
    return toActionError(error);
  }
}

const webhookSchema = z.object({
  name: nameSchema,
  description: descSchema,
  url: z.string().trim().url().max(2048),
  signingEnabled: z.boolean().default(true),
  customHeaders: z
    .array(z.object({ name: z.string().trim().min(1).max(64), value: z.string().max(1024), secret: z.boolean().default(false) }))
    .max(10)
    .default([]),
});

export async function createWebhookChannelAction(
  organizationId: string,
  input: unknown,
): Promise<ActionResult<{ channelId: string; signingSecret?: string; signingKeyId?: string }>> {
  try {
    const access = await requireAlertsAccess(organizationId);
    limitOrThrow(access.profile.id, "create", 20);
    const data = webhookSchema.parse(input);
    const result = await createWebhookChannel({
      organizationId,
      actorProfileId: access.profile.id,
      name: data.name,
      description: data.description,
      url: data.url,
      signingEnabled: data.signingEnabled,
      customHeaders: data.customHeaders,
    });
    await afterCreate(organizationId, access.profile.id, result.channelId, "webhook", data.name);
    return { ok: true, data: result };
  } catch (error) {
    return toActionError(error);
  }
}

async function afterCreate(organizationId: string, actorId: string, channelId: string, provider: string, name: string) {
  await recordAuditEvent({
    organizationId,
    actorUserId: actorId,
    action: "alert_channel.created",
    targetType: "alert_channel",
    targetId: channelId,
    summary: `Created ${provider} alert channel "${name}"`,
    metadata: { provider },
  });
  await trackGoal({ name: DataFastGoals.alertChannelCreated, metadata: { provider } }).catch(() => {});
  revalidatePath("/app/integrations");
}

/* ------------------------------------------------------------------ */
/* Channel lifecycle + testing                                         */
/* ------------------------------------------------------------------ */

export async function testChannelAction(organizationId: string, channelId: string): Promise<ActionResult<{ ok: boolean; summary: string; errorCategory: string | null }>> {
  try {
    const access = await requireAlertsAccess(organizationId);
    limitOrThrow(access.profile.id, "test", 15);
    const result = await sendChannelTest({ organizationId, channelId, actorProfileId: access.profile.id });
    await recordAuditEvent({
      organizationId,
      actorUserId: access.profile.id,
      action: "alert_channel.tested",
      targetType: "alert_channel",
      targetId: channelId,
      summary: result.ok ? "Channel test succeeded" : "Channel test failed",
      metadata: { result: result.ok ? "passed" : "failed", error_category: result.errorCategory ?? "none" },
    });
    await trackGoal({ name: result.ok ? DataFastGoals.alertChannelTestPassed : DataFastGoals.alertChannelTestFailed }).catch(() => {});
    revalidatePath(`/app/integrations/${channelId}`);
    revalidatePath("/app/integrations");
    return { ok: true, data: { ok: result.ok, summary: result.safeSummary, errorCategory: result.errorCategory } };
  } catch (error) {
    return toActionError(error);
  }
}

export async function activateChannelAction(organizationId: string, channelId: string): Promise<ActionResult> {
  try {
    const access = await requireAlertsAccess(organizationId);
    limitOrThrow(access.profile.id, "lifecycle", 40);
    await activateChannel(organizationId, channelId);
    await recordAuditEvent({ organizationId, actorUserId: access.profile.id, action: "alert_channel.activated", targetType: "alert_channel", targetId: channelId, summary: "Activated an alert channel" });
    await trackGoal({ name: DataFastGoals.alertChannelActivated }).catch(() => {});
    revalidatePath(`/app/integrations/${channelId}`);
    revalidatePath("/app/integrations");
    return { ok: true };
  } catch (error) {
    return toActionError(error);
  }
}

export async function pauseChannelAction(organizationId: string, channelId: string): Promise<ActionResult> {
  try {
    const access = await requireAlertsAccess(organizationId);
    limitOrThrow(access.profile.id, "lifecycle", 40);
    await pauseChannel(organizationId, channelId, "Paused by an operator.");
    await recordAuditEvent({ organizationId, actorUserId: access.profile.id, action: "alert_channel.paused", targetType: "alert_channel", targetId: channelId, summary: "Paused an alert channel" });
    await trackGoal({ name: DataFastGoals.alertChannelPaused }).catch(() => {});
    revalidatePath(`/app/integrations/${channelId}`);
    revalidatePath("/app/integrations");
    return { ok: true };
  } catch (error) {
    return toActionError(error);
  }
}

export async function resumeChannelAction(organizationId: string, channelId: string): Promise<ActionResult> {
  try {
    const access = await requireAlertsAccess(organizationId);
    limitOrThrow(access.profile.id, "lifecycle", 40);
    await resumeChannel(organizationId, channelId);
    await recordAuditEvent({ organizationId, actorUserId: access.profile.id, action: "alert_channel.resumed", targetType: "alert_channel", targetId: channelId, summary: "Resumed an alert channel" });
    await trackGoal({ name: DataFastGoals.alertChannelResumed }).catch(() => {});
    revalidatePath(`/app/integrations/${channelId}`);
    revalidatePath("/app/integrations");
    return { ok: true };
  } catch (error) {
    return toActionError(error);
  }
}

export async function deleteChannelAction(organizationId: string, channelId: string): Promise<ActionResult> {
  try {
    const access = await requireAlertsAccess(organizationId);
    limitOrThrow(access.profile.id, "lifecycle", 30);
    await softDeleteChannel(organizationId, channelId);
    await recordAuditEvent({ organizationId, actorUserId: access.profile.id, action: "alert_channel.deleted", targetType: "alert_channel", targetId: channelId, summary: "Deleted an alert channel" });
    await trackGoal({ name: DataFastGoals.alertChannelDeleted }).catch(() => {});
    revalidatePath("/app/integrations");
    return { ok: true };
  } catch (error) {
    return toActionError(error);
  }
}

export async function setDefaultChannelAction(organizationId: string, channelId: string): Promise<ActionResult> {
  try {
    const access = await requireAlertsAccess(organizationId);
    limitOrThrow(access.profile.id, "lifecycle", 40);
    await setDefaultChannel(organizationId, channelId);
    await recordAuditEvent({ organizationId, actorUserId: access.profile.id, action: "alert_channel.set_default", targetType: "alert_channel", targetId: channelId, summary: "Set the default alert channel" });
    revalidatePath("/app/integrations");
    return { ok: true };
  } catch (error) {
    return toActionError(error);
  }
}

const rotateSchema = z.object({ provider: z.enum(["slack", "discord", "webhook"]), value: z.string().trim().url().max(2048) });

export async function rotateChannelCredentialAction(organizationId: string, channelId: string, input: unknown): Promise<ActionResult> {
  try {
    const access = await requireAlertsAccess(organizationId);
    limitOrThrow(access.profile.id, "rotate", 20);
    const data = rotateSchema.parse(input);
    await rotateChannelCredential({ organizationId, channelId, actorProfileId: access.profile.id, provider: data.provider, value: data.value });
    await recordAuditEvent({ organizationId, actorUserId: access.profile.id, action: "alert_channel.credential_rotated", targetType: "alert_channel", targetId: channelId, summary: "Rotated a channel credential" });
    await trackGoal({ name: DataFastGoals.alertChannelCredentialRotated }).catch(() => {});
    revalidatePath(`/app/integrations/${channelId}`);
    return { ok: true };
  } catch (error) {
    return toActionError(error);
  }
}

export async function rotateSigningKeyAction(organizationId: string, channelId: string): Promise<ActionResult<{ keyId: string; secret: string }>> {
  try {
    const access = await requireAlertsAccess(organizationId);
    limitOrThrow(access.profile.id, "rotate", 20);
    const key = await rotateSigningKey({ organizationId, channelId, actorProfileId: access.profile.id });
    await recordAuditEvent({ organizationId, actorUserId: access.profile.id, action: "alert_channel.signing_key_rotated", targetType: "alert_channel", targetId: channelId, summary: "Rotated a webhook signing key" });
    await trackGoal({ name: DataFastGoals.alertSigningKeyRotated }).catch(() => {});
    revalidatePath(`/app/integrations/${channelId}`);
    return { ok: true, data: key };
  } catch (error) {
    return toActionError(error);
  }
}

/* ------------------------------------------------------------------ */
/* Routing rules                                                       */
/* ------------------------------------------------------------------ */

const ruleSchema = z.object({
  name: nameSchema,
  scopeKind: z.enum(SCOPE_KINDS),
  recoveryBehavior: z.enum(RECOVERY_BEHAVIORS),
  deduplicate: z.boolean().default(true),
  quietBehavior: z.enum(QUIET_BEHAVIORS),
  eventTypes: z.array(z.enum(SELECTABLE_EVENT_TYPES as unknown as [string, ...string[]])).max(30).default([]),
  severities: z.array(z.enum(ALERT_SEVERITIES)).max(5).default([]),
  monitorIds: z.array(z.string().uuid()).max(200).default([]),
  groupIds: z.array(z.string().uuid()).max(100).default([]),
  tagIds: z.array(z.string().uuid()).max(100).default([]),
  channels: z
    .array(z.object({ channelId: z.string().uuid(), role: z.enum(["primary", "recovery_only", "fallback"]).default("primary"), fallbackOrder: z.number().int().min(0).max(100).optional() }))
    .min(1)
    .max(20),
});

export async function createRuleAction(organizationId: string, input: unknown): Promise<ActionResult<{ ruleId: string }>> {
  try {
    const access = await requireAlertsAccess(organizationId);
    limitOrThrow(access.profile.id, "rule", 30);
    const data = ruleSchema.parse(input) as RuleInput;
    const ruleId = await createRule({ organizationId, actorProfileId: access.profile.id, input: data });
    await recordAuditEvent({ organizationId, actorUserId: access.profile.id, action: "alert_rule.created", targetType: "alert_rule", targetId: ruleId, summary: `Created routing rule "${data.name}"`, metadata: { scope: data.scopeKind, channels: String(data.channels.length) } });
    await trackGoal({ name: DataFastGoals.alertRuleCreated, metadata: { scope: data.scopeKind } }).catch(() => {});
    revalidatePath("/app/integrations/rules");
    return { ok: true, data: { ruleId } };
  } catch (error) {
    return toActionError(error);
  }
}

export async function updateRuleAction(organizationId: string, ruleId: string, input: unknown): Promise<ActionResult> {
  try {
    const access = await requireAlertsAccess(organizationId);
    limitOrThrow(access.profile.id, "rule", 40);
    const data = ruleSchema.parse(input) as RuleInput;
    await updateRule({ organizationId, ruleId, actorProfileId: access.profile.id, input: data });
    await recordAuditEvent({ organizationId, actorUserId: access.profile.id, action: "alert_rule.updated", targetType: "alert_rule", targetId: ruleId, summary: `Updated routing rule "${data.name}"` });
    await trackGoal({ name: DataFastGoals.alertRuleUpdated }).catch(() => {});
    revalidatePath("/app/integrations/rules");
    revalidatePath(`/app/integrations/rules/${ruleId}`);
    return { ok: true };
  } catch (error) {
    return toActionError(error);
  }
}

export async function toggleRuleAction(organizationId: string, ruleId: string, status: "active" | "disabled"): Promise<ActionResult> {
  try {
    const access = await requireAlertsAccess(organizationId);
    limitOrThrow(access.profile.id, "rule", 40);
    await setRuleStatus(organizationId, ruleId, status);
    await recordAuditEvent({ organizationId, actorUserId: access.profile.id, action: "alert_rule.toggled", targetType: "alert_rule", targetId: ruleId, summary: `Set routing rule ${status}` });
    await trackGoal({ name: DataFastGoals.alertRuleToggled, metadata: { status } }).catch(() => {});
    revalidatePath("/app/integrations/rules");
    return { ok: true };
  } catch (error) {
    return toActionError(error);
  }
}

export async function deleteRuleAction(organizationId: string, ruleId: string): Promise<ActionResult> {
  try {
    const access = await requireAlertsAccess(organizationId);
    limitOrThrow(access.profile.id, "rule", 30);
    await deleteRule(organizationId, ruleId);
    await recordAuditEvent({ organizationId, actorUserId: access.profile.id, action: "alert_rule.deleted", targetType: "alert_rule", targetId: ruleId, summary: "Deleted a routing rule" });
    await trackGoal({ name: DataFastGoals.alertRuleDeleted }).catch(() => {});
    revalidatePath("/app/integrations/rules");
    return { ok: true };
  } catch (error) {
    return toActionError(error);
  }
}

export async function createRecommendedRuleAction(organizationId: string, channelId: string): Promise<ActionResult<{ ruleId: string }>> {
  try {
    const access = await requireAlertsAccess(organizationId);
    limitOrThrow(access.profile.id, "rule", 20);
    const ruleId = await createRecommendedRule({ organizationId, actorProfileId: access.profile.id, channelId });
    await recordAuditEvent({ organizationId, actorUserId: access.profile.id, action: "alert_rule.created", targetType: "alert_rule", targetId: ruleId, summary: "Created the recommended default rule", metadata: { recommended: "true" } });
    await trackGoal({ name: DataFastGoals.alertRuleCreated, metadata: { recommended: "true" } }).catch(() => {});
    revalidatePath("/app/integrations/rules");
    return { ok: true, data: { ruleId } };
  } catch (error) {
    return toActionError(error);
  }
}

/* ------------------------------------------------------------------ */
/* Delivery operations                                                 */
/* ------------------------------------------------------------------ */

export async function retryDeadLetterAction(organizationId: string, deadLetterId: string): Promise<ActionResult> {
  try {
    const access = await requireAlertsAccess(organizationId);
    limitOrThrow(access.profile.id, "deadletter", 40);
    await retryDeadLetter({ organizationId, deadLetterId, actorProfileId: access.profile.id });
    await recordAuditEvent({ organizationId, actorUserId: access.profile.id, action: "alert_delivery.dead_letter_retried", targetType: "alert_dead_letter", targetId: deadLetterId, summary: "Retried a failed delivery" });
    await trackGoal({ name: DataFastGoals.alertDeadLetterRetried }).catch(() => {});
    revalidatePath("/app/integrations/deliveries");
    return { ok: true };
  } catch (error) {
    return toActionError(error);
  }
}

export async function dismissDeadLetterAction(organizationId: string, deadLetterId: string): Promise<ActionResult> {
  try {
    const access = await requireAlertsAccess(organizationId);
    limitOrThrow(access.profile.id, "deadletter", 40);
    await dismissDeadLetter({ organizationId, deadLetterId, actorProfileId: access.profile.id });
    await recordAuditEvent({ organizationId, actorUserId: access.profile.id, action: "alert_delivery.dead_letter_dismissed", targetType: "alert_dead_letter", targetId: deadLetterId, summary: "Dismissed a failed delivery" });
    await trackGoal({ name: DataFastGoals.alertDeadLetterDismissed }).catch(() => {});
    revalidatePath("/app/integrations/deliveries");
    return { ok: true };
  } catch (error) {
    return toActionError(error);
  }
}

export async function exportDeliveriesAction(organizationId: string): Promise<ActionResult<{ csv: string }>> {
  try {
    const access = await requireAlertsAccess(organizationId);
    limitOrThrow(access.profile.id, "export", 10);
    const csv = await exportDeliveriesCsv(organizationId, {});
    await recordAuditEvent({ organizationId, actorUserId: access.profile.id, action: "alert_delivery.exported", targetType: "organization", targetId: organizationId, summary: "Exported the alert delivery log" });
    await trackGoal({ name: DataFastGoals.alertDeliveryExported }).catch(() => {});
    return { ok: true, data: { csv } };
  } catch (error) {
    return toActionError(error);
  }
}
