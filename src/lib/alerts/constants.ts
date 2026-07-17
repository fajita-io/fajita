/**
 * Shared vocabulary for the alert system. Pure module (client + server safe).
 * Mirrors the CHECK constraints in the Phase 7 migrations so TypeScript and the
 * database agree on the allowed values.
 */

export const ALERT_PROVIDERS = ["email", "slack", "discord", "webhook"] as const;
export type AlertProvider = (typeof ALERT_PROVIDERS)[number];

export const CHANNEL_STATUSES = [
  "draft",
  "testing",
  "active",
  "paused",
  "degraded",
  "disabled",
  "pending_deletion",
  "deleted",
] as const;
export type ChannelStatus = (typeof CHANNEL_STATUSES)[number];

export const CHANNEL_HEALTH = [
  "healthy",
  "degraded",
  "failing",
  "paused",
  "unverified",
  "disabled",
] as const;
export type ChannelHealth = (typeof CHANNEL_HEALTH)[number];

export const VERIFICATION_STATUSES = [
  "unverified",
  "verifying",
  "verified",
  "failed",
] as const;
export type VerificationStatus = (typeof VERIFICATION_STATUSES)[number];

export const ALERT_SEVERITIES = [
  "minor",
  "major",
  "critical",
  "maintenance",
  "informational",
] as const;
export type AlertSeverity = (typeof ALERT_SEVERITIES)[number];

/** Operator-assignable incident severities that appear in routing rules. */
export const ROUTABLE_SEVERITIES = ["minor", "major", "critical"] as const;

export const DELIVERY_STATUSES = [
  "pending",
  "scheduled",
  "processing",
  "delivered",
  "failed",
  "dead_letter",
  "suppressed",
  "canceled",
] as const;
export type DeliveryStatus = (typeof DELIVERY_STATUSES)[number];

export const RECOVERY_BEHAVIORS = [
  "same_channels",
  "never",
  "only_if_opened_delivered",
  "selected_channels",
] as const;
export type RecoveryBehavior = (typeof RECOVERY_BEHAVIORS)[number];

export const QUIET_BEHAVIORS = ["suppress", "delay", "ignore_quiet"] as const;
export type QuietBehavior = (typeof QUIET_BEHAVIORS)[number];

export const SCOPE_KINDS = ["organization", "tag", "group", "monitor"] as const;
export type ScopeKind = (typeof SCOPE_KINDS)[number];

/** Lower rank = more specific = wins when the same channel is selected twice. */
export const SCOPE_PRECEDENCE: Record<ScopeKind, number> = {
  monitor: 10,
  group: 20,
  tag: 30,
  organization: 100,
};

/** Bounded limits to prevent abuse. */
export const ALERT_LIMITS = {
  maxEmailRecipientsPerChannel: 20,
  maxChannelsPerOrg: 100,
  maxRulesPerOrg: 200,
  maxRuleChannels: 20,
  maxCustomHeaders: 10,
  maxHeaderValueLength: 1024,
  webhookTimeoutMs: 10_000,
  /** Timeout applied to any provider send (email API, chat webhook, generic). */
  providerTimeoutMs: 10_000,
  webhookMaxResponseBytes: 64 * 1024,
  defaultMaxAttempts: 5,
} as const;

/** Retry backoff schedule (documented; the DB applies the same in SQL). */
export const RETRY_BACKOFF_SECONDS = [30, 120, 600, 1800, 7200] as const;

/** Header names a customer may never set on a generic webhook. */
export const BLOCKED_WEBHOOK_HEADERS = new Set(
  [
    "host",
    "content-length",
    "content-type",
    "transfer-encoding",
    "connection",
    "keep-alive",
    "upgrade",
    "te",
    "trailer",
    "expect",
    "proxy-authorization",
    "proxy-authenticate",
    "fajita-event-id",
    "fajita-event-type",
    "fajita-timestamp",
    "fajita-signature",
    "fajita-schema-version",
  ].map((h) => h.toLowerCase()),
);

/** Webhook payload schema version. Bump when the envelope changes shape. */
export const WEBHOOK_SCHEMA_VERSION = "2026-07-21";

export const WEBHOOK_SIGNATURE_HEADERS = {
  eventId: "Fajita-Event-ID",
  eventType: "Fajita-Event-Type",
  timestamp: "Fajita-Timestamp",
  signature: "Fajita-Signature",
  schemaVersion: "Fajita-Schema-Version",
} as const;
