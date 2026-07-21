import type { Metadata } from "next";
import { redirect } from "next/navigation";

import type { PlanCardData } from "@/components/app/billing/plan-chooser";
import { PaymentSetup } from "@/components/app/billing/payment-setup";
import { resolveActiveOrg } from "@/lib/app/organizations";
import { readActiveOrgId } from "@/lib/app/active-org";
import {
  parseSignupPlanParams,
} from "@/lib/auth/paid-signup-flow";
import { shouldSkipPaymentStep } from "@/lib/billing/setup-access";
import { getCurrentProfile } from "@/lib/auth/context";
import { CATALOG_PLANS } from "@/lib/billing/catalog";
import { formatChecksCompact } from "@/lib/billing/check-volume";
import { computeOrgBillingState } from "@/lib/billing/engine";
import { intervalLabel } from "@/lib/monitoring/entitlements";

export const metadata: Metadata = {
  title: "Choose your plan",
  robots: { index: false, follow: false },
};

function highlightsFor(planKey: string): string[] {
  const plan = CATALOG_PLANS.find((p) => p.key === planKey);
  if (!plan) return [];
  const e = plan.entitlements;
  return [
    `${formatChecksCompact(e.max_monthly_checks)} checks included per month`,
    e.max_active_monitors == null
      ? "Unlimited monitors"
      : `${e.max_active_monitors} active monitors`,
    intervalLabel(e.minimum_check_interval_seconds).replace(
      "Every",
      "Checks every",
    ),
  ];
}

export default async function PaymentSetupPage({
  searchParams,
}: {
  searchParams: Promise<{ plan?: string; interval?: string }>;
}) {
  const profile = await getCurrentProfile();
  if (!profile || profile.deleted_at) redirect("/login");

  const requestedOrgId = await readActiveOrgId();
  const active = await resolveActiveOrg(profile.id, requestedOrgId);
  if (!active) redirect("/app/new-organization");

  const billing = await computeOrgBillingState(active.organization.id).catch(
    (error) => {
      console.error("[payment setup] billing state failed", error);
      return null;
    },
  );
  if (!billing) {
    return (
      <>
        <ol className="fj-flow__steps" aria-hidden="true">
          <li className="fj-flow__step" data-complete />
          <li className="fj-flow__step" data-active />
          <li className="fj-flow__step" />
        </ol>
        <div className="fj-flow__card" style={{ display: "grid", gap: "var(--space-4)" }}>
          <h1 className="fj-flow__title">Billing is unavailable</h1>
          <p className="fj-flow__lede">
            We could not load billing for this organization. Your account is fine.
            Try again in a moment.
          </p>
        </div>
      </>
    );
  }
  if (shouldSkipPaymentStep(billing)) {
    redirect("/app/onboarding");
  }

  const params = parseSignupPlanParams(await searchParams);
  const plans: PlanCardData[] = CATALOG_PLANS.map((p) => ({
    key: p.key,
    name: p.name,
    description: p.description,
    highlights: highlightsFor(p.key),
  }));

  return (
    <>
      <ol className="fj-flow__steps" aria-hidden="true">
        <li className="fj-flow__step" data-complete />
        <li className="fj-flow__step" data-active />
        <li className="fj-flow__step" />
      </ol>
      <PaymentSetup
        organizationId={active.organization.id}
        planKey={params.plan}
        interval={params.interval}
        plans={plans}
      />
    </>
  );
}
