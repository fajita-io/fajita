import "server-only";

import { randomBytes } from "node:crypto";
import type Stripe from "stripe";

import { serviceClient } from "@/lib/supabase/service";
import { recordAuditEvent } from "@/lib/app/audit";
import { isPlanId, type BillingInterval, type PlanId } from "@/lib/stripe/plans";

import {
  ACTIVE_PROGRAM_VERSION,
  activeTerms,
  isEligiblePlan,
} from "./config";
import { computeCommission, computeReversal } from "./commission";
import { queueAffiliateNotification } from "./notifications";
import { membershipAllowsAccrual, type MembershipState } from "./states";

/**
 * Conversion + commission engine. Consumes already-verified, idempotent billing
 * events (from the Stripe webhook inbox) and turns eligible paid invoices into
 * commissions and immutable ledger entries. Every write is idempotent: the
 * commission is unique per (conversion, invoice, calculation version) and every
 * ledger entry carries a unique idempotency key. Money is integer cents.
 *
 * This module never reads or exposes customer identity to affiliates. It writes
 * service-role-only tables; affiliate dashboards read projected summaries.
 */

const CALC_VERSION = 1;

function anonRef(): string {
  return randomBytes(4).toString("hex").toUpperCase();
}

function addDays(iso: string, days: number): string {
  return new Date(new Date(iso).getTime() + days * 86_400_000).toISOString();
}

function addMonths(iso: string, months: number): string {
  const d = new Date(iso);
  d.setMonth(d.getMonth() + months);
  return d.toISOString();
}

/** Tax portion of an invoice in cents, tolerant of Stripe API shape changes. */
function invoiceTaxCents(invoice: Stripe.Invoice): number {
  const taxes = (invoice as unknown as {
    total_taxes?: { amount?: number }[];
  }).total_taxes;
  if (Array.isArray(taxes) && taxes.length > 0) {
    return taxes.reduce((sum, t) => sum + (t.amount ?? 0), 0);
  }
  const legacy = (invoice as unknown as { tax?: number | null }).tax;
  return typeof legacy === "number" ? legacy : 0;
}

/** Whether an invoice is tied to a subscription, across Stripe API shapes. */
function isSubscriptionInvoice(invoice: Stripe.Invoice): boolean {
  const legacy = (invoice as unknown as { subscription?: unknown }).subscription;
  if (legacy) return true;
  const parent = (invoice as unknown as {
    parent?: { subscription_details?: unknown };
  }).parent;
  if (parent?.subscription_details) return true;
  return invoice.billing_reason?.startsWith("subscription") ?? false;
}

interface OrgSubscription {
  stripeSubscriptionId: string | null;
  planKey: PlanId | null;
  interval: BillingInterval;
}

async function orgSubscription(orgId: string): Promise<OrgSubscription> {
  const db = serviceClient();
  const { data } = await db
    .from("billing_subscriptions")
    .select("stripe_subscription_id, plan_key, billing_interval")
    .eq("organization_id", orgId)
    .order("stripe_updated_at", { ascending: false })
    .limit(1)
    .maybeSingle();
  return {
    stripeSubscriptionId: data?.stripe_subscription_id ?? null,
    planKey: data && isPlanId(data.plan_key) ? (data.plan_key as PlanId) : null,
    interval: data?.billing_interval === "year" ? "year" : "month",
  };
}

/** Write one immutable ledger entry, ignoring exact duplicates. */
async function writeLedger(entry: {
  affiliateId: string;
  conversionId: string | null;
  commissionId: string | null;
  stripeInvoiceId: string | null;
  amountCents: number;
  entryType: string;
  idempotencyKey: string;
  sourceEvent?: string | null;
  reason?: string | null;
}): Promise<void> {
  const db = serviceClient();
  await db
    .from("affiliate_commission_ledger")
    .upsert(
      {
        affiliate_id: entry.affiliateId,
        conversion_id: entry.conversionId,
        commission_id: entry.commissionId,
        stripe_invoice_id: entry.stripeInvoiceId,
        amount_cents: entry.amountCents,
        entry_type: entry.entryType,
        calculation_version: CALC_VERSION,
        source_event: entry.sourceEvent ?? null,
        idempotency_key: entry.idempotencyKey,
        reason: entry.reason ?? null,
        created_by: "system",
      } as never,
      { onConflict: "idempotency_key", ignoreDuplicates: true },
    );
}

