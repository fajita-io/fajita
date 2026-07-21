import type { Metadata } from "next";
import { redirect } from "next/navigation";

import { PageHeader } from "@/components/app/ui";
import {
  FirstSession,
  type FirstSessionInitial,
} from "@/components/app/onboarding/first-session";
import { requireActiveContext } from "@/lib/app/page-context";
import { getOnboardingState } from "@/lib/app/onboarding";
import {
  buildPaymentSetupUrl,
} from "@/lib/auth/paid-signup-flow";
import { canEnterProductSetup } from "@/lib/billing/setup-access";
import { can } from "@/lib/auth/roles";
import { computeOrgBillingState } from "@/lib/billing/engine";

export const metadata: Metadata = {
  title: "Get set up",
  robots: { index: false, follow: false },
};

export default async function OnboardingPage() {
  const { membership } = await requireActiveContext();
  const billing = await computeOrgBillingState(membership.organization.id);
  if (!canEnterProductSetup(billing)) {
    redirect(buildPaymentSetupUrl(billing.planKey ?? undefined, billing.interval ?? undefined));
  }

  const state = await getOnboardingState(membership.organization.id);
  const row = state.row;

  const initial: FirstSessionInitial = {
    useCase: row?.use_case ?? "",
    firstConcern: row?.first_concern ?? "",
    responsibilityRole: row?.responsibility_role ?? "",
  };

  const hasMonitor = state.signals.activeMonitorCount > 0;

  return (
    <div className="fj-app-narrow">
      <PageHeader
        title="Let's watch something that matters."
        description={
          hasMonitor
            ? "Your first monitor is already live. These answers still tune the remaining setup guidance."
            : "Start with a website, API, certificate, or scheduled job. Fajita will test the setup before monitoring begins."
        }
      />
      <FirstSession
        organizationId={membership.organization.id}
        canCreateMonitor={can(membership.role, "monitors:manage")}
        initial={initial}
      />
    </div>
  );
}
