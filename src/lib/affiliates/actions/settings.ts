"use server";

import { revalidatePath } from "next/cache";
import { z } from "zod";

import { recordAuditEvent } from "@/lib/app/audit";
import { toActionError, type ActionResult } from "@/lib/app/actions/shared";
import { Conflict } from "@/lib/auth/errors";

import { requireAffiliate, requireAffiliatePermission } from "../context";
import {
  updateAffiliateProfile,
  updateEmailPreferences,
} from "../profile";
import { queueAffiliateNotification } from "../notifications";
import { setMembershipState } from "../provisioning";
import type { MembershipState } from "../states";

const profileSchema = z.object({
  displayName: z.string().trim().max(80).optional(),
  contactEmail: z.string().trim().email().max(200).optional().or(z.literal("")),
  websiteUrl: z
    .string()
    .trim()
    .url()
    .max(300)
    .optional()
    .or(z.literal("")),
});

/** Update the affiliate's display name, contact email, and website. */
export async function updateProfileAction(
  input: z.input<typeof profileSchema>,
): Promise<ActionResult> {
  try {
    const { affiliate } = await requireAffiliatePermission(
      "affiliate.profile.update",
    );
    const parsed = profileSchema.parse(input);
    await updateAffiliateProfile(affiliate.id, {
      displayName: parsed.displayName?.trim() || null,
      contactEmail: parsed.contactEmail?.trim() || null,
      websiteUrl: parsed.websiteUrl?.trim() || null,
    });

    await recordAuditEvent({
      organizationId: null,
      actorUserId: affiliate.user_id,
      action: "affiliate.profile_updated",
      targetType: "affiliate_profile",
      targetId: affiliate.id,
      summary: "Affiliate profile updated",
    });

    revalidatePath("/affiliate/settings");
    return { ok: true };
  } catch (error) {
    return toActionError(error);
  }
}

const prefsSchema = z.object({
  conversionNotifications: z.boolean(),
  commissionNotifications: z.boolean(),
  payoutNotifications: z.boolean(),
  programUpdates: z.boolean(),
  educational: z.boolean(),
});

/** Update the affiliate's optional email preferences. */
export async function updateEmailPreferencesAction(
  input: z.input<typeof prefsSchema>,
): Promise<ActionResult> {
  try {
    const { affiliate } = await requireAffiliatePermission(
      "affiliate.profile.update",
    );
    const parsed = prefsSchema.parse(input);
    await updateEmailPreferences(affiliate.id, parsed);

    await recordAuditEvent({
      organizationId: null,
      actorUserId: affiliate.user_id,
      action: "affiliate.email_preferences_updated",
      targetType: "affiliate_profile",
      targetId: affiliate.id,
      summary: "Affiliate email preferences updated",
    });

    revalidatePath("/affiliate/settings");
    return { ok: true };
  } catch (error) {
    return toActionError(error);
  }
}

const closureSchema = z.object({
  confirm: z.literal("close my account", {
    message: "Type the confirmation phrase exactly to close your account.",
  }),
});

/**
 * Close the affiliate's own account. Cleared balances are still paid; history
 * remains readable. Requires an active or paused account and typed confirmation.
 */
export async function requestAccountClosureAction(
  input: { confirm: string },
): Promise<ActionResult> {
  try {
    const { affiliate } = await requireAffiliate();
    closureSchema.parse(input);

    const state = affiliate.membership_state as MembershipState;
    if (state !== "active" && state !== "paused") {
      throw Conflict("This account cannot be closed from its current state.");
    }

    await recordAuditEvent({
      organizationId: null,
      actorUserId: affiliate.user_id,
      action: "affiliate.closure_requested",
      targetType: "affiliate",
      targetId: affiliate.id,
      summary: "Affiliate requested account closure",
    });

    await setMembershipState(affiliate.id, "closed");

    await recordAuditEvent({
      organizationId: null,
      actorUserId: affiliate.user_id,
      action: "affiliate.closed",
      targetType: "affiliate",
      targetId: affiliate.id,
      summary: "Affiliate account closed",
    });

    await queueAffiliateNotification({
      affiliateId: affiliate.id,
      kind: "account_closed",
      dedupeKey: `account_closed:${affiliate.id}`,
    });

    revalidatePath("/affiliate/settings");
    revalidatePath("/affiliate");
    return { ok: true };
  } catch (error) {
    return toActionError(error);
  }
}
