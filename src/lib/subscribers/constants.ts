/**
 * Shared, pure constants for the status-page subscriber system. Safe to import
 * from anywhere (no server-only dependencies). Values that must stay stable for
 * consent evidence (text version) or deliverability (List-Unsubscribe) live
 * here so there is one source of truth across templates, forms, and workers.
 */

/**
 * Version of the public consent statement shown on the subscriber form. Bump
 * this string whenever the wording materially changes so each consent record
 * pins the exact text a subscriber agreed to. Never reuse an old version for
 * new wording.
 */
export const CONSENT_TEXT_VERSION = "2026-07-01" as const;

/** Confirmation link lifetime. Documented and enforced in one place. */
export const CONFIRMATION_TTL_HOURS = 48 as const;
export const CONFIRMATION_TTL_MS = CONFIRMATION_TTL_HOURS * 60 * 60 * 1000;

/** Preference-access link lifetime. Long-lived but revocable. */
export const PREFERENCE_TOKEN_TTL_DAYS = 180 as const;
export const PREFERENCE_TOKEN_TTL_MS = PREFERENCE_TOKEN_TTL_DAYS * 24 * 60 * 60 * 1000;

/** Repeated soft bounces before durable suppression. */
export const SOFT_BOUNCE_SUPPRESSION_THRESHOLD = 3 as const;

/** Public event types that can generate subscriber email. */
export const SUBSCRIBER_EVENT_TYPES = [
  "incident_opened",
  "incident_update",
  "incident_resolved",
  "incident_reopened",
  "maintenance_scheduled",
  "maintenance_started",
  "maintenance_updated",
  "maintenance_completed",
  "maintenance_canceled",
  "manual_notice",
] as const;
export type SubscriberEventType = (typeof SUBSCRIBER_EVENT_TYPES)[number];

/** Template keys. One per rendered message shape. */
export const MESSAGE_KINDS = {
  confirmation: "confirmation",
  incidentOpened: "incident_opened",
  incidentUpdate: "incident_update",
  incidentResolved: "incident_resolved",
  incidentReopened: "incident_reopened",
  maintenanceScheduled: "maintenance_scheduled",
  maintenanceStarted: "maintenance_started",
  maintenanceUpdated: "maintenance_updated",
  maintenanceCompleted: "maintenance_completed",
  maintenanceCanceled: "maintenance_canceled",
  manualNotice: "manual_notice",
} as const;
export type MessageKind = (typeof MESSAGE_KINDS)[keyof typeof MESSAGE_KINDS];

/** Map a subscriber event type to the template key used to render it. */
export function messageKindForEvent(eventType: SubscriberEventType): MessageKind {
  return eventType as MessageKind;
}

/** Which status-page setting column gates each event type. */
export const EVENT_TYPE_SETTING: Record<SubscriberEventType, string> = {
  incident_opened: "subscriber_incident_opened_enabled",
  incident_update: "subscriber_incident_updates_enabled",
  incident_resolved: "subscriber_incident_resolved_enabled",
  incident_reopened: "subscriber_incident_reopened_enabled",
  maintenance_scheduled: "subscriber_maintenance_scheduled_enabled",
  maintenance_started: "subscriber_maintenance_started_enabled",
  maintenance_updated: "subscriber_maintenance_updated_enabled",
  maintenance_completed: "subscriber_maintenance_completed_enabled",
  maintenance_canceled: "subscriber_maintenance_canceled_enabled",
  manual_notice: "subscriber_manual_notice_enabled",
};

/** Rate-limit windows (ms) and ceilings for public subscriber endpoints. */
export const SUBSCRIBER_RATE_LIMITS = {
  subscribePerIpWindowMs: 60_000,
  subscribePerIpMax: 5,
  subscribePerEmailWindowMs: 15 * 60_000,
  subscribePerEmailMax: 3,
  confirmationResendCooldownMs: 120_000,
  preferenceLinkWindowMs: 15 * 60_000,
  preferenceLinkMax: 3,
} as const;

/** Provider timeout for a single subscriber email send. */
export const SUBSCRIBER_EMAIL_TIMEOUT_MS = 15_000;

/** Never send to more than this many addresses per single provider request. */
export const MAX_TEST_RECIPIENTS = 5;
