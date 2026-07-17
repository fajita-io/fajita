/**
 * Lifecycle message registry.
 *
 * Every lifecycle email Fajita can send is declared here with its class,
 * template version, and preference gate. The registry is the single source of
 * truth for eligibility checks, deduplication, the email center, previews,
 * and the docs. Pure module: safe on client and server.
 *
 * Message classes (see /docs/engineering/lifecycle-state-model.md):
 *   required     Service communication. Cannot be disabled while operationally
 *                necessary (export ready, deletion scheduled, cancellation).
 *   setup        Product setup guidance. Preference-gated, cooldown-limited.
 *   report       Weekly reliability reports and incident recaps.
 *   reactivation Limited, lawful win-back. Preference-gated, bounded.
 *
 * Marketing is deliberately absent. There is no such class.
 */

export type LifecycleMessageClass =
  | "required"
  | "setup"
  | "report"
  | "reactivation";

/** Preference columns on lifecycle_email_preferences. Null = mandatory. */
export type LifecyclePreferenceKey =
  | "setup_guidance"
  | "weekly_report"
  | "incident_recaps"
  | "usage_notices"
  | "reactivation_reminders";

export interface LifecycleMessageDefinition {
  key: string;
  class: LifecycleMessageClass;
  /** Bump when the rendered template changes materially. */
  templateVersion: number;
  /** Preference that must be enabled. Null = required service message. */
  preference: LifecyclePreferenceKey | null;
  /** Short internal label for delivery history and the admin view. */
  label: string;
  /** True when only one send may ever exist per dedup scope. */
  oneShot: boolean;
}

export const LIFECYCLE_MESSAGES = {
  welcome: {
    key: "welcome",
    class: "setup",
    templateVersion: 1,
    preference: "setup_guidance",
    label: "Welcome",
    oneShot: true,
  },
  setup_reminder: {
    key: "setup_reminder",
    class: "setup",
    templateVersion: 1,
    preference: "setup_guidance",
    label: "Setup reminder",
    oneShot: false,
  },
  monitor_draft_reminder: {
    key: "monitor_draft_reminder",
    class: "setup",
    templateVersion: 1,
    preference: "setup_guidance",
    label: "Monitor draft reminder",
    oneShot: false,
  },
  first_monitor_live: {
    key: "first_monitor_live",
    class: "setup",
    templateVersion: 1,
    preference: "setup_guidance",
    label: "First monitor confirmation",
    oneShot: true,
  },
  first_failure_education: {
    key: "first_failure_education",
    class: "setup",
    templateVersion: 1,
    preference: "setup_guidance",
    label: "First failed check explained",
    oneShot: true,
  },
  alert_channel_reminder: {
    key: "alert_channel_reminder",
    class: "setup",
    templateVersion: 1,
    preference: "setup_guidance",
    label: "Alert channel reminder",
    oneShot: false,
  },
  status_page_reminder: {
    key: "status_page_reminder",
    class: "setup",
    templateVersion: 1,
    preference: "setup_guidance",
    label: "Status page reminder",
    oneShot: false,
  },
  activation_complete: {
    key: "activation_complete",
    class: "setup",
    templateVersion: 1,
    preference: "setup_guidance",
    label: "Everything is connected",
    oneShot: true,
  },
  weekly_report: {
    key: "weekly_report",
    class: "report",
    templateVersion: 1,
    preference: "weekly_report",
    label: "Weekly reliability report",
    oneShot: false,
  },
  incident_recap: {
    key: "incident_recap",
    class: "report",
    templateVersion: 1,
    preference: "incident_recaps",
    label: "Incident recap",
    oneShot: false,
  },
  usage_limit_notice: {
    key: "usage_limit_notice",
    class: "setup",
    templateVersion: 1,
    preference: "usage_notices",
    label: "Usage limit notice",
    oneShot: false,
  },
  cancellation_confirmation: {
    key: "cancellation_confirmation",
    class: "required",
    templateVersion: 1,
    preference: null,
    label: "Cancellation confirmation",
    oneShot: false,
  },
  pre_deletion_reminder: {
    key: "pre_deletion_reminder",
    class: "required",
    templateVersion: 1,
    preference: null,
    label: "Data deletion reminder",
    oneShot: false,
  },
  reactivation_reminder: {
    key: "reactivation_reminder",
    class: "reactivation",
    templateVersion: 1,
    preference: "reactivation_reminders",
    label: "Reactivation reminder",
    oneShot: false,
  },
} as const satisfies Record<string, LifecycleMessageDefinition>;

export type LifecycleMessageKey = keyof typeof LIFECYCLE_MESSAGES;

export function lifecycleMessage(
  key: string,
): LifecycleMessageDefinition | undefined {
  return (LIFECYCLE_MESSAGES as Record<string, LifecycleMessageDefinition>)[
    key
  ];
}

export const LIFECYCLE_MESSAGE_KEYS = Object.keys(
  LIFECYCLE_MESSAGES,
) as LifecycleMessageKey[];