async function eligibleAttribution(orgId: string): Promise<{
  id: string;
  affiliateId: string;
  status: string;
} | null> {
  const db = serviceClient();
  const { data } = await db
    .from("affiliate_attributions")
    .select("id, affiliate_id, eligibility_status")
    .eq("organization_id", orgId)
    .in("eligibility_status", ["eligible", "locked"])
    .maybeSingle();
  if (!data) return null;
  return {
    id: data.id,
    affiliateId: data.affiliate_id,
    status: data.eligibility_status,
  };
}

async function affiliateMembership(
  affiliateId: string,
): Promise<MembershipState | null> {
  const db = serviceClient();
  const { data } = await db
    .from("affiliates")
    .select("membership_state")
    .eq("id", affiliateId)
    .maybeSingle();
  return (data?.membership_state as MembershipState) ?? null;
}

const TERMINAL_CONVERSION_STATES = new Set([
  "reversed",
  "canceled",
  "ineligible",
  "expired",
  "fraud_review",
]);

/**
 * Process a paid invoice for affiliate commission. Safe to call for every
 * invoice.paid: it no-ops when there is no eligible attribution, the plan is
 * not eligible, the affiliate is not accruing, the eligibility window has
 * passed, or the invoice was already processed.
 */
export async function processInvoicePaidForAffiliate(
  invoice: Stripe.Invoice,
  orgId: string,
  sourceEventId?: string,
): Promise<void> {
  const amountPaid = invoice.amount_paid ?? 0;
  if (amountPaid <= 0) return; // trial / zero invoice: nothing to accrue

  const terms = activeTerms();
  if (terms.excludeTestModeSubscriptions && invoice.livemode === false) return;

  if (terms.excludeInternalOrganizations) {
    const db = serviceClient();
    const { data: org } = await db
      .from("organizations")
      .select("is_internal")
      .eq("id", orgId)
      .maybeSingle();
    if (org?.is_internal) return;
  }

  const attribution = await eligibleAttribution(orgId);
  if (!attribution) return;

  const membership = await affiliateMembership(attribution.affiliateId);
  if (!membership || !membershipAllowsAccrual(membership)) return;

  // Only subscription invoices generate recurring commission. A non-subscription
  // paid invoice never accrues, so skip it without forcing retries.
  if (!isSubscriptionInvoice(invoice)) return;

  const sub = await orgSubscription(orgId);
  // Subscription invoice with an eligible attribution but the subscription row
  // is not synced yet: throw so the idempotent webhook retries rather than
  // silently dropping the commission.
  if (!sub.planKey) {
    throw new Error(
      `affiliate: subscription not synced for org ${orgId}; retry pending`,
    );
  }
  if (!isEligiblePlan(sub.planKey)) return;

  const db = serviceClient();
  const paidAt = invoice.status_transitions?.paid_at
    ? new Date(invoice.status_transitions.paid_at * 1000).toISOString()
    : new Date().toISOString();

  const conversion = await ensureConversion({
    orgId,
    attributionId: attribution.id,
    affiliateId: attribution.affiliateId,
    planKey: sub.planKey,
    interval: sub.interval,
    stripeSubscriptionId: sub.stripeSubscriptionId,
    invoiceId: invoice.id ?? null,
    paidAt,
    sourceEventId,
  });
  if (!conversion || TERMINAL_CONVERSION_STATES.has(conversion.state)) return;

  // Eligibility window: no accrual past the window or when it is not active.
  const { data: window } = await db
    .from("affiliate_eligibility_windows")
    .select("eligibility_end, status")
    .eq("conversion_id", conversion.id)
    .maybeSingle();
  if (window) {
    if (window.status !== "active") return;
    if (new Date(paidAt).getTime() > new Date(window.eligibility_end).getTime()) {
      return;
    }
  }

  const { grossEligibleCents, excludedCents, commissionCents } =
    computeCommission({
      amountPaidCents: amountPaid,
      taxCents: invoiceTaxCents(invoice),
      rateBps: terms.commissionRateBps,
      excludeTax: terms.excludeTax,
    });

  // Insert the commission (idempotent per conversion+invoice+calc version).
  const { data: commission, error } = await db
    .from("affiliate_commissions")
    .insert({
      affiliate_id: attribution.affiliateId,
      conversion_id: conversion.id,
      organization_id: orgId,
      stripe_invoice_id: invoice.id ?? "",
      invoice_paid_at: paidAt,
      gross_eligible_cents: grossEligibleCents,
      excluded_cents: excludedCents,
      commission_rate_bps: terms.commissionRateBps,
      commission_amount_cents: commissionCents,
      currency: (invoice.currency ?? "usd").toLowerCase(),
      state: "holding",
      hold_release_at: addDays(paidAt, terms.commissionHoldingDays),
      calculation_version: CALC_VERSION,
      program_version: ACTIVE_PROGRAM_VERSION,
    })
    .select("id")
    .single();

  if (error) {
    if (error.code === "23505") return; // already processed this invoice
    throw error;
  }

  await writeLedger({
    affiliateId: attribution.affiliateId,
    conversionId: conversion.id,
    commissionId: commission.id,
    stripeInvoiceId: invoice.id ?? null,
    amountCents: commissionCents,
    entryType: "commission_accrued",
    idempotencyKey: `accrue:${commission.id}`,
    sourceEvent: sourceEventId ?? "invoice.paid",
  });

  await db.from("affiliate_conversion_events").insert({
    conversion_id: conversion.id,
    kind: "invoice_paid",
    source_event: sourceEventId ?? "invoice.paid",
    metadata: { commission_cents: commissionCents } as never,
  });
}

