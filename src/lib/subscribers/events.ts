import "server-only";

import { serviceClient } from "@/lib/supabase/service";
import { EVENT_TYPE_SETTING, type SubscriberEventType } from "./constants";
import type { RenderPayload } from "./templates";

/**
 * Subscriber event emission. The ONLY approved source of subscriber email is a
 * PUBLISHED public status-page event. This layer records an event row that the
 * fan-out worker later processes; it never sends email inline and never blocks
 * publication. Emission is idempotent per (page, type, subject, revision) so a
 * duplicate publish or a retried action cannot double-send. It honors the
 * page's subscriber settings: if subscriptions are disabled, the event type is
 * disabled, or the form is auto-paused, no event is created.
 *
 * Internal notes, private evidence, monitor names, assignees, and unpublished
 * drafts never reach the public_payload: callers pass only allowlisted public
 * content (the same content shown on the public status page).
 */

export interface EmitSubscriberEventInput {
  organizationId: string;
  statusPageId: string;
  eventType: SubscriberEventType;
  incidentId?: string | null;
  maintenanceWindowId?: string | null;
  manualMessageId?: string | null;
  contentRevision?: number;
  /** Allowlisted public payload the templates render. */
  payload: RenderPayload;
  /** Component ids the event affects; empty means page-wide by default. */
  affectedComponentIds?: string[];
  pageWide?: boolean;
}

interface StatusPageSubscriberSettings {
  subscriptions_enabled: boolean;
  subscriber_form_auto_paused_at: string | null;
  status: string;
  [key: string]: unknown;
}

export async function emitSubscriberEvent(input: EmitSubscriberEventInput): Promise<string | null> {
  const db = serviceClient();

  const { data: page } = await db
    .from("status_pages")
    .select(
      "status, subscriptions_enabled, subscriber_form_auto_paused_at, subscriber_incident_opened_enabled, subscriber_incident_updates_enabled, subscriber_incident_resolved_enabled, subscriber_incident_reopened_enabled, subscriber_maintenance_scheduled_enabled, subscriber_maintenance_started_enabled, subscriber_maintenance_updated_enabled, subscriber_maintenance_completed_enabled, subscriber_maintenance_canceled_enabled, subscriber_manual_notice_enabled",
    )
    .eq("id", input.statusPageId)
    .is("deleted_at", null)
    .maybeSingle();
  if (!page) return null;
  const settings = page as unknown as StatusPageSubscriberSettings;
  if (["suspended", "pending_deletion", "deleted"].includes(settings.status)) return null;
  if (!settings.subscriptions_enabled) return null;
  // Auto-paused forms still deliver to existing subscribers, but do not emit
  // when the org is suspended (handled above). Pause only gates NEW signups.
  // Per-event toggle.
  const toggle = settings[EVENT_TYPE_SETTING[input.eventType]];
  if (toggle === false) return null;

  const revision = input.contentRevision ?? 1;
  const subject =
    input.incidentId ?? input.maintenanceWindowId ?? input.manualMessageId ?? "none";
  const idempotencyKey = `${input.statusPageId}:${input.eventType}:${subject}:${revision}`;

  const affected = input.affectedComponentIds ?? [];
  const publicPayload = {
    ...input.payload,
    affected_component_ids: affected,
  };

  const { data, error } = await db
    .from("status_page_subscriber_events")
    .insert({
      organization_id: input.organizationId,
      status_page_id: input.statusPageId,
      event_type: input.eventType,
      incident_id: input.incidentId ?? null,
      maintenance_window_id: input.maintenanceWindowId ?? null,
      manual_message_id: input.manualMessageId ?? null,
      content_revision: revision,
      public_payload: publicPayload as never,
      page_wide: input.pageWide ?? affected.length === 0,
      idempotency_key: idempotencyKey,
      fanout_status: "pending",
    })
    .select("id")
    // Idempotent: a duplicate publish is a no-op.
    .maybeSingle();

  if (error) {
    // Unique violation on idempotency_key -> already emitted; treat as success.
    if ((error as { code?: string }).code === "23505") return null;
    throw error;
  }
  return data?.id ?? null;
}
