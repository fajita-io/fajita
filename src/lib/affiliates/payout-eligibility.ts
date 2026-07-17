import type { MembershipState } from "./states";

/**
 * Resolved payout status for one affiliate in a batch. Pure and dependency-light
 * so the batch generator, dashboards, and tests all agree. It answers a single
 * question: can this affiliate be paid right now, and if not, what unlocks it?
 */
export type PayoutStatus =
  | "not_eligible"
  | "below_threshold"
  | "tax_information_required"
  | "payout_setup_required"
  | "ready"
  | "held";

export type TaxStatus =
  | "not_started"
  | "required"
  | "submitted"
  | "verified"
  | "needs_attention"
  | "expired"
  | "not_required"
  | "withholding_applied";

/** Tax states that block a payout until the affiliate resolves them. */
const TAX_BLOCKING: ReadonlySet<TaxStatus> = new Set([
  "required",
  "needs_attention",
  "expired",
]);

export interface PayoutEligibilityInput {
  membershipState: MembershipState;
  /** Admin hold on this affiliate's payouts. */
  payoutHold: boolean;
  /** Net payable owed to the affiliate, in cents. */
  grossPayableCents: number;
  /** Program minimum payout threshold, in cents. */
  thresholdCents: number;
  provider: "stripe_connect" | "manual";
  /** Whether the connected account can receive payouts (Stripe payouts_enabled). */
  accountEnabled: boolean;
  taxStatus: TaxStatus;
}

/**
 * Resolve payout status. Precedence: frozen accounts are held, empty balances
 * are not eligible, sub-threshold balances wait, then setup and tax must be
 * complete before a payout is ready.
 */
export function resolvePayoutStatus(
  input: PayoutEligibilityInput,
): PayoutStatus {
  if (
    input.membershipState === "suspended" ||
    input.membershipState === "terminated" ||
    input.membershipState === "closed"
  ) {
    return "held";
  }
  if (input.payoutHold) return "held";
  if (input.grossPayableCents <= 0) return "not_eligible";
  if (input.grossPayableCents < input.thresholdCents) return "below_threshold";
  if (input.provider === "stripe_connect" && !input.accountEnabled) {
    return "payout_setup_required";
  }
  if (TAX_BLOCKING.has(input.taxStatus)) return "tax_information_required";
  return "ready";
}

/** Human, user-safe explanation of a non-ready payout status. */
export function payoutStatusExplanation(status: PayoutStatus): string {
  switch (status) {
    case "ready":
      return "Ready for the next payout run.";
    case "below_threshold":
      return "Your balance has not reached the payout minimum yet. It carries forward.";
    case "payout_setup_required":
      return "Finish payout setup to get paid.";
    case "tax_information_required":
      return "We need your tax information before we can pay you.";
    case "held":
      return "Payouts are paused on this account.";
    case "not_eligible":
      return "No balance is available to pay out right now.";
    default:
      return "";
  }
}
