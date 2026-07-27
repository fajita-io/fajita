"use server";

import { revalidatePath } from "next/cache";
import Stripe from "stripe";
import { z } from "zod";

import {
  requireOrganizationPermission,
} from "@/lib/auth/context";
import { serviceClient } from "@/lib/supabase/service";
import { getStripe } from "@/lib/stripe/server";
import { recordAuditEvent } from "@/lib/app/audit";
import { Conflict, NotFound } from "@/lib/auth/errors";
import { DataFastGoals, trackServerGoal } from "@/lib/analytics";
import {
  isBillingInterval,
  isPlanId,
  type BillingInterval,
  type PlanId,
} from "@/lib/stripe/plans";
import { resolvePriceId } from "@/lib/stripe/entitlements";
import { startCheckout } from "@/lib/billing/checkout";
import { stripePaymentsUnavailableMessage } from "@/lib/billing/stripe-messages";
import { createOrgPortalSession } from "@/lib/billing/portal";
import { loadCurrentSubscription, writeEntitlementSnapshot } from "@/lib/billing/engine";
import { monthlyValueCents } from "@/lib/billing/catalog";
import { toActionError, type ActionResult } from "./shared";

const planSchema = z.object({
  organizationId: z.string().uuid(),
  planKey: z.string().refine(isPlanId, "Unknown plan."),
  interval: z.string().refine(isBillingInterval, "Unknown interval."),
});

function checkoutStartErrorMessage(error: unknown): string | null {
  if (error instanceof Stripe.errors.StripeError) {
    const message = error.message.toLowerCase();
    if (message.includes("no valid payment method types")) {
      return "Checkout is not available yet. Payment setup is still finishing. Try again in a few minutes.";
    }
    if (message.includes("charges are currently disabled")) {
      return stripePaymentsUnavailableMessage();
    }
    if (message.includes("no active stripe price found")) {
      return "That plan is not available for checkout right now. Pick another plan or contact support.";
    }
  }
  if (error instanceof Error) {
    if (error.message.includes("STRIPE_SECRET_KEY is not configured")) {
      return "Billing is temporarily unavailable. Try again in a few minutes.";
    }
  }
  return null;
}

/** Load org name + a billing email for Stripe customer creation. */
async function orgBillingIdentity(organizationId: string): Promise<{
  name: string;
  email: string | null;
}> {
  const db = serviceClient();
  const { data: org } = await db
    .from("organizations")
    .select("name, owner_user_id")
    .eq("id", organizationId)
    .maybeSingle();
  if (!org) throw NotFound("Organization not found.");
  const { data: owner } = await db
    .from("user_profiles")
    .select("primary_email")
    .eq("id", org.owner_user_id)
    .maybeSingle();
  return { name: org.name, email: owner?.primary_email ?? null };
}

/** Start Checkout for a new subscription. Returns a Stripe-hosted URL. */
export async function startCheckoutAction(
  organizationId: string,
  planKey: string,
  interval: string,
): Promise<ActionResult<{ url: string }>> {
  try {
    const parsed = planSchema.parse({ organizationId, planKey, interval });
    const access = await requireOrganizationPermission(
      parsed.organizationId,
      "billing:manage",
    );
    const identity = await orgBillingIdentity(parsed.organizationId);

    const { url } = await startCheckout({
      organizationId: parsed.organizationId,
      organizationName: identity.name,
      initiatedByUserId: access.profile.id,
      billingEmail: identity.email,
      planKey: parsed.planKey as PlanId,
      interval: parsed.interval as BillingInterval,
    });

    await recordAuditEvent({
      organizationId: parsed.organizationId,
      actorUserId: access.profile.id,
      action: "billing.checkout_started",
      summary: `Checkout started for ${parsed.planKey} (${parsed.interval}).`,
      metadata: { plan: parsed.planKey, interval: parsed.interval },
    });
    await trackServerGoal({
      name: DataFastGoals.initiateCheckout,
      metadata: { plan: parsed.planKey, interval: parsed.interval },
    });

    return { ok: true, data: { url } };
  } catch (error) {
    const checkoutMessage = checkoutStartErrorMessage(error);
    if (checkoutMessage) {
      console.error("[billing] checkout start failed", error);
      return { ok: false, error: checkoutMessage };
    }
    return toActionError(error);
  }
}

