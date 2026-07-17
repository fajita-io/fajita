"use server";

import { revalidatePath } from "next/cache";

import { DataFastGoals } from "@/lib/analytics/goals";
import { trackGoal } from "@/lib/analytics/server";
import { recordAuditEvent } from "@/lib/app/audit";
import {
  type ActionResult,
  toActionError,
} from "@/lib/app/actions/shared";
import { isFeatureEnabled } from "@/lib/app/feature-flags.server";
import {
  isPlatformAdmin,
  requireOrganizationPermission,
} from "@/lib/auth/context";
import { Forbidden, RateLimited } from "@/lib/auth/errors";
import { rateLimit } from "@/lib/site/rate-limit";
import { monitorConfigSchema } from "@/lib/monitoring/config";
import {
  activateMonitor,
  archiveMonitor,
  createDraftMonitor,
  duplicateMonitor,
  pauseMonitor,
  requestManualCheck,
  restoreMonitor,
  resumeMonitor,
  softDeleteMonitor,
  updateMonitor,
} from "@/lib/monitoring/monitors";
import { moveMonitorToGroup } from "@/lib/monitoring/groups";
import { assignTag, unassignTag } from "@/lib/monitoring/tags";
import {
  countActiveMonitors,
  resolveEntitlements,
} from "@/lib/monitoring/entitlements.server";
import {
  addSecret,
  deleteSecret,
  rotateSecret,
} from "@/lib/monitoring/secrets";
import {
  createHeartbeatToken,
  revokeHeartbeatToken,
  rotateHeartbeatToken,
} from "@/lib/monitoring/heartbeat";
import { testMonitorConfig } from "@/lib/monitoring/test-run";
import { z } from "zod";
import type { SecretType } from "@contracts/contract";

/**
 * Server actions for the monitoring engine. These are internal foundation APIs,
 * not a public API. Every action:
 *   1. verifies the `monitors:manage` permission for the organization,
 *   2. confirms the feature is available to the caller (platform admins during
 *      development; feature-enabled orgs later),
 *   3. rate-limits by actor,
 *   4. records an audit event and (where useful) an analytics goal.
 *
 * Result status, schedule lock fields, and worker-owned columns are never
 * writable through these actions. Secrets are never returned in full.
 */

/**
 * Gate access: caller must hold monitors:manage AND either be a platform admin
 * or belong to an org where the monitors feature is enabled. Returns the
 * verified org access bundle.
 */
async function requireMonitorAccess(organizationId: string) {
  const access = await requireOrganizationPermission(
    organizationId,
    "monitors:manage",
  );
  const admin = await isPlatformAdmin();
  const enabled = await isFeatureEnabled("monitors", organizationId);
  if (!admin && !enabled) {
    throw Forbidden("Monitoring is not available for this organization yet.");
  }
  return access;
}

function limitOrThrow(profileId: string, bucket: string, perMinute: number) {
  if (
    !rateLimit(`monitors:${bucket}:${profileId}`, {
      limit: perMinute,
      windowMs: 60_000,
    })
  ) {
    throw RateLimited();
  }
}

export async function createMonitorAction(
  organizationId: string,
  input: unknown,
): Promise<ActionResult<{ monitorId: string }>> {
  try {
    const access = await requireMonitorAccess(organizationId);
    limitOrThrow(access.profile.id, "create", 20);
    const config = monitorConfigSchema.parse(input);

    const ent = await resolveEntitlements(organizationId);
    if (config.monitor_type === "heartbeat" && !ent.heartbeatEnabled) {
      throw Forbidden("Heartbeat monitors are not available on this plan.");
    }
    if (config.check_interval_seconds < ent.minimumCheckIntervalSeconds) {
      throw Forbidden("This check interval is faster than your plan allows.");
    }
    if (config.assertions.length > ent.maxAssertionsPerMonitor) {
      throw Forbidden("This monitor has more assertions than your plan allows.");
    }
    const activeCount = await countActiveMonitors(organizationId);
    if (activeCount >= ent.maxMonitors) {
      throw Forbidden("You have reached your monitor limit.");
    }

    const { monitorId } = await createDraftMonitor({
      organizationId,
      actorProfileId: access.profile.id,
      config,
    });

    await recordAuditEvent({
      organizationId,
      actorUserId: access.profile.id,
      action: "monitor.created",
      targetType: "monitor",
      targetId: monitorId,
      summary: `Created monitor "${config.name}"`,
      metadata: { monitor_type: config.monitor_type },
    });
    await trackGoal({
      name: DataFastGoals.monitorCreated,
      metadata: { type: config.monitor_type },
    }).catch(() => {});

    revalidatePath("/internal/monitor-engine-lab");
    return { ok: true, data: { monitorId } };
  } catch (error) {
    return toActionError(error);
  }
}

