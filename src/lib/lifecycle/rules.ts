import "server-only";

import { serviceClient } from "@/lib/supabase/service";
import { getOrgEntitlements } from "@/lib/billing/engine";
import { getUsageSnapshot } from "@/lib/billing/usage";
import {
  assessLifecycleState,
  type LifecycleAssessment,
} from "./state";
import { createLifecycleIntent, type CreateIntentResult } from "./intents";
import { LIFECYCLE_TIMING, dedupKeys } from "./messages";

/**
 * Typed lifecycle rule engine.
 *
 * Each rule inspects one organization's evidence and may create delivery
 * intents. Rules are pure decisions over the shared context; the intent layer
 * owns eligibility and deduplication, so a rule firing twice is harmless.
 *
 * Boundaries enforced here:
 * - Setup guidance is bounded (24h + 72h reminders, then silence).
 * - Nothing fires for organizations older than the catch-up window, so
 *   enabling the engine never mass-emails historical organizations.
 * - Weekly reports and incident recaps are created by their generators, not
 *   by this engine.
 */

const CATCH_UP_WINDOW_MS = 14 * 24 * 60 * 60 * 1000;

export interface RuleContext {
  organizationId: string;
  organizationName: string;
  organizationCreatedAt: string;
  ownerUserId: string;
  assessment: LifecycleAssessment;
  now: number;
}

export interface RuleOutcome {
  rule: string;
  result: CreateIntentResult | { created: false; reason: "not_applicable" };
}

type LifecycleRule = (ctx: RuleContext) => Promise<RuleOutcome[]>;

const notApplicable = (rule: string): RuleOutcome[] => [
  { rule, result: { created: false, reason: "not_applicable" } },
];

function withinCatchUp(ctx: RuleContext, sinceIso: string | null): boolean {
  if (!sinceIso) return false;
  return ctx.now - new Date(sinceIso).getTime() < CATCH_UP_WINDOW_MS;
}

/* ------------------------------------------------------------------ */
/* Rules                                                               */
/* ------------------------------------------------------------------ */

/** Welcome: once per user, shortly after the organization exists. */
const welcomeRule: LifecycleRule = async (ctx) => {
  if (!withinCatchUp(ctx, ctx.organizationCreatedAt)) {
    return notApplicable("welcome");
  }
  const result = await createLifecycleIntent({
    organizationId: ctx.organizationId,
    userId: ctx.ownerUserId,
    messageKey: "welcome",
    dedupKey: dedupKeys.welcome(ctx.ownerUserId),
    payload: {},
  });
  return [{ rule: "welcome", result }];
};

/** Setup reminders: 24h and 72h after creation without an active monitor. */
const setupReminderRule: LifecycleRule = async (ctx) => {
  const { signals } = ctx.assessment;
  if (signals.activeMonitorCount > 0) return notApplicable("setup_reminder");
  if (!withinCatchUp(ctx, ctx.organizationCreatedAt)) {
    return notApplicable("setup_reminder");
  }
  const age = ctx.now - new Date(ctx.organizationCreatedAt).getTime();
  const outcomes: RuleOutcome[] = [];

  if (age >= LIFECYCLE_TIMING.setupReminderFirstAfterMs) {
    outcomes.push({
      rule: "setup_reminder_1",
      result: await createLifecycleIntent({
        organizationId: ctx.organizationId,
        userId: ctx.ownerUserId,
        messageKey: "setup_reminder",
        dedupKey: dedupKeys.setupReminder(ctx.organizationId, ctx.ownerUserId, 1),
        payload: { organization_name: ctx.organizationName, stage: 1 },
      }),
    });
  }
  if (age >= LIFECYCLE_TIMING.setupReminderFinalAfterMs) {
    outcomes.push({
      rule: "setup_reminder_2",
      result: await createLifecycleIntent({
        organizationId: ctx.organizationId,
        userId: ctx.ownerUserId,
        messageKey: "setup_reminder",
        dedupKey: dedupKeys.setupReminder(ctx.organizationId, ctx.ownerUserId, 2),
        payload: { organization_name: ctx.organizationName, stage: 2 },
      }),
    });
  }
  return outcomes.length > 0 ? outcomes : notApplicable("setup_reminder");
};

