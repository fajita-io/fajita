/**
 * Pure helpers for Stripe webhook inbox decisions. Kept free of I/O so Phase 18
 * can unit-test idempotency classification without a live database.
 */

export type WebhookInboxPriorStatus =
  | "processing"
  | "processed"
  | "failed"
  | "ignored"
  | "dead_letter"
  | string;

export type WebhookInboxAction = "process_new" | "duplicate" | "retry";

/**
 * After an insert-or-ignore upsert on stripe_event_id:
 * - inserted row → process as new
 * - prior processed → duplicate (ack without side effects)
 * - prior failed/processing/other → retry dispatch
 */
export function resolveWebhookInboxAction(args: {
  inserted: boolean;
  priorStatus: WebhookInboxPriorStatus | null | undefined;
}): WebhookInboxAction {
  if (args.inserted) return "process_new";
  if (args.priorStatus === "processed") return "duplicate";
  return "retry";
}

/** Events Fajita persists and dispatches. Others are recorded then ignored. */
export const STRIPE_HANDLED_EVENTS = new Set<string>([
  "checkout.session.completed",
  "checkout.session.expired",
  "customer.subscription.created",
  "customer.subscription.updated",
  "customer.subscription.deleted",
  "invoice.paid",
  "invoice.payment_failed",
  "invoice.finalized",
  "charge.refunded",
  "charge.dispute.created",
  "charge.dispute.closed",
]);

export function isHandledStripeEvent(type: string): boolean {
  return STRIPE_HANDLED_EVENTS.has(type);
}
