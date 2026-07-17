import "server-only";

import { serviceClient } from "@/lib/supabase/service";
import {
  getActivationSignals,
  type ActivationSignals,
} from "@/lib/onboarding/activation";

/**
 * Evidence-based organization lifecycle state.
 *
 * Every state is derived from verifiable product and billing data, never from
 * behavioral profiling. The reasons array records exactly which evidence
 * produced the state so the internal lifecycle view can explain itself.
 *
 * Precedence (first match wins): deletion and billing states override product
 * states; product states order from most to least established.
 */

export type LifecycleState =
  | "new"
  | "setup_in_progress"
  | "first_value"
  | "activated"
  | "engaged"
  | "setup_stalled"
  | "inactive"
  | "at_risk"
  | "payment_issue"
  | "cancellation_scheduled"
  | "canceled_read_only"
  | "reactivated"
  | "pending_deletion"
  | "deleted";

export interface LifecycleAssessment {
  state: LifecycleState;
  reasons: string[];
  signals: ActivationSignals;
}

const SETUP_STALLED_AFTER_MS = 72 * 60 * 60 * 1000;
const INACTIVE_AFTER_MS = 30 * 24 * 60 * 60 * 1000;
const REACTIVATED_WINDOW_MS = 14 * 24 * 60 * 60 * 1000;

/** Compute the current lifecycle state for one organization. Read-only. */
export async function assessLifecycleState(
  organizationId: string,
): Promise<LifecycleAssessment> {
  const db = serviceClient();

  const [orgRes, billingRes, deletionRes, signals, lastAuditRes, reactivationRes] =
    await Promise.all([
      db
        .from("organizations")
        .select("id, status, deleted_at, created_at")
        .eq("id", organizationId)
        .maybeSingle(),
      db
        .from("billing_subscriptions")
        .select(
          "status, access_state, cancel_at_period_end, canceled_at, cancellation_effective_at",
        )
        .eq("organization_id", organizationId)
        .order("created_at", { ascending: false })
        .limit(1)
        .maybeSingle(),
      db
        .from("deletion_requests")
        .select("id, status, scheduled_for")
        .eq("subject_type", "organization")
        .eq("organization_id", organizationId)
        .in("status", ["pending", "scheduled"])
        .maybeSingle(),
      getActivationSignals(organizationId),
      db
        .from("audit_events")
        .select("created_at")
        .eq("organization_id", organizationId)
        .order("created_at", { ascending: false })
        .limit(1),
      db
        .from("audit_events")
        .select("created_at")
        .eq("organization_id", organizationId)
        .eq("action", "billing.subscription_reactivated")
        .order("created_at", { ascending: false })
        .limit(1),
    ]);

  const org = orgRes.data;
  const billing = billingRes.data;
  const reasons: string[] = [];
  const now = Date.now();

  if (!org || org.deleted_at) {
    return {
      state: "deleted",
      reasons: ["Organization deleted"],
      signals,
    };
  }

  if (org.status === "pending_deletion" || deletionRes.data) {
    reasons.push(
      deletionRes.data?.scheduled_for
        ? `Deletion scheduled for ${deletionRes.data.scheduled_for}`
        : "Organization pending deletion",
    );
    return { state: "pending_deletion", reasons, signals };
  }

  if (billing) {
    const effectivePassed =
      billing.cancellation_effective_at &&
      new Date(billing.cancellation_effective_at).getTime() <= now;
    if (billing.status === "canceled" || effectivePassed) {
      reasons.push("Subscription canceled; data retained read-only");
      return { state: "canceled_read_only", reasons, signals };
    }
    if (billing.cancel_at_period_end || billing.cancellation_effective_at) {
      reasons.push(
        `Cancellation scheduled${billing.cancellation_effective_at ? ` for ${billing.cancellation_effective_at}` : ""}`,
      );
      return { state: "cancellation_scheduled", reasons, signals };
    }
    if (
      billing.status === "past_due" ||
      billing.access_state === "grace" ||
      billing.access_state === "restricted"
    ) {
      reasons.push(`Billing needs attention (${billing.status})`);
      return { state: "payment_issue", reasons, signals };
    }
  }

  const reactivatedAt = reactivationRes.data?.[0]?.created_at;
  if (
    reactivatedAt &&
    now - new Date(reactivatedAt).getTime() < REACTIVATED_WINDOW_MS
  ) {
    reasons.push(`Reactivated at ${reactivatedAt}`);
    return { state: "reactivated", reasons, signals };
  }

  const lastActivityAt = lastAuditRes.data?.[0]?.created_at ?? org.created_at;
  const lastActivityAge = now - new Date(lastActivityAt).getTime();
  const orgAge = now - new Date(org.created_at).getTime();

  if (signals.activatedAt) {
    if (signals.activeMonitorCount === 0) {
      reasons.push("Activated but no monitor is currently active");
      return { state: "at_risk", reasons, signals };
    }
    if (signals.verifiedChannelCount === 0) {
      reasons.push("Activated but no verified alert channel remains");
      return { state: "at_risk", reasons, signals };
    }
    if (lastActivityAge < 7 * 24 * 60 * 60 * 1000) {
      reasons.push("Activated with recent product activity");
      return { state: "engaged", reasons, signals };
    }
    reasons.push("Activated; monitoring continues without recent changes");
    return { state: "activated", reasons, signals };
  }

  if (signals.firstRealCheckAt) {
    if (lastActivityAge > INACTIVE_AFTER_MS && signals.activeMonitorCount === 0) {
      reasons.push("First value reached but the organization went quiet");
      return { state: "inactive", reasons, signals };
    }
    reasons.push("First real check completed; activation incomplete");
    return { state: "first_value", reasons, signals };
  }

  if (signals.activeMonitorCount > 0 || signals.draftMonitorCount > 0) {
    reasons.push(
      signals.activeMonitorCount > 0
        ? "Monitor active; awaiting first scheduled result"
        : "Monitor draft in progress",
    );
    return { state: "setup_in_progress", reasons, signals };
  }

  if (orgAge > INACTIVE_AFTER_MS) {
    reasons.push("No monitor created and no activity for 30 days");
    return { state: "inactive", reasons, signals };
  }

  if (orgAge > SETUP_STALLED_AFTER_MS) {
    reasons.push("No active monitor 72 hours after creation");
    return { state: "setup_stalled", reasons, signals };
  }

  reasons.push("Recently created");
  return { state: "new", reasons, signals };
}

