/**
 * Centralized public pricing configuration.
 *
 * Dollar amounts mirror BILLING_CATALOG (cents → dollars). When `published`
 * is true, marketing surfaces show amounts. Checkout still resolves Stripe
 * Prices by lookup key; these numbers are the customer-facing catalog.
 */
import { BILLING_CATALOG } from "@/lib/billing/catalog";
import { PLANS, type PlanId } from "@/lib/stripe/plans";

export interface PublicPlan {
  id: PlanId;
  name: string;
  /** Who it is for, in one plain line. */
  audience: string;
  monitorLimit: number | null;
  /** Approved dollar amounts. Null until published. */
  monthlyUsd: number | null;
  yearlyUsd: number | null;
  highlight: boolean;
}

export const pricingConfig = {
  /** True when dollar amounts may appear on customer-facing surfaces. */
  published: true as boolean,
  unpublishedNote:
    "Pricing publishes when accounts open. Early access members see it first, before anyone is asked to pay.",
  /** Lede used when amounts are published (homepage preview, pricing hero). */
  publishedNote:
    "Starter, Pro, and Business. Clear monitor limits. Monthly or annual. No usage traps.",
} as const;

function dollarsFromCents(cents: number): number {
  return cents / 100;
}

export const publicPlans: PublicPlan[] = [
  {
    id: "starter",
    name: PLANS.starter.name,
    audience: "For one product and the person who answers for it.",
    monitorLimit: PLANS.starter.monitorLimit,
    monthlyUsd: dollarsFromCents(BILLING_CATALOG.starter.pricing.monthlyCents),
    yearlyUsd: dollarsFromCents(BILLING_CATALOG.starter.pricing.yearlyCents),
    highlight: false,
  },
  {
    id: "pro",
    name: PLANS.pro.name,
    audience: "For growing products that need more monitors and faster checks.",
    monitorLimit: PLANS.pro.monitorLimit,
    monthlyUsd: dollarsFromCents(BILLING_CATALOG.pro.pricing.monthlyCents),
    yearlyUsd: dollarsFromCents(BILLING_CATALOG.pro.pricing.yearlyCents),
    highlight: true,
  },
  {
    id: "business",
    name: PLANS.business.name,
    audience: "For teams and agencies watching many products at once.",
    monitorLimit: PLANS.business.monitorLimit,
    monthlyUsd: dollarsFromCents(BILLING_CATALOG.business.pricing.monthlyCents),
    yearlyUsd: dollarsFromCents(BILLING_CATALOG.business.pricing.yearlyCents),
    highlight: false,
  },
];

export type ComparisonValue =
  | { kind: "text"; value: string }
  | { kind: "yes" }
  | { kind: "no" }
  | { kind: "at-launch" };

export interface ComparisonRow {
  label: string;
  /** One value per plan, in publicPlans order. */
  values: [ComparisonValue, ComparisonValue, ComparisonValue];
  note?: string;
}

const yes: ComparisonValue = { kind: "yes" };
const no: ComparisonValue = { kind: "no" };
const text = (value: string): ComparisonValue => ({ kind: "text", value });

/**
 * Comparison rows mirror catalog entitlements. Keep in sync when plan limits
 * change in BILLING_CATALOG.
 */
export const comparisonRows: ComparisonRow[] = [
  {
    label: "Monitors",
    values: [text("10"), text("50"), text("Unlimited")],
  },
  {
    label: "Website, API, SSL, and cron checks",
    values: [yes, yes, yes],
  },
  {
    label: "Fastest check interval",
    values: [text("5 min"), text("1 min"), text("1 min")],
  },
  {
    label: "Email alerts",
    values: [yes, yes, yes],
  },
  {
    label: "Slack, Discord, and webhooks",
    values: [no, yes, yes],
  },
  {
    label: "Public status page",
    values: [yes, yes, yes],
  },
  {
    label: "Custom status domain",
    values: [no, yes, yes],
  },
  {
    label: "Status page subscribers",
    values: [text("100"), text("2,500"), text("10,000")],
  },
  {
    label: "Team members",
    values: [text("1"), text("5"), text("15")],
  },
  {
    label: "Uptime history retention",
    values: [text("30 days"), text("90 days"), text("365 days")],
  },
  {
    label: "Data export",
    values: [no, yes, yes],
  },
];
