import "server-only";

import { serviceClient } from "@/lib/supabase/service";
import type { Database } from "@/lib/supabase/types";
import { Conflict, NotFound } from "@/lib/auth/errors";

import { ACTIVE_PROGRAM_VERSION, activeTerms } from "./config";

export type ApplicationRow = Database["public"]["Tables"]["affiliate_applications"]["Row"];

export interface ApplicationInput {
  email: string;
  country: string;
  websiteUrl: string | null;
  promotionMethods: string[];
  audienceDescription: string | null;
  audienceSizeBand: string | null;
  experience: string | null;
  relevance: string | null;
  disclosureMethod: string | null;
  usesCoupons: boolean;
  usesPaidSearch: boolean;
  usesEmailMarketing: boolean;
  isExistingCustomer: boolean;
  termsVersion: number;
  privacyVersion: number | null;
}

/** The caller's most recent application, if any. */
export async function getApplicationForProfile(
  profileId: string,
): Promise<ApplicationRow | null> {
  const db = serviceClient();
  const { data } = await db
    .from("affiliate_applications")
    .select("*")
    .eq("applicant_user_id", profileId)
    .order("created_at", { ascending: false })
    .limit(1)
    .maybeSingle();
  return data ?? null;
}

/** Is the profile already an approved affiliate? */
export async function profileIsAffiliate(profileId: string): Promise<boolean> {
  const db = serviceClient();
  const { data } = await db
    .from("affiliates")
    .select("id")
    .eq("user_id", profileId)
    .maybeSingle();
  return Boolean(data);
}

/**
 * Submit an application. Enforces one live application per user, respects prior
 * rejection cooldown and blocked/terminated status, and records terms
 * acceptance. Approval is handled by the caller after submit.
 */
export async function submitApplication(
  profileId: string,
  input: ApplicationInput,
  requestContext: Record<string, unknown> = {},
): Promise<ApplicationRow> {
  const db = serviceClient();

  if (await profileIsAffiliate(profileId)) {
    throw Conflict("You are already part of the affiliate program.");
  }

  const existing = await getApplicationForProfile(profileId);
  if (existing) {
    const liveStates = [
      "draft",
      "submitted",
      "under_review",
      "needs_information",
      "waitlisted",
    ];
    if (liveStates.includes(existing.state)) {
      throw Conflict("You already have an application in review.");
    }
    if (existing.state === "blocked") {
      throw Conflict("This account is not eligible to apply.");
    }
    if (existing.state === "rejected" && existing.decided_at) {
      const cooldownMs =
        activeTerms().reapplyCooldownDays * 24 * 60 * 60 * 1000;
      const readyAt = new Date(existing.decided_at).getTime() + cooldownMs;
      if (Date.now() < readyAt) {
        throw Conflict("You can reapply after the cooldown period ends.");
      }
    }
  }

  const { data, error } = await db
    .from("affiliate_applications")
    .insert({
      applicant_user_id: profileId,
      email: input.email,
      country: input.country,
      website_url: input.websiteUrl,
      promotion_methods: input.promotionMethods,
      audience_description: input.audienceDescription,
      audience_size_band: input.audienceSizeBand,
      experience: input.experience,
      relevance: input.relevance,
      disclosure_method: input.disclosureMethod,
      uses_coupons: input.usesCoupons,
      uses_paid_search: input.usesPaidSearch,
      uses_email_marketing: input.usesEmailMarketing,
      is_existing_customer: input.isExistingCustomer,
      program_version: ACTIVE_PROGRAM_VERSION,
      terms_version: input.termsVersion,
      privacy_version: input.privacyVersion,
      state: "submitted",
      submitted_at: new Date().toISOString(),
    })
    .select("*")
    .single();

  if (error) {
    // Unique violation on the one-live-application index.
    if (error.code === "23505") {
      throw Conflict("You already have an application in review.");
    }
    throw error;
  }

  await db.from("affiliate_terms_acceptances").insert({
    application_id: data.id,
    user_id: profileId,
    program_version: ACTIVE_PROGRAM_VERSION,
    terms_version: input.termsVersion,
    privacy_version: input.privacyVersion,
    request_context: sanitizeContext(requestContext) as never,
    source: "application",
  });

  return data;
}

export interface ApplicationListItem {
  id: string;
  email: string;
  country: string | null;
  websiteUrl: string | null;
  promotionMethods: string[];
  isExistingCustomer: boolean;
  state: string;
  submittedAt: string | null;
  createdAt: string;
}

