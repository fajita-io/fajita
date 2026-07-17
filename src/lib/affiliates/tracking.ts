import "server-only";

import { serviceClient } from "@/lib/supabase/service";
import { activeTerms } from "./config";
import { normalizeCode } from "./code";
import { type ApprovedDestination } from "./destinations";

/**
 * Server-side referral tracking and attribution binding.
 *
 * First-party only. No third-party cookies, no browser fingerprinting, no
 * cross-site identity. Attribution is bound to durable server-side records
 * (sessions -> user -> organization -> conversion), never trusted from the
 * browser at payment time. The last-eligible-touch model is enforced here and by
 * the one-active-attribution-per-organization unique index.
 */

export type BotClassification =
  | "human_likely"
  | "bot_likely"
  | "internal"
  | "test"
  | "duplicate"
  | "invalid"
  | "fraud_review";

const BOT_UA_PATTERN =
  /bot|crawl|spider|slurp|curl|wget|python-requests|headless|phantom|scrapy|httpclient|preview|monitor|pingdom|uptime|facebookexternalhit|embedly|okhttp|go-http/i;

/** Coarse, privacy-minimized bot classification from the user-agent only. */
export function classifyUserAgent(userAgent: string | null | undefined): BotClassification {
  if (!userAgent || userAgent.trim().length === 0) return "bot_likely";
  if (BOT_UA_PATTERN.test(userAgent)) return "bot_likely";
  if (userAgent.length > 512) return "invalid";
  return "human_likely";
}

/** Coarse user-agent category for storage (never the full UA string). */
export function userAgentCategory(userAgent: string | null | undefined): string {
  if (!userAgent) return "unknown";
  const ua = userAgent.toLowerCase();
  if (BOT_UA_PATTERN.test(ua)) return "bot";
  if (/mobile|android|iphone|ipad/.test(ua)) return "mobile";
  if (/mozilla|chrome|safari|firefox|edg/.test(ua)) return "desktop";
  return "other";
}

/** Normalize a referrer header to a bounded host only (no path, no query). */
export function normalizeReferrerDomain(referrer: string | null | undefined): string | null {
  if (!referrer) return null;
  try {
    const host = new URL(referrer).hostname.toLowerCase();
    return host.length > 0 && host.length <= 255 ? host : null;
  } catch {
    return null;
  }
}

export interface ReferralVisitInput {
  code: string;
  campaignSlug?: string | null;
  destination: ApprovedDestination;
  existingSessionId?: string | null;
  userAgent?: string | null;
  referrer?: string | null;
  countryRegion?: string | null;
}

export interface ReferralVisitResult {
  /** Session id to write to the referral cookie, or null when not attributable. */
  sessionId: string | null;
  botClassification: BotClassification;
  reason?: string;
}

/**
 * Record an eligible referral visit: validate the code and affiliate state,
 * classify the request, create or extend a first-party session, and record a
 * privacy-minimized click. Bot-likely and invalid requests are recorded for
 * quality metrics but never create or extend attribution.
 */
export async function recordReferralVisit(input: ReferralVisitInput): Promise<ReferralVisitResult> {
  const db = serviceClient();
  const normalized = normalizeCode(input.code);
  const bot = classifyUserAgent(input.userAgent);

  // Resolve the code -> affiliate, requiring an active code and an active
  // affiliate that is permitted to track.
  const { data: codeRow } = await db
    .from("affiliate_codes")
    .select("id, affiliate_id, status, affiliates!inner(id, membership_state)")
    .eq("normalized_code", normalized)
    .eq("status", "active")
    .maybeSingle();

  const affiliate = (codeRow?.affiliates ?? null) as { id: string; membership_state: string } | null;
  const trackable = affiliate?.membership_state === "active";

  if (!codeRow || !affiliate || !trackable) {
    // Record an invalid click for quality metrics without an affiliate link.
    return { sessionId: null, botClassification: bot, reason: "invalid_code" };
  }

  const affiliateId = affiliate.id;

  // Optional campaign resolution.
  let campaignId: string | null = null;
  if (input.campaignSlug) {
    const { data: campaign } = await db
      .from("affiliate_campaigns")
      .select("id")
      .eq("affiliate_id", affiliateId)
      .eq("slug", input.campaignSlug)
      .eq("status", "active")
      .maybeSingle();
    campaignId = campaign?.id ?? null;
  }

  const attributionEligible = bot === "human_likely";
  const now = new Date();
  const windowMs = activeTerms().attributionWindowDays * 24 * 60 * 60 * 1000;
  const expiresAt = new Date(now.getTime() + windowMs);

  let sessionId: string | null = null;

  if (attributionEligible) {
    // Reuse an existing active session for the SAME affiliate (extend it);
    // otherwise start a new session (a later touch by a different affiliate
    // becomes the new last-touch session the cookie points to).
    if (input.existingSessionId) {
      const { data: existing } = await db
        .from("affiliate_sessions")
        .select("id, affiliate_id, status")
        .eq("id", input.existingSessionId)
        .maybeSingle();
      if (
        existing &&
        existing.affiliate_id === affiliateId &&
        existing.status === "active"
      ) {
        await db
          .from("affiliate_sessions")
          .update({
            last_eligible_click_at: now.toISOString(),
            expires_at: expiresAt.toISOString(),
            campaign_id: campaignId,
          })
          .eq("id", existing.id);
        sessionId = existing.id;
      }
    }

    if (!sessionId) {
      const { data: created } = await db
        .from("affiliate_sessions")
        .insert({
          affiliate_id: affiliateId,
          campaign_id: campaignId,
          first_click_at: now.toISOString(),
          last_eligible_click_at: now.toISOString(),
          expires_at: expiresAt.toISOString(),
          model_version: activeTerms().version,
          status: "active",
        })
        .select("id")
        .single();
      sessionId = created?.id ?? null;
    }
  }

  // Record the click (always, for quality metrics), linked to the session when
  // one exists.
  await db.from("affiliate_clicks").insert({
    affiliate_id: affiliateId,
    campaign_id: campaignId,
    session_id: sessionId,
    destination: input.destination,
    bot_classification: bot,
    country_region: input.countryRegion ?? null,
    referrer_domain: normalizeReferrerDomain(input.referrer),
    user_agent_category: userAgentCategory(input.userAgent),
    attribution_eligible: attributionEligible,
    invalid_reason: attributionEligible ? null : bot,
    occurred_at: now.toISOString(),
  });

  return { sessionId, botClassification: bot };
}

