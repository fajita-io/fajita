import "server-only";

import type Stripe from "stripe";

import { getStripe } from "@/lib/stripe/server";
import { serviceClient } from "@/lib/supabase/service";
import { appUrl } from "@/lib/billing/checkout";
import { recordAuditEvent } from "@/lib/app/audit";

import type { AffiliateRow } from "./context";

/**
 * Payout provider integration (Stripe Connect Express).
 *
 * The platform pays affiliates by transferring to their connected Express
 * account. Stripe collects identity, bank, and tax details during Express
 * onboarding, so the affiliate never hands us bank or tax numbers directly and
 * we never store them. This module owns:
 *
 *   - ensuring a payout profile + connected account exist,
 *   - producing onboarding links,
 *   - reconciling the connected account's status, capabilities, and tax
 *     readiness back into our own tables.
 *
 * When Connect is not configured (STRIPE_CONNECT_CLIENT_ID unset), onboarding
 * reports "not configured" and the affiliate falls back to a manual payout
 * profile that an operator settles by hand. Nothing here moves money; transfers
 * live in payouts.ts.
 */

export type ConnectAccountStatus =
  | "none"
  | "onboarding"
  | "restricted"
  | "enabled"
  | "disabled"
  | "deauthorized";

/** Whether Stripe Connect Express onboarding is available in this environment. */
export function stripeConnectConfigured(): boolean {
  return Boolean(process.env.STRIPE_CONNECT_CLIENT_ID);
}

export interface PayoutProfileView {
  provider: "stripe_connect" | "manual";
  connectedAccountId: string | null;
  accountStatus: ConnectAccountStatus;
  payoutHold: boolean;
  country: string | null;
  /** Whether the account can currently receive transfers and pay out. */
  enabled: boolean;
  /** Requirements Stripe still needs, if any (coarse, non-sensitive). */
  needsAttention: boolean;
}

interface PayoutProfileRow {
  affiliate_id: string;
  provider: "stripe_connect" | "manual";
  connected_account_id: string | null;
  account_status: ConnectAccountStatus;
  payout_hold: boolean;
  country: string | null;
}

/** Fetch or lazily create the affiliate's payout profile row. */
export async function ensurePayoutProfile(
  affiliateId: string,
): Promise<PayoutProfileRow> {
  const db = serviceClient();
  const { data } = await db
    .from("affiliate_payout_profiles")
    .select("affiliate_id, provider, connected_account_id, account_status, payout_hold, country")
    .eq("affiliate_id", affiliateId)
    .maybeSingle();
  if (data) return data as PayoutProfileRow;

  const provider = stripeConnectConfigured() ? "stripe_connect" : "manual";
  const { data: created, error } = await db
    .from("affiliate_payout_profiles")
    .insert({ affiliate_id: affiliateId, provider })
    .select("affiliate_id, provider, connected_account_id, account_status, payout_hold, country")
    .single();
  if (error) {
    // Lost a race: re-read.
    const { data: raced } = await db
      .from("affiliate_payout_profiles")
      .select("affiliate_id, provider, connected_account_id, account_status, payout_hold, country")
      .eq("affiliate_id", affiliateId)
      .single();
    return raced as PayoutProfileRow;
  }
  return created as PayoutProfileRow;
}

/** Map a Stripe account to our coarse status enum. */
function mapAccountStatus(account: Stripe.Account): ConnectAccountStatus {
  const disabledReason = account.requirements?.disabled_reason ?? null;
  const transfersActive =
    account.capabilities?.transfers === "active";
  if (!account.details_submitted) return "onboarding";
  if (disabledReason) return "restricted";
  if (transfersActive && account.payouts_enabled) return "enabled";
  return "restricted";
}

/** Coarse tax readiness derived from the connected account requirements. */
function deriveTaxStatus(account: Stripe.Account):
  | "not_required"
  | "required"
  | "needs_attention" {
  const req = account.requirements;
  const pending = [
    ...(req?.currently_due ?? []),
    ...(req?.past_due ?? []),
    ...(req?.eventually_due ?? []),
  ];
  const taxPending = pending.some(
    (field) =>
      field.includes("tax") ||
      field.includes("ssn") ||
      field.includes("id_number") ||
      field.includes("company.tax_id"),
  );
  if (account.payouts_enabled && !taxPending) return "not_required";
  if ((req?.past_due?.length ?? 0) > 0) return "needs_attention";
  return taxPending ? "required" : "not_required";
}

