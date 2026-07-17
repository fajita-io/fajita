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
import { submitApplication } from "../applications";

const applySchema = z.object({
  email: z.string().trim().email("Enter a valid email.").max(254),
  country: z.string().trim().min(2, "Select your country.").max(64),
  websiteUrl: z
    .string()
    .trim()
    .max(2048)
    .optional()
    .transform((v) => (v ? v : null)),
  promotionMethods: z.array(z.string().trim().max(64)).max(12).default([]),
  audienceDescription: z
    .string()
    .trim()
    .max(2000)
    .optional()
    .transform((v) => (v ? v : null)),
  audienceSizeBand: z
    .string()
    .trim()
    .max(64)
    .optional()
    .transform((v) => (v ? v : null)),
  relevance: z
    .string()
    .trim()
    .max(2000)
    .optional()
    .transform((v) => (v ? v : null)),
  disclosureMethod: z
    .string()
    .trim()
    .max(500)
    .optional()
    .transform((v) => (v ? v : null)),
  usesCoupons: z.boolean().default(false),
  usesPaidSearch: z.boolean().default(false),
  usesEmailMarketing: z.boolean().default(false),
  isExistingCustomer: z.boolean().default(false),
  acceptTerms: z.literal(true, {
    message: "You must accept the program terms.",
  }),
});

export type ApplyInput = z.input<typeof applySchema>;

/**
 * Submit an affiliate application. Requires sign-in (identity comes from the
 * session, never a form field). Gated to the published program, or platform
 * admins during pre-launch preview. Never auto-approves.
 */
export async function submitApplicationAction(
  input: ApplyInput,
): Promise<ActionResult<{ status: "submitted" }>> {
  try {
    await requireAffiliateProgramAccess();
    const profile = await requireAuthenticatedUser();
    const parsed = applySchema.parse(input);
    const terms = activeTerms();

    await submitApplication(
      profile.id,
      {
        email: parsed.email,
        country: parsed.country,
        websiteUrl: parsed.websiteUrl,
        promotionMethods: parsed.promotionMethods,
        audienceDescription: parsed.audienceDescription,
        audienceSizeBand: parsed.audienceSizeBand,
        experience: null,
        relevance: parsed.relevance,
        disclosureMethod: parsed.disclosureMethod,
        usesCoupons: parsed.usesCoupons,
        usesPaidSearch: parsed.usesPaidSearch,
        usesEmailMarketing: parsed.usesEmailMarketing,
        isExistingCustomer: parsed.isExistingCustomer,
        termsVersion: AFFILIATE_TERMS_VERSION,
        privacyVersion: AFFILIATE_PRIVACY_VERSION,
      },
      { country: parsed.country, acceptedAt: new Date().toISOString() },
    );

    await recordAuditEvent({
      organizationId: null,
      actorUserId: profile.id,
      action: "affiliate.application_submitted",
      targetType: "affiliate_application",
      summary: "Affiliate application submitted",
      metadata: {
        country: parsed.country,
        existingCustomer: parsed.isExistingCustomer,
        programVersion: terms.version,
      },
    });

    await trackServerGoal({
      name: DataFastGoals.affiliateApplicationSubmitted,
      metadata: { existing_customer: parsed.isExistingCustomer },
    });

    revalidatePath("/affiliates");
    return { ok: true, data: { status: "submitted" } };
  } catch (error) {
    return toActionError(error);
  }
}