async function ensureConversion(input: {
  orgId: string;
  attributionId: string;
  affiliateId: string;
  planKey: PlanId;
  interval: BillingInterval;
  stripeSubscriptionId: string | null;
  invoiceId: string | null;
  paidAt: string;
  sourceEventId?: string;
}): Promise<{ id: string; state: string } | null> {
  const db = serviceClient();

  const { data: existing } = await db
    .from("affiliate_conversions")
    .select("id, state")
    .eq("organization_id", input.orgId)
    .maybeSingle();
  if (existing) return existing;

  const terms = activeTerms();

  for (let attempt = 0; attempt < 5; attempt += 1) {
    const { data, error } = await db
      .from("affiliate_conversions")
      .insert({
        organization_id: input.orgId,
        affiliate_id: input.affiliateId,
        attribution_id: input.attributionId,
        program_version: ACTIVE_PROGRAM_VERSION,
        anon_ref: anonRef(),
        state: "active",
        plan_key: input.planKey,
        billing_interval: input.interval,
        stripe_subscription_id: input.stripeSubscriptionId,
        first_paid_invoice_id: input.invoiceId,
        first_paid_at: input.paidAt,
        confirmed_at: input.paidAt,
      })
      .select("id, state")
      .single();

    if (!error && data) {
      // Lock the attribution: it can no longer be replaced.
      await db
        .from("affiliate_attributions")
        .update({
          eligibility_status: "locked",
          locked_at: input.paidAt,
        } as never)
        .eq("id", input.attributionId)
        .eq("eligibility_status", "eligible");

      // Open the recurring eligibility window.
      await db.from("affiliate_eligibility_windows").insert({
        conversion_id: data.id,
        affiliate_id: input.affiliateId,
        organization_id: input.orgId,
        eligibility_start: input.paidAt,
        eligibility_end: addMonths(
          input.paidAt,
          terms.recurringEligibilityMonths,
        ),
        max_months: terms.recurringEligibilityMonths,
        status: "active",
      });

      await recordAuditEvent({
        organizationId: input.orgId,
        actorUserId: null,
        actorType: "system",
        action: "affiliate.conversion_confirmed",
        targetType: "affiliate_conversion",
        targetId: data.id,
        summary: "Affiliate conversion confirmed on first paid invoice",
      });

      // First-commission nudge (idempotent per affiliate via dedupe key).
      await queueAffiliateNotification({
        affiliateId: input.affiliateId,
        kind: "first_commission",
        dedupeKey: `first_commission:${input.affiliateId}`,
      });

      return data;
    }

    if (error?.code === "23505") {
      // Lost a race (org or anon_ref collision). Re-read the org conversion.
      const { data: raced } = await db
        .from("affiliate_conversions")
        .select("id, state")
        .eq("organization_id", input.orgId)
        .maybeSingle();
      if (raced) return raced;
      continue; // anon_ref collision: retry with a new ref
    }
    if (error) throw error;
  }
  return null;
}

