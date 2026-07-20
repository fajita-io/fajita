import "server-only";

import { serviceClient } from "@/lib/supabase/service";
import type { Database } from "@/lib/supabase/types";
import {
  CURRENT_ONBOARDING_VERSION,
  ONBOARDING_V2_STEPS,
} from "@/lib/onboarding/definitions";
import {
  getActivationSignals,
  syncActivationMilestones,
  type ActivationSignals,
} from "@/lib/onboarding/activation";
import { countActiveMembers } from "./organizations";

export type OnboardingRow =
  Database["public"]["Tables"]["organization_onboarding"]["Row"];

export interface OnboardingStep {
  key: string;
  title: string;
  description: string;
  done: boolean;
  optional?: boolean;
  /** Locked steps belong to a later phase and are shown as unavailable. */
  locked?: boolean;
  lockedReason?: string;
  href?: string;
  /** Permission needed to act on the step (UI hides the link without it). */
  permission?: string | null;
  skipped?: boolean;
}

export interface OnboardingState {
  row: OnboardingRow | null;
  steps: OnboardingStep[];
  completedRequired: number;
  totalRequired: number;
  isComplete: boolean;
  /** Full activation per the centralized Phase 11 definition. */
  activated: boolean;
  dismissed: boolean;
  signals: ActivationSignals;
}

type StepFlags = Record<string, boolean>;

function flags(row: OnboardingRow | null): StepFlags {
  const raw = (row?.steps ?? {}) as Record<string, unknown>;
  const out: StepFlags = {};
  for (const [k, v] of Object.entries(raw)) out[k] = v === true;
  return out;
}

/**
 * Compute the onboarding checklist for an organization from real data
 * (onboarding version 2, the activation journey). Nothing here fabricates
 * state: every core step is derived from the database. Milestone timestamps
 * are synced as a side effect while the organization is not yet activated,
 * so the checklist is accurate across users and devices.
 */
export async function getOnboardingState(
  organizationId: string,
): Promise<OnboardingState> {
  const db = serviceClient();

  let signals: ActivationSignals;
  try {
    // Sync persists newly reached milestones (idempotent, guarded updates) and
    // returns live signals. For activated organizations this is read-only.
    signals = await syncActivationMilestones(organizationId);
  } catch (error) {
    console.error("[onboarding] syncActivationMilestones failed", error);
    signals = await getActivationSignals(organizationId);
  }

  const [{ data: row }, memberCount, { data: skipRows }] = await Promise.all([
    db
      .from("organization_onboarding")
      .select("*")
      .eq("organization_id", organizationId)
      .maybeSingle(),
    countActiveMembers(organizationId),
    db
      .from("organization_onboarding_steps")
      .select("step_key, status")
      .eq("organization_id", organizationId)
      .eq("version", CURRENT_ONBOARDING_VERSION)
      .eq("status", "skipped"),
  ]);

  const f = flags(row ?? null);
  const skipped = new Set((skipRows ?? []).map((s) => s.step_key));

  const doneByKey: Record<string, boolean> = {
    organization: true,
    first_monitor: signals.activeMonitorCount > 0,
    first_result: Boolean(signals.firstRealCheckAt),
    alert_channel: signals.verifiedChannelCount > 0,
    routing_rule: Boolean(signals.alertPathReadyAt),
    status_page: signals.publishedStatusPageCount > 0,
    component_mapped: Boolean(signals.statusPageReadyAt),
    use_case: Boolean(row?.use_case),
    invite: memberCount > 1 || f.invite_done === true,
    notifications: f.notifications_reviewed === true,
    ssl_monitor: signals.hasSslMonitor,
    heartbeat_monitor: signals.hasHeartbeatMonitor,
  };

  const steps: OnboardingStep[] = ONBOARDING_V2_STEPS.map((def) => {
    let description = def.description;
    if (
      def.key === "first_result" &&
      signals.activeMonitorCount > 0 &&
      !signals.firstRealCheckAt
    ) {
      description =
        "Your monitor is live. The first scheduled check runs at the configured interval; the result lands here.";
    }
    return {
      key: def.key,
      title: def.title,
      description,
      done: doneByKey[def.key] ?? false,
      optional: def.kind === "optional" || undefined,
      href: def.href ?? undefined,
      permission: def.permission,
      skipped: skipped.has(def.key) || undefined,
    };
  });

  const required = steps.filter((s) => !s.optional);
  const completedRequired = required.filter((s) => s.done).length;
  const activated = Boolean(signals.activatedAt);
  const isComplete = activated || completedRequired === required.length;

  return {
    row: row ?? null,
    steps,
    completedRequired,
    totalRequired: required.length,
    isComplete,
    activated,
    dismissed: Boolean(row?.checklist_dismissed_at),
    signals,
  };
}
