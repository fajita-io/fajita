import "server-only";

import { serviceClient } from "@/lib/supabase/service";
import { decryptEmail } from "./email-crypto";
import { maskEmail } from "./mask";

/**
 * Authenticated, permissioned subscriber administration reads. Callers must
 * already have passed the subscriber permission guard. Addresses are masked by
 * default; a caller with subscribers:read_sensitive may request full display.
 * These functions use the service client, so the ROUTE is responsible for
 * tenant + permission enforcement (RLS is defense in depth, not the only gate).
 */

export interface SubscriberCounts {
  confirmed: number;
  pending: number;
  unsubscribed: number;
  bounced: number;
  complained: number;
  suppressed: number;
  pendingDeletion: number;
  total: number;
}

export async function getSubscriberCounts(
  organizationId: string,
  statusPageId: string,
): Promise<SubscriberCounts> {
  const db = serviceClient();
  const { data } = await db
    .from("status_page_subscribers")
    .select("status")
    .eq("organization_id", organizationId)
    .eq("status_page_id", statusPageId)
    .is("deleted_at", null);

  const counts: SubscriberCounts = {
    confirmed: 0,
    pending: 0,
    unsubscribed: 0,
    bounced: 0,
    complained: 0,
    suppressed: 0,
    pendingDeletion: 0,
    total: 0,
  };
  for (const row of data ?? []) {
    counts.total += 1;
    switch (row.status) {
      case "confirmed":
        counts.confirmed += 1;
        break;
      case "pending":
        counts.pending += 1;
        break;
      case "unsubscribed":
        counts.unsubscribed += 1;
        break;
      case "bounced":
        counts.bounced += 1;
        break;
      case "complained":
        counts.complained += 1;
        break;
      case "suppressed":
        counts.suppressed += 1;
        break;
      case "pending_deletion":
        counts.pendingDeletion += 1;
        break;
    }
  }
  return counts;
}

export interface SubscriberListItem {
  id: string;
  email: string; // masked unless includeSensitive
  status: string;
  incidentUpdates: boolean | null;
  maintenanceUpdates: boolean | null;
  allComponents: boolean | null;
  source: string;
  confirmedAt: string | null;
  lastDeliveryAt: string | null;
}

export interface SubscriberListPage {
  items: SubscriberListItem[];
  total: number;
  page: number;
  pageSize: number;
}

export async function listSubscribers(
  organizationId: string,
  statusPageId: string,
  opts: {
    status?: string;
    page?: number;
    pageSize?: number;
    includeSensitive?: boolean;
  } = {},
): Promise<SubscriberListPage> {
  const db = serviceClient();
  const pageSize = Math.min(Math.max(opts.pageSize ?? 25, 1), 100);
  const page = Math.max(opts.page ?? 1, 1);
  const from = (page - 1) * pageSize;
  const to = from + pageSize - 1;

  let query = db
    .from("status_page_subscribers")
    .select("id, status, encrypted_email, email_normalized, source, confirmed_at, last_delivery_at", {
      count: "exact",
    })
    .eq("organization_id", organizationId)
    .eq("status_page_id", statusPageId)
    .is("deleted_at", null)
    .order("created_at", { ascending: false })
    .range(from, to);
  if (opts.status) query = query.eq("status", opts.status);

  const { data, count } = await query;
  const rows = data ?? [];

  const prefsById = new Map<
    string,
    { incident: boolean; maintenance: boolean; all: boolean }
  >();
  if (rows.length > 0) {
    const { data: prefs } = await db
      .from("status_page_subscriber_event_prefs")
      .select("subscriber_id, incident_updates, maintenance_updates, all_components")
      .in(
        "subscriber_id",
        rows.map((r) => r.id),
      );
    for (const p of prefs ?? []) {
      prefsById.set(p.subscriber_id, {
        incident: p.incident_updates,
        maintenance: p.maintenance_updates,
        all: p.all_components,
      });
    }
  }

  const items: SubscriberListItem[] = rows.map((r) => {
    const plain = r.encrypted_email ? safeDecrypt(r.encrypted_email) : r.email_normalized;
    const display = !plain
      ? "•••"
      : opts.includeSensitive
        ? plain
        : maskEmail(plain);
    const p = prefsById.get(r.id);
    return {
      id: r.id,
      email: display,
      status: r.status,
      incidentUpdates: p?.incident ?? null,
      maintenanceUpdates: p?.maintenance ?? null,
      allComponents: p?.all ?? null,
      source: r.source,
      confirmedAt: r.confirmed_at,
      lastDeliveryAt: r.last_delivery_at,
    };
  });

  return { items, total: count ?? items.length, page, pageSize };
}