export async function updateMonitorAction(
  organizationId: string,
  monitorId: string,
  input: unknown,
  changeSummary?: string,
): Promise<ActionResult<{ versionNumber: number }>> {
  try {
    const access = await requireMonitorAccess(organizationId);
    limitOrThrow(access.profile.id, "update", 40);
    const config = monitorConfigSchema.parse(input);

    const { versionNumber } = await updateMonitor({
      organizationId,
      actorProfileId: access.profile.id,
      monitorId,
      config,
      changeSummary,
    });

    await recordAuditEvent({
      organizationId,
      actorUserId: access.profile.id,
      action: "monitor.version_created",
      targetType: "monitor",
      targetId: monitorId,
      summary: `Saved version ${versionNumber}`,
      metadata: { version_number: versionNumber },
    });

    revalidatePath("/internal/monitor-engine-lab");
    return { ok: true, data: { versionNumber } };
  } catch (error) {
    return toActionError(error);
  }
}

export async function testMonitorConfigAction(
  organizationId: string,
  input: unknown,
  monitorId?: string,
): Promise<ActionResult<{ outcome: string; message: string }>> {
  try {
    const access = await requireMonitorAccess(organizationId);
    limitOrThrow(access.profile.id, "test", 15);
    const config = monitorConfigSchema.parse(input);

    const result = await testMonitorConfig({
      organizationId,
      monitorId: monitorId ?? null,
      config,
    });

    await recordAuditEvent({
      organizationId,
      actorUserId: access.profile.id,
      action: "monitor.tested",
      targetType: "monitor",
      targetId: monitorId ?? undefined,
      summary: `Tested configuration: ${result.outcome}`,
      metadata: { outcome: result.outcome },
    });
    await trackGoal({
      name: DataFastGoals.monitorTested,
      metadata: { outcome: result.outcome },
    }).catch(() => {});

    return { ok: true, data: { outcome: result.outcome, message: result.message } };
  } catch (error) {
    return toActionError(error);
  }
}

export async function activateMonitorAction(
  organizationId: string,
  monitorId: string,
): Promise<ActionResult> {
  try {
    const access = await requireMonitorAccess(organizationId);
    limitOrThrow(access.profile.id, "activate", 30);

    await activateMonitor({
      organizationId,
      actorProfileId: access.profile.id,
      monitorId,
    });

    await recordAuditEvent({
      organizationId,
      actorUserId: access.profile.id,
      action: "monitor.activated",
      targetType: "monitor",
      targetId: monitorId,
      summary: "Activated monitor",
    });
    await trackGoal({ name: DataFastGoals.monitorActivated }).catch(() => {});

    revalidatePath("/internal/monitor-engine-lab");
    return { ok: true };
  } catch (error) {
    return toActionError(error);
  }
}

export async function pauseMonitorAction(
  organizationId: string,
  monitorId: string,
): Promise<ActionResult> {
  try {
    const access = await requireMonitorAccess(organizationId);
    limitOrThrow(access.profile.id, "pause", 30);
    await pauseMonitor({
      organizationId,
      actorProfileId: access.profile.id,
      monitorId,
    });
    await recordAuditEvent({
      organizationId,
      actorUserId: access.profile.id,
      action: "monitor.paused",
      targetType: "monitor",
      targetId: monitorId,
      summary: "Paused monitor",
    });
    revalidatePath("/internal/monitor-engine-lab");
    return { ok: true };
  } catch (error) {
    return toActionError(error);
  }
}

export async function resumeMonitorAction(
  organizationId: string,
  monitorId: string,
): Promise<ActionResult> {
  try {
    const access = await requireMonitorAccess(organizationId);
    limitOrThrow(access.profile.id, "resume", 30);
    await resumeMonitor({
      organizationId,
      actorProfileId: access.profile.id,
      monitorId,
    });
    await recordAuditEvent({
      organizationId,
      actorUserId: access.profile.id,
      action: "monitor.resumed",
      targetType: "monitor",
      targetId: monitorId,
      summary: "Resumed monitor",
    });
    revalidatePath("/internal/monitor-engine-lab");
    return { ok: true };
  } catch (error) {
    return toActionError(error);
  }
}