/** Draft reminder: a monitor draft sat untouched for 24h, none active yet. */
const draftReminderRule: LifecycleRule = async (ctx) => {
  const { signals } = ctx.assessment;
  if (signals.activeMonitorCount > 0 || signals.draftMonitorCount === 0) {
    return notApplicable("monitor_draft_reminder");
  }
  const db = serviceClient();
  const { data: draft } = await db
    .from("monitors")
    .select("id, name, monitor_type, updated_at, created_by_user_id")
    .eq("organization_id", ctx.organizationId)
    .eq("status", "draft")
    .is("deleted_at", null)
    .order("updated_at", { ascending: false })
    .limit(1)
    .maybeSingle();
  if (!draft) return notApplicable("monitor_draft_reminder");

  const idleMs = ctx.now - new Date(draft.updated_at).getTime();
  if (
    idleMs < LIFECYCLE_TIMING.draftReminderAfterMs ||
    !withinCatchUp(ctx, draft.updated_at)
  ) {
    return notApplicable("monitor_draft_reminder");
  }

  const recipient = draft.created_by_user_id ?? ctx.ownerUserId;
  const result = await createLifecycleIntent({
    organizationId: ctx.organizationId,
    userId: recipient,
    messageKey: "monitor_draft_reminder",
    dedupKey: dedupKeys.monitorDraftReminder(draft.id, recipient),
    payload: {
      organization_name: ctx.organizationName,
      monitor_name: draft.name,
      monitor_type: draft.monitor_type,
      monitor_id: draft.id,
    },
    relatedType: "monitor",
    relatedId: draft.id,
  });
  return [{ rule: "monitor_draft_reminder", result }];
};

/** First-monitor confirmation: after the first real scheduled result. */
const firstMonitorLiveRule: LifecycleRule = async (ctx) => {
  const { signals } = ctx.assessment;
  if (!signals.firstRealCheckAt || !withinCatchUp(ctx, signals.firstRealCheckAt)) {
    return notApplicable("first_monitor_live");
  }
  const db = serviceClient();
  const { data: monitor } = await db
    .from("monitors")
    .select("id, name, monitor_type, check_interval_seconds")
    .eq("organization_id", ctx.organizationId)
    .eq("status", "active")
    .is("deleted_at", null)
    .order("created_at", { ascending: true })
    .limit(1)
    .maybeSingle();

  const firstCheckFailed = signals.firstRealCheckStatus !== "success";
  const result = await createLifecycleIntent({
    organizationId: ctx.organizationId,
    userId: ctx.ownerUserId,
    messageKey: "first_monitor_live",
    dedupKey: dedupKeys.firstMonitorLive(ctx.organizationId, ctx.ownerUserId),
    payload: {
      organization_name: ctx.organizationName,
      monitor_name: monitor?.name ?? "Your monitor",
      monitor_id: monitor?.id ?? null,
      check_interval_seconds: monitor?.check_interval_seconds ?? null,
      first_check_status: signals.firstRealCheckStatus,
      first_check_failed: firstCheckFailed,
      first_check_at: signals.firstRealCheckAt,
    },
    relatedType: monitor ? "monitor" : undefined,
    relatedId: monitor?.id,
  });

  const outcomes: RuleOutcome[] = [{ rule: "first_monitor_live", result }];

  // First-failure education: only when the first real result failed and no
  // alert path exists to have told the team already.
  if (firstCheckFailed && signals.verifiedChannelCount === 0) {
    outcomes.push({
      rule: "first_failure_education",
      result: await createLifecycleIntent({
        organizationId: ctx.organizationId,
        userId: ctx.ownerUserId,
        messageKey: "first_failure_education",
        dedupKey: dedupKeys.firstFailureEducation(
          ctx.organizationId,
          ctx.ownerUserId,
        ),
        payload: {
          organization_name: ctx.organizationName,
          monitor_name: monitor?.name ?? "Your monitor",
          monitor_id: monitor?.id ?? null,
          failure_category: signals.firstRealCheckStatus,
        },
        relatedType: monitor ? "monitor" : undefined,
        relatedId: monitor?.id,
      }),
    });
  }
  return outcomes;
};

