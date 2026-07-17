import type { Metadata } from "next";

import { PageHeader } from "@/components/app/ui";
import { PlanChooser, type PlanCardData } from "@/components/app/billing/plan-chooser";
import { requireBillingContext } from "@/lib/app/billing-page";
import { CATALOG_PLANS } from "@/lib/billing/catalog";
import { intervalLabel } from "@/lib/monitoring/entitlements";

export const metadata: Metadata = {
  title: "Change plan",
  robots: { index: false, follow: false },
};

function highlightsFor(planKey: string): string[] {
  const plan = CATALOG_PLANS.find((p) => p.key === planKey);
  if (!plan) return [];
  const e = plan.entitlements;
  const list: string[] = [];
  list.push(
    e.max_active_monitors == null
      ? "Unlimited monitors"
      : `${e.max_active_monitors} active monitors`,
  );
  list.push(intervalLabel(e.minimum_check_interval_seconds).replace("Every", "Checks every"));
  list.push(
    e.max_organization_members == null
      ? "Unlimited team members"
      : `${e.max_organization_members} team member${e.max_organization_members === 1 ? "" : "s"}`,
  );
  list.push(
    `${e.max_status_pages} status page${e.max_status_pages === 1 ? "" : "s"}`,
  );
  list.push(
    e.max_confirmed_subscribers == null
      ? "Unlimited subscribers"
      : `${e.max_confirmed_subscribers.toLocaleString()} subscribers`,
  );
  if (e.custom_status_domains_enabled) list.push("Custom status domains");
  if (e.slack_alerts_enabled) list.push("Slack, Discord, and webhook alerts");
  if (e.status_page_remove_powered_by) list.push("Remove Powered by Fajita");
  return list;
}

export default async function ChangePlanPage() {
  const { state, canManage } = await requireBillingContext();

  const plans: PlanCardData[] = CATALOG_PLANS.map((p) => ({
    key: p.key,
    name: p.name,
    description: p.description,
    highlights: highlightsFor(p.key),
  }));

  return (
    <>
      <PageHeader
        title="Choose a plan"
        description="Upgrades apply immediately. Downgrades take effect at the end of your billing period. Your data is always preserved."
      />
      <PlanChooser
        organizationId={state.organizationId}
        canManage={canManage}
        hasSubscription={state.status !== "none"}
        currentPlanKey={state.planKey}
        currentInterval={state.interval}
        plans={plans}
      />
    </>
  );
}
