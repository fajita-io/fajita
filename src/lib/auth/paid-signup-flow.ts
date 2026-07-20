import type { BillingInterval, PlanId } from "@/lib/stripe/plans";
import { isBillingInterval, isPlanId } from "@/lib/stripe/plans";
import type { BillingAccessState } from "@/lib/billing/catalog";

export const DEFAULT_SIGNUP_PLAN: PlanId = "pro";
export const DEFAULT_SIGNUP_INTERVAL: BillingInterval = "month";

export interface SignupPlanParams {
  plan: PlanId;
  interval: BillingInterval;
}

export function parseSignupPlanParams(
  input: Record<string, string | string[] | undefined>,
): SignupPlanParams {
  const rawPlan = Array.isArray(input.plan) ? input.plan[0] : input.plan;
  const rawInterval = Array.isArray(input.interval)
    ? input.interval[0]
    : input.interval;

  return {
    plan: rawPlan && isPlanId(rawPlan) ? rawPlan : DEFAULT_SIGNUP_PLAN,
    interval:
      rawInterval && isBillingInterval(rawInterval)
        ? rawInterval
        : DEFAULT_SIGNUP_INTERVAL,
  };
}

export function buildSignupUrl(
  plan: PlanId = DEFAULT_SIGNUP_PLAN,
  interval: BillingInterval = DEFAULT_SIGNUP_INTERVAL,
): string {
  const params = new URLSearchParams({ plan, interval });
  return `/signup?${params.toString()}`;
}

export function buildNewOrganizationUrl(
  plan: PlanId = DEFAULT_SIGNUP_PLAN,
  interval: BillingInterval = DEFAULT_SIGNUP_INTERVAL,
): string {
  const params = new URLSearchParams({ plan, interval });
  return `/app/new-organization?${params.toString()}`;
}

export function buildPaymentSetupUrl(
  plan?: PlanId,
  interval?: BillingInterval,
): string {
  const params = new URLSearchParams();
  if (plan) params.set("plan", plan);
  if (interval) params.set("interval", interval);
  const query = params.toString();
  return query ? `/app/start/payment?${query}` : "/app/start/payment";
}

export function hasActiveSubscription(status: string): boolean {
  return ["active", "trialing", "cancellation_scheduled"].includes(status);
}

/** Product access for setup and the app shell (beta grant, grace, or paid). */
export function hasBillingAccess(billing: {
  status: string;
  accessState: BillingAccessState;
}): boolean {
  if (billing.accessState === "active" || billing.accessState === "grace_period") {
    return true;
  }
  return hasActiveSubscription(billing.status);
}