/**
 * Attach a signed-in user to their referral session at the durable signup /
 * sign-in moment. Idempotent. Only attaches active, unexpired sessions.
 */
export async function attachUserToReferralSession(
  sessionId: string,
  userProfileId: string,
): Promise<void> {
  const db = serviceClient();
  await db
    .from("affiliate_sessions")
    .update({ user_id: userProfileId, user_attached_at: new Date().toISOString() })
    .eq("id", sessionId)
    .eq("status", "active")
    .is("user_id", null);
}

export interface OrgAttributionResult {
  attributed: boolean;
  reason?: string;
  affiliateId?: string;
}

/**
 * Bind (or replace) an organization's affiliate attribution from a referral
 * session, enforcing the launch policy:
 *   - existing paid organizations are never reattributed;
 *   - self-referrals (affiliate is a member of the org) are ineligible;
 *   - once a conversion exists, attribution is locked and never replaced;
 *   - otherwise last eligible touch wins (the prior active attribution is
 *     marked replaced and the new one becomes active).
 *
 * The one-active-attribution-per-organization unique index is the final guard.
 */
export async function attachOrganizationAttribution(
  sessionId: string,
  organizationId: string,
  source = "organization_created",
): Promise<OrgAttributionResult> {
  const db = serviceClient();

  const { data: session } = await db
    .from("affiliate_sessions")
    .select("id, affiliate_id, campaign_id, status, expires_at, first_click_at, last_eligible_click_at")
    .eq("id", sessionId)
    .maybeSingle();
  if (!session || session.status !== "active") {
    return { attributed: false, reason: "no_active_session" };
  }
  if (new Date(session.expires_at).getTime() < Date.now()) {
    return { attributed: false, reason: "session_expired" };
  }

  const affiliateId = session.affiliate_id;

  // Locked conversion already exists for this org: never replace.
  const { data: conversion } = await db
    .from("affiliate_conversions")
    .select("id")
    .eq("organization_id", organizationId)
    .maybeSingle();
  if (conversion) {
    return { attributed: false, reason: "conversion_locked" };
  }

  // Existing paid organization is never reattributed.
  const { data: sub } = await db
    .from("billing_subscriptions")
    .select("id, access_state")
    .eq("organization_id", organizationId)
    .in("access_state", ["active", "grace_period"])
    .maybeSingle();
  if (sub) {
    await db.from("affiliate_attributions").insert({
      organization_id: organizationId,
      affiliate_id: affiliateId,
      session_id: sessionId,
      model_version: activeTerms().version,
      eligibility_status: "ineligible",
      invalidated_reason: "existing_paid_customer",
      source,
      first_touch_at: session.first_click_at,
      last_touch_at: session.last_eligible_click_at,
    });
    return { attributed: false, reason: "existing_paid_customer" };
  }

  // Self-referral: the affiliate is a member of the organization.
  const { data: affiliate } = await db
    .from("affiliates")
    .select("user_id")
    .eq("id", affiliateId)
    .maybeSingle();
  if (affiliate) {
    const { data: membership } = await db
      .from("organization_members")
      .select("user_id")
      .eq("organization_id", organizationId)
      .eq("user_id", affiliate.user_id)
      .maybeSingle();
    if (membership) {
      await db.from("affiliate_attributions").insert({
        organization_id: organizationId,
        affiliate_id: affiliateId,
        session_id: sessionId,
        model_version: activeTerms().version,
        eligibility_status: "ineligible",
        invalidated_reason: "self_referral",
        source,
        first_touch_at: session.first_click_at,
        last_touch_at: session.last_eligible_click_at,
      });
      return { attributed: false, reason: "self_referral" };
    }
  }

  // Last-touch replacement: retire any prior active attribution, then insert the
  // new eligible one. The partial unique index guarantees only one active row.
  await db
    .from("affiliate_attributions")
    .update({ eligibility_status: "replaced", invalidated_reason: "last_touch_replaced" })
    .eq("organization_id", organizationId)
    .in("eligibility_status", ["eligible"]);

  const { error } = await db.from("affiliate_attributions").insert({
    organization_id: organizationId,
    affiliate_id: affiliateId,
    session_id: sessionId,
    campaign_id: session.campaign_id,
    model_version: activeTerms().version,
    eligibility_status: "eligible",
    source,
    first_touch_at: session.first_click_at,
    last_touch_at: session.last_eligible_click_at,
    attributed_at: new Date().toISOString(),
  });
  if (error) {
    return { attributed: false, reason: "attribution_conflict" };
  }

  await db
    .from("affiliate_sessions")
    .update({ organization_id: organizationId, org_attached_at: new Date().toISOString() })
    .eq("id", sessionId);

  return { attributed: true, affiliateId };
}
