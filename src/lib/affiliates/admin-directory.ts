import "server-only";

import { serviceClient } from "@/lib/supabase/service";
import { NotFound } from "@/lib/auth/errors";

import { getEarningsSummary, type EarningsSummary } from "./earnings";
import type { FraudState, MembershipState } from "./states";

/**
 * Platform-admin affiliate directory. Projects operator-safe views: default
 * code, membership/fraud/tax states, and earnings buckets. Never returns
 * customer identity, Stripe ids, tax numbers, or bank details.
 */

export interface AffiliateDirectoryRow {
  id: string;
  defaultCode: string | null;
  contactEmail: string | null;
  membershipState: MembershipState;
  fraudState: FraudState;
  taxState: string;
  payoutEligibilityState: string;
  approvedAt: string | null;
  createdAt: string;
}

export async function listAffiliates(
  limit = 100,
): Promise<AffiliateDirectoryRow[]> {
  const db = serviceClient();
  const { data } = await db
    .from("affiliates")
    .select(
      "id, membership_state, fraud_state, tax_state, payout_eligibility_state, approved_at, created_at",
    )
    .order("created_at", { ascending: false })
    .limit(limit);
  if (!data || data.length === 0) return [];

  const ids = data.map((a) => a.id);
  const [{ data: codes }, { data: profiles }] = await Promise.all([
    db
      .from("affiliate_codes")
      .select("affiliate_id, code")
      .in("affiliate_id", ids)
      .eq("is_default", true)
      .eq("status", "active"),
    db
      .from("affiliate_profiles")
      .select("affiliate_id, contact_email")
      .in("affiliate_id", ids),
  ]);

  const codeById = new Map((codes ?? []).map((c) => [c.affiliate_id, c.code]));
  const emailById = new Map(
    (profiles ?? []).map((p) => [p.affiliate_id, p.contact_email]),
  );

  return data.map((a) => ({
    id: a.id,
    defaultCode: codeById.get(a.id) ?? null,
    contactEmail: emailById.get(a.id) ?? null,
    membershipState: a.membership_state as MembershipState,
    fraudState: a.fraud_state as FraudState,
    taxState: a.tax_state,
    payoutEligibilityState: a.payout_eligibility_state,
    approvedAt: a.approved_at,
    createdAt: a.created_at,
  }));
}

export interface OpenFraudFlagView {
  id: string;
  flagType: string;
  severity: string;
  reviewState: string;
  createdAt: string;
}

export interface AffiliateAdminDetail {
  id: string;
  defaultCode: string | null;
  contactEmail: string | null;
  displayName: string | null;
  websiteUrl: string | null;
  country: string | null;
  membershipState: MembershipState;
  fraudState: FraudState;
  taxState: string;
  payoutEligibilityState: string;
  approvedAt: string | null;
  createdAt: string;
  earnings: EarningsSummary;
  openFlags: OpenFraudFlagView[];
  conversionCount: number;
  clickCount: number;
}

export async function getAffiliateAdminDetail(
  affiliateId: string,
): Promise<AffiliateAdminDetail> {
  const db = serviceClient();
  const { data: affiliate } = await db
    .from("affiliates")
    .select(
      "id, membership_state, fraud_state, tax_state, payout_eligibility_state, approved_at, created_at",
    )
    .eq("id", affiliateId)
    .maybeSingle();
  if (!affiliate) throw NotFound("We could not find that affiliate.");

  const [
    { data: code },
    { data: profile },
    earnings,
    { data: flags },
    { count: conversionCount },
    { count: clickCount },
  ] = await Promise.all([
    db
      .from("affiliate_codes")
      .select("code")
      .eq("affiliate_id", affiliateId)
      .eq("is_default", true)
      .eq("status", "active")
      .maybeSingle(),
    db
      .from("affiliate_profiles")
      .select("display_name, contact_email, website_url, country")
      .eq("affiliate_id", affiliateId)
      .maybeSingle(),
    getEarningsSummary(affiliateId),
    db
      .from("affiliate_fraud_flags")
      .select("id, flag_type, severity, review_state, created_at")
      .eq("affiliate_id", affiliateId)
      .in("review_state", ["open", "reviewing"])
      .order("created_at", { ascending: false })
      .limit(20),
    db
      .from("affiliate_conversions")
      .select("id", { count: "exact", head: true })
      .eq("affiliate_id", affiliateId),
    db
      .from("affiliate_clicks")
      .select("id", { count: "exact", head: true })
      .eq("affiliate_id", affiliateId),
  ]);

  return {
    id: affiliate.id,
    defaultCode: code?.code ?? null,
    contactEmail: profile?.contact_email ?? null,
    displayName: profile?.display_name ?? null,
    websiteUrl: profile?.website_url ?? null,
    country: profile?.country ?? null,
    membershipState: affiliate.membership_state as MembershipState,
    fraudState: affiliate.fraud_state as FraudState,
    taxState: affiliate.tax_state,
    payoutEligibilityState: affiliate.payout_eligibility_state,
    approvedAt: affiliate.approved_at,
    createdAt: affiliate.created_at,
    earnings,
    openFlags: (flags ?? []).map((f) => ({
      id: f.id,
      flagType: f.flag_type,
      severity: f.severity,
      reviewState: f.review_state,
      createdAt: f.created_at,
    })),
    conversionCount: conversionCount ?? 0,
    clickCount: clickCount ?? 0,
  };
}