/** Alert-channel reminders: 3 and 7 days after the first monitor activated. */
const alertReminderRule: LifecycleRule = async (ctx) => {
  const { signals } = ctx.assessment;
  if (
    signals.activeMonitorCount === 0 ||
    signals.verifiedChannelCount > 0 ||
    !signals.firstMonitorActivatedAt ||
    !withinCatchUp(ctx, signals.firstMonitorActivatedAt)
  ) {
    return notApplicable("alert_channel_reminder");
  }
  const sinceActivation =
    ctx.now - new Date(signals.firstMonitorActivatedAt).getTime();
  const outcomes: RuleOutcome[] = [];

  if (sinceActivation >= LIFECYCLE_TIMING.alertReminderFirstAfterMs) {
    outcomes.push({
      rule: "alert_channel_reminder_1",
      result: await createLifecycleIntent({
        organizationId: ctx.organizationId,
        userId: ctx.ownerUserId,
        messageKey: "alert_channel_reminder",
        dedupKey: dedupKeys.alertChannelReminder(
          ctx.organizationId,
          ctx.ownerUserId,
          1,
        ),
        payload: {
          organization_name: ctx.organizationName,
          active_monitor_count: signals.activeMonitorCount,
        },
      }),
    });
  }
  if (sinceActivation >= LIFECYCLE_TIMING.alertReminderFinalAfterMs) {
    outcomes.push({
      rule: "alert_channel_reminder_2",
      result: await createLifecycleIntent({
        organizationId: ctx.organizationId,
        userId: ctx.ownerUserId,
        messageKey: "alert_channel_reminder",
        dedupKey: dedupKeys.alertChannelReminder(
          ctx.organizationId,
          ctx.ownerUserId,
          2,
        ),
        payload: {
          organization_name: ctx.organizationName,
          active_monitor_count: signals.activeMonitorCount,
          stage: 2,
        },
      }),
    });
  }
  return outcomes.length > 0 ? outcomes : notApplicable("alert_channel_reminder");
};

/** Status-page reminder: one, 7 days after the alert path became ready. */
const statusPageReminderRule: LifecycleRule = async (ctx) => {
  const { signals } = ctx.assessment;
  if (
    !signals.alertPathReadyAt ||
    signals.publishedStatusPageCount > 0 ||
    !withinCatchUp(ctx, signals.alertPathReadyAt)
  ) {
    return notApplicable("status_page_reminder");
  }
  const sinceReady = ctx.now - new Date(signals.alertPathReadyAt).getTime();
  if (sinceReady < LIFECYCLE_TIMING.statusPageReminderAfterMs) {
    return notApplicable("status_page_reminder");
  }
  const result = await createLifecycleIntent({
    organizationId: ctx.organizationId,
    userId: ctx.ownerUserId,
    messageKey: "status_page_reminder",
    dedupKey: dedupKeys.statusPageReminder(ctx.organizationId, ctx.ownerUserId),
    payload: { organization_name: ctx.organizationName },
  });
  return [{ rule: "status_page_reminder", result }];
};

/** Activation complete: once, when full activation is reached. */
const activationCompleteRule: LifecycleRule = async (ctx) => {
  const { signals } = ctx.assessment;
  if (!signals.activatedAt || !withinCatchUp(ctx, signals.activatedAt)) {
    return notApplicable("activation_complete");
  }
  const result = await createLifecycleIntent({
    organizationId: ctx.organizationId,
    userId: ctx.ownerUserId,
    messageKey: "activation_complete",
    dedupKey: dedupKeys.activationComplete(ctx.organizationId, ctx.ownerUserId),
    payload: {
      organization_name: ctx.organizationName,
      active_monitor_count: signals.activeMonitorCount,
      verified_channel_count: signals.verifiedChannelCount,
      published_status_page_count: signals.publishedStatusPageCount,
      activated_at: signals.activatedAt,
    },
  });
  return [{ rule: "activation_complete", result }];
};

/** Usage notices at 80% and 100% of the active-monitor plan limit. */
const usageLimitRule: LifecycleRule = async (ctx) => {
  const { signals } = ctx.assessment;
  if (signals.activeMonitorCount === 0) return notApplicable("usage_limit");

  const entitlements = await getOrgEntitlements(ctx.organizationId);
  const limit = entitlements.max_active_monitors;
  if (!limit || limit <= 0) return notApplicable("usage_limit");

  const usage = signals.activeMonitorCount;
  const ratio = usage / limit;
  if (ratio < 0.8) return notApplicable("usage_limit");

  const threshold: 80 | 100 = ratio >= 1 ? 100 : 80;
  // Month-scoped dedup keeps notices to one per threshold per month.
  const period = new Date(ctx.now).toISOString().slice(0, 7);
  const result = await createLifecycleIntent({
    organizationId: ctx.organizationId,
    userId: ctx.ownerUserId,
    messageKey: "usage_limit_notice",
    dedupKey: dedupKeys.usageLimitNotice(
      ctx.organizationId,
      "active_monitors",
      threshold,
      period,
      ctx.ownerUserId,
    ),
    payload: {
      organization_name: ctx.organizationName,
      limit_key: "active_monitors",
      threshold,
      usage,
      limit,
    },
  });
  return [{ rule: "usage_limit_notice", result }];
};

