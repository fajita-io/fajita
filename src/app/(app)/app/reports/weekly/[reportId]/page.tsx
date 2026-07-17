import type { Metadata } from "next";
import Link from "next/link";
import { notFound } from "next/navigation";

import { AppSection, PageHeader } from "@/components/app/ui";
import { requireActiveContext } from "@/lib/app/page-context";
import { isFeatureEnabled } from "@/lib/app/feature-flags.server";
import { isPlatformAdmin } from "@/lib/auth/context";
import { getWeeklyReport } from "@/lib/reports/queries";

export const metadata: Metadata = {
  title: "Weekly report",
  robots: { index: false, follow: false },
};

function ms(value: number | null): string {
  if (value == null) return "n/a";
  return value >= 1000 ? `${(value / 1000).toFixed(2)} s` : `${value} ms`;
}

function Metric({ label, value }: { label: string; value: string }) {
  return (
    <div className="fj-inc-metric">
      <div className="fj-inc-metric__label">{label}</div>
      <div className="fj-inc-metric__value fj-numeric">{value}</div>
    </div>
  );
}

export default async function WeeklyReportPage({
  params,
}: {
  params: Promise<{ reportId: string }>;
}) {
  const { reportId } = await params;
  const { membership } = await requireActiveContext();
  const org = membership.organization;

  const [enabled, admin] = await Promise.all([
    isFeatureEnabled("reports", org.id),
    isPlatformAdmin(),
  ]);
  if (!enabled && !admin) notFound();

  const report = await getWeeklyReport(org.id, reportId);
  if (!report) notFound();
  const s = report.snapshot;

  return (
    <>
      <PageHeader
        title={`Weekly report: ${s.periodLabel}`}
        description={`Generated ${new Date(report.generatedAt).toLocaleString("en-US", { timeZone: report.timezone })} (${report.timezone.replace(/_/g, " ")}). This snapshot is fixed; it does not change as new data arrives.`}
        actions={
          <Link className="fj-link-button" href="/app/reports">
            All reports
          </Link>
        }
      />

      {report.dataCompleteness !== "complete" ? (
        <div className="fj-notice" role="status">
          Some monitoring data for this period was unavailable. Success rates
          exclude the uncertain periods; they are not counted as downtime.
        </div>
      ) : null}

      <AppSection title="Reliability at a glance">
        <div className="fj-inc-metrics">
          <Metric label="Check success" value={s.checks.successRateLabel} />
          <Metric
            label="Checks completed"
            value={s.checks.totalConsidered.toLocaleString("en-US")}
          />
          <Metric
            label="Active monitors"
            value={String(s.monitors.activeCount)}
          />
          <Metric
            label="Monitors with failures"
            value={String(s.monitors.withFailures.length)}
          />
          <Metric label="Avg response" value={ms(s.checks.avgResponseMs)} />
          <Metric
            label="Incidents opened"
            value={String(s.incidents.openedCount)}
          />
        </div>
      </AppSection>

      {s.monitors.withFailures.length > 0 ? (
        <AppSection
          title="Monitors with failures"
          description="Failed, errored, or timed-out scheduled checks during the period."
        >
          <table className="fj-table">
            <thead>
              <tr>
                <th scope="col">Monitor</th>
                <th scope="col">Failed checks</th>
                <th scope="col">Total checks</th>
              </tr>
            </thead>
            <tbody>
              {s.monitors.withFailures.map((m) => (
                <tr key={m.name}>
                  <td>{m.name}</td>
                  <td className="fj-numeric">{m.failed}</td>
                  <td className="fj-numeric">{m.total}</td>
                </tr>
              ))}
            </tbody>
          </table>
        </AppSection>
      ) : null}

      {s.incidents.items.length > 0 ? (
        <AppSection title="Incidents">
          <table className="fj-table">
            <thead>
              <tr>
                <th scope="col">Incident</th>
                <th scope="col">Severity</th>
                <th scope="col">Opened</th>
                <th scope="col">Duration</th>
              </tr>
            </thead>
            <tbody>
              {s.incidents.items.map((i) => (
                <tr key={`${i.title}-${i.openedAt}`}>
                  <td>{i.title}</td>
                  <td>{i.severity}</td>
                  <td>
                    {new Date(i.openedAt).toLocaleString("en-US", {
                      timeZone: report.timezone,
                      month: "short",
                      day: "numeric",
                      hour: "numeric",
                      minute: "2-digit",
                    })}
                  </td>
                  <td className="fj-numeric">
                    {i.durationMinutes != null
                      ? `${i.durationMinutes} min`
                      : "Unresolved at period end"}
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </AppSection>
      ) : (
        <AppSection title="Incidents">
          <p className="fj-app-section__desc">
            No incidents opened during this period.
          </p>
        </AppSection>
      )}

      {s.monitors.slowest.length > 0 ? (
        <AppSection
          title="Performance"
          description="Slowest monitors by 95th percentile response time (successful checks only)."
        >
          <table className="fj-table">
            <thead>
              <tr>
                <th scope="col">Monitor</th>
                <th scope="col">p95 response</th>
              </tr>
            </thead>
            <tbody>
              {s.monitors.slowest.map((m) => (
                <tr key={m.name}>
                  <td>{m.name}</td>
                  <td className="fj-numeric">{ms(m.p95Ms)}</td>
                </tr>
              ))}
            </tbody>
          </table>
        </AppSection>
      ) : null}

      {(s.certificates.expired.length > 0 ||
        s.certificates.criticalWithin7.length > 0 ||
        s.certificates.expiringWithin30.length > 0) ? (
        <AppSection title="Certificates">
          <table className="fj-table">
            <thead>
              <tr>
                <th scope="col">Monitor</th>
                <th scope="col">Status</th>
              </tr>
            </thead>
            <tbody>
              {s.certificates.expired.map((c) => (
                <tr key={c.name}>
                  <td>{c.name}</td>
                  <td>Expired</td>
                </tr>
              ))}
              {s.certificates.criticalWithin7.map((c) => (
                <tr key={c.name}>
                  <td>{c.name}</td>
                  <td>{c.daysRemaining} days remaining (critical)</td>
                </tr>
              ))}
              {s.certificates.expiringWithin30.map((c) => (
                <tr key={c.name}>
                  <td>{c.name}</td>
                  <td>{c.daysRemaining} days remaining</td>
                </tr>
              ))}
            </tbody>
          </table>
        </AppSection>
      ) : null}

      {s.heartbeats.monitorsWithMisses.length > 0 ? (
        <AppSection title="Heartbeats">
          <table className="fj-table">
            <thead>
              <tr>
                <th scope="col">Monitor</th>
                <th scope="col">Missed check-ins</th>
              </tr>
            </thead>
            <tbody>
              {s.heartbeats.monitorsWithMisses.map((h) => (
                <tr key={h.name}>
                  <td>{h.name}</td>
                  <td className="fj-numeric">{h.failed}</td>
                </tr>
              ))}
            </tbody>
          </table>
        </AppSection>
      ) : null}

      <AppSection title="Alert delivery">
        <div className="fj-inc-metrics">
          <Metric label="Delivered" value={String(s.alerts.delivered)} />
          <Metric label="Failed" value={String(s.alerts.failed)} />
          <Metric label="Retrying" value={String(s.alerts.retrying)} />
          <Metric
            label="Dead-lettered"
            value={String(s.alerts.deadLettered)}
          />
        </div>
      </AppSection>

      {s.recommendedActions.length > 0 ? (
        <AppSection
          title="Recommended actions"
          description="Deterministic recommendations from this period's data. Nothing speculative."
        >
          <ul className="fj-activity">
            {s.recommendedActions.map((action) => (
              <li key={action} className="fj-activity__item">
                <span>{action}</span>
              </li>
            ))}
          </ul>
        </AppSection>
      ) : null}
    </>
  );
}
