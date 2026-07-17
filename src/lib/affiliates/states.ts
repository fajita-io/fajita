/**
 * Affiliate lifecycle state model.
 *
 * The spec is explicit that one status field must never be overloaded. An
 * affiliate carries several independent states at once (program membership,
 * payout eligibility, tax readiness, fraud review), and applications,
 * conversions, commissions, and payouts each have their own machines. This
 * module declares every state set and the legal transitions between them. Pure
 * and dependency-free so it can be imported anywhere and unit tested directly.
 */

/* ------------------------------------------------------------------ */
/* Application state                                                    */
/* ------------------------------------------------------------------ */

export const APPLICATION_STATES = [
  "draft",
  "submitted",
  "under_review",
  "needs_information",
  "waitlisted",
  "approved",
  "rejected",
  "blocked",
] as const;
export type ApplicationState = (typeof APPLICATION_STATES)[number];

const APPLICATION_TRANSITIONS: Record<ApplicationState, ApplicationState[]> = {
  draft: ["submitted"],
  submitted: ["under_review", "needs_information", "waitlisted", "approved", "rejected", "blocked"],
  under_review: ["needs_information", "waitlisted", "approved", "rejected", "blocked"],
  needs_information: ["submitted", "under_review", "waitlisted", "approved", "rejected", "blocked"],
  waitlisted: ["under_review", "approved", "rejected", "blocked"],
  approved: [],
  rejected: [],
  blocked: [],
};

/* ------------------------------------------------------------------ */
/* Program membership state (separate from application)                 */
/* ------------------------------------------------------------------ */

export const MEMBERSHIP_STATES = [
  "active",
  "paused",
  "suspended",
  "terminated",
  "closed",
] as const;
export type MembershipState = (typeof MEMBERSHIP_STATES)[number];

const MEMBERSHIP_TRANSITIONS: Record<MembershipState, MembershipState[]> = {
  active: ["paused", "suspended", "terminated", "closed"],
  paused: ["active", "suspended", "terminated", "closed"],
  suspended: ["active", "terminated", "closed"],
  terminated: [],
  closed: [],
};

/* ------------------------------------------------------------------ */
/* Payout eligibility state (derived + persisted)                       */
/* ------------------------------------------------------------------ */

export const PAYOUT_ELIGIBILITY_STATES = [
  "not_eligible",
  "below_threshold",
  "tax_information_required",
  "payout_setup_required",
  "ready",
  "held",
] as const;
export type PayoutEligibilityState = (typeof PAYOUT_ELIGIBILITY_STATES)[number];

/* ------------------------------------------------------------------ */
/* Tax readiness state                                                  */
/* ------------------------------------------------------------------ */

export const TAX_STATES = [
  "not_started",
  "required",
  "submitted",
  "verified",
  "needs_attention",
  "expired",
  "not_required",
  "withholding_applied",
] as const;
export type TaxState = (typeof TAX_STATES)[number];

/* ------------------------------------------------------------------ */
/* Fraud review state                                                   */
/* ------------------------------------------------------------------ */

export const FRAUD_STATES = ["clear", "review", "hold", "confirmed"] as const;
export type FraudState = (typeof FRAUD_STATES)[number];

export const FRAUD_REVIEW_DECISIONS = [
  "clear",
  "hold",
  "suspend",
  "terminate",
  "reverse",
  "request_information",
  "escalate",
] as const;
export type FraudReviewDecision = (typeof FRAUD_REVIEW_DECISIONS)[number];

/** Throws when a string is not a known fraud review decision. */
export function assertFraudDecision(
  decision: string,
): asserts decision is FraudReviewDecision {
  if (!(FRAUD_REVIEW_DECISIONS as readonly string[]).includes(decision)) {
    throw new Error("Unknown fraud decision.");
  }
}

/* ------------------------------------------------------------------ */
/* Conversion state (separate from commission)                          */
/* ------------------------------------------------------------------ */

export const CONVERSION_STATES = [
  "attributed_signup",
  "checkout_started",
  "subscription_created",
  "payment_pending",
  "confirmed",
  "holding",
  "active",
  "ineligible",
  "fraud_review",
  "reversed",
  "canceled",
  "expired",
] as const;
export type ConversionState = (typeof CONVERSION_STATES)[number];

/* ------------------------------------------------------------------ */
/* Commission state                                                     */
/* ------------------------------------------------------------------ */

export const COMMISSION_STATES = [
  "pending",
  "holding",
  "approved",
  "payable",
  "scheduled",
  "paid",
  "partially_reversed",
  "reversed",
  "disputed",
  "fraud_hold",
  "expired",
  "canceled",
] as const;
export type CommissionState = (typeof COMMISSION_STATES)[number];

/** Commission states that count toward an affiliate's payable balance. */
export const PAYABLE_COMMISSION_STATES: readonly CommissionState[] = ["payable"];

/** States that represent real, non-reversed commission value earned so far. */
export const REALIZED_COMMISSION_STATES: readonly CommissionState[] = [
  "approved",
  "payable",
  "scheduled",
  "paid",
  "partially_reversed",
];

/* ------------------------------------------------------------------ */
/* Payout item + batch state                                            */
/* ------------------------------------------------------------------ */

export const PAYOUT_ITEM_STATES = [
  "not_eligible",
  "below_threshold",
  "tax_information_required",
  "payout_setup_required",
  "ready",
  "scheduled",
  "processing",
  "paid",
  "failed",
  "returned",
  "held",
  "canceled",
] as const;
export type PayoutItemState = (typeof PAYOUT_ITEM_STATES)[number];

export const PAYOUT_BATCH_STATES = [
  "draft",
  "review",
  "approved",
  "processing",
  "partially_completed",
  "completed",
  "failed",
  "canceled",
] as const;
export type PayoutBatchState = (typeof PAYOUT_BATCH_STATES)[number];

/* ------------------------------------------------------------------ */
/* Eligibility window state                                             */
/* ------------------------------------------------------------------ */

export const ELIGIBILITY_WINDOW_STATES = [
  "active",
  "paused",
  "ended",
] as const;
export type EligibilityWindowState = (typeof ELIGIBILITY_WINDOW_STATES)[number];

/* ------------------------------------------------------------------ */
/* Transition helpers                                                   */
/* ------------------------------------------------------------------ */

export function canTransitionApplication(
  from: ApplicationState,
  to: ApplicationState,
): boolean {
  return APPLICATION_TRANSITIONS[from]?.includes(to) ?? false;
}

export function canTransitionMembership(
  from: MembershipState,
  to: MembershipState,
): boolean {
  return MEMBERSHIP_TRANSITIONS[from]?.includes(to) ?? false;
}

/** Program states in which referral tracking may still create attribution. */
export function membershipAllowsTracking(state: MembershipState): boolean {
  return state === "active";
}

/**
 * Program states in which an already-locked conversion continues to accrue
 * commission on new eligible invoices. Paused/suspended freeze new accrual but
 * preserve history; terminated/closed stop accrual entirely.
 */
export function membershipAllowsAccrual(state: MembershipState): boolean {
  return state === "active";
}
