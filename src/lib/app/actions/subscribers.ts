"use server";

import { revalidatePath } from "next/cache";
import { z } from "zod";

import { recordAuditEvent } from "@/lib/app/audit";
import { type ActionResult, toActionError } from "@/lib/app/actions/shared";
import { isFeatureEnabled } from "@/lib/app/feature-flags.server";
import {
  isPlatformAdmin,
  requireOrganizationPermission,
  type OrgAccess,
} from "@/lib/auth/context";
import { Forbidden } from "@/lib/auth/errors";
import { serviceClient } from "@/lib/supabase/service";
import type { Permission } from "@/lib/auth/roles";

/**
 * Server actions for subscriber administration. Every action verifies a
 * subscriber permission, confirms the statusSubscribers feature (or platform
 * admin during private beta), scopes to the caller's organization and the
 * status page, and audits. Operator actions never create consent, never
 * override complaint/hard-bounce suppression, and never re-enable email that a
 * subscriber turned off.
 */

async function requirePermission(
  organizationId: string,
  permission: Permission,
): Promise<OrgAccess> {
  const access = await requireOrganizationPermission(organizationId, permission);
  const admin = await isPlatformAdmin();
  const enabled = await isFeatureEnabled("statusSubscribers", organizationId);
  if (!enabled && !admin) throw Forbidden();
  return access;
}

/** Confirm the status page belongs to the org (tenant isolation). */
async function assertPageInOrg(organizationId: string, statusPageId: string): Promise<void> {
  const db = serviceClient();
  const { data } = await db
    .from("status_pages")
    .select("id")
    .eq("id", statusPageId)
    .eq("organization_id", organizationId)
    .is("deleted_at", null)
    .maybeSingle();
  if (!data) throw Forbidden();
}

/** Confirm a subscriber belongs to the org + page before any mutation. */
async function loadScopedSubscriber(
  organizationId: string,
  statusPageId: string,
  subscriberId: string,
): Promise<{ id: string; status: string }> {
  const db = serviceClient();
  const { data } = await db
    .from("status_page_subscribers")
    .select("id, status")
    .eq("id", subscriberId)
    .eq("organization_id", organizationId)
    .eq("status_page_id", statusPageId)
    .is("deleted_at", null)
    .maybeSingle();
  if (!data) throw Forbidden();
  return { id: data.id, status: data.status };
}

const settingsSchema = z.object({
  subscriptionsEnabled: z.boolean(),
  incidentOpened: z.boolean(),
  incidentUpdates: z.boolean(),
  incidentResolved: z.boolean(),
  incidentReopened: z.boolean(),
  maintenanceScheduled: z.boolean(),
  maintenanceStarted: z.boolean(),
  maintenanceUpdated: z.boolean(),
  maintenanceCompleted: z.boolean(),
  maintenanceCanceled: z.boolean(),
  componentSelectionEnabled: z.boolean(),
  allComponentsDefault: z.boolean(),
  confirmationCooldownSeconds: z.number().int().min(30).max(3600),
  privacyUrl: z.string().url().max(500).or(z.literal("")).optional(),
});

