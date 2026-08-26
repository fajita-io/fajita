"use server";

import { revalidatePath } from "next/cache";
import { redirect } from "next/navigation";
import { z } from "zod";

import {
  requireAuthenticatedUser,
  requireOrganizationMembership,
  requireOrganizationPermission,
} from "@/lib/auth/context";
import { recordAuditEvent } from "@/lib/app/audit";
import { createOrganization } from "@/lib/app/organizations";
import { bindReferralOnOrgCreation } from "@/lib/affiliates/bind";
import { serviceClient } from "@/lib/supabase/service";
import type { Database } from "@/lib/supabase/types";
import { writeActiveOrgId } from "@/lib/app/active-org";
import { validateSlug } from "@/lib/app/slug";
import { markOnboardingStepAction } from "./onboarding";
import {
  buildPaymentSetupUrl,
  DEFAULT_SIGNUP_INTERVAL,
} from "@/lib/auth/paid-signup-flow";
import { isBillingInterval, isPlanId } from "@/lib/stripe/plans";
import { DataFastGoals } from "@/lib/analytics/goals";
import { trackGoal } from "@/lib/analytics/server";
import { toActionError, type ActionResult } from "./shared";

const createSchema = z.object({
  name: z.string().trim().min(1, "Name your organization.").max(120),
  slug: z.string().trim().min(1),
  timezone: z.string().trim().min(1).max(64).default("UTC"),
  planKey: z.string().optional(),
  interval: z.string().optional(),
});

export async function createOrganizationAction(
  input: z.input<typeof createSchema>,
): Promise<ActionResult<{ id: string; slug: string }>> {
  try {
    const parsed = createSchema.safeParse(input);
    if (!parsed.success) {
      const issue = parsed.error.issues[0];
      return {
        ok: false,
        error: issue?.message ?? "Check the organization details and try again.",
        kind: "validation",
      };
    }
    const profile = await requireAuthenticatedUser();
    const org = await createOrganization({
      profile,
      name: parsed.data.name,
      slug: parsed.data.slug,
      timezone: parsed.data.timezone,
    });
    await writeActiveOrgId(org.id);

    // Bind affiliate attribution from the first-party referral cookie at this
    // durable moment. Best-effort; never blocks organization creation.
    await bindReferralOnOrgCreation(org.id, profile.id).catch(() => {});

    if (profile.onboarding_status === "account_created" || profile.onboarding_status === "email_verified") {
      await serviceClient()
        .from("user_profiles")
        .update({ onboarding_status: "organization_created" })
        .eq("id", profile.id);
    }

    await trackGoal({
      name: DataFastGoals.organizationCreated,
      metadata: { role: "owner" },
    }).catch(() => {});

    revalidatePath("/app");
    return { ok: true, data: { id: org.id, slug: org.slug } };
  } catch (error) {
    return toActionError(error);
  }
}

export async function switchOrganizationAction(
  organizationId: string,
): Promise<ActionResult> {
  try {
    // Verifies active membership; throws if the caller does not belong.
    await requireOrganizationMembership(organizationId);
    await writeActiveOrgId(organizationId);
    await trackGoal({ name: DataFastGoals.organizationSwitched }).catch(() => {});
    revalidatePath("/app", "layout");
    return { ok: true };
  } catch (error) {
    return toActionError(error);
  }
}

const updateSchema = z.object({
  name: z.string().trim().min(1).max(120).optional(),
  defaultTimezone: z.string().trim().min(1).max(64).optional(),
});

export async function updateOrganizationAction(
  organizationId: string,
  input: z.input<typeof updateSchema>,
): Promise<ActionResult> {
  try {
    const access = await requireOrganizationPermission(organizationId, "org:update");
    const parsed = updateSchema.parse(input);

    const patch: Database["public"]["Tables"]["organizations"]["Update"] = {};
    if (parsed.name && parsed.name !== access.organization.name) {
      patch.name = parsed.name;
    }
    if (
      parsed.defaultTimezone &&
      parsed.defaultTimezone !== access.organization.default_timezone
    ) {
      patch.default_timezone = parsed.defaultTimezone;
    }
    if (Object.keys(patch).length === 0) return { ok: true };

    const { error } = await serviceClient()
      .from("organizations")
      .update(patch)
      .eq("id", organizationId);
    if (error) throw error;

    if (patch.name) {
      await recordAuditEvent({
        organizationId,
        actorUserId: access.profile.id,
        action: "organization.name_changed",
        targetType: "organization",
        targetId: organizationId,
        summary: `Renamed to ${patch.name}`,
      });
    }
    if (patch.default_timezone) {
      await recordAuditEvent({
        organizationId,
        actorUserId: access.profile.id,
        action: "organization.timezone_changed",
        targetType: "organization",
        targetId: organizationId,
        metadata: { timezone: patch.default_timezone },
      });
      await markOnboardingStepAction(organizationId, "timezone_confirmed").catch(() => {});
    }

    await trackGoal({ name: DataFastGoals.organizationUpdated }).catch(() => {});
    revalidatePath("/app/settings/organization");
    return { ok: true };
  } catch (error) {
    return toActionError(error);
  }
}

export async function updateOrganizationSlugAction(
  organizationId: string,
  slugInput: string,
): Promise<ActionResult> {
  try {
    const access = await requireOrganizationPermission(
      organizationId,
      "org:update_slug",
    );
    const check = validateSlug(slugInput);
    if (!check.ok) return { ok: false, error: check.reason };
    if (check.slug === access.organization.slug) return { ok: true };

    const { error } = await serviceClient()
      .from("organizations")
      .update({ slug: check.slug })
      .eq("id", organizationId);
    if (error) {
      if (error.code === "23505") {
        return { ok: false, error: "That handle is taken. Try another." };
      }
      throw error;
    }

    await recordAuditEvent({
      organizationId,
      actorUserId: access.profile.id,
      action: "organization.slug_changed",
      targetType: "organization",
      targetId: organizationId,
      metadata: { slug: check.slug },
    });
    revalidatePath("/app/settings/organization");
    return { ok: true };
  } catch (error) {
    return toActionError(error);
  }
}

/** Convenience wrapper used by the onboarding create form. Redirects to payment on success. */
export async function createFirstOrganizationAndContinue(
  input: z.input<typeof createSchema>,
): Promise<ActionResult> {
  const result = await createOrganizationAction(input);
  if (!result.ok) return result;

  const planKey =
    input.planKey && isPlanId(input.planKey) ? input.planKey : undefined;
  const interval =
    input.interval && isBillingInterval(input.interval)
      ? input.interval
      : DEFAULT_SIGNUP_INTERVAL;

  redirect(
    planKey ? buildPaymentSetupUrl(planKey, interval) : buildPaymentSetupUrl(),
  );
}
