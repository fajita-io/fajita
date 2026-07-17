import "server-only";

import type Stripe from "stripe";

import { getStripe } from "@/lib/stripe/server";
import { serviceClient } from "@/lib/supabase/service";
import { PLANS, type BillingInterval, type PlanId } from "@/lib/stripe/plans";
import { isPlanId } from "@/lib/stripe/plans";
import {
  mapStripeSubscriptionStatus,
  shouldApplyEvent,
} from "@/lib/billing/subscription-state";
import { writeEntitlementSnapshot } from "@/lib/billing/engine";
import { restrictionStartsAt } from "@/lib/billing/grace-period";
import { recordAuditEvent } from "@/lib/app/audit";
import {
  processDisputeForAffiliate,
  processInvoicePaidForAffiliate,
  processRefundForAffiliate,
  processSubscriptionCanceledForAffiliate,
} from "@/lib/affiliates/conversions";
import {
  isHandledStripeEvent,
  resolveWebhookInboxAction,
} from "@/lib/billing/webhook-inbox";

function planKeyFromPrice(price: Stripe.Price | null | undefined): PlanId | null {
  if (!price) return null;
  const lookup = price.lookup_key;
  if (lookup) {
    for (const plan of Object.values(PLANS)) {
      if (plan.lookupKeys.month === lookup || plan.lookupKeys.year === lookup) {
        return plan.id;
      }
    }
  }
  const meta = price.metadata?.plan_id;
  return meta && isPlanId(meta) ? meta : null;
}

async function resolveOrganizationId(
  metaOrgId: string | undefined | null,
  stripeCustomerId: string | null,
): Promise<string | null> {
  if (metaOrgId) return metaOrgId;
  if (!stripeCustomerId) return null;
  const db = serviceClient();
  const { data } = await db
    .from("billing_customers")
    .select("organization_id")
    .eq("stripe_customer_id", stripeCustomerId)
    .maybeSingle();
  return data?.organization_id ?? null;
}

/**
 * Upsert one org subscription from a Stripe subscription object, guarding
 * against out-of-order events, then recalculate the entitlement snapshot.
 */
async function syncSubscription(sub: Stripe.Subscription): Promise<string | null> {
  const db = serviceClient();
  const customerId =
    typeof sub.customer === "string" ? sub.customer : sub.customer.id;
  const organizationId = await resolveOrganizationId(
    sub.metadata?.organization_id,
    customerId,
  );
  if (!organizationId) return null;

  const item = sub.items.data[0];
  const price = item?.price ?? null;
  const planKey =
    (sub.metadata?.plan_key && isPlanId(sub.metadata.plan_key)
      ? (sub.metadata.plan_key as PlanId)
      : null) ?? planKeyFromPrice(price) ?? "starter";
  const interval: BillingInterval =
    price?.recurring?.interval === "year" ? "year" : "month";
  const recurringAmountCents = price?.unit_amount ?? 0;

  const status = mapStripeSubscriptionStatus({
    status: sub.status,
    cancelAtPeriodEnd: sub.cancel_at_period_end,
  });

  const periodStart = item?.current_period_start
    ? new Date(item.current_period_start * 1000).toISOString()
    : null;
  const periodEnd = item?.current_period_end
    ? new Date(item.current_period_end * 1000).toISOString()
    : null;
  const cancellationEffectiveAt =
    sub.cancel_at != null
      ? new Date(sub.cancel_at * 1000).toISOString()
      : sub.cancel_at_period_end
        ? periodEnd
        : null;
  const canceledAt = sub.canceled_at
    ? new Date(sub.canceled_at * 1000).toISOString()
    : null;

  // Out-of-order protection: only apply if the incoming object is newer.
  const { data: existing } = await db
    .from("billing_subscriptions")
    .select("id, stripe_updated_at")
    .eq("stripe_subscription_id", sub.id)
    .maybeSingle();

  if (
    existing &&
    !shouldApplyEvent(existing.stripe_updated_at ?? null, sub.created)
  ) {
    // A newer state is already stored; still recalc to be safe.
    await writeEntitlementSnapshot(organizationId);
    return organizationId;
  }

  const row = {
    organization_id: organizationId,
    stripe_customer_id: customerId,
    stripe_subscription_id: sub.id,
    plan_key: planKey,
    billing_interval: interval,
    status,
    recurring_amount_cents: recurringAmountCents,
    currency: (price?.currency ?? "usd").toLowerCase(),
    current_period_start: periodStart,
    current_period_end: periodEnd,
    cancel_at_period_end: sub.cancel_at_period_end,
    cancellation_effective_at: cancellationEffectiveAt,
    canceled_at: canceledAt,
    stripe_updated_at: sub.created,
  };

  await db
    .from("billing_subscriptions")
    .upsert(row as never, { onConflict: "stripe_subscription_id" });

  await writeEntitlementSnapshot(organizationId);
  return organizationId;
}

