"use server";

import { revalidatePath } from "next/cache";

import { recordAuditEvent } from "@/lib/app/audit";
import { DataFastGoals } from "@/lib/analytics/goals";
import { trackServerGoal } from "@/lib/analytics";
import { toActionError, type ActionResult } from "@/lib/app/actions/shared";

import { requireAffiliatePermission } from "../context";
import {
  createOnboardingLink,
  refreshAccountStatus,
  stripeConnectConfigured,
} from "../payout-provider";

/**
 * Start (or resume) payout setup. Returns a Stripe Express onboarding URL the
 * client redirects to. When Connect is not configured, returns configured:false
 * so the UI can show the manual-payout fallback instead of a dead button.
 */
export async function startPayoutSetupAction(): Promise<
  ActionResult<{ configured: boolean; url: string | null }>
> {
  try {
    const { affiliate } = await requireAffiliatePermission(
      "affiliate.payout_profile.manage",
    );

    if (!stripeConnectConfigured()) {
      return { ok: true, data: { configured: false, url: null } };
    }

    const result = await createOnboardingLink(affiliate);

    await recordAuditEvent({
      organizationId: null,
      actorUserId: affiliate.user_id,
      action: "affiliate.payout_setup_changed",
      targetType: "affiliate_payout_profile",
      targetId: affiliate.id,
      summary: "Affiliate started payout setup",
    });
    await trackServerGoal({ name: DataFastGoals.affiliatePayoutSetupStarted });

    return { ok: true, data: { configured: true, url: result.url } };
  } catch (error) {
    return toActionError(error);
  }
}

/**
 * Reconcile the connected account status with Stripe and refresh the dashboard.
 * Called on return from onboarding and from a manual refresh control.
 */
export async function refreshPayoutStatusAction(): Promise<
  ActionResult<{ enabled: boolean; accountStatus: string }>
> {
  try {
    const { affiliate } = await requireAffiliatePermission(
      "affiliate.payout_profile.manage",
    );
    const view = await refreshAccountStatus(affiliate);

    if (view.enabled) {
      await trackServerGoal({
        name: DataFastGoals.affiliatePayoutSetupCompleted,
      });
    }

    revalidatePath("/affiliate/payouts");
    return {
      ok: true,
      data: { enabled: view.enabled, accountStatus: view.accountStatus },
    };
  } catch (error) {
    return toActionError(error);
  }
}