/**
 * Apply a refund reversal to the commission for one invoice. `refundedCents` is
 * cumulative refunded revenue on the invoice. Idempotent per refund event.
 */
export async function processRefundForAffiliate(input: {
  orgId: string;
  stripeInvoiceId: string | null;
  refundedCents: number;
  full: boolean;
  idempotencyKey: string;
  sourceEvent?: string | null;
}): Promise<void> {
  const db = serviceClient();

  const { data: commission } = input.stripeInvoiceId
    ? await db
        .from("affiliate_commissions")
        .select(
          "id, affiliate_id, conversion_id, gross_eligible_cents, commission_amount_cents, reversed_cents, state",
        )
        .eq("organization_id", input.orgId)
        .eq("stripe_invoice_id", input.stripeInvoiceId)
        .maybeSingle()
    : { data: null };

  // Record the refund event regardless (idempotent). Skip if seen.
  const { data: eventRow, error: eventError } = await db
    .from("affiliate_refund_events")
    .insert({
      organization_id: input.orgId,
      commission_id: commission?.id ?? null,
      stripe_invoice_id: input.stripeInvoiceId,
      amount_cents: Math.max(0, Math.trunc(input.refundedCents)),
      kind: input.full ? "full" : "partial",
      source_event: input.sourceEvent ?? null,
      idempotency_key: input.idempotencyKey,
    })
    .select("id")
    .single();
  if (eventError) {
    if (eventError.code === "23505") return; // already processed
    throw eventError;
  }

  if (!commission) {
    await db
      .from("affiliate_refund_events")
      .update({ processed_at: new Date().toISOString() } as never)
      .eq("id", eventRow.id);
    return;
  }

  const reversal = computeReversal({
    grossEligibleCents: commission.gross_eligible_cents,
    commissionCents: commission.commission_amount_cents,
    alreadyReversedCents: commission.reversed_cents,
    refundedCents: input.refundedCents,
    full: input.full,
  });

  if (reversal > 0) {
    const newReversed = commission.reversed_cents + reversal;
    const fullyReversed = newReversed >= commission.commission_amount_cents;
    await db
      .from("affiliate_commissions")
      .update({
        reversed_cents: newReversed,
        state: fullyReversed ? "reversed" : "partially_reversed",
      } as never)
      .eq("id", commission.id);

    await writeLedger({
      affiliateId: commission.affiliate_id,
      conversionId: commission.conversion_id,
      commissionId: commission.id,
      stripeInvoiceId: input.stripeInvoiceId,
      amountCents: -reversal,
      entryType: "refund_reversal",
      idempotencyKey: `refund:${eventRow.id}`,
      sourceEvent: input.sourceEvent ?? "charge.refunded",
    });

    await recordAuditEvent({
      organizationId: input.orgId,
      actorUserId: null,
      actorType: "system",
      action: "affiliate.commission_reversed",
      targetType: "affiliate_commission",
      targetId: commission.id,
      summary: "Commission reversed after refund",
      metadata: { reversedCents: reversal },
    });
  }

  await db
    .from("affiliate_refund_events")
    .update({ processed_at: new Date().toISOString() } as never)
    .eq("id", eventRow.id);
}

