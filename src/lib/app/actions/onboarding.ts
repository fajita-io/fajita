"use server";

import { revalidatePath } from "next/cache";
import { z } from "zod";

import { requireOrganizationMembership } from "@/lib/auth/context";
import { serviceClient } from "@/lib/supabase/service";
import type { Database } from "@/lib/supabase/types";
import { DataFastGoals } from "@/lib/analytics/goals";
import { trackGoal } from "@/lib/analytics/server";
import { recordAuditEvent } from "@/lib/app/audit";
import {
  CURRENT_ONBOARDING_VERSION,
  FIRST_CONCERN_OPTIONS,
  OPTIONAL_STEP_KEYS,
  RESPONSIBILITY_ROLES,
  isKnownTourKey,
} from "@/lib/onboarding/definitions";
import { recordOnboardingEvent } from "@/lib/onboarding/activation";
import { toActionError, type ActionResult } from "./shared";

type OnboardingUpdate =
  Database["public"]["Tables"]["organization_onboarding"]["Update"];

const contextSchema = z.object({
  useCase: z.string().trim().min(1).max(200).optional(),
  firstConcern: z
    .enum(FIRST_CONCERN_OPTIONS.map((o) => o.key) as [string, ...string[]])
    .optional(),
  responsibilityRole: z
    .enum(RESPONSIBILITY_ROLES.map((r) => r.key) as [string, ...string[]])
    .optional(),
  monitoringScope: z.enum(["own", "client"]).optional(),
  serviceCount: z.string().trim().max(40).optional(),
  alertDestination: z.string().trim().max(120).optional(),
  plansStatusPage: z.boolean().optional(),
});

async function readSteps(organizationId: string): Promise<Record<string, boolean>> {
  const { data } = await serviceClient()
    .from("organization_onboarding")
    .select("steps")
    .eq("organization_id", organizationId)
    .maybeSingle();
  const raw = (data?.steps ?? {}) as Record<string, unknown>;
  const out: Record<string, boolean> = {};
  for (const [k, v] of Object.entries(raw)) out[k] = v === true;
  return out;
}

async function ensureRow(organizationId: string): Promise<void> {
  await serviceClient()
    .from("organization_onboarding")
    .upsert(
      { organization_id: organizationId },
      { onConflict: "organization_id", ignoreDuplicates: true },
    );
}

/** Save the product-context answers gathered during onboarding. */
export async function saveOnboardingContextAction(
  organizationId: string,
  input: z.input<typeof contextSchema>,
): Promise<ActionResult> {
  try {
    const access = await requireOrganizationMembership(organizationId);
    const parsed = contextSchema.parse(input);
    await ensureRow(organizationId);

    const patch: OnboardingUpdate = {};
    if (parsed.useCase !== undefined) patch.use_case = parsed.useCase;
    if (parsed.firstConcern !== undefined) patch.first_concern = parsed.firstConcern;
    if (parsed.responsibilityRole !== undefined) patch.responsibility_role = parsed.responsibilityRole;
    if (parsed.monitoringScope !== undefined) patch.monitoring_scope = parsed.monitoringScope;
    if (parsed.serviceCount !== undefined) patch.service_count = parsed.serviceCount;
    if (parsed.alertDestination !== undefined) patch.alert_destination = parsed.alertDestination;
    if (parsed.plansStatusPage !== undefined) patch.plans_status_page = parsed.plansStatusPage;

    const { error } = await serviceClient()
      .from("organization_onboarding")
      .update(patch)
      .eq("organization_id", organizationId);
    if (error) throw error;

    if (parsed.useCase !== undefined) {
      await recordOnboardingEvent({
        organizationId,
        userId: access.profile.id,
        eventType: "use_case_selected",
        stepKey: "use_case",
      });
      await trackGoal({ name: DataFastGoals.useCaseSelected }).catch(() => {});
    }
    if (parsed.responsibilityRole !== undefined) {
      await recordOnboardingEvent({
        organizationId,
        userId: access.profile.id,
        eventType: "role_selected",
        metadata: { role: parsed.responsibilityRole },
      });
      await trackGoal({
        name: DataFastGoals.responsibilitySelected,
        metadata: { role: parsed.responsibilityRole },
      }).catch(() => {});
    }

    await trackGoal({ name: DataFastGoals.onboardingStepCompleted, metadata: { step: "context" } }).catch(() => {});
    revalidatePath("/app/onboarding");
    revalidatePath("/app");
    return { ok: true };
  } catch (error) {
    return toActionError(error);
  }
}

