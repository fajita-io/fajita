import "server-only";

import { serviceClient } from "@/lib/supabase/service";
import type { Database } from "@/lib/supabase/types";
import { FEATURE_REGISTRY, isStageAvailable } from "@/lib/app/feature-flags";
import type { BillingInterval, PlanId } from "@/lib/stripe/plans";
import { isPlanId } from "@/lib/stripe/plans";
import {
  BETA_ENTITLEMENTS,
  ENTITLEMENT_VERSION,
  LOCKED_ENTITLEMENTS,
  SELF_HOSTED_ENTITLEMENTS,
  effectiveEntitlements,
  type BillingAccessState,
  type PlanEntitlements,
} from "@/lib/billing/catalog";
import { deploymentConfig } from "@/lib/deployment/config";
import {
  deriveAccessState,
  type InternalSubscriptionStatus,
} from "@/lib/billing/subscription-state";
import { gracePhase, type GracePhase } from "@/lib/billing/grace-period";
import {
  BILLING_BETA_GRANT_ENABLED,
  BILLING_ENFORCEMENT_ENABLED,
} from "@/lib/billing/enforcement";
import { stripeLivePaymentsReady } from "@/lib/billing/stripe-account";
import { loadPromoGrantForOrg } from "@/lib/promo/grants";

type SubscriptionRow =
  Database["public"]["Tables"]["billing_subscriptions"]["Row"];
type OverrideRow =
  Database["public"]["Tables"]["billing_admin_overrides"]["Row"];

export interface OrgBillingState {
  organizationId: string;
  planKey: PlanId | null;
  interval: BillingInterval | null;
  status: InternalSubscriptionStatus;
  accessState: BillingAccessState;
  entitlements: PlanEntitlements;
  stripeCustomerId: string | null;
  stripeSubscriptionId: string | null;
  subscriptionId: string | null;
  currentPeriodEnd: string | null;
  cancelAtPeriodEnd: boolean;
  cancellationEffectiveAt: string | null;
  recurringAmountCents: number;
  currency: string;
  grace: { startedAt: string; restrictionAt: string | null; phase: GracePhase } | null;
  /** True when the org has no subscription and beta grant applies. */
  isBetaGrant: boolean;
  /** True when access comes from a redeemed promo code grant. */
  isPromoGrant: boolean;
  promoCode: string | null;
}

/**
 * Whether paid billing has launched (unbilled orgs get locked, not beta).
 * Active when billing is customer-visible unless BILLING_BETA_GRANT_ENABLED
 * opts back into free beta entitlements for staging or local dev.
 */
export function billingLaunched(): boolean {
  if (!isStageAvailable(FEATURE_REGISTRY.billing.stage)) return false;
  if (BILLING_BETA_GRANT_ENABLED) return false;
  return true;
}

/** The current live subscription for an org, or the most recent one. */
export async function loadCurrentSubscription(
  organizationId: string,
): Promise<SubscriptionRow | null> {
  const db = serviceClient();
  const { data, error } = await db
    .from("billing_subscriptions")
    .select("*")
    .eq("organization_id", organizationId)
    .order("created_at", { ascending: false });
  if (error) throw error;
  const rows = data ?? [];
  const live = rows.find(
    (r) =>
      r.status !== "canceled" &&
      r.status !== "incomplete_expired" &&
      r.status !== "none",
  );
  return live ?? rows[0] ?? null;
}

async function isInternalOrganization(
  organizationId: string,
): Promise<boolean> {
  const db = serviceClient();
  const { data, error } = await db
    .from("organizations")
    .select("is_internal")
    .eq("id", organizationId)
    .maybeSingle();
  if (error) throw error;
  return data?.is_internal === true;
}

/** Platform self-monitoring orgs bypass billing lockout and always run checks. */
function internalOrgBillingState(organizationId: string): OrgBillingState {
  return {
    organizationId,
    planKey: null,
    interval: null,
    status: "none",
    accessState: "active",
    entitlements: BETA_ENTITLEMENTS,
    stripeCustomerId: null,
    stripeSubscriptionId: null,
    subscriptionId: null,
    currentPeriodEnd: null,
    cancelAtPeriodEnd: false,
    cancellationEffectiveAt: null,
    recurringAmountCents: 0,
    currency: "usd",
    grace: null,
    isBetaGrant: true,
    isPromoGrant: false,
    promoCode: null,
  };
}