/** Admin list of applications, optionally filtered by state. */
export async function listApplications(
  state?: string,
  limit = 100,
): Promise<ApplicationListItem[]> {
  const db = serviceClient();
  let query = db
    .from("affiliate_applications")
    .select(
      "id, email, country, website_url, promotion_methods, is_existing_customer, state, submitted_at, created_at",
    )
    .order("submitted_at", { ascending: false, nullsFirst: false })
    .limit(limit);
  if (state) query = query.eq("state", state);
  const { data, error } = await query;
  if (error) throw error;
  return (data ?? []).map((row) => ({
    id: row.id,
    email: row.email,
    country: row.country,
    websiteUrl: row.website_url,
    promotionMethods: row.promotion_methods ?? [],
    isExistingCustomer: row.is_existing_customer,
    state: row.state,
    submittedAt: row.submitted_at,
    createdAt: row.created_at,
  }));
}

export interface ApplicationDetail extends ApplicationRow {
  reviews: {
    id: string;
    action: string;
    reason: string | null;
    internalNotes: string | null;
    createdAt: string;
  }[];
}

/** Admin detail with review history. */
export async function getApplicationDetail(
  applicationId: string,
): Promise<ApplicationDetail | null> {
  const db = serviceClient();
  const { data } = await db
    .from("affiliate_applications")
    .select("*")
    .eq("id", applicationId)
    .maybeSingle();
  if (!data) return null;

  const { data: reviews } = await db
    .from("affiliate_application_reviews")
    .select("id, action, reason, internal_notes, created_at")
    .eq("application_id", applicationId)
    .order("created_at", { ascending: false });

  return {
    ...data,
    reviews: (reviews ?? []).map((r) => ({
      id: r.id,
      action: r.action,
      reason: r.reason,
      internalNotes: r.internal_notes,
      createdAt: r.created_at,
    })),
  };
}

export type ReviewDecision =
  | "reject"
  | "waitlist"
  | "request_information"
  | "block"
  | "escalate_fraud"
  | "note";

const DECISION_STATE: Partial<Record<ReviewDecision, string>> = {
  reject: "rejected",
  waitlist: "waitlisted",
  request_information: "needs_information",
  block: "blocked",
  escalate_fraud: "under_review",
};

const DECISION_IS_TERMINAL: Record<ReviewDecision, boolean> = {
  reject: true,
  waitlist: false,
  request_information: false,
  block: true,
  escalate_fraud: false,
  note: false,
};

/**
 * Record a non-approve review decision (approval lives in provisioning.ts).
 * Updates the application state and writes an audited review row. Reason is
 * shared with the applicant for reject/needs-information; internal notes are
 * admin-only.
 */
export async function reviewApplicationDecision(
  applicationId: string,
  reviewerId: string,
  decision: ReviewDecision,
  reason: string | null,
  internalNotes: string | null,
): Promise<ApplicationRow> {
  const db = serviceClient();
  const { data: application } = await db
    .from("affiliate_applications")
    .select("*")
    .eq("id", applicationId)
    .maybeSingle();
  if (!application) throw NotFound("We could not find that application.");

  if (["approved", "blocked", "rejected"].includes(application.state)) {
    throw Conflict("This application has already been decided.");
  }

  const nextState = DECISION_STATE[decision];
  const patch: Record<string, unknown> = {};
  if (nextState) patch.state = nextState;
  if (DECISION_IS_TERMINAL[decision]) {
    patch.decided_at = new Date().toISOString();
    patch.decided_by_user_id = reviewerId;
  }

  let updated = application;
  if (Object.keys(patch).length > 0) {
    const { data, error } = await db
      .from("affiliate_applications")
      .update(patch as never)
      .eq("id", applicationId)
      .select("*")
      .single();
    if (error) throw error;
    updated = data;
  }

  await db.from("affiliate_application_reviews").insert({
    application_id: applicationId,
    reviewer_user_id: reviewerId,
    action: decision,
    reason: reason?.trim() || null,
    internal_notes: internalNotes?.trim() || null,
  });

  return updated;
}

/** Count applications awaiting review, for the admin overview. */
export async function countPendingApplications(): Promise<number> {
  const db = serviceClient();
  const { count } = await db
    .from("affiliate_applications")
    .select("id", { count: "exact", head: true })
    .in("state", ["submitted", "under_review", "needs_information"]);
  return count ?? 0;
}

/** Bounded request context (never store full headers or precise data). */
function sanitizeContext(ctx: Record<string, unknown>): Record<string, unknown> {
  const out: Record<string, unknown> = {};
  for (const key of ["country", "userAgentCategory", "acceptedAt"]) {
    if (ctx[key] != null) out[key] = String(ctx[key]).slice(0, 128);
  }
  return out;
}
