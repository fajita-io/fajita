import "server-only";

import { serviceClient } from "@/lib/supabase/service";
import { Conflict, NotFound } from "@/lib/auth/errors";

import {
  ACTIVE_PROGRAM_VERSION,
  AFFILIATE_PRIVACY_VERSION,
  AFFILIATE_TERMS_VERSION,
} from "./config";
import { normalizeCode, suggestCodeFromName } from "./code";
import { buildReferralUrl } from "./links";
import { queueAffiliateNotification } from "./notifications";
import { canTransitionMembership, type MembershipState } from "./states";
import type { AffiliateRow } from "./context";

const PROGRAM_SLUG = "fajita-affiliate";

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

/**
 * Approve an application: provision the affiliate, default code, default link,
 * email preferences, and a terms-acceptance snapshot. Idempotent-ish: if the
 * applicant is already an affiliate we surface a conflict rather than double
 * provision. Money is never touched here.
 */
export async function approveApplication(
  applicationId: string,
  reviewerId: string,
): Promise<ApproveResult> {
  const db = serviceClient();

  const { data: application } = await db
    .from("affiliate_applications")
    .select("*")
    .eq("id", applicationId)
    .maybeSingle();
  if (!application) throw NotFound("We could not find that application.");

  const approvable = [
    "submitted",
    "under_review",
    "needs_information",
    "waitlisted",
  ];
  if (!approvable.includes(application.state)) {
    throw Conflict("This application cannot be approved from its current state.");
  }

  const { data: alreadyAffiliate } = await db
    .from("affiliates")
    .select("id")
    .eq("user_id", application.applicant_user_id)
    .maybeSingle();
  if (alreadyAffiliate) {
    throw Conflict("This person is already an affiliate.");
  }

  const programId = await activeProgramId();
  const now = new Date().toISOString();

  const { data: affiliate, error: affiliateError } = await db
    .from("affiliates")
    .insert({
      user_id: application.applicant_user_id,
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
    contact_email: application.email,
    country: application.country,
    website_url: application.website_url,
    promotion_methods: application.promotion_methods ?? [],
  });

  await db
    .from("affiliate_email_preferences")
    .insert({ affiliate_id: affiliate.id });

  const codeBase =
    application.website_url ?? application.email.split("@")[0] ?? "partner";
  const codeValue = await reserveDefaultCode(codeBase);
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
    application_id: application.id,
    user_id: application.applicant_user_id,
      program_version: ACTIVE_PROGRAM_VERSION,
      terms_version: application.terms_version ?? AFFILIATE_TERMS_VERSION,
      privacy_version: application.privacy_version ?? AFFILIATE_PRIVACY_VERSION,
    source: "approval",
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
