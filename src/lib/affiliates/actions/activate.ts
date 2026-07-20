"use server";

import { revalidatePath } from "next/cache";
import { z } from "zod";

import { requireAuthenticatedUser } from "@/lib/auth/context";
import { recordAuditEvent } from "@/lib/app/audit";
import { DataFastGoals } from "@/lib/analytics/goals";
import { trackServerGoal } from "@/lib/analytics";
import { toActionError, type ActionResult } from "@/lib/app/actions/shared";

import {
  AFFILIATE_PRIVACY_VERSION,
  AFFILIATE_TERMS_VERSION,
  activeTerms,
} from "../config";
import { requireAffiliateProgramAccess } from "../context";
import { ensureAffiliateAccount } from "../provisioning";

const activateSchema = z.object({
  acceptTerms: z.literal(true, {
    message: "You must accept the program terms.",
  }),
  country: z.string().trim().min(2).max(64).optional(),
});

/**
 * Activate the affiliate program from the in-app referrals page. Provisions the
 * account, default code, and referral link immediately after terms acceptance.
 */
export async function activateAffiliateAction(
  input: z.input<typeof activateSchema>,
): Promise<
  ActionResult<{ defaultLink: string; defaultCode: string; created: boolean }>
> {
  try {
    await requireAffiliateProgramAccess();
    const profile = await requireAuthenticatedUser();
    const parsed = activateSchema.parse(input);
    const terms = activeTerms();

    if (!profile.primary_email) {
      return {
        ok: false,
        error: "Add an email to your account before activating referrals.",
        kind: "validation",
      };
    }

    const result = await ensureAffiliateAccount({
      profileId: profile.id,
      email: profile.primary_email,
      displayName: profile.display_name,
      country: parsed.country ?? null,
      termsVersion: AFFILIATE_TERMS_VERSION,
      privacyVersion: AFFILIATE_PRIVACY_VERSION,
      termsSource: "app_referrals",
    });

    await recordAuditEvent({
      organizationId: null,
      actorUserId: profile.id,
      action: result.created ? "affiliate.approved" : "affiliate.terms_accepted",
      targetType: "affiliate",
      targetId: result.affiliate.id,
      summary: result.created
        ? "Affiliate account activated from referrals"
        : "Referrals page loaded for existing affiliate",
      metadata: {
        programVersion: terms.version,
        created: result.created,
        source: "app_referrals",
      },
    });

    if (result.created) {
      await trackServerGoal({
        name: DataFastGoals.affiliateApplicationApproved,
        metadata: { source: "app_referrals" },
      });
      await trackServerGoal({
        name: DataFastGoals.affiliateTermsAccepted,
        metadata: { source: "app_referrals" },
      });
    }

    revalidatePath("/app/referrals");
    revalidatePath("/affiliate");
    return {
      ok: true,
      data: {
        defaultLink: result.defaultLink,
        defaultCode: result.defaultCode,
        created: result.created,
      },
    };
  } catch (error) {
    return toActionError(error);
  }
}