/** Open the Stripe Customer Portal for payment methods, invoices, tax. */
export async function openBillingPortalAction(
  organizationId: string,
): Promise<ActionResult<{ url: string }>> {
  try {
    const access = await requireOrganizationPermission(
      organizationId,
      "billing:manage",
    );
    const url = await createOrgPortalSession(organizationId);
    await recordAuditEvent({
      organizationId,
      actorUserId: access.profile.id,
      action: "billing.portal_opened",
      summary: "Opened Stripe billing portal.",
    });
    return { ok: true, data: { url } };
  } catch (error) {
    return toActionError(error);
  }
}

/**
 * Change plan or interval on the existing subscription. Upgrades apply
 * immediately with prorations; downgrades are scheduled to the period end via a
 * Stripe subscription schedule and recorded for the compliance flow.
 */
export async function changePlanAction(
  organizationId: string,
  planKey: string,
  interval: string,
): Promise<ActionResult<{ effect: "immediate" | "scheduled" }>> {
  try {
    const parsed = planSchema.parse({ organizationId, planKey, interval });
    const access = await requireOrganizationPermission(
      parsed.organizationId,
      "billing:manage",
    );
    const targetPlan = parsed.planKey as PlanId;
    const targetInterval = parsed.interval as BillingInterval;

    const subscription = await loadCurrentSubscription(parsed.organizationId);
    if (
      !subscription ||
      subscription.status === "canceled" ||
      subscription.status === "incomplete_expired" ||
      subscription.status === "none"
    ) {
      throw Conflict("No active subscription to change. Start checkout instead.");
    }

    const currentValue = monthlyValueCents(
      subscription.plan_key as PlanId,
      subscription.billing_interval as BillingInterval,
    );
    const targetValue = monthlyValueCents(targetPlan, targetInterval);
    const isUpgrade = targetValue >= currentValue;

    const stripe = getStripe();
    const priceId = await resolvePriceId(targetPlan, targetInterval);
    const stripeSub = await stripe.subscriptions.retrieve(
      subscription.stripe_subscription_id,
    );
    const itemId = stripeSub.items.data[0]?.id;
    if (!itemId) throw Conflict("Subscription has no billable item.");

    if (isUpgrade) {
      await stripe.subscriptions.update(subscription.stripe_subscription_id, {
        items: [{ id: itemId, price: priceId }],
        proration_behavior: "create_prorations",
        cancel_at_period_end: false,
      });
      await recordAuditEvent({
        organizationId: parsed.organizationId,
        actorUserId: access.profile.id,
        action: "billing.plan_upgraded",
        summary: `Upgraded to ${targetPlan} (${targetInterval}).`,
        metadata: { plan: targetPlan, interval: targetInterval },
      });
      await writeEntitlementSnapshot(parsed.organizationId);
      revalidatePath("/app/settings/billing");
      return { ok: true, data: { effect: "immediate" } };
    }

    // Downgrade: schedule the price change at the current period end.
    const schedule = await stripe.subscriptionSchedules.create({
      from_subscription: subscription.stripe_subscription_id,
    });
    const currentPhase = schedule.phases[0];
    await stripe.subscriptionSchedules.update(schedule.id, {
      end_behavior: "release",
      phases: [
        {
          items: [
            {
              price: currentPhase.items[0].price as string,
              quantity: 1,
            },
          ],
          start_date: currentPhase.start_date,
          end_date: currentPhase.end_date,
        },
        {
          items: [{ price: priceId, quantity: 1 }],
        },
      ],
    });

    const db = serviceClient();
    await db.from("billing_downgrade_plans").insert({
      organization_id: parsed.organizationId,
      from_plan_key: subscription.plan_key,
      to_plan_key: targetPlan,
      billing_interval: targetInterval,
      effective_at:
        subscription.current_period_end ?? new Date().toISOString(),
      status: "scheduled",
    } as never);

    await recordAuditEvent({
      organizationId: parsed.organizationId,
      actorUserId: access.profile.id,
      action: "billing.downgrade_scheduled",
      summary: `Downgrade to ${targetPlan} scheduled at period end.`,
      metadata: { plan: targetPlan, interval: targetInterval },
    });
    revalidatePath("/app/settings/billing");
    return { ok: true, data: { effect: "scheduled" } };
  } catch (error) {
    return toActionError(error);
  }
}