/**
 * Persist the assessed state. Writes lifecycle_states (current) and appends a
 * lifecycle_events row only on transition, so the event log stays meaningful.
 */
export async function syncLifecycleState(
  organizationId: string,
): Promise<LifecycleAssessment> {
  const db = serviceClient();
  const assessment = await assessLifecycleState(organizationId);

  const { data: current } = await db
    .from("lifecycle_states")
    .select("state")
    .eq("organization_id", organizationId)
    .maybeSingle();

  const previous = current?.state ?? null;
  if (previous === assessment.state) {
    await db
      .from("lifecycle_states")
      .update({
        reasons: assessment.reasons as never,
        computed_at: new Date().toISOString(),
        updated_at: new Date().toISOString(),
      })
      .eq("organization_id", organizationId);
    return assessment;
  }

  await db.from("lifecycle_states").upsert(
    {
      organization_id: organizationId,
      state: assessment.state,
      previous_state: previous,
      reasons: assessment.reasons as never,
      computed_at: new Date().toISOString(),
      updated_at: new Date().toISOString(),
    },
    { onConflict: "organization_id" },
  );

  await db.from("lifecycle_events").insert({
    organization_id: organizationId,
    event_type: "state_changed",
    detail: {
      from: previous,
      to: assessment.state,
      reasons: assessment.reasons,
    } as never,
  });

  return assessment;
}