/** Usage notices at 80% and 100% of the monthly check allowance. */
const checkUsageLimitRule: LifecycleRule = async (ctx) => {
  const entitlements = await getOrgEntitlements(ctx.organizationId);
  const limit = entitlements.max_monthly_checks;
  if (!limit || limit <= 0) return notApplicable("check_usage_limit");

  const snapshot = await getUsageSnapshot(ctx.organizationId);
  const usage = snapshot.checksThisPeriod ?? 0;
  if (usage <= 0) return notApplicable("check_usage_limit");

  const ratio = usage / limit;
  if (ratio < 0.8) return notApplicable("check_usage_limit");

  const threshold: 80 | 100 = ratio >= 1 ? 100 : 80;
  const period =
    snapshot.checksPeriodStart?.slice(0, 7) ??
    new Date(ctx.now).toISOString().slice(0, 7);
  const result = await createLifecycleIntent({
    organizationId: ctx.organizationId,
    userId: ctx.ownerUserId,
    messageKey: "usage_limit_notice",
    dedupKey: dedupKeys.usageLimitNotice(
      ctx.organizationId,
      "monthly_checks",
      threshold,
      period,
      ctx.ownerUserId,
    ),
    payload: {
      organization_name: ctx.organizationName,
      limit_key: "monthly_checks",
      threshold,
      usage,
      limit,
    },
  });
  return [{ rule: "check_usage_limit_notice", result }];
};

/** Cancellation, pre-deletion, and reactivation reminders. */
const cancellationLifecycleRule: LifecycleRule = async (ctx) => {
  const db = serviceClient();
  const outcomes: RuleOutcome[] = [];

  const { data: cancellation } = await db
    .from("billing_cancellation_records")
    .select("id, status, effective_at, requested_at, reactivated_at")
    .eq("organization_id", ctx.organizationId)
    .order("requested_at", { ascending: false })
    .limit(1)
    .maybeSingle();

  // Enriched cancellation confirmation (Phase 10 owns billing authority; this
  // is the coordinated single message with counts, export, and reactivation).
  if (
    cancellation &&
    cancellation.status === "scheduled" &&
    !cancellation.reactivated_at &&
    withinCatchUp(ctx, cancellation.requested_at)
  ) {
    outcomes.push({
      rule: "cancellation_confirmation",
      result: await createLifecycleIntent({
        organizationId: ctx.organizationId,
        userId: ctx.ownerUserId,
        messageKey: "cancellation_confirmation",
        dedupKey: dedupKeys.cancellationConfirmation(
          cancellation.id,
          ctx.ownerUserId,
        ),
        payload: {
          organization_name: ctx.organizationName,
          effective_at: cancellation.effective_at,
          active_monitor_count: ctx.assessment.signals.activeMonitorCount,
          published_status_page_count:
            ctx.assessment.signals.publishedStatusPageCount,
        },
        relatedType: "cancellation",
        relatedId: cancellation.id,
      }),
    });

    // Single mid-retention reactivation reminder (preference-gated).
    if (cancellation.effective_at) {
      const effective = new Date(cancellation.effective_at).getTime();
      if (ctx.now >= effective) {
        outcomes.push({
          rule: "reactivation_reminder",
          result: await createLifecycleIntent({
            organizationId: ctx.organizationId,
            userId: ctx.ownerUserId,
            messageKey: "reactivation_reminder",
            dedupKey: dedupKeys.reactivationReminder(
              cancellation.id,
              ctx.ownerUserId,
            ),
            payload: {
              organization_name: ctx.organizationName,
              active_monitor_count: ctx.assessment.signals.activeMonitorCount,
              published_status_page_count:
                ctx.assessment.signals.publishedStatusPageCount,
            },
            relatedType: "cancellation",
            relatedId: cancellation.id,
            scheduledAt: new Date(ctx.now + 60 * 1000),
          }),
        });
      }
    }
  }

  // Pre-deletion reminders: 7 days and 1 day before scheduled deletion.
  const { data: deletionRequest } = await db
    .from("deletion_requests")
    .select("id, scheduled_for, status")
    .eq("subject_type", "organization")
    .eq("organization_id", ctx.organizationId)
    .eq("status", "scheduled")
    .maybeSingle();

  if (deletionRequest?.scheduled_for) {
    const deleteAt = new Date(deletionRequest.scheduled_for).getTime();
    const remaining = deleteAt - ctx.now;
    const stages: Array<{ stage: "7d" | "1d"; beforeMs: number }> = [
      { stage: "7d", beforeMs: LIFECYCLE_TIMING.preDeletionFirstBeforeMs },
      { stage: "1d", beforeMs: LIFECYCLE_TIMING.preDeletionFinalBeforeMs },
    ];
    for (const { stage, beforeMs } of stages) {
      if (remaining > 0 && remaining <= beforeMs) {
        outcomes.push({
          rule: `pre_deletion_${stage}`,
          result: await createLifecycleIntent({
            organizationId: ctx.organizationId,
            userId: ctx.ownerUserId,
            messageKey: "pre_deletion_reminder",
            dedupKey: dedupKeys.preDeletionReminder(
              deletionRequest.id,
              stage,
              ctx.ownerUserId,
            ),
            payload: {
              organization_name: ctx.organizationName,
              deletion_scheduled_for: deletionRequest.scheduled_for,
              stage,
            },
            relatedType: "deletion_request",
            relatedId: deletionRequest.id,
          }),
        });
      }
    }
  }

  return outcomes.length > 0
    ? outcomes
    : notApplicable("cancellation_lifecycle");
};