const cancelSchema = z.object({
  organizationId: z.string().uuid(),
  reasonCode: z.string().max(60).optional(),
  feedback: z.string().max(2000).optional(),
  secondaryReason: z.string().max(60).optional(),
  missingFeature: z.string().max(500).optional(),
  followUpOk: z.boolean().optional(),
});

/**
 * Schedule cancellation at period end. Access continues until then. All
 * feedback fields are optional: feedback never gates cancellation, and no
 * response path may obstruct it.
 */
export async function scheduleCancellationAction(
  organizationId: string,
  reasonCode?: string,
  feedback?: string,
  extra?: {
    secondaryReason?: string;
    missingFeature?: string;
    followUpOk?: boolean;
  },
): Promise<ActionResult> {
  try {
    const parsed = cancelSchema.parse({
      organizationId,
      reasonCode,
      feedback,
      ...extra,
    });
    const access = await requireOrganizationPermission(
      parsed.organizationId,
      "billing:manage",
    );
    const subscription = await loadCurrentSubscription(parsed.organizationId);
    if (!subscription || subscription.status === "canceled") {
      throw Conflict("There is no active subscription to cancel.");
    }

    const stripe = getStripe();
    await stripe.subscriptions.update(subscription.stripe_subscription_id, {
      cancel_at_period_end: true,
    });

    const db = serviceClient();
    await db.from("billing_cancellation_records").insert({
      organization_id: parsed.organizationId,
      subscription_id: subscription.id,
      requested_by_user_id: access.profile.id,
      reason_code: parsed.reasonCode ?? null,
      feedback: parsed.feedback ?? null,
      secondary_reason: parsed.secondaryReason ?? null,
      missing_feature: parsed.missingFeature ?? null,
      follow_up_ok: parsed.followUpOk ?? null,
      effective_at: subscription.current_period_end,
      status: "scheduled",
    } as never);

    await recordAuditEvent({
      organizationId: parsed.organizationId,
      actorUserId: access.profile.id,
      action: "billing.cancellation_scheduled",
      summary: "Cancellation scheduled at period end.",
      metadata: parsed.reasonCode ? { reason: parsed.reasonCode } : {},
    });
    if (parsed.reasonCode || parsed.feedback || parsed.missingFeature) {
      await recordAuditEvent({
        organizationId: parsed.organizationId,
        actorUserId: access.profile.id,
        action: "cancellation.feedback_recorded",
        summary: "Cancellation feedback recorded.",
        metadata: {
          reason: parsed.reasonCode ?? null,
          secondary_reason: parsed.secondaryReason ?? null,
          has_written_feedback: Boolean(parsed.feedback),
          follow_up_ok: parsed.followUpOk ?? null,
        },
      });
      await trackServerGoal({
        name: DataFastGoals.cancellationFeedbackSubmitted,
        metadata: parsed.reasonCode ? { reason: parsed.reasonCode } : undefined,
      }).catch(() => {});
    }
    await writeEntitlementSnapshot(parsed.organizationId);
    revalidatePath("/app/settings/billing");
    return { ok: true };
  } catch (error) {
    return toActionError(error);
  }
}

/** Reactivate a subscription scheduled to cancel, before it takes effect. */
export async function reactivateSubscriptionAction(
  organizationId: string,
): Promise<ActionResult> {
  try {
    const access = await requireOrganizationPermission(
      organizationId,
      "billing:manage",
    );
    const subscription = await loadCurrentSubscription(organizationId);
    if (!subscription) throw Conflict("No subscription to reactivate.");
    if (!subscription.cancel_at_period_end) {
      throw Conflict("This subscription is not scheduled to cancel.");
    }

    const stripe = getStripe();
    await stripe.subscriptions.update(subscription.stripe_subscription_id, {
      cancel_at_period_end: false,
    });

    const db = serviceClient();
    await db
      .from("billing_cancellation_records")
      .update({
        status: "reactivated",
        reactivated_at: new Date().toISOString(),
      } as never)
      .eq("organization_id", organizationId)
      .eq("status", "scheduled");

    await recordAuditEvent({
      organizationId,
      actorUserId: access.profile.id,
      action: "billing.subscription_reactivated",
      summary: "Subscription reactivated before cancellation.",
    });
    await writeEntitlementSnapshot(organizationId);
    revalidatePath("/app/settings/billing");
    return { ok: true };
  } catch (error) {
    return toActionError(error);
  }
}