async function loadActiveOverrides(
  organizationId: string,
): Promise<OverrideRow[]> {
  const db = serviceClient();
  const nowIso = new Date().toISOString();
  const { data, error } = await db
    .from("billing_admin_overrides")
    .select("*")
    .eq("organization_id", organizationId)
    .lte("effective_at", nowIso);
  if (error) throw error;
  return (data ?? []).filter(
    (o) => !o.expires_at || o.expires_at > nowIso,
  );
}

/** Apply expiring admin overrides on top of the base entitlement set. */
export function applyOverrides(
  base: PlanEntitlements,
  overrides: { entitlement_key: string; override_value: unknown }[],
): PlanEntitlements {
  const next = { ...base } as unknown as Record<string, unknown>;
  for (const o of overrides) {
    if (o.entitlement_key in next) {
      // Trust only shape-compatible values; overrides are platform-admin only.
      next[o.entitlement_key] = o.override_value;
    }
  }
  return next as unknown as PlanEntitlements;
}

/**
 * Compute the org's billing state from persisted subscription + grace + admin
 * overrides. Pure read (no writes). This is the authority the product reads;
 * it never calls Stripe.
 */
/** Self-hosted installs bypass Stripe; every org gets full product entitlements. */
function selfHostedOrgBillingState(organizationId: string): OrgBillingState {
  return {
    organizationId,
    planKey: null,
    interval: null,
    status: "none",
    accessState: "active",
    entitlements: SELF_HOSTED_ENTITLEMENTS,
    stripeCustomerId: null,
    stripeSubscriptionId: null,
    subscriptionId: null,
    currentPeriodEnd: null,
    cancelAtPeriodEnd: false,
    cancellationEffectiveAt: null,
    recurringAmountCents: 0,
    currency: "usd",
    grace: null,
    isBetaGrant: false,
    isPromoGrant: false,
    promoCode: null,
  };
}