/** Ensure a connected Express account exists; returns its id, or null if Connect is off. */
async function ensureConnectedAccount(
  affiliate: AffiliateRow,
): Promise<string | null> {
  if (!stripeConnectConfigured()) return null;
  const db = serviceClient();
  const profile = await ensurePayoutProfile(affiliate.id);
  if (profile.connected_account_id) return profile.connected_account_id;

  const stripe = getStripe();
  const account = await stripe.accounts.create(
    {
      type: "express",
      capabilities: { transfers: { requested: true } },
      business_profile: {
        product_description: "Fajita affiliate partner payouts",
      },
      metadata: { affiliate_id: affiliate.id },
    },
    { idempotencyKey: `affiliate_account:${affiliate.id}` },
  );

  await db
    .from("affiliate_payout_profiles")
    .update({
      provider: "stripe_connect",
      connected_account_id: account.id,
      account_status: "onboarding",
    } as never)
    .eq("affiliate_id", affiliate.id);

  await recordAuditEvent({
    organizationId: null,
    actorUserId: affiliate.user_id,
    action: "affiliate.payout_setup_changed",
    targetType: "affiliate_payout_profile",
    targetId: affiliate.id,
    summary: "Connected account created for affiliate payouts",
  });

  return account.id;
}

export interface OnboardingResult {
  configured: boolean;
  url: string | null;
}

/**
 * Produce a Stripe Express onboarding (or update) link for the affiliate. When
 * Connect is unconfigured, returns { configured: false }.
 */
export async function createOnboardingLink(
  affiliate: AffiliateRow,
): Promise<OnboardingResult> {
  const accountId = await ensureConnectedAccount(affiliate);
  if (!accountId) return { configured: false, url: null };

  const stripe = getStripe();
  const base = appUrl();
  const link = await stripe.accountLinks.create({
    account: accountId,
    type: "account_onboarding",
    refresh_url: `${base}/affiliate/payouts?setup=refresh`,
    return_url: `${base}/affiliate/payouts?setup=return`,
  });
  return { configured: true, url: link.url };
}

/**
 * Reconcile the connected account's live state into our tables. Updates the
 * payout profile status/capabilities/requirements and mirrors tax readiness.
 * Safe to call often; it only reads Stripe and writes our own rows.
 */
export async function refreshAccountStatus(
  affiliate: AffiliateRow,
): Promise<PayoutProfileView> {
  const profile = await ensurePayoutProfile(affiliate.id);
  const db = serviceClient();

  if (profile.provider !== "stripe_connect" || !profile.connected_account_id) {
    return {
      provider: profile.provider,
      connectedAccountId: profile.connected_account_id,
      accountStatus: profile.account_status,
      payoutHold: profile.payout_hold,
      country: profile.country,
      enabled: profile.provider === "manual",
      needsAttention: false,
    };
  }

  const stripe = getStripe();
  const account = await stripe.accounts.retrieve(profile.connected_account_id);
  const status = mapAccountStatus(account);
  const req = account.requirements;
  const needsAttention =
    (req?.currently_due?.length ?? 0) > 0 ||
    (req?.past_due?.length ?? 0) > 0;

  await db
    .from("affiliate_payout_profiles")
    .update({
      account_status: status,
      country: account.country ?? profile.country,
      capabilities: (account.capabilities ?? {}) as never,
      requirements: {
        currently_due: req?.currently_due ?? [],
        past_due: req?.past_due ?? [],
        disabled_reason: req?.disabled_reason ?? null,
      } as never,
    } as never)
    .eq("affiliate_id", affiliate.id);

  // Mirror tax readiness. Express collects tax info during onboarding.
  const taxStatus = deriveTaxStatus(account);
  await db
    .from("affiliate_tax_profiles")
    .upsert(
      {
        affiliate_id: affiliate.id,
        country: account.country ?? null,
        status: taxStatus,
        provider_reference: account.id,
        verification_date:
          taxStatus === "not_required" ? new Date().toISOString() : null,
      } as never,
      { onConflict: "affiliate_id" },
    );

  return {
    provider: "stripe_connect",
    connectedAccountId: profile.connected_account_id,
    accountStatus: status,
    payoutHold: profile.payout_hold,
    country: account.country ?? profile.country,
    enabled: status === "enabled" && !profile.payout_hold,
    needsAttention,
  };
}

/** Read the stored payout profile view without hitting Stripe. */
export async function getPayoutProfileView(
  affiliateId: string,
): Promise<PayoutProfileView> {
  const profile = await ensurePayoutProfile(affiliateId);
  const enabled =
    profile.provider === "manual"
      ? true
      : profile.account_status === "enabled" && !profile.payout_hold;
  return {
    provider: profile.provider,
    connectedAccountId: profile.connected_account_id,
    accountStatus: profile.account_status,
    payoutHold: profile.payout_hold,
    country: profile.country,
    enabled,
    needsAttention: false,
  };
}