export async function deleteMonitorAction(
  organizationId: string,
  monitorId: string,
): Promise<ActionResult> {
  try {
    const access = await requireMonitorAccess(organizationId);
    limitOrThrow(access.profile.id, "delete", 20);
    await softDeleteMonitor({
      organizationId,
      actorProfileId: access.profile.id,
      monitorId,
    });
    await recordAuditEvent({
      organizationId,
      actorUserId: access.profile.id,
      action: "monitor.deleted",
      targetType: "monitor",
      targetId: monitorId,
      summary: "Deleted monitor",
    });
    revalidatePath("/internal/monitor-engine-lab");
    return { ok: true };
  } catch (error) {
    return toActionError(error);
  }
}

const secretSchema = z.object({
  secretType: z.enum([
    "authorization_header",
    "api_key",
    "bearer_token",
    "basic_auth",
    "custom_header",
  ]),
  headerName: z.string().trim().max(128).optional(),
  value: z.string().min(1).max(4096),
});

export async function addSecretAction(
  organizationId: string,
  monitorId: string,
  input: unknown,
): Promise<ActionResult<{ id: string; maskedLabel: string }>> {
  try {
    const access = await requireMonitorAccess(organizationId);
    limitOrThrow(access.profile.id, "secret", 20);
    const parsed = secretSchema.parse(input);

    const result = await addSecret({
      organizationId,
      monitorId,
      actorProfileId: access.profile.id,
      secretType: parsed.secretType as SecretType,
      headerName: parsed.headerName ?? null,
      value: parsed.value,
    });

    await recordAuditEvent({
      organizationId,
      actorUserId: access.profile.id,
      action: "monitor.secret_added",
      targetType: "monitor",
      targetId: monitorId,
      summary: "Added a monitor secret",
      metadata: { secret_type: parsed.secretType },
    });
    return { ok: true, data: result };
  } catch (error) {
    return toActionError(error);
  }
}

export async function rotateSecretAction(
  organizationId: string,
  secretId: string,
  value: string,
): Promise<ActionResult<{ maskedLabel: string }>> {
  try {
    const access = await requireMonitorAccess(organizationId);
    limitOrThrow(access.profile.id, "secret-rotate", 10);
    const parsed = z.string().min(1).max(4096).parse(value);
    const result = await rotateSecret({
      organizationId,
      secretId,
      value: parsed,
    });
    await recordAuditEvent({
      organizationId,
      actorUserId: access.profile.id,
      action: "monitor.secret_rotated",
      targetType: "monitor_secret",
      targetId: secretId,
      summary: "Rotated a monitor secret",
    });
    return { ok: true, data: result };
  } catch (error) {
    return toActionError(error);
  }
}

export async function deleteSecretAction(
  organizationId: string,
  secretId: string,
): Promise<ActionResult> {
  try {
    const access = await requireMonitorAccess(organizationId);
    limitOrThrow(access.profile.id, "secret-delete", 20);
    await deleteSecret({ organizationId, secretId });
    return { ok: true };
  } catch (error) {
    return toActionError(error);
  }
}

const heartbeatTokenSchema = z.object({
  expectedIntervalSeconds: z.number().int().min(60).max(2592000),
  gracePeriodSeconds: z.number().int().min(0).max(86400).default(60),
});

export async function createHeartbeatTokenAction(
  organizationId: string,
  monitorId: string,
  input: unknown,
): Promise<ActionResult<{ rawToken: string; maskedLabel: string }>> {
  try {
    const access = await requireMonitorAccess(organizationId);
    limitOrThrow(access.profile.id, "hb-create", 15);
    const parsed = heartbeatTokenSchema.parse(input);

    const result = await createHeartbeatToken({
      organizationId,
      monitorId,
      actorProfileId: access.profile.id,
      expectedIntervalSeconds: parsed.expectedIntervalSeconds,
      gracePeriodSeconds: parsed.gracePeriodSeconds,
    });

    await recordAuditEvent({
      organizationId,
      actorUserId: access.profile.id,
      action: "monitor.heartbeat_token_created",
      targetType: "monitor",
      targetId: monitorId,
      summary: "Created a heartbeat token",
    });
    return {
      ok: true,
      data: { rawToken: result.rawToken, maskedLabel: result.maskedLabel },
    };
  } catch (error) {
    return toActionError(error);
  }
}

