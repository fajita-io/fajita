/** Customer referral helpers (distinct from affiliate commissions). */

export const CUSTOMER_REFERRAL_COOKIE = "fj_cust_ref";
export const CUSTOMER_REFERRAL_WINDOW_DAYS = 30;
export const REFERRAL_POLICY_VERSION = "customer-referral-v1";

export type ReferralRewardType = "none" | "thank_you" | "affiliate_invite";

export interface ReferralEligibilityInput {
  coreActivated: boolean;
  accountAgeDays: number;
  minAccountAgeDays: number;
  billingHealthy: boolean;
  securityRestricted: boolean;
  unresolvedSevereSupport: boolean;
  satisfactionSignal: "positive" | "neutral" | "negative" | "unknown";
  realProductUsage: boolean;
  activeIncident: boolean;
  paymentFailure: boolean;
  cancellationInProgress: boolean;
}

export interface ReferralEligibilityResult {
  eligible: boolean;
  reasons: string[];
  rewardType: ReferralRewardType;
}

export function evaluateReferralEligibility(
  input: ReferralEligibilityInput,
): ReferralEligibilityResult {
  const reasons: string[] = [];

  if (!input.coreActivated) reasons.push("Core activation required");
  if (input.accountAgeDays < input.minAccountAgeDays) {
    reasons.push(`Minimum account age is ${input.minAccountAgeDays} days`);
  }
  if (!input.billingHealthy) reasons.push("Billing must be in good standing");
  if (input.securityRestricted) reasons.push("Security restriction active");
  if (input.unresolvedSevereSupport) {
    reasons.push("Unresolved severe support issue");
  }
  if (input.satisfactionSignal === "negative") {
    reasons.push("Satisfaction signal is negative");
  }
  if (!input.realProductUsage) reasons.push("Real product usage required");
  if (input.activeIncident) reasons.push("Do not prompt during active incident");
  if (input.paymentFailure) reasons.push("Do not prompt during payment failure");
  if (input.cancellationInProgress) {
    reasons.push("Do not prompt during cancellation");
  }

  return {
    eligible: reasons.length === 0,
    reasons,
    rewardType: "thank_you",
  };
}

export type AttributionConflict =
  | "none"
  | "self_referral"
  | "duplicate"
  | "affiliate_locked"
  | "window_expired";

/** Resolve referral vs affiliate attribution. Locked affiliate attribution wins. */
export function resolveAttributionConflict(input: {
  isSelfReferral: boolean;
  alreadyAttributed: boolean;
  affiliateLocked: boolean;
  windowExpired: boolean;
}): { acceptReferral: boolean; conflict: AttributionConflict; note: string } {
  if (input.isSelfReferral) {
    return {
      acceptReferral: false,
      conflict: "self_referral",
      note: "Self-referral blocked",
    };
  }
  if (input.alreadyAttributed) {
    return {
      acceptReferral: false,
      conflict: "duplicate",
      note: "Organization already has referral attribution",
    };
  }
  if (input.affiliateLocked) {
    return {
      acceptReferral: false,
      conflict: "affiliate_locked",
      note: "Affiliate attribution is locked; referral does not create a commission",
    };
  }
  if (input.windowExpired) {
    return {
      acceptReferral: false,
      conflict: "window_expired",
      note: "Referral attribution window expired",
    };
  }
  return {
    acceptReferral: true,
    conflict: "none",
    note: "Customer referral attributed. No cash reward by default.",
  };
}

export function buildShareCopy(referralCode: string, origin: string): {
  link: string;
  text: string;
} {
  const link = `${origin}/r/${referralCode}`;
  return {
    link,
    text: `I use Fajita to watch uptime before customers notice. If you want the same, start here: ${link}`,
  };
}

export const APPROVED_SHARE_COPY = [
  "I use Fajita to watch websites, APIs, certificates, and cron jobs before customers smell smoke.",
  "When something starts cooking, my team hears first. Fajita keeps the watch.",
];