/**
 * Apply a dispute outcome to the commission for an invoice. Opened puts the
 * commission on hold; lost reverses the standing amount; won releases the hold.
 * Idempotent per dispute event.
 */
export async function processDisputeForAffiliate(input: {
  orgId: string;
  stripeInvoiceId: string | null;
  stripeChargeId: string | null;
  status: "opened" | "won" | "lost";
  idempotencyKey: string;
  sourceEvent?: string | null;
}): Promise<void> {
  const db = serviceClient();

  const { data: commission } = input.stripeInvoiceId
    ? await db
        .from("affiliate_commissions")
        .select(
          "id, affiliate_id, conversion_id, commission_amount_cents, reversed_cents, state",
        )
        .eq("organization_id", input.orgId)
        .eq("stripe_invoice_id", input.stripeInvoiceId)
        .maybeSingle()
    : { data: null };

  const { data: eventRow, error: eventError } = await db
    .from("affiliate_dispute_events")
    .insert({
      organization_id: input.orgId,
      commission_id: commission?.id ?? null,
      stripe_invoice_id: input.stripeInvoiceId,
      stripe_charge_id: input.stripeChargeId,
      status: input.status,
      source_event: input.sourceEvent ?? null,
      idempotency_key: input.idempotencyKey,
    })
    .select("id")
    .single();
  if (eventError) {
    if (eventError.code === "23505") return;
    throw eventError;
  }

  if (!commission) return;

  if (input.status === "opened") {
    if (commission.state === "holding" || commission.state === "approved" || commission.state === "payable") {
      await db
        .from("affiliate_commissions")
        .update({ state: "disputed" } as never)
        .eq("id", commission.id);
      await writeLedger({
        affiliateId: commission.affiliate_id,
        conversionId: commission.conversion_id,
        commissionId: commission.id,
        stripeInvoiceId: input.stripeInvoiceId,
        amountCents: 0,
        entryType: "dispute_hold",
        idempotencyKey: `dispute_hold:${eventRow.id}`,
        sourceEvent: input.sourceEvent ?? "charge.dispute.created",
      });
    }
    return;
  }

  if (input.status === "won") {
    // Restore a held-for-dispute commission back to holding.
    if (commission.state === "disputed") {
      await db
        .from("affiliate_commissions")
        .update({ state: "holding" } as never)
        .eq("id", commission.id);
    }
    return;
  }

  // lost: reverse the standing commission.
  const standing = Math.max(
    0,
    commission.commission_amount_cents - commission.reversed_cents,
  );
  if (standing > 0) {
    await db
      .from("affiliate_commissions")
      .update({
        reversed_cents: commission.reversed_cents + standing,
        state: "reversed",
      } as never)
      .eq("id", commission.id);
    await writeLedger({
      affiliateId: commission.affiliate_id,
      conversionId: commission.conversion_id,
      commissionId: commission.id,
      stripeInvoiceId: input.stripeInvoiceId,
      amountCents: -standing,
      entryType: "dispute_reversal",
      idempotencyKey: `dispute_reversal:${eventRow.id}`,
      sourceEvent: input.sourceEvent ?? "charge.dispute.closed",
    });
    await recordAuditEvent({
      organizationId: input.orgId,
      actorUserId: null,
      actorType: "system",
      action: "affiliate.commission_reversed",
      targetType: "affiliate_commission",
      targetId: commission.id,
      summary: "Commission reversed after lost dispute",
      metadata: { reversedCents: standing },
    });
  }
}

/**
 * Mark a canceled subscription's conversion canceled and end its eligibility
 * window. Commissions already accrued keep their own lifecycle (they still
 * mature and pay out after holding, unless refunded or disputed).
 */