export async function rotateHeartbeatTokenAction(
  organizationId: string,
  tokenId: string,
): Promise<ActionResult<{ rawToken: string; maskedLabel: string }>> {
  try {
    const access = await requireMonitorAccess(organizationId);
    limitOrThrow(access.profile.id, "hb-rotate", 10);
    const result = await rotateHeartbeatToken({ organizationId, tokenId });
    await recordAuditEvent({
      organizationId,
      actorUserId: access.profile.id,
      action: "monitor.heartbeat_token_rotated",
      targetType: "heartbeat_token",
      targetId: tokenId,
      summary: "Rotated a heartbeat token",
    });
    return { ok: true, data: result };
  } catch (error) {
    return toActionError(error);
  }
}

export async function revokeHeartbeatTokenAction(
  organizationId: string,
  tokenId: string,
): Promise<ActionResult> {
  try {
    const access = await requireMonitorAccess(organizationId);
    limitOrThrow(access.profile.id, "hb-revoke", 15);
    await revokeHeartbeatToken({ organizationId, tokenId });
    await recordAuditEvent({
      organizationId,
      actorUserId: access.profile.id,
      action: "monitor.heartbeat_token_revoked",
      targetType: "heartbeat_token",
      targetId: tokenId,
      summary: "Revoked a heartbeat token",
    });
    return { ok: true };
  } catch (error) {
    return toActionError(error);
  }
}

export async function archiveMonitorAction(
  organizationId: string,
  monitorId: string,
): Promise<ActionResult> {
  try {
    const access = await requireMonitorAccess(organizationId);
    limitOrThrow(access.profile.id, "archive", 30);
    await archiveMonitor({
      organizationId,
      actorProfileId: access.profile.id,
      monitorId,
    });
    await recordAuditEvent({
      organizationId,
      actorUserId: access.profile.id,
      action: "monitor.archived",
      targetType: "monitor",
      targetId: monitorId,
      summary: "Archived monitor",
    });
    await trackGoal({ name: DataFastGoals.monitorArchived }).catch(() => {});
    revalidatePath("/app/monitors");
    return { ok: true };
  } catch (error) {
    return toActionError(error);
  }
}

export async function restoreMonitorAction(
  organizationId: string,
  monitorId: string,
): Promise<ActionResult> {
  try {
    const access = await requireMonitorAccess(organizationId);
    limitOrThrow(access.profile.id, "restore", 30);
    await restoreMonitor({
      organizationId,
      actorProfileId: access.profile.id,
      monitorId,
    });
    await recordAuditEvent({
      organizationId,
      actorUserId: access.profile.id,
      action: "monitor.restored",
      targetType: "monitor",
      targetId: monitorId,
      summary: "Restored monitor from archive",
    });
    revalidatePath("/app/monitors");
    return { ok: true };
  } catch (error) {
    return toActionError(error);
  }
}

export async function duplicateMonitorAction(
  organizationId: string,
  monitorId: string,
): Promise<ActionResult<{ monitorId: string }>> {
  try {
    const access = await requireMonitorAccess(organizationId);
    limitOrThrow(access.profile.id, "duplicate", 20);

    const ent = await resolveEntitlements(organizationId);
    const activeCount = await countActiveMonitors(organizationId);
    if (activeCount >= ent.maxMonitors) {
      throw Forbidden("You have reached your monitor limit.");
    }

    const { monitorId: newId } = await duplicateMonitor({
      organizationId,
      actorProfileId: access.profile.id,
      monitorId,
    });
    await recordAuditEvent({
      organizationId,
      actorUserId: access.profile.id,
      action: "monitor.duplicated",
      targetType: "monitor",
      targetId: newId,
      summary: "Duplicated a monitor",
      metadata: { source_monitor_id: monitorId },
    });
    await trackGoal({ name: DataFastGoals.monitorDuplicated }).catch(() => {});
    revalidatePath("/app/monitors");
    return { ok: true, data: { monitorId: newId } };
  } catch (error) {
    return toActionError(error);
  }
}