const RULES: LifecycleRule[] = [
  welcomeRule,
  setupReminderRule,
  draftReminderRule,
  firstMonitorLiveRule,
  alertReminderRule,
  statusPageReminderRule,
  activationCompleteRule,
  usageLimitRule,
  checkUsageLimitRule,
  cancellationLifecycleRule,
];

/* ------------------------------------------------------------------ */
/* Evaluation                                                          */
/* ------------------------------------------------------------------ */

export interface EvaluationSummary {
  organizationId: string;
  state: string;
  intentsCreated: number;
  outcomes: RuleOutcome[];
}

/** Evaluate all lifecycle rules for one organization. */
export async function evaluateOrganizationLifecycle(
  organizationId: string,
): Promise<EvaluationSummary> {
  const db = serviceClient();
  const { data: org } = await db
    .from("organizations")
    .select("id, name, owner_user_id, created_at, status, deleted_at")
    .eq("id", organizationId)
    .maybeSingle();

  if (!org || org.deleted_at) {
    return { organizationId, state: "deleted", intentsCreated: 0, outcomes: [] };
  }

  const assessment = await assessLifecycleState(organizationId);
  const ctx: RuleContext = {
    organizationId,
    organizationName: org.name,
    organizationCreatedAt: org.created_at,
    ownerUserId: org.owner_user_id,
    assessment,
    now: Date.now(),
  };

  const outcomes: RuleOutcome[] = [];
  for (const rule of RULES) {
    try {
      outcomes.push(...(await rule(ctx)));
    } catch (error) {
      console.error("[lifecycle] rule failed", organizationId, error);
    }
  }

  return {
    organizationId,
    state: assessment.state,
    intentsCreated: outcomes.filter((o) => "created" in o.result && o.result.created).length,
    outcomes,
  };
}

/**
 * Batch evaluation for the worker: organizations with recent activity or in
 * lifecycle-relevant states. Bounded; safe to run every few minutes.
 */
export async function evaluateLifecycleBatch(max = 50): Promise<{
  evaluated: number;
  intentsCreated: number;
}> {
  const db = serviceClient();
  const since = new Date(Date.now() - CATCH_UP_WINDOW_MS).toISOString();

  // Recently created or recently active organizations.
  const { data: orgs } = await db
    .from("organizations")
    .select("id")
    .is("deleted_at", null)
    .neq("status", "deleted")
    .gte("updated_at", since)
    .order("updated_at", { ascending: false })
    .limit(Math.min(max, 200));

  // Plus organizations with scheduled deletion or cancellation regardless of
  // recent activity (their reminders are time-driven, not activity-driven).
  const { data: pendingDeletion } = await db
    .from("deletion_requests")
    .select("organization_id")
    .eq("subject_type", "organization")
    .eq("status", "scheduled")
    .not("organization_id", "is", null)
    .limit(100);

  const ids = new Set<string>((orgs ?? []).map((o) => o.id));
  for (const row of pendingDeletion ?? []) {
    if (row.organization_id) ids.add(row.organization_id);
  }

  let evaluated = 0;
  let intentsCreated = 0;
  for (const id of ids) {
    if (evaluated >= max) break;
    const summary = await evaluateOrganizationLifecycle(id);
    evaluated += 1;
    intentsCreated += summary.intentsCreated;
  }
  return { evaluated, intentsCreated };
}
