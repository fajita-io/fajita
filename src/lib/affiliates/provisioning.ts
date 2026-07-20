import "server-only";

import { serviceClient } from "@/lib/supabase/service";
import { Conflict, NotFound } from "@/lib/auth/errors";

import {
  ACTIVE_PROGRAM_VERSION,
  AFFILIATE_PRIVACY_VERSION,
  AFFILIATE_TERMS_VERSION,
} from "./config";
import { normalizeCode, suggestCodeFromName } from "./code";
import { buildReferralUrl, getDefaultCode } from "./links";
import { queueAffiliateNotification } from "./notifications";
import { canTransitionMembership, type MembershipState } from "./states";
import type { AffiliateRow } from "./context";
import { getApplicationForProfile } from "./applications";

const PROGRAM_SLUG = "fajita-affiliate";

const APPROVABLE_APPLICATION_STATES = [
  "submitted",
  "under_review",
  "needs_information",
  "waitlisted",
] as const;

async function activeProgramId(): Promise<string> {
  const db = serviceClient();
  const { data } = await db
    .from("affiliate_programs")
    .select("id")
    .eq("slug", PROGRAM_SLUG)
    .maybeSingle();
  if (!data) throw NotFound("The affiliate program is not configured.");
  return data.id;
}

/** Find an unused normalized code near `base`, appending a numeric suffix. */
async function reserveDefaultCode(base: string): Promise<string> {
  const db = serviceClient();
  const seed = suggestCodeFromName(base) || "partner";
  for (let attempt = 0; attempt < 25; attempt += 1) {
    const candidate = attempt === 0 ? seed : `${seed}${attempt + 1}`;
    const normalized = normalizeCode(candidate);
    const { data } = await db
      .from("affiliate_codes")
      .select("id")
      .eq("normalized_code", normalized)
      .maybeSingle();
    if (!data) return candidate;
  }
  return `${seed}${Date.now().toString(36)}`;
}

export interface ApproveResult {
  affiliate: AffiliateRow;
  defaultCode: string;
  defaultLink: string;
}

export interface EnsureAffiliateResult extends ApproveResult {
  created: boolean;
}

export interface EnsureAffiliateInput {
  profileId: string;
  email: string;
  displayName?: string | null;
  country?: string | null;
  websiteUrl?: string | null;
  termsVersion?: number;
  privacyVersion?: number | null;
  termsSource: "app_referrals" | "application_auto" | "approval";
}

interface ProvisionRecordsInput {
  userId: string;
  email: string;
  country: string | null;
  websiteUrl: string | null;
  promotionMethods: string[];
  applicationId: string | null;
  termsVersion: number;
  privacyVersion: number | null;
  termsSource: string;
  codeBase: string;
}

async function resolveExistingAffiliate(
  affiliate: AffiliateRow,
): Promise<EnsureAffiliateResult> {
  const state = affiliate.membership_state as MembershipState;
  if (state === "terminated" || state === "closed") {
    throw Conflict(
      "This affiliate account is closed. Contact support if you need help.",
    );
  }
  if (state === "suspended") {
    throw Conflict(
      "Your affiliate account is under review. Check your email for next steps.",
    );
  }

  let defaultCode = await getDefaultCode(affiliate.id);
  if (!defaultCode) {
    const codeValue = await reserveDefaultCode(affiliate.user_id);
    const db = serviceClient();
    const { data: code, error } = await db
      .from("affiliate_codes")
      .insert({
        affiliate_id: affiliate.id,
        code: codeValue,
        normalized_code: normalizeCode(codeValue),
        is_default: true,
        status: "active",
      })
      .select("*")
      .single();
    if (error) throw error;
    await db.from("affiliate_links").insert({
      affiliate_id: affiliate.id,
      code_id: code.id,
      destination: "/",
    });
    defaultCode = code;
  }

  return {
    affiliate,
    defaultCode: defaultCode.code,
    defaultLink: buildReferralUrl({ code: defaultCode.code, destination: "/" }),
    created: false,
  };
}

async function provisionAffiliateRecords(
  input: ProvisionRecordsInput,
): Promise<ApproveResult> {
  const db = serviceClient();
  const programId = await activeProgramId();
  const now = new Date().toISOString();

  const { data: affiliate, error: affiliateError } = await db
    .from("affiliates")
    .insert({
      user_id: input.userId,
      program_id: programId,
      program_version: ACTIVE_PROGRAM_VERSION,
      membership_state: "active",
      approved_at: now,
    })
    .select("*")
    .single();
  if (affiliateError) throw affiliateError;

  await db.from("affiliate_profiles").insert({
    affiliate_id: affiliate.id,
    contact_email: input.email,
    country: input.country,
    website_url: input.websiteUrl,
    promotion_methods: input.promotionMethods,
  });

  await db.from("affiliate_email_preferences").insert({ affiliate_id: affiliate.id });

  const codeValue = await reserveDefaultCode(input.codeBase);
  const { data: code, error: codeError } = await db
    .from("affiliate_codes")
    .insert({
      affiliate_id: affiliate.id,
      code: codeValue,
      normalized_code: normalizeCode(codeValue),
      is_default: true,
      status: "active",
    })
    .select("*")
    .single();
  if (codeError) throw codeError;

  await db.from("affiliate_links").insert({
    affiliate_id: affiliate.id,
    code_id: code.id,
    destination: "/",
  });

  await db.from("affiliate_terms_acceptances").insert({
    affiliate_id: affiliate.id,
    application_id: input.applicationId,
    user_id: input.userId,
    program_version: ACTIVE_PROGRAM_VERSION,
    terms_version: input.termsVersion,
    privacy_version: input.privacyVersion,
    source: input.termsSource,
  });

  const defaultLink = buildReferralUrl({ code: code.code, destination: "/" });

  await queueAffiliateNotification({
    affiliateId: affiliate.id,
    kind: "approved",
    payload: { defaultLink },
    dedupeKey: `approved:${affiliate.id}`,
  });

  return {
    affiliate,
    defaultCode: code.code,
    defaultLink,
  };
}