async function openGracePeriod(
  organizationId: string,
  reason: string,
): Promise<void> {
  const db = serviceClient();
  const { data: open } = await db
    .from("billing_grace_periods")
    .select("id")
    .eq("organization_id", organizationId)
    .in("status", ["open", "restricted"])
    .maybeSingle();
  if (open) return; // idempotent: one open grace period per org

  const startedAt = new Date().toISOString();
  await db.from("billing_grace_periods").insert({
    organization_id: organizationId,
    started_at: startedAt,
    restriction_at: restrictionStartsAt(startedAt),
    reason,
    status: "open",
  } as never);

  await recordAuditEvent({
    organizationId,
    actorUserId: null,
    actorType: "system",
    action: "billing.grace_period_started",
    summary: "Payment failed; grace period started.",
  });
}

async function resolveGracePeriods(organizationId: string): Promise<void> {
  const db = serviceClient();
  const { data: open } = await db
    .from("billing_grace_periods")
    .select("id")
    .eq("organization_id", organizationId)
    .in("status", ["open", "restricted"]);
  if (!open || open.length === 0) return;

  await db
    .from("billing_grace_periods")
    .update({ status: "resolved", ended_at: new Date().toISOString() } as never)
    .eq("organization_id", organizationId)
    .in("status", ["open", "restricted"]);

  await recordAuditEvent({
    organizationId,
    actorUserId: null,
    actorType: "system",
    action: "billing.payment_recovered",
    summary: "Payment recovered; grace period ended.",
  });
}

async function recordPaymentEvent(
  organizationId: string,
  invoice: Stripe.Invoice,
  kind: "paid" | "failed" | "finalized",
): Promise<void> {
  const db = serviceClient();
  await db
    .from("billing_payment_events")
    .upsert(
      {
        organization_id: organizationId,
        stripe_invoice_id: invoice.id,
        kind,
        amount_cents:
          kind === "paid" ? invoice.amount_paid : invoice.amount_due,
        currency: (invoice.currency ?? "usd").toLowerCase(),
        hosted_invoice_url: invoice.hosted_invoice_url ?? null,
        invoice_pdf_url: invoice.invoice_pdf ?? null,
        occurred_at: new Date().toISOString(),
        summary: {
          number: invoice.number ?? null,
          status: invoice.status ?? null,
        },
      } as never,
      { onConflict: "stripe_invoice_id,kind", ignoreDuplicates: true },
    );
}

/** Invoice id linked to a charge, tolerant of Stripe SDK type differences. */
function chargeInvoiceIdOf(charge: Stripe.Charge): string | null {
  const value = (charge as unknown as {
    invoice?: string | { id?: string } | null;
  }).invoice;
  if (!value) return null;
  return typeof value === "string" ? value : value.id ?? null;
}

async function invoiceOrgId(invoice: Stripe.Invoice): Promise<string | null> {
  const customerId =
    typeof invoice.customer === "string"
      ? invoice.customer
      : invoice.customer?.id ?? null;
  const metaOrg =
    invoice.parent?.subscription_details?.metadata?.organization_id ?? null;
  return resolveOrganizationId(metaOrg, customerId);
}