/* ------------------------------------------------------------------ */
/* Deduplication keys                                                  */
/* ------------------------------------------------------------------ */

/**
 * Deterministic dedup keys. The unique dedup_key column on
 * lifecycle_delivery_intents is the deduplication authority; these builders
 * make the scopes explicit and testable.
 */
export const dedupKeys = {
  /** One welcome per user, ever. */
  welcome: (userId: string) => `welcome:v1:user:${userId}`,

  /** One setup reminder per stage (1 = 24h, 2 = 72h) per user per org. */
  setupReminder: (organizationId: string, userId: string, stage: 1 | 2) =>
    `setup_reminder:v1:s${stage}:org:${organizationId}:user:${userId}`,

  /** One draft reminder per monitor per user. */
  monitorDraftReminder: (monitorId: string, userId: string) =>
    `monitor_draft_reminder:v1:monitor:${monitorId}:user:${userId}`,

  /** One first-monitor confirmation per org per user. */
  firstMonitorLive: (organizationId: string, userId: string) =>
    `first_monitor_live:v1:org:${organizationId}:user:${userId}`,

  /** One first-failure education per org per user. */
  firstFailureEducation: (organizationId: string, userId: string) =>
    `first_failure_education:v1:org:${organizationId}:user:${userId}`,

  /** One alert reminder per stage per user per org (bounded to 2 stages). */
  alertChannelReminder: (organizationId: string, userId: string, stage: 1 | 2) =>
    `alert_channel_reminder:v1:s${stage}:org:${organizationId}:user:${userId}`,

  /** One status-page reminder per user per org. */
  statusPageReminder: (organizationId: string, userId: string) =>
    `status_page_reminder:v1:org:${organizationId}:user:${userId}`,

  /** One activation-complete email per org per user. */
  activationComplete: (organizationId: string, userId: string) =>
    `activation_complete:v1:org:${organizationId}:user:${userId}`,

  /** One weekly report per org, ISO period start, and recipient. */
  weeklyReport: (organizationId: string, periodStart: string, userId: string) =>
    `weekly_report:v1:org:${organizationId}:${periodStart}:user:${userId}`,

  /** One recap per incident per recipient. */
  incidentRecap: (incidentId: string, userId: string) =>
    `incident_recap:v1:incident:${incidentId}:user:${userId}`,

  /** One usage notice per limit, threshold, and billing period per user. */
  usageLimitNotice: (
    organizationId: string,
    limitKey: string,
    threshold: 80 | 100,
    periodStart: string,
    userId: string,
  ) =>
    `usage_limit:v1:${limitKey}:${threshold}:org:${organizationId}:${periodStart}:user:${userId}`,

  /** One enriched confirmation per cancellation record per user. */
  cancellationConfirmation: (cancellationId: string, userId: string) =>
    `cancellation_confirmation:v1:${cancellationId}:user:${userId}`,

  /** One pre-deletion reminder per deletion request and stage per user. */
  preDeletionReminder: (
    deletionRequestId: string,
    stage: "7d" | "1d",
    userId: string,
  ) => `pre_deletion:v1:${stage}:request:${deletionRequestId}:user:${userId}`,

  /** One reactivation reminder per cancellation record per user. */
  reactivationReminder: (cancellationId: string, userId: string) =>
    `reactivation_reminder:v1:${cancellationId}:user:${userId}`,
} as const;

/* ------------------------------------------------------------------ */
/* Cooldowns and bounds                                                */
/* ------------------------------------------------------------------ */

export const LIFECYCLE_TIMING = {
  /** First setup reminder: 24h after signup without an active monitor. */
  setupReminderFirstAfterMs: 24 * 60 * 60 * 1000,
  /** Final setup reminder: 72h after signup. Nothing after that. */
  setupReminderFinalAfterMs: 72 * 60 * 60 * 1000,
  /** Draft reminder waits 24h after the last draft edit. */
  draftReminderAfterMs: 24 * 60 * 60 * 1000,
  /** Alert-channel reminder: 3 days after first monitor, one follow-up at 7. */
  alertReminderFirstAfterMs: 3 * 24 * 60 * 60 * 1000,
  alertReminderFinalAfterMs: 7 * 24 * 60 * 60 * 1000,
  /** Status-page reminder: 7 days after alert path ready. */
  statusPageReminderAfterMs: 7 * 24 * 60 * 60 * 1000,
  /** Incident recap waits for a stabilization window after resolution. */
  incidentRecapStabilizationMs: 30 * 60 * 1000,
  /** Minimum incident duration to earn a recap (avoids transient noise). */
  incidentRecapMinDurationMs: 5 * 60 * 1000,
  /** Pre-deletion reminder offsets before the scheduled deletion. */
  preDeletionFirstBeforeMs: 7 * 24 * 60 * 60 * 1000,
  preDeletionFinalBeforeMs: 24 * 60 * 60 * 1000,
} as const;