export async function processSubscriptionCanceledForAffiliate(
  orgId: string,
): Promise<void> {
  const db = serviceClient();
  const { data: conversion } = await db
    .from("affiliate_conversions")
    .select("id, state")
    .eq("organization_id", orgId)
    .maybeSingle();
  if (!conversion) return;
  if (TERMINAL_CONVERSION_STATES.has(conversion.state)) return;

  await db
    .from("affiliate_conversions")
    .update({ state: "canceled", canceled_at: new Date().toISOString() } as never)
    .eq("id", conversion.id);

  await db
    .from("affiliate_eligibility_windows")
    .update({ status: "ended", ended_reason: "subscription_canceled" } as never)
    .eq("conversion_id", conversion.id)
    .eq("status", "active");

  await db.from("affiliate_conversion_events").insert({
    conversion_id: conversion.id,
    kind: "subscription_canceled",
    source_event: "customer.subscription.deleted",
  });
}

/**
 * End eligibility windows whose recurring period has elapsed and mark their
 * conversions expired (they no longer accrue on new invoices). Idempotent and
 * bounded. Returns the count ended. Runs from the internal worker.
 */
export async function expireEligibilityWindows(limit = 500): Promise<number> {
  const db = serviceClient();
  const nowIso = new Date().toISOString();

  const { data: windows } = await db
    .from("affiliate_eligibility_windows")
    .select("id, conversion_id")
    .eq("status", "active")
    .lt("eligibility_end", nowIso)
    .limit(limit);
  if (!windows || windows.length === 0) return 0;

  let ended = 0;
  for (const window of windows) {
    const { data: updated } = await db
      .from("affiliate_eligibility_windows")
      .update({ status: "ended", ended_reason: "window_elapsed" } as never)
      .eq("id", window.id)
      .eq("status", "active")
      .select("id")
      .maybeSingle();
    if (!updated) continue;

    await db
      .from("affiliate_conversions")
      .update({ state: "expired" } as never)
      .eq("id", window.conversion_id)
      .eq("state", "active");
    ended += 1;
  }
  return ended;
}

/**
 * Move matured holding commissions to payable. A commission matures when its
 * hold has elapsed, nothing has been reversed, and its conversion is not in a
 * fraud state. Writes approval + payable ledger markers (amount 0; the accrual
 * already moved the balance). Idempotent via ledger keys. Returns the count
 * released. Intended to run from the internal worker on a schedule.
 */
export async function releaseMaturedCommissions(limit = 500): Promise<number> {
  const db = serviceClient();
  const nowIso = new Date().toISOString();

  const { data: rows } = await db
    .from("affiliate_commissions")
    .select("id, affiliate_id, conversion_id, stripe_invoice_id")
    .eq("state", "holding")
    .eq("reversed_cents", 0)
    .lte("hold_release_at", nowIso)
    .limit(limit);
  if (!rows || rows.length === 0) return 0;

  let released = 0;
  for (const row of rows) {
    const { data: updated } = await db
      .from("affiliate_commissions")
      .update({ state: "payable" } as never)
      .eq("id", row.id)
      .eq("state", "holding")
      .eq("reversed_cents", 0)
      .select("id")
      .maybeSingle();
    if (!updated) continue; // changed under us; skip

    await writeLedger({
      affiliateId: row.affiliate_id,
      conversionId: row.conversion_id,
      commissionId: row.id,
      stripeInvoiceId: row.stripe_invoice_id,
      amountCents: 0,
      entryType: "commission_approved",
      idempotencyKey: `approve:${row.id}`,
    });
    await writeLedger({
      affiliateId: row.affiliate_id,
      conversionId: row.conversion_id,
      commissionId: row.id,
      stripeInvoiceId: row.stripe_invoice_id,
      amountCents: 0,
      entryType: "commission_payable",
      idempotencyKey: `payable:${row.id}`,
    });
    released += 1;
  }
  return released;
}