export async function updateSubscriberSettings(
  organizationId: string,
  statusPageId: string,
  input: z.infer<typeof settingsSchema>,
): Promise<ActionResult> {
  try {
    const access = await requirePermission(organizationId, "subscribers:settings_manage");
    await assertPageInOrg(organizationId, statusPageId);
    const parsed = settingsSchema.parse(input);
    const db = serviceClient();

    // Detect whether the form is being turned on/off for a precise audit line.
    const { data: prev } = await db
      .from("status_pages")
      .select("subscriptions_enabled")
      .eq("id", statusPageId)
      .maybeSingle();

    await db
      .from("status_pages")
      .update({
        subscriptions_enabled: parsed.subscriptionsEnabled,
        subscriber_incident_opened_enabled: parsed.incidentOpened,
        subscriber_incident_updates_enabled: parsed.incidentUpdates,
        subscriber_incident_resolved_enabled: parsed.incidentResolved,
        subscriber_incident_reopened_enabled: parsed.incidentReopened,
        subscriber_maintenance_scheduled_enabled: parsed.maintenanceScheduled,
        subscriber_maintenance_started_enabled: parsed.maintenanceStarted,
        subscriber_maintenance_updated_enabled: parsed.maintenanceUpdated,
        subscriber_maintenance_completed_enabled: parsed.maintenanceCompleted,
        subscriber_maintenance_canceled_enabled: parsed.maintenanceCanceled,
        subscriber_component_selection_enabled: parsed.componentSelectionEnabled,
        subscriber_all_components_default: parsed.allComponentsDefault,
        subscriber_confirmation_cooldown_seconds: parsed.confirmationCooldownSeconds,
        subscriber_privacy_url: parsed.privacyUrl ? parsed.privacyUrl : null,
      } as never)
      .eq("id", statusPageId)
      .eq("organization_id", organizationId);

    const toggled =
      prev && prev.subscriptions_enabled !== parsed.subscriptionsEnabled;
    await recordAuditEvent({
      organizationId,
      actorUserId: access.profile.id,
      action: toggled
        ? parsed.subscriptionsEnabled
          ? "subscriber.form_enabled"
          : "subscriber.form_disabled"
        : "subscriber.settings_changed",
      targetType: "status_page",
      targetId: statusPageId,
    });

    revalidatePath(`/app/status-pages/${statusPageId}/subscribers`);
    return { ok: true };
  } catch (error) {
    return toActionError(error);
  }
}

export async function operatorUnsubscribe(
  organizationId: string,
  statusPageId: string,
  subscriberId: string,
): Promise<ActionResult> {
  try {
    const access = await requirePermission(organizationId, "subscribers:manage");
    const sub = await loadScopedSubscriber(organizationId, statusPageId, subscriberId);
    // Never override complaint/bounce/suppression; those are terminal.
    if (["complained", "bounced", "suppressed", "deleted", "pending_deletion"].includes(sub.status)) {
      return { ok: false, error: "This subscriber is already off the list." };
    }
    const db = serviceClient();
    await db
      .from("status_page_subscribers")
      .update({ status: "unsubscribed", unsubscribed_at: new Date().toISOString() })
      .eq("id", subscriberId);
    await db.rpc("cancel_pending_subscriber_intents", { p_subscriber_id: subscriberId });
    await recordAuditEvent({
      organizationId,
      actorUserId: access.profile.id,
      action: "subscriber.unsubscribed_by_operator",
      targetType: "subscriber",
      targetId: subscriberId,
    });
    revalidatePath(`/app/status-pages/${statusPageId}/subscribers`);
    return { ok: true };
  } catch (error) {
    return toActionError(error);
  }
}

export async function operatorSuppress(
  organizationId: string,
  statusPageId: string,
  subscriberId: string,
): Promise<ActionResult> {
  try {
    const access = await requirePermission(organizationId, "subscribers:suppress");
    await loadScopedSubscriber(organizationId, statusPageId, subscriberId);
    const db = serviceClient();
    // Administrative suppression is reversible by an authorized operator; the
    // RPC also cancels pending deliveries.
    await db.rpc("suppress_subscriber", {
      p_subscriber_id: subscriberId,
      p_reason: "administrative",
      p_reversible: true,
      p_actor_profile_id: access.profile.id,
    } as never);
    await recordAuditEvent({
      organizationId,
      actorUserId: access.profile.id,
      action: "subscriber.suppressed",
      targetType: "subscriber",
      targetId: subscriberId,
      metadata: { reason: "administrative" },
    });
    revalidatePath(`/app/status-pages/${statusPageId}/subscribers`);
    return { ok: true };
  } catch (error) {
    return toActionError(error);
  }
}
