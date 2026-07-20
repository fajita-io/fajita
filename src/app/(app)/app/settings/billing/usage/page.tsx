import type { Metadata } from "next";

import { AppSection } from "@/components/app/ui";
import { requireBillingContext } from "@/lib/app/billing-page";
import { intervalLabel } from "@/lib/monitoring/entitlements";

export const metadata: Metadata = {
  title: "Usage",
  robots: { index: false, follow: false },
};

interface UsageRow {
  label: string;
  used: number;
  limit: number | null;
  atLimitHint?: string;
}

function UsageMeter({ row }: { row: UsageRow }) {
  const unlimited = row.limit == null;
  const pct = unlimited
    ? 0
    : Math.min(100, Math.round((row.used / Math.max(1, row.limit ?? 1)) * 100));
  const atLimit = !unlimited && row.used >= (row.limit ?? 0);
  const warn = !unlimited && pct >= 80;

  return (
    <div style={{ display: "grid", gap: "var(--space-2)" }}>
      <div style={{ display: "flex", justifyContent: "space-between" }}>
        <span>{row.label}</span>
        <span>
          {row.used}
          {unlimited ? "" : ` / ${row.limit}`}
        </span>
      </div>
      {!unlimited ? (
        <div
          className="fj-meter"
          role="progressbar"
          aria-valuenow={row.used}
          aria-valuemin={0}
          aria-valuemax={row.limit ?? undefined}
          aria-label={`${row.label}: ${row.used} of ${row.limit}`}
          style={{
            height: 8,
            borderRadius: 999,
            background: "var(--color-background-inset)",
            overflow: "hidden",
          }}
        >
          <div
            style={{
              width: `${pct}%`,
              height: "100%",
              background: atLimit
                ? "var(--color-status-down-bold, #d64545)"
                : warn
                  ? "var(--color-status-degraded-bold)"
                  : "var(--color-status-operational-bold, #3fa34d)",
            }}
          />
        </div>
      ) : null}
      {atLimit ? (
        <p className="fj-notice fj-notice--warning" style={{ margin: 0 }}>
          {row.atLimitHint ??
            `You have reached the ${row.label.toLowerCase()} limit for this plan. Pause or remove one, or choose a plan with more capacity.`}
        </p>
      ) : null}
    </div>
  );
}

export default async function BillingUsagePage() {
  const { state, usage } = await requireBillingContext();
  const e = state.entitlements;

  const rows: UsageRow[] = [
    {
      label: "Checks this period",
      used: usage.checksThisPeriod ?? 0,
      limit: e.max_monthly_checks > 0 ? e.max_monthly_checks : null,
      atLimitHint:
        "You have reached your check allowance. Scheduled monitoring is paused until you upgrade or your billing period resets.",
    },
    { label: "Active monitors", used: usage.activeMonitors, limit: e.max_active_monitors },
    { label: "Team members", used: usage.teamMembers, limit: e.max_organization_members },
    { label: "Status pages", used: usage.statusPages, limit: e.max_status_pages },
    { label: "Custom domains", used: usage.customDomains, limit: e.custom_status_domains_enabled ? e.max_custom_status_domains : 0 },
    { label: "Alert channels", used: usage.alertChannels, limit: e.max_alert_channels },
    { label: "Alert rules", used: usage.alertRules, limit: e.max_alert_rules },
    { label: "Confirmed subscribers", used: usage.confirmedSubscribers, limit: e.max_confirmed_subscribers },
  ];

  return (
    <>
      <AppSection
        title="Usage against your plan"
        description="Existing resources are preserved. Check limits pause scheduled monitoring. Monitor limits apply to creating new ones."
      >
        <div style={{ display: "grid", gap: "var(--space-5)" }}>
          {rows.map((row) => (
            <UsageMeter key={row.label} row={row} />
          ))}
        </div>
      </AppSection>

      <AppSection title="Plan settings" description="What your plan allows.">
        <dl className="fj-stat-list">
          <div>
            <dt>Fastest check interval</dt>
            <dd>{intervalLabel(e.minimum_check_interval_seconds)}</dd>
          </div>
          <div>
            <dt>Detailed history</dt>
            <dd>{e.detailed_check_retention_days} days</dd>
          </div>
          <div>
            <dt>Data export</dt>
            <dd>{e.monitor_export_enabled ? "Included" : "Not on this plan"}</dd>
          </div>
          <div>
            <dt>Powered by Fajita</dt>
            <dd>
              {e.status_page_remove_powered_by ? "Can be removed" : "Shown on status pages"}
            </dd>
          </div>
        </dl>
      </AppSection>
    </>
  );
}