async function dispatch(event: Stripe.Event): Promise<string | null> {
  const stripe = getStripe();

  switch (event.type) {
    case "checkout.session.completed": {
      const session = event.data.object as Stripe.Checkout.Session;
      const db = serviceClient();
      const intentId = session.metadata?.checkout_intent_id;
      if (intentId) {
        await db
          .from("billing_checkout_intents")
          .update({
            status: "completed",
            completed_at: new Date().toISOString(),
          } as never)
          .eq("id", intentId);
      }
      const subId =
        typeof session.subscription === "string"
          ? session.subscription
          : session.subscription?.id;
      if (!subId) return null;
      const sub = await stripe.subscriptions.retrieve(subId, {
        expand: ["items.data.price"],
      });
      const orgId = await syncSubscription(sub);
      if (orgId) {
        await recordAuditEvent({
          organizationId: orgId,
          actorUserId: null,
          actorType: "system",
          action: "billing.subscription_activated",
          summary: "Subscription activated from checkout.",
        });
      }
      return orgId;
    }
    case "checkout.session.expired": {
      const session = event.data.object as Stripe.Checkout.Session;
      const intentId = session.metadata?.checkout_intent_id;
      if (intentId) {
        await serviceClient()
          .from("billing_checkout_intents")
          .update({ status: "expired" } as never)
          .eq("id", intentId);
      }
      return null;
    }
    case "customer.subscription.created":
    case "customer.subscription.updated": {
      const sub = event.data.object as Stripe.Subscription;
      return syncSubscription(sub);
    }
    case "customer.subscription.deleted": {
      const sub = event.data.object as Stripe.Subscription;
      const orgId = await syncSubscription(sub);
      if (orgId) await processSubscriptionCanceledForAffiliate(orgId);
      return orgId;
    }
    case "invoice.paid": {
      const invoice = event.data.object as Stripe.Invoice;
      const orgId = await invoiceOrgId(invoice);
      if (orgId) {
        await recordPaymentEvent(orgId, invoice, "paid");
        await resolveGracePeriods(orgId);
        await writeEntitlementSnapshot(orgId);
        await processInvoicePaidForAffiliate(invoice, orgId, event.id);
      }
      return orgId;
    }
    case "invoice.payment_failed": {
      const invoice = event.data.object as Stripe.Invoice;
      const orgId = await invoiceOrgId(invoice);
      if (orgId) {
        await recordPaymentEvent(orgId, invoice, "failed");
        await openGracePeriod(orgId, "invoice.payment_failed");
        await writeEntitlementSnapshot(orgId);
        await recordAuditEvent({
          organizationId: orgId,
          actorUserId: null,
          actorType: "system",
          action: "billing.payment_failed",
          summary: "Invoice payment failed.",
        });
      }
      return orgId;
    }
    case "invoice.finalized": {
      const invoice = event.data.object as Stripe.Invoice;
      const orgId = await invoiceOrgId(invoice);
      if (orgId) await recordPaymentEvent(orgId, invoice, "finalized");
      return orgId;
    }
    case "charge.refunded": {
      const charge = event.data.object as Stripe.Charge;
      const customerId =
        typeof charge.customer === "string"
          ? charge.customer
          : charge.customer?.id ?? null;
      const orgId = await resolveOrganizationId(null, customerId);
      if (orgId) {
        await serviceClient()
          .from("billing_payment_events")
          .insert({
            organization_id: orgId,
            stripe_invoice_id: null,
            kind: charge.amount_refunded < charge.amount ? "partially_refunded" : "refunded",
            amount_cents: charge.amount_refunded,
            currency: (charge.currency ?? "usd").toLowerCase(),
            occurred_at: new Date().toISOString(),
            summary: { charge_id: charge.id },
          } as never);
        await recordAuditEvent({
          organizationId: orgId,
          actorUserId: null,
          actorType: "system",
          action: "billing.refund_issued",
          summary: "Refund recorded from Stripe.",
        });
        const chargeInvoiceId = chargeInvoiceIdOf(charge);
        await processRefundForAffiliate({
          orgId,
          stripeInvoiceId: chargeInvoiceId,
          refundedCents: charge.amount_refunded,
          full: charge.amount_refunded >= charge.amount,
          idempotencyKey: `refund:${event.id}`,
          sourceEvent: "charge.refunded",
        });
      }
      return orgId;
    }
    case "charge.dispute.created":
    case "charge.dispute.closed": {
      const dispute = event.data.object as Stripe.Dispute;
      const chargeId =
        typeof dispute.charge === "string"
          ? dispute.charge
          : dispute.charge?.id ?? null;
      if (!chargeId) return null;
      const charge = await stripe.charges.retrieve(chargeId);
      const customerId =
        typeof charge.customer === "string"
          ? charge.customer
          : charge.customer?.id ?? null;
      const orgId = await resolveOrganizationId(null, customerId);
      if (!orgId) return null;
      const invoiceId = chargeInvoiceIdOf(charge);
      const status: "opened" | "won" | "lost" =
        event.type === "charge.dispute.created"
          ? "opened"
          : dispute.status === "won"
            ? "won"
            : dispute.status === "lost"
              ? "lost"
              : "opened";
      await processDisputeForAffiliate({
        orgId,
        stripeInvoiceId: invoiceId,
        stripeChargeId: chargeId,
        status,
        idempotencyKey: `dispute:${event.id}`,
        sourceEvent: event.type,
      });
      return orgId;
    }
    default:
      return null;
  }
}