function safeDecrypt(envelope: string): string | null {
  try {
    return decryptEmail(envelope);
  } catch {
    return null;
  }
}

export interface SubscriberSettings {
  subscriptionsEnabled: boolean;
  incidentOpened: boolean;
  incidentUpdates: boolean;
  incidentResolved: boolean;
  incidentReopened: boolean;
  maintenanceScheduled: boolean;
  maintenanceStarted: boolean;
  maintenanceUpdated: boolean;
  maintenanceCompleted: boolean;
  maintenanceCanceled: boolean;
  componentSelectionEnabled: boolean;
  allComponentsDefault: boolean;
  confirmationCooldownSeconds: number;
  privacyUrl: string;
  autoPausedAt: string | null;
  pauseReason: string | null;
}

export async function getSubscriberSettings(
  organizationId: string,
  statusPageId: string,
): Promise<SubscriberSettings | null> {
  const db = serviceClient();
  const { data } = await db
    .from("status_pages")
    .select(
      "subscriptions_enabled, subscriber_incident_opened_enabled, subscriber_incident_updates_enabled, subscriber_incident_resolved_enabled, subscriber_incident_reopened_enabled, subscriber_maintenance_scheduled_enabled, subscriber_maintenance_started_enabled, subscriber_maintenance_updated_enabled, subscriber_maintenance_completed_enabled, subscriber_maintenance_canceled_enabled, subscriber_component_selection_enabled, subscriber_all_components_default, subscriber_confirmation_cooldown_seconds, subscriber_privacy_url, subscriber_form_auto_paused_at, subscriber_form_pause_reason",
    )
    .eq("id", statusPageId)
    .eq("organization_id", organizationId)
    .is("deleted_at", null)
    .maybeSingle();
  if (!data) return null;
  return {
    subscriptionsEnabled: data.subscriptions_enabled,
    incidentOpened: data.subscriber_incident_opened_enabled,
    incidentUpdates: data.subscriber_incident_updates_enabled,
    incidentResolved: data.subscriber_incident_resolved_enabled,
    incidentReopened: data.subscriber_incident_reopened_enabled,
    maintenanceScheduled: data.subscriber_maintenance_scheduled_enabled,
    maintenanceStarted: data.subscriber_maintenance_started_enabled,
    maintenanceUpdated: data.subscriber_maintenance_updated_enabled,
    maintenanceCompleted: data.subscriber_maintenance_completed_enabled,
    maintenanceCanceled: data.subscriber_maintenance_canceled_enabled,
    componentSelectionEnabled: data.subscriber_component_selection_enabled,
    allComponentsDefault: data.subscriber_all_components_default,
    confirmationCooldownSeconds: data.subscriber_confirmation_cooldown_seconds,
    privacyUrl: data.subscriber_privacy_url ?? "",
    autoPausedAt: data.subscriber_form_auto_paused_at,
    pauseReason: data.subscriber_form_pause_reason,
  };
}

export interface DeliveryHealth {
  delivered: number;
  failed: number;
  pending: number;
  deadLettered: number;
}

/** Aggregate recent subscriber delivery health for the overview card. */
export async function getDeliveryHealth(
  organizationId: string,
  statusPageId: string,
): Promise<DeliveryHealth> {
  const db = serviceClient();
  const { data } = await db
    .from("status_page_subscriber_delivery_intents")
    .select("status")
    .eq("organization_id", organizationId)
    .eq("status_page_id", statusPageId);
  const health: DeliveryHealth = { delivered: 0, failed: 0, pending: 0, deadLettered: 0 };
  for (const row of data ?? []) {
    if (row.status === "delivered") health.delivered += 1;
    else if (row.status === "failed") health.failed += 1;
    else if (row.status === "dead_lettered") health.deadLettered += 1;
    else health.pending += 1;
  }
  return health;
}