const STEP_KEYS = ["timezone_confirmed", "invite_done", "notifications_reviewed"] as const;
const stepSchema = z.enum(STEP_KEYS);

/** Mark a discrete onboarding step done (idempotent). */
export async function markOnboardingStepAction(
  organizationId: string,
  step: (typeof STEP_KEYS)[number],
): Promise<ActionResult> {
  try {
    await requireOrganizationMembership(organizationId);
    const key = stepSchema.parse(step);
    await ensureRow(organizationId);

    const steps = await readSteps(organizationId);
    steps[key] = true;
    const { error } = await serviceClient()
      .from("organization_onboarding")
      .update({ steps: steps as unknown as OnboardingUpdate["steps"] })
      .eq("organization_id", organizationId);
    if (error) throw error;

    revalidatePath("/app/onboarding");
    revalidatePath("/app");
    return { ok: true };
  } catch (error) {
    return toActionError(error);
  }
}

/** Skip an optional onboarding step (records skip, still allows later). */
export async function skipOnboardingStepAction(
  organizationId: string,
  step: (typeof STEP_KEYS)[number],
): Promise<ActionResult> {
  try {
    await requireOrganizationMembership(organizationId);
    await trackGoal({ name: DataFastGoals.onboardingSkipped, metadata: { step } }).catch(() => {});
    return await markOnboardingStepAction(organizationId, step);
  } catch (error) {
    return toActionError(error);
  }
}

/** Mark onboarding complete for the organization and the current user. */
export async function completeOnboardingAction(
  organizationId: string,
): Promise<ActionResult> {
  try {
    const access = await requireOrganizationMembership(organizationId);
    await ensureRow(organizationId);
    const db = serviceClient();

    await db
      .from("organization_onboarding")
      .update({ completed_at: new Date().toISOString() })
      .eq("organization_id", organizationId)
      .is("completed_at", null);

    if (access.profile.onboarding_status !== "completed") {
      await db
        .from("user_profiles")
        .update({ onboarding_status: "completed" })
        .eq("id", access.profile.id);
    }

    await trackGoal({ name: DataFastGoals.onboardingComplete }).catch(() => {});
    revalidatePath("/app");
    return { ok: true };
  } catch (error) {
    return toActionError(error);
  }
}

/* ------------------------------------------------------------------ */
/* Phase 11: activation checklist, tours, dismissal                    */
/* ------------------------------------------------------------------ */

const optionalStepSchema = z
  .string()
  .refine((k) => OPTIONAL_STEP_KEYS.includes(k), "Unknown optional step");

/**
 * Skip an optional activation-checklist step. Core steps cannot be skipped:
 * they are derived from real product state and complete themselves. Skipping
 * records intent so reminders stay quiet; the step stays available later.
 */
export async function skipChecklistStepAction(
  organizationId: string,
  stepKey: string,
): Promise<ActionResult> {
  try {
    const access = await requireOrganizationMembership(organizationId);
    const key = optionalStepSchema.parse(stepKey);
    const db = serviceClient();

    const { error } = await db.from("organization_onboarding_steps").upsert(
      {
        organization_id: organizationId,
        version: CURRENT_ONBOARDING_VERSION,
        step_key: key,
        status: "skipped",
        skipped_at: new Date().toISOString(),
        completed_by_user_id: access.profile.id,
        source: "user",
      },
      { onConflict: "organization_id,version,step_key" },
    );
    if (error) throw error;

    await recordOnboardingEvent({
      organizationId,
      userId: access.profile.id,
      eventType: "step_skipped",
      stepKey: key,
    });
    await recordAuditEvent({
      organizationId,
      actorUserId: access.profile.id,
      action: "onboarding.step_skipped",
      targetType: "onboarding_step",
      summary: `Skipped optional setup step: ${key}`,
      metadata: { step: key, version: CURRENT_ONBOARDING_VERSION },
    });
    await trackGoal({ name: DataFastGoals.checklistStepSkipped, metadata: { step: key } }).catch(() => {});

    revalidatePath("/app");
    revalidatePath("/app/onboarding");
    return { ok: true };
  } catch (error) {
    return toActionError(error);
  }
}

