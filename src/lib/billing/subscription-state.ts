/**
 * Internal subscription state machine. Stripe is the source of truth for raw
 * subscription status; Fajita derives a bounded internal status and a product
 * access state from it. The product reads only the internal states, never a
 * raw Stripe status string, so provider changes never leak into the UI.
 *
 * Pure module (no I/O) so the mapping is unit-tested in isolation.
 */
import type Stripe from "stripe";

import type { BillingAccessState } from "@/lib/billing/catalog";

export type InternalSubscriptionStatus =
  | "none"
  | "checkout_pending"
  | "trialing"
  | "active"
  | "past_due"
  | "payment_action_required"
  | "grace_period"
  | "restricted"
  | "unpaid"
  | "cancellation_scheduled"
  | "canceled"
  | "incomplete"
  | "incomplete_expired"
  | "paused"
  | "admin_suspended";

export interface StripeSubscriptionShape {
  status: Stripe.Subscription.Status;
  cancelAtPeriodEnd: boolean;
  /** True when the latest invoice needs customer authentication (SCA). */
  paymentActionRequired?: boolean;
}

/**
 * Map a Stripe subscription to the internal status. Cancellation-at-period-end
 * on an otherwise-active subscription is surfaced as `cancellation_scheduled`
 * so the UI can offer reactivation while access continues.
 */
export function mapStripeSubscriptionStatus(
  sub: StripeSubscriptionShape,
): InternalSubscriptionStatus {
  switch (sub.status) {
    case "trialing":
      return sub.cancelAtPeriodEnd ? "cancellation_scheduled" : "trialing";
    case "active":
      return sub.cancelAtPeriodEnd ? "cancellation_scheduled" : "active";
    case "past_due":
      return sub.paymentActionRequired ? "payment_action_required" : "past_due";
    case "unpaid":
      return "unpaid";
    case "canceled":
      return "canceled";
    case "incomplete":
      return sub.paymentActionRequired ? "payment_action_required" : "incomplete";
    case "incomplete_expired":
      return "incomplete_expired";
    case "paused":
      return "paused";
    default:
      return "none";
  }
}

export interface AccessStateInput {
  status: InternalSubscriptionStatus;
  /** True once the grace window has elapsed and billing restriction applies. */
  restricted: boolean;
  /** True while an admin has suspended the organization. */
  adminSuspended?: boolean;
}

/**
 * Derive the product access state. This is what the entitlement engine consumes
 * to decide whether to grant the plan's entitlements or the locked set.
 *
 * - active / trialing / cancellation_scheduled keep full access.
 * - payment problems grant `grace_period` until the recovery window elapses,
 *   then `restricted` (monitoring paused, data preserved).
 * - canceled is read-only retention.
 * - everything else is locked (`none`).
 */
export function deriveAccessState(input: AccessStateInput): BillingAccessState {
  if (input.adminSuspended) return "restricted";

  switch (input.status) {
    case "active":
    case "trialing":
    case "cancellation_scheduled":
      return "active";
    case "past_due":
    case "payment_action_required":
    case "grace_period":
      return input.restricted ? "restricted" : "grace_period";
    case "unpaid":
    case "restricted":
    case "paused":
    case "admin_suspended":
      return "restricted";
    case "canceled":
      return "canceled";
    case "none":
    case "checkout_pending":
    case "incomplete":
    case "incomplete_expired":
    default:
      return "none";
  }
}

/**
 * Guard against out-of-order webhook application. Returns true when an incoming
 * event should overwrite the stored state, based on Stripe object timestamps.
 * Newer Stripe object wins; equal timestamps allow the update (idempotent).
 */
export function shouldApplyEvent(
  storedStripeUpdatedAt: number | null,
  incomingStripeUpdatedAt: number,
): boolean {
  if (storedStripeUpdatedAt === null) return true;
  return incomingStripeUpdatedAt >= storedStripeUpdatedAt;
}

/** Whether the internal status represents a currently paying subscription. */
export function isPayingStatus(status: InternalSubscriptionStatus): boolean {
  return (
    status === "active" ||
    status === "cancellation_scheduled" ||
    status === "grace_period" ||
    status === "past_due"
  );
}

/** Customer-friendly label. No raw Stripe strings reach the UI. */
export function subscriptionStatusLabel(
  status: InternalSubscriptionStatus,
): string {
  switch (status) {
    case "none":
      return "No plan";
    case "checkout_pending":
      return "Confirming payment";
    case "trialing":
      return "Trial";
    case "active":
      return "Active";
    case "past_due":
    case "grace_period":
      return "Payment overdue";
    case "payment_action_required":
      return "Action needed";
    case "restricted":
      return "Service restricted";
    case "unpaid":
      return "Unpaid";
    case "cancellation_scheduled":
      return "Cancels at period end";
    case "canceled":
      return "Canceled";
    case "incomplete":
      return "Checkout incomplete";
    case "incomplete_expired":
      return "Checkout expired";
    case "paused":
      return "Paused";
    case "admin_suspended":
      return "Suspended";
    default:
      return "Unknown";
  }
}