export async function computeOrgBillingState(
  organizationId: string,
): Promise<OrgBillingState> {
  if (deploymentConfig().isSelfHosted) {
    return selfHostedOrgBillingState(organizationId);
  }

  if (await isInternalOrganization(organizationId)) {
    return internalOrgBillingState(organizationId);
  }

  const db = serviceClient();
  const subscription = await loadCurrentSubscription(organizationId);
  let promoGrant = null;
  try {
    promoGrant = await loadPromoGrantForOrg(organizationId);
  } catch (error) {
    console.error("[billing] promo grant lookup failed", error);
  }

  // Promo code grant (no Stripe subscription required).
  if (promoGrant && !subscription) {
    const planKey = isPlanId(promoGrant.plan_key)
      ? promoGrant.plan_key
      : null;
    const overrides = await loadActiveOverrides(organizationId);
    const base = effectiveEntitlements(planKey, "active");
    return {
      organizationId,
      planKey,
      interval: null,
      status: "none",
      accessState: "active",
      entitlements: applyOverrides(base, overrides),
      stripeCustomerId: null,
      stripeSubscriptionId: null,
      subscriptionId: null,
      currentPeriodEnd: null,
      cancelAtPeriodEnd: false,
      cancellationEffectiveAt: null,
      recurringAmountCents: 0,
      currency: "usd",
      grace: null,
      isBetaGrant: false,
      isPromoGrant: true,
      promoCode: promoGrant.code,
    };
  }

  // No subscription: beta grant while pre-launch or live Stripe cannot charge yet.
  if (!subscription) {
    const launched = billingLaunched();
    let paymentsReady = false;
    try {
      paymentsReady = await stripeLivePaymentsReady();
    } catch (error) {
      console.error("[billing] Stripe payments readiness check failed", error);
    }
    const checkoutRequired =
      launched && paymentsReady && BILLING_ENFORCEMENT_ENABLED;
    const overrides = await loadActiveOverrides(organizationId);
    const base = checkoutRequired ? LOCKED_ENTITLEMENTS : BETA_ENTITLEMENTS;
    return {
      organizationId,
      planKey: null,
      interval: null,
      status: "none",
      accessState: checkoutRequired ? "none" : "active",
      entitlements: applyOverrides(base, overrides),
      stripeCustomerId: null,
      stripeSubscriptionId: null,
      subscriptionId: null,
      currentPeriodEnd: null,
      cancelAtPeriodEnd: false,
      cancellationEffectiveAt: null,
      recurringAmountCents: 0,
      currency: "usd",
      grace: null,
      isBetaGrant: !checkoutRequired,
      isPromoGrant: false,
      promoCode: null,
    };
  }

  const status = subscription.status as InternalSubscriptionStatus;
  const planKey = isPlanId(subscription.plan_key)
    ? subscription.plan_key
    : null;

  // Grace period: resolve current phase from the open record, if any.
  const { data: graceRow } = await db
    .from("billing_grace_periods")
    .select("*")
    .eq("organization_id", organizationId)
    .in("status", ["open", "restricted"])
    .order("started_at", { ascending: false })
    .limit(1)
    .maybeSingle();

  const phase: GracePhase | null = graceRow
    ? gracePhase(graceRow.started_at)
    : null;
  const restricted = phase === "restricted";

  const accessState = deriveAccessState({ status, restricted });

  const overrides = await loadActiveOverrides(organizationId);
  const base = effectiveEntitlements(planKey, accessState);
  const entitlements = applyOverrides(base, overrides);

  return {
    organizationId,
    planKey,
    interval: subscription.billing_interval as BillingInterval,
    status,
    accessState,
    entitlements,
    stripeCustomerId: subscription.stripe_customer_id,
    stripeSubscriptionId: subscription.stripe_subscription_id,
    subscriptionId: subscription.id,
    currentPeriodEnd: subscription.current_period_end,
    cancelAtPeriodEnd: subscription.cancel_at_period_end,
    cancellationEffectiveAt: subscription.cancellation_effective_at,
    recurringAmountCents: subscription.recurring_amount_cents,
    currency: subscription.currency,
    grace: graceRow
      ? {
          startedAt: graceRow.started_at,
          restrictionAt: graceRow.restriction_at,
          phase: phase ?? "warn",
        }
      : null,
    isBetaGrant: false,
    isPromoGrant: false,
    promoCode: null,
  };
}

/**
 * Persist the current entitlement snapshot for an org (idempotent). Writes one
 * "current" row (unique per org) and one historical row for audit/repro.
 */
export async function writeEntitlementSnapshot(
  organizationId: string,
  source = "webhook",
): Promise<OrgBillingState> {
  const state = await computeOrgBillingState(organizationId);
  const db = serviceClient();

  const payload = {
    organization_id: organizationId,
    subscription_id: state.subscriptionId,
    plan_key: state.planKey,
    entitlement_version: ENTITLEMENT_VERSION,
    access_state: state.accessState,
    entitlements: state.entitlements as unknown as Database["public"]["Tables"]["billing_entitlement_snapshots"]["Insert"]["entitlements"],
    calculated_at: new Date().toISOString(),
  };

  // Historical row.
  await db
    .from("billing_entitlement_snapshots")
    .insert({ ...payload, source } as never);

  // Current row (upsert on the partial-unique current index).
  await db
    .from("billing_entitlement_snapshots")
    .delete()
    .eq("organization_id", organizationId)
    .eq("source", "current");
  await db
    .from("billing_entitlement_snapshots")
    .insert({ ...payload, source: "current" } as never);

  return state;
}

/**
 * Fast entitlement read for enforcement. Prefers the stored current snapshot;
 * falls back to a live compute if none exists yet. Never calls Stripe.
 */
export async function getOrgEntitlements(
  organizationId: string,
): Promise<PlanEntitlements> {
  const db = serviceClient();
  const { data } = await db
    .from("billing_entitlement_snapshots")
    .select("entitlements, access_state")
    .eq("organization_id", organizationId)
    .eq("source", "current")
    .maybeSingle();

  if (data?.entitlements) {
    return data.entitlements as unknown as PlanEntitlements;
  }

  const state = await computeOrgBillingState(organizationId);
  return state.entitlements;
}
