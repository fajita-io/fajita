/**
 * Centralized public pricing configuration.
 *
 * Dollar amounts mirror BILLING_CATALOG (cents → dollars). When `published`
 * is true, marketing surfaces show amounts. Checkout still resolves Stripe
 * Prices by lookup key; keep Dashboard prices aligned with these cents.
 */
import {
  BILLING_CATALOG,
  checksIncludedForPlan,
} from "@/lib/billing/catalog";
import {
  formatChecksCompact,
  VOLUME_TIERS,
  type VolumeTier,
} from "@/lib/billing/check-volume";
import { PLANS, type PlanId } from "@/lib/stripe/plans";

export interface PublicPlan {
  id: PlanId;
  name: string;
  audience: string;
  monitorLimit: number;
  checksIncluded: number;
  checksLabel: string;
  monthlyUsd: number | null;
  yearlyUsd: number | null;
  highlight: boolean;
}

export const pricingConfig = {
  published: true as boolean,
  unpublishedNote:
    "Pricing is on the pricing page. Pick a plan and start monitoring.",
  publishedNote:
    "Core, Team, and Scale. Checks included every month. Monthly or annual. No overage charges.",
  limitNote:
    "When you reach your included checks, scheduled monitoring pauses until you upgrade or your billing period resets.",
  annualNote: "Annual billing saves two months on every plan.",
} as const;

export { VOLUME_TIERS, type VolumeTier };

function dollarsFromCents(cents: number): number {
  return cents / 100;
}

export const publicPlans: PublicPlan[] = [
  {
    id: "starter",
    name: PLANS.starter.name,
    audience: "For one product and the person who answers for it.",
    monitorLimit: PLANS.starter.monitorLimit,
    checksIncluded: checksIncludedForPlan("starter"),
    checksLabel: formatChecksCompact(checksIncludedForPlan("starter")),
    monthlyUsd: dollarsFromCents(BILLING_CATALOG.starter.pricing.monthlyCents),
    yearlyUsd: dollarsFromCents(BILLING_CATALOG.starter.pricing.yearlyCents),
    highlight: false,
  },
  {
    id: "pro",
    name: PLANS.pro.name,
    audience: "For growing products that need more monitors and faster checks.",
    monitorLimit: PLANS.pro.monitorLimit,
    checksIncluded: checksIncludedForPlan("pro"),
    checksLabel: formatChecksCompact(checksIncludedForPlan("pro")),
    monthlyUsd: dollarsFromCents(BILLING_CATALOG.pro.pricing.monthlyCents),
    yearlyUsd: dollarsFromCents(BILLING_CATALOG.pro.pricing.yearlyCents),
    highlight: true,
  },
  {
    id: "business",
    name: PLANS.business.name,
    audience: "For teams and agencies watching many products at once.",
    monitorLimit: PLANS.business.monitorLimit,
    checksIncluded: checksIncludedForPlan("business"),
    checksLabel: formatChecksCompact(checksIncludedForPlan("business")),
    monthlyUsd: dollarsFromCents(BILLING_CATALOG.business.pricing.monthlyCents),
    yearlyUsd: dollarsFromCents(BILLING_CATALOG.business.pricing.yearlyCents),
    highlight: false,
  },
];

export type ComparisonValue =
  | { kind: "text"; value: string }
  | { kind: "yes" }
  | { kind: "no" }
  | { kind: "included" };

export interface ComparisonRow {
  label: string;
  values: [ComparisonValue, ComparisonValue, ComparisonValue];
  note?: string;
}

const yes: ComparisonValue = { kind: "yes" };
const no: ComparisonValue = { kind: "no" };
const text = (value: string): ComparisonValue => ({ kind: "text", value });

export const comparisonRows: ComparisonRow[] = [
  {
    label: "Checks included / month",
    values: [
      text(formatChecksCompact(checksIncludedForPlan("starter"))),
      text(formatChecksCompact(checksIncludedForPlan("pro"))),
      text(formatChecksCompact(checksIncludedForPlan("business"))),
    ],
    note: "Primary usage meter. Monitoring pauses at the limit until you upgrade.",
  },
  {
    label: "Monitors",
    values: [
      text(String(PLANS.starter.monitorLimit)),
      text(String(PLANS.pro.monitorLimit)),
      text(String(PLANS.business.monitorLimit)),
    ],
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
