"use server";

import { revalidatePath } from "next/cache";
import { z } from "zod";

import { requirePlatformAdmin } from "@/lib/auth/context";
import { recordAuditEvent } from "@/lib/app/audit";
import { DataFastGoals } from "@/lib/analytics/goals";
import { trackServerGoal } from "@/lib/analytics";
import { toActionError, type ActionResult } from "@/lib/app/actions/shared";

import {
  reviewApplicationDecision,
  type ReviewDecision,
} from "../applications";
import { approveApplication, setMembershipState } from "../provisioning";
import { queueAffiliateNotification } from "../notifications";
import type { MembershipState } from "../states";

const uuid = z.string().uuid();

/** Approve an application and provision the affiliate. Platform admin only. */
export async function approveApplicationAction(
  applicationId: string,
): Promise<ActionResult<{ affiliateId: string; defaultCode: string }>> {
  try {
    const admin = await requirePlatformAdmin();
    const id = uuid.parse(applicationId);
    const result = await approveApplication(id, admin.id);

    await recordAuditEvent({
      organizationId: null,
      actorUserId: admin.id,
      actorType: "platform_admin",
      action: "affiliate.approved",
      targetType: "affiliate",
      targetId: result.affiliate.id,
      summary: "Affiliate application approved",
    });
    await trackServerGoal({ name: DataFastGoals.affiliateApplicationApproved });

    return {
      ok: true,
      data: {
        affiliateId: result.affiliate.id,
        defaultCode: result.defaultCode,
      },
    };
  } catch (error) {
    return toActionError(error);
  }
}

const reviewSchema = z.object({
  applicationId: uuid,
  decision: z.enum([
    "reject",
    "waitlist",
    "request_information",
    "block",
    "escalate_fraud",
    "note",
  ]),
  reason: z.string().trim().max(1000).optional(),
  internalNotes: z.string().trim().max(2000).optional(),
});

const DECISION_AUDIT: Record<
  ReviewDecision,
  Parameters<typeof recordAuditEvent>[0]["action"]
> = {
  reject: "affiliate.rejected",
  waitlist: "affiliate.waitlisted",
  request_information: "affiliate.information_requested",
  block: "affiliate.blocked",
  escalate_fraud: "affiliate.fraud_review_opened",
  note: "affiliate.application_reviewed",
};

/** Record a non-approve application decision. Platform admin only. */
export async function reviewApplicationAction(
  input: z.input<typeof reviewSchema>,
): Promise<ActionResult<{ state: string }>> {
  try {
    const admin = await requirePlatformAdmin();
    const parsed = reviewSchema.parse(input);
    const updated = await reviewApplicationDecision(
      parsed.applicationId,
      admin.id,
      parsed.decision as ReviewDecision,
      parsed.reason ?? null,
      parsed.internalNotes ?? null,
    );

    await recordAuditEvent({
      organizationId: null,
      actorUserId: admin.id,
      actorType: "platform_admin",
      action: DECISION_AUDIT[parsed.decision as ReviewDecision],
      targetType: "affiliate_application",
      targetId: parsed.applicationId,
      summary: `Application ${parsed.decision}`,
    });
    if (parsed.decision === "reject") {
      await trackServerGoal({ name: DataFastGoals.affiliateApplicationRejected });
    }

    return { ok: true, data: { state: updated.state } };
  } catch (error) {
    return toActionError(error);
  }
}

const membershipSchema = z.object({
  affiliateId: uuid,
  next: z.enum(["active", "paused", "suspended", "terminated", "closed"]),
  reason: z.string().trim().max(1000).optional(),
});

const MEMBERSHIP_AUDIT: Record<
  MembershipState,
  Parameters<typeof recordAuditEvent>[0]["action"]
> = {
  active: "affiliate.reactivated",
  paused: "affiliate.paused",
  suspended: "affiliate.suspended",
  terminated: "affiliate.terminated",
  closed: "affiliate.closed",
};

/** Change an affiliate's membership state. Platform admin only. */
export async function setAffiliateMembershipAction(
  input: z.input<typeof membershipSchema>,
): Promise<ActionResult<{ state: MembershipState }>> {
  try {
    const admin = await requirePlatformAdmin();
    const parsed = membershipSchema.parse(input);
    const updated = await setMembershipState(
      parsed.affiliateId,
      parsed.next as MembershipState,
    );

    await recordAuditEvent({
      organizationId: null,
      actorUserId: admin.id,
      actorType: "platform_admin",
      action: MEMBERSHIP_AUDIT[parsed.next as MembershipState],
      targetType: "affiliate",
      targetId: parsed.affiliateId,
      summary: `Affiliate set to ${parsed.next}`,
      metadata: parsed.reason ? { hasReason: true } : {},
    });

    if (parsed.next === "closed") {
      await queueAffiliateNotification({
        affiliateId: parsed.affiliateId,
        kind: "account_closed",
        dedupeKey: `account_closed:${parsed.affiliateId}`,
      });
    }

    return { ok: true, data: { state: updated.membership_state as MembershipState } };
  } catch (error) {
    return toActionError(error);
  }
}
