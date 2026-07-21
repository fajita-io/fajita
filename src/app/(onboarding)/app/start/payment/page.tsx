import type { Metadata } from "next";
import { redirect } from "next/navigation";

import type { PlanCardData } from "@/components/app/billing/plan-chooser";
import { PaymentSetup } from "@/components/app/billing/payment-setup";
import { startCheckoutAction } from "@/lib/app/actions/billing";
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
import { stripeLivePaymentsReady } from "@/lib/billing/stripe-account";
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

  let active;
  try {
    const requestedOrgId = await readActiveOrgId();
    active = await resolveActiveOrg(profile.id, requestedOrgId);
  } catch (error) {
    console.error("[payment setup] active org resolution failed", error);
    active = null;
  }
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

  const paymentsReady = await stripeLivePaymentsReady().catch((error) => {
    console.error("[payment setup] stripe payments readiness failed", error);
    return false;
  });

  let checkoutError: string | null = null;
  if (params.plan && paymentsReady) {
    const checkout = await startCheckoutAction(
      active.organization.id,
      params.plan,
      params.interval,
    );
    if (checkout.ok && checkout.data?.url) {
      redirect(checkout.data.url);
    }
    checkoutError = checkout.ok
      ? "Could not start checkout."
      : checkout.error;
  }

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
        initialError={checkoutError}
        paymentsReady={paymentsReady}
      />
    </>
  );
}