/**
 * Idempotently ensure an affiliate account exists with a live default link.
 * Used by in-app referrals activation and auto-approval after application submit.
 */
export async function ensureAffiliateAccount(
  input: EnsureAffiliateInput,
): Promise<EnsureAffiliateResult> {
  const db = serviceClient();
  const termsVersion = input.termsVersion ?? AFFILIATE_TERMS_VERSION;
  const privacyVersion = input.privacyVersion ?? AFFILIATE_PRIVACY_VERSION;

  const { data: existingAffiliate } = await db
    .from("affiliates")
    .select("*")
    .eq("user_id", input.profileId)
    .maybeSingle();
  if (existingAffiliate) {
    return resolveExistingAffiliate(existingAffiliate);
  }

  const application = await getApplicationForProfile(input.profileId);
  if (application?.state === "blocked") {
    throw Conflict("This account is not eligible for the affiliate program.");
  }
  if (application && APPROVABLE_APPLICATION_STATES.includes(application.state as typeof APPROVABLE_APPLICATION_STATES[number])) {
    const approved = await approveApplication(application.id, null, {
      termsSource: input.termsSource,
    });
    return { ...approved, created: true };
  }

  const codeBase =
    input.websiteUrl ??
    input.displayName ??
    input.email.split("@")[0] ??
    "partner";

  const provisioned = await provisionAffiliateRecords({
    userId: input.profileId,
    email: input.email,
    country: input.country ?? null,
    websiteUrl: input.websiteUrl ?? null,
    promotionMethods: [],
    applicationId: null,
    termsVersion,
    privacyVersion,
    termsSource: input.termsSource,
    codeBase,
  });

  return { ...provisioned, created: true };
}

/**
 * Approve an application: provision the affiliate, default code, default link,
 * email preferences, and a terms-acceptance snapshot. Idempotent-ish: if the
 * applicant is already an affiliate we surface a conflict rather than double
 * provision. Money is never touched here.
 */
export async function approveApplication(
  applicationId: string,
  reviewerId: string | null,
  options: { termsSource?: string } = {},
): Promise<ApproveResult> {
  const db = serviceClient();

  const { data: application } = await db
    .from("affiliate_applications")
    .select("*")
    .eq("id", applicationId)
    .maybeSingle();
  if (!application) throw NotFound("We could not find that application.");

  if (!APPROVABLE_APPLICATION_STATES.includes(application.state as typeof APPROVABLE_APPLICATION_STATES[number])) {
    throw Conflict("This application cannot be approved from its current state.");
  }

  const { data: alreadyAffiliate } = await db
    .from("affiliates")
    .select("*")
    .eq("user_id", application.applicant_user_id)
    .maybeSingle();
  if (alreadyAffiliate) {
    return resolveExistingAffiliate(alreadyAffiliate);
  }

  const now = new Date().toISOString();
  const codeBase =
    application.website_url ?? application.email.split("@")[0] ?? "partner";

  const provisioned = await provisionAffiliateRecords({
    userId: application.applicant_user_id,
    email: application.email,
    country: application.country,
    websiteUrl: application.website_url,
    promotionMethods: application.promotion_methods ?? [],
    applicationId: application.id,
    termsVersion: application.terms_version ?? AFFILIATE_TERMS_VERSION,
    privacyVersion: application.privacy_version ?? AFFILIATE_PRIVACY_VERSION,
    termsSource: options.termsSource ?? "approval",
    codeBase,
  });

  await db
    .from("affiliate_applications")
    .update({
      state: "approved",
      decided_at: now,
      decided_by_user_id: reviewerId,
    })
    .eq("id", application.id);

  await db.from("affiliate_application_reviews").insert({
    application_id: application.id,
    reviewer_user_id: reviewerId,
    action: "approve",
  });

  return provisioned;
}

const MEMBERSHIP_TIMESTAMP: Partial<Record<MembershipState, string>> = {
  paused: "paused_at",
  suspended: "suspended_at",
  terminated: "terminated_at",
  closed: "closed_at",
};

/**
 * Move an affiliate to a new membership state with transition guards. Returns
 * the updated row. Callers record the audit event and any downstream freezes.
 */
export async function setMembershipState(
  affiliateId: string,
  next: MembershipState,
): Promise<AffiliateRow> {
  const db = serviceClient();
  const { data: current } = await db
    .from("affiliates")
    .select("*")
    .eq("id", affiliateId)
    .maybeSingle();
  if (!current) throw NotFound("We could not find that affiliate.");

  const from = current.membership_state as MembershipState;
  if (from === next) return current;
  if (!canTransitionMembership(from, next)) {
    throw Conflict("That status change is not allowed.");
  }

  const patch: Record<string, unknown> = { membership_state: next };
  const stamp = MEMBERSHIP_TIMESTAMP[next];
  if (stamp) patch[stamp] = new Date().toISOString();
  if (next === "active") {
    patch.paused_at = null;
    patch.suspended_at = null;
  }

  const { data, error } = await db
    .from("affiliates")
    .update(patch as never)
    .eq("id", affiliateId)
    .select("*")
    .single();
  if (error) throw error;
  return data;
}
