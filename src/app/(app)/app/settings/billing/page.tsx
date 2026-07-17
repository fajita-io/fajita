import type { Metadata } from "next";
import Link from "next/link";

import { AppSection } from "@/components/app/ui";
import { BillingActions } from "@/components/app/billing/billing-actions";
import { requireBillingContext } from "@/lib/app/billing-page";
import { BILLING_CATALOG } from "@/lib/billing/catalog";
import { subscriptionStatusLabel } from "@/lib/billing/subscription-state";

export const metadata: Metadata = {
  title: "Billing",
  robots: { index: false, follow: false },
};

function formatDate(iso: string | null): string {
  if (!iso) return "—";
  return new Date(iso).toLocaleDateString(undefined, {
    year: "numeric",
    month: "long",
    day: "numeric",
  });
}

export default async function BillingOverviewPage() {
  const { state, usage, canManage } = await requireBillingContext();

  const planName = state.planKey ? BILLING_CATALOG[state.planKey].name : null;
  const hasSubscription = state.status !== "none";
  const monitorLimit = state.entitlements.max_active_monitors;

  return (
    <>
      {state.grace ? (
        <div className="fj-notice fj-notice--warning" role="status" style={{ marginBottom: "var(--space-4)" }}>
          <p style={{ margin: 0 }}>
            <strong>Payment overdue.</strong>{" "}
            {state.grace.phase === "restricted"
              ? "Service is restricted until payment is resolved. Your data and settings are preserved."
              : `Monitoring continues during the grace period. Update your payment method${
                  state.grace.restrictionAt
                    ? ` before ${formatDate(state.grace.restrictionAt)}`
                    : ""
                } to avoid a service restriction.`}
          </p>
        </div>
      ) : null}

      {state.cancelAtPeriodEnd ? (
        <div className="fj-notice" role="status" style={{ marginBottom: "var(--space-4)" }}>
          <p style={{ margin: 0 }}>
            Your subscription is scheduled to cancel. Access continues until{" "}
            {formatDate(state.cancellationEffectiveAt ?? state.currentPeriodEnd)}.
            You can reactivate any time before then, and your monitoring
            history stays available through the retention period after that
            date.{" "}
            <Link href="/app/settings/data">Export your data</Link> whenever
            you like.
          </p>
        </div>
      ) : null}

      <AppSection
        title="Plan"
        description="Your current plan and subscription status."
      >
        <dl className="fj-stat-list">
          <div>
            <dt>Plan</dt>
            <dd>{planName ?? (state.isBetaGrant ? "Beta access" : "No plan")}</dd>
          </div>
          <div>
            <dt>Status</dt>
            <dd>{subscriptionStatusLabel(state.status)}</dd>
          </div>
          {state.interval ? (
            <div>
              <dt>Billing</dt>
              <dd>{state.interval === "year" ? "Annual" : "Monthly"}</dd>
            </div>
          ) : null}
          {hasSubscription ? (
            <div>
              <dt>{state.cancelAtPeriodEnd ? "Access ends" : "Renews"}</dt>
              <dd>{formatDate(state.currentPeriodEnd)}</dd>
            </div>
          ) : null}
        </dl>

        <div style={{ marginTop: "var(--space-4)" }}>
          <BillingActions
            organizationId={state.organizationId}
            canManage={canManage}
            hasSubscription={hasSubscription}
            cancelScheduled={state.cancelAtPeriodEnd}
            cancellationEffectiveAt={
              state.cancellationEffectiveAt ?? state.currentPeriodEnd
            }
          />
        </div>
      </AppSection>

      <AppSection
        title="Usage"
        description="A quick view of this organization against plan limits."
      >
        <dl className="fj-stat-list">
          <div>
            <dt>Active monitors</dt>
            <dd>
              {usage.activeMonitors}
              {monitorLimit != null ? ` of ${monitorLimit}` : ""}
            </dd>
          </div>
          <div>
            <dt>Team members</dt>
            <dd>
              {usage.teamMembers}
              {state.entitlements.max_organization_members != null
                ? ` of ${state.entitlements.max_organization_members}`
                : ""}
            </dd>
          </div>
          <div>
            <dt>Status pages</dt>
            <dd>
              {usage.statusPages}
              {state.entitlements.max_status_pages != null
                ? ` of ${state.entitlements.max_status_pages}`
                : ""}
            </dd>
          </div>
        </dl>
        <p style={{ marginTop: "var(--space-3)" }}>
          <Link href="/app/settings/billing/usage">See full usage</Link>
          {" · "}
          <Link href="/app/settings/billing/invoices">Invoices</Link>
        </p>
      </AppSection>

      <AppSection
        title="Payments and receipts"
        description="Payment methods, billing address, tax details, and invoices are managed securely by Stripe. Fajita never stores your card details."
      >
        <p className="fj-app-section__desc" style={{ margin: 0 }}>
          {canManage
            ? "Use Manage billing above to update your payment method or download receipts."
            : "Ask an owner to manage payment methods and receipts."}
        </p>
      </AppSection>
    </>
  );
}