export async function runManualCheckAction(
  organizationId: string,
  monitorId: string,
): Promise<ActionResult<{ queued: boolean; reason?: string }>> {
  try {
    const access = await requireMonitorAccess(organizationId);
    // Tight limit: manual checks must never become a denial-of-service vector.
    limitOrThrow(access.profile.id, "manual-check", 10);
    const result = await requestManualCheck({ organizationId, monitorId });
    if (result.queued) {
      await recordAuditEvent({
        organizationId,
        actorUserId: access.profile.id,
        action: "monitor.manual_check_requested",
        targetType: "monitor",
        targetId: monitorId,
        summary: "Requested a manual check",
      });
      await trackGoal({ name: DataFastGoals.monitorManualCheck }).catch(() => {});
    }
    revalidatePath(`/app/monitors/${monitorId}`);
    return { ok: true, data: result };
  } catch (error) {
    return toActionError(error);
  }
}

export async function moveMonitorToGroupAction(
  organizationId: string,
  monitorId: string,
  groupId: string | null,
): Promise<ActionResult> {
  try {
    const access = await requireMonitorAccess(organizationId);
    limitOrThrow(access.profile.id, "group-move", 60);
    await moveMonitorToGroup({ organizationId, monitorId, groupId });
    await recordAuditEvent({
      organizationId,
      actorUserId: access.profile.id,
      action: "monitor.group_changed",
      targetType: "monitor",
      targetId: monitorId,
      summary: groupId ? "Moved monitor to a group" : "Removed monitor from its group",
    });
    revalidatePath("/app/monitors");
    return { ok: true };
  } catch (error) {
    return toActionError(error);
  }
}

const BULK_ACTIONS = ["pause", "resume", "archive", "add_tag", "remove_tag", "move_group"] as const;
type BulkAction = (typeof BULK_ACTIONS)[number];

const bulkSchema = z.object({
  action: z.enum(BULK_ACTIONS),
  monitorIds: z.array(z.string().uuid()).min(1).max(100),
  tagId: z.string().uuid().optional(),
  groupId: z.string().uuid().nullable().optional(),
});

/**
 * Bounded, server-side bulk action. Processes a limited set sequentially with a
 * per-item try so one failure does not abort the batch, and reports how many
 * succeeded. Never runs hundreds of synchronous mutations from the browser.
 */
export async function bulkMonitorAction(
  organizationId: string,
  input: unknown,
): Promise<ActionResult<{ succeeded: number; failed: number }>> {
  try {
    const access = await requireMonitorAccess(organizationId);
    limitOrThrow(access.profile.id, "bulk", 6);
    const parsed = bulkSchema.parse(input);
    const actor = access.profile.id;

    let succeeded = 0;
    let failed = 0;
    for (const id of parsed.monitorIds) {
      try {
        await applyBulk(parsed.action, organizationId, actor, id, parsed);
        succeeded += 1;
      } catch {
        failed += 1;
      }
    }

    await recordAuditEvent({
      organizationId,
      actorUserId: actor,
      action: "monitor.bulk_action",
      targetType: "monitor",
      summary: `Bulk ${parsed.action}: ${succeeded} succeeded, ${failed} failed`,
      metadata: { action: parsed.action, succeeded, failed },
    });
    revalidatePath("/app/monitors");
    return { ok: true, data: { succeeded, failed } };
  } catch (error) {
    return toActionError(error);
  }
}

async function applyBulk(
  action: BulkAction,
  organizationId: string,
  actor: string,
  monitorId: string,
  parsed: z.infer<typeof bulkSchema>,
): Promise<void> {
  switch (action) {
    case "pause":
      await pauseMonitor({ organizationId, actorProfileId: actor, monitorId });
      return;
    case "resume":
      await resumeMonitor({ organizationId, actorProfileId: actor, monitorId });
      return;
    case "archive":
      await archiveMonitor({ organizationId, actorProfileId: actor, monitorId });
      return;
    case "add_tag":
      if (!parsed.tagId) throw new Error("tagId required");
      await assignTag({ organizationId, monitorId, tagId: parsed.tagId });
      return;
    case "remove_tag":
      if (!parsed.tagId) throw new Error("tagId required");
      await unassignTag({ organizationId, monitorId, tagId: parsed.tagId });
      return;
    case "move_group":
      await moveMonitorToGroup({ organizationId, monitorId, groupId: parsed.groupId ?? null });
      return;
  }
}