/**
 * Idempotent, verified webhook processing. Records the event in the inbox
 * (unique on stripe_event_id), skips duplicates, dispatches, and marks the
 * outcome. Never trusts an unsigned or client-supplied event.
 */
export async function processStripeWebhookEvent(
  event: Stripe.Event,
): Promise<{ status: "processed" | "duplicate" | "ignored" | "failed" }> {
  const db = serviceClient();

  // Idempotency: insert-or-skip on the event id.
  const { data: inserted } = await db
    .from("billing_webhook_events")
    .upsert(
      {
        stripe_event_id: event.id,
        event_type: event.type,
        stripe_object_id:
          "id" in (event.data.object as { id?: string })
            ? (event.data.object as { id?: string }).id ?? null
            : null,
        api_version: event.api_version ?? null,
        livemode: event.livemode,
        status: "processing",
        attempts: 1,
        summary: {},
      } as never,
      { onConflict: "stripe_event_id", ignoreDuplicates: true },
    )
    .select("stripe_event_id");

  const insertedOk = Boolean(inserted && inserted.length > 0);
  if (!insertedOk) {
    const { data: prior } = await db
      .from("billing_webhook_events")
      .select("status")
      .eq("stripe_event_id", event.id)
      .maybeSingle();
    const action = resolveWebhookInboxAction({
      inserted: false,
      priorStatus: prior?.status,
    });
    if (action === "duplicate") {
      return { status: "duplicate" };
    }
    // Re-attempt a previously failed/processing event.
    await db
      .from("billing_webhook_events")
      .update({ status: "processing" } as never)
      .eq("stripe_event_id", event.id);
  }

  if (!isHandledStripeEvent(event.type)) {
    await db
      .from("billing_webhook_events")
      .update({ status: "ignored", processed_at: new Date().toISOString() } as never)
      .eq("stripe_event_id", event.id);
    return { status: "ignored" };
  }

  try {
    const orgId = await dispatch(event);
    await db
      .from("billing_webhook_events")
      .update({
        status: "processed",
        processed_at: new Date().toISOString(),
        organization_id: orgId,
      } as never)
      .eq("stripe_event_id", event.id);
    return { status: "processed" };
  } catch (error) {
    console.error("[billing webhook] processing failed", event.type, error);
    await db
      .from("billing_webhook_events")
      .update({
        status: "failed",
        last_error:
          error instanceof Error ? error.message.slice(0, 500) : "unknown",
      } as never)
      .eq("stripe_event_id", event.id);
    return { status: "failed" };
  }
}
