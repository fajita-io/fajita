"use server";

import { revalidatePath } from "next/cache";
import { z } from "zod";

import { recordAuditEvent } from "@/lib/app/audit";
import { DataFastGoals } from "@/lib/analytics/goals";
import { trackServerGoal } from "@/lib/analytics";
import { toActionError, type ActionResult } from "@/lib/app/actions/shared";

import { requireAffiliatePermission } from "../context";
import { APPROVED_DESTINATIONS } from "../destinations";
import {
  archiveCampaign,
  createCampaign,
  createCode,
  createLink,
} from "../links";

const destinationEnum = z.enum(
  APPROVED_DESTINATIONS as unknown as [string, ...string[]],
);

export async function createCodeAction(
  rawCode: string,
): Promise<ActionResult<{ code: string }>> {
  try {
    const { affiliate } = await requireAffiliatePermission(
      "affiliate.links.manage",
    );
    const code = await createCode(affiliate.id, rawCode);

    await recordAuditEvent({
      organizationId: null,
      actorUserId: affiliate.user_id,
      action: "affiliate.code_changed",
      targetType: "affiliate_code",
      targetId: code.id,
      summary: "Affiliate code created",
    });

    revalidatePath("/affiliate/links");
    return { ok: true, data: { code: code.code } };
  } catch (error) {
    return toActionError(error);
  }
}

const campaignSchema = z.object({
  name: z.string().trim().min(2).max(80),
  destination: destinationEnum.optional(),
  source: z.string().trim().max(64).optional(),
  medium: z.string().trim().max(64).optional(),
  contentLabel: z.string().trim().max(64).optional(),
});

export async function createCampaignAction(
  input: z.input<typeof campaignSchema>,
): Promise<ActionResult<{ id: string }>> {
  try {
    const { affiliate } = await requireAffiliatePermission(
      "affiliate.campaigns.manage",
    );
    const parsed = campaignSchema.parse(input);
    const campaign = await createCampaign(affiliate.id, {
      name: parsed.name,
      destination: parsed.destination ?? "/",
      source: parsed.source ?? null,
      medium: parsed.medium ?? null,
      contentLabel: parsed.contentLabel ?? null,
    });

    await recordAuditEvent({
      organizationId: null,
      actorUserId: affiliate.user_id,
      action: "affiliate.campaign_created",
      targetType: "affiliate_campaign",
      targetId: campaign.id,
      summary: "Affiliate campaign created",
    });
    await trackServerGoal({ name: DataFastGoals.affiliateCampaignCreated });

    revalidatePath("/affiliate/links");
    return { ok: true, data: { id: campaign.id } };
  } catch (error) {
    return toActionError(error);
  }
}

export async function archiveCampaignAction(
  campaignId: string,
): Promise<ActionResult> {
  try {
    const { affiliate } = await requireAffiliatePermission(
      "affiliate.campaigns.manage",
    );
    await archiveCampaign(affiliate.id, z.string().uuid().parse(campaignId));
    revalidatePath("/affiliate/links");
    return { ok: true };
  } catch (error) {
    return toActionError(error);
  }
}

const linkSchema = z.object({
  codeId: z.string().uuid(),
  destination: destinationEnum.optional(),
  campaignId: z.string().uuid().optional(),
  source: z.string().trim().max(64).optional(),
  medium: z.string().trim().max(64).optional(),
  contentLabel: z.string().trim().max(64).optional(),
});

export async function createLinkAction(
  input: z.input<typeof linkSchema>,
): Promise<ActionResult<{ id: string }>> {
  try {
    const { affiliate } = await requireAffiliatePermission(
      "affiliate.links.manage",
    );
    const parsed = linkSchema.parse(input);
    const link = await createLink(affiliate.id, {
      codeId: parsed.codeId,
      destination: parsed.destination ?? "/",
      campaignId: parsed.campaignId ?? null,
      source: parsed.source ?? null,
      medium: parsed.medium ?? null,
      contentLabel: parsed.contentLabel ?? null,
    });

    await recordAuditEvent({
      organizationId: null,
      actorUserId: affiliate.user_id,
      action: "affiliate.link_created",
      targetType: "affiliate_link",
      targetId: link.id,
      summary: "Affiliate link created",
    });
    await trackServerGoal({ name: DataFastGoals.affiliateLinkCreated });

    revalidatePath("/affiliate/links");
    return { ok: true, data: { id: link.id } };
  } catch (error) {
    return toActionError(error);
  }
}