/** Dismiss the activation checklist for the organization. Reversible. */
export async function dismissChecklistAction(
  organizationId: string,
): Promise<ActionResult> {
  try {
    const access = await requireOrganizationMembership(organizationId);
    await ensureRow(organizationId);

    const { error } = await serviceClient()
      .from("organization_onboarding")
      .update({ checklist_dismissed_at: new Date().toISOString() })
      .eq("organization_id", organizationId)
      .is("checklist_dismissed_at", null);
    if (error) throw error;

    await recordOnboardingEvent({
      organizationId,
      userId: access.profile.id,
      eventType: "checklist_dismissed",
    });
    await recordAuditEvent({
      organizationId,
      actorUserId: access.profile.id,
      action: "onboarding.checklist_dismissed",
      summary: "Dismissed the setup checklist",
    });
    await trackGoal({ name: DataFastGoals.checklistDismissed }).catch(() => {});

    revalidatePath("/app");
    return { ok: true };
  } catch (error) {
    return toActionError(error);
  }
}

/** Reopen a dismissed checklist (from settings or the command palette). */
export async function reopenChecklistAction(
  organizationId: string,
): Promise<ActionResult> {
  try {
    const access = await requireOrganizationMembership(organizationId);

    const { error } = await serviceClient()
      .from("organization_onboarding")
      .update({ checklist_dismissed_at: null })
      .eq("organization_id", organizationId);
    if (error) throw error;

    await recordOnboardingEvent({
      organizationId,
      userId: access.profile.id,
      eventType: "checklist_reopened",
    });
    await recordAuditEvent({
      organizationId,
      actorUserId: access.profile.id,
      action: "onboarding.checklist_reopened",
      summary: "Reopened the setup checklist",
    });
    await trackGoal({ name: DataFastGoals.checklistReopened }).catch(() => {});

    revalidatePath("/app");
    return { ok: true };
  } catch (error) {
    return toActionError(error);
  }
}

const tourStateSchema = z.object({
  tourKey: z.string().refine(isKnownTourKey, "Unknown tour"),
  state: z.enum(["started", "completed", "dismissed"]),
});

interface TourRecord {
  status: "started" | "completed" | "dismissed";
  updated_at: string;
  completions?: number;
}

/**
 * Record per-user tour progress. Replays (starting a tour that was already
 * completed or dismissed) are tracked separately from the original run so
 * onboarding analytics stay honest.
 */
export async function recordTourStateAction(
  organizationId: string,
  input: z.input<typeof tourStateSchema>,
): Promise<ActionResult> {
  try {
    const access = await requireOrganizationMembership(organizationId);
    const { tourKey, state } = tourStateSchema.parse(input);
    const db = serviceClient();
    const userId = access.profile.id;

    const { data: row } = await db
      .from("user_onboarding")
      .select("tours, replay_count")
      .eq("user_id", userId)
      .maybeSingle();

    const tours = (row?.tours ?? {}) as unknown as Record<string, TourRecord>;
    const prior = tours[tourKey];
    const isReplay =
      state === "started" &&
      (prior?.status === "completed" || prior?.status === "dismissed");

    tours[tourKey] = {
      status: state,
      updated_at: new Date().toISOString(),
      completions:
        (prior?.completions ?? 0) + (state === "completed" ? 1 : 0),
    };

    const { error } = await db.from("user_onboarding").upsert(
      {
        user_id: userId,
        tours: tours as never,
        replay_count: (row?.replay_count ?? 0) + (isReplay ? 1 : 0),
      },
      { onConflict: "user_id" },
    );
    if (error) throw error;

    const eventType =
      state === "started"
        ? "tour_started"
        : state === "completed"
          ? "tour_completed"
          : "tour_dismissed";
    await recordOnboardingEvent({
      organizationId,
      userId,
      eventType,
      metadata: { tour: tourKey, replay: isReplay },
    });
    const goal = isReplay
      ? DataFastGoals.tourReplayed
      : state === "started"
        ? DataFastGoals.tourStarted
        : state === "completed"
          ? DataFastGoals.tourCompleted
          : DataFastGoals.tourDismissed;
    await trackGoal({ name: goal, metadata: { tour: tourKey } }).catch(() => {});

    return { ok: true };
  } catch (error) {
    return toActionError(error);
  }
}
