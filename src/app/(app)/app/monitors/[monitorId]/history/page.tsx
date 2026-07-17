import Link from "next/link";
import { notFound } from "next/navigation";

import { BrandCard } from "@/components/design-system/primitives";
import { ResponseChart } from "@/components/app/monitors/response-chart";
import { StatusTimeline } from "@/components/app/monitors/status-timeline";
import { requireMonitorPage, loadMonitorDetail } from "@/lib/app/monitor-page";
import { getResultSeries, statsForMonitor } from "@/lib/monitoring/queries";
import { resolveEntitlements } from "@/lib/monitoring/entitlements.server";
import { formatResponseTime, formatUptime, uptimeBand } from "@/lib/monitoring/uptime";

const PERIODS: Record<string, { label: string; hours: number }> = {
  "24h": { label: "Last 24 hours", hours: 24 },
  "7d": { label: "Last 7 days", hours: 24 * 7 },
  "30d": { label: "Last 30 days", hours: 24 * 30 },
};

export default async function HistoryPage({
  params,
  searchParams,
}: {
  params: Promise<{ monitorId: string }>;
  searchParams: Promise<{ period?: string }>;
}) {
  const { monitorId } = await params;
  const sp = await searchParams;
  const ctx = await requireMonitorPage();
  const monitor = await loadMonitorDetail(ctx.organizationId, monitorId);
  if (!monitor) notFound();
  if (monitor.monitorType === "heartbeat") notFound();

  const ent = await resolveEntitlements(ctx.organizationId);
  const periodKey = PERIODS[sp.period ?? "7d"] ? (sp.period ?? "7d") : "7d";
  const period = PERIODS[periodKey];
  const cappedHours = Math.min(period.hours, ent.resultRetentionDays * 24);
  const since = new Date(Date.now() - cappedHours * 60 * 60 * 1000);

  const [stats, series] = await Promise.all([
    statsForMonitor(ctx.organizationId, monitorId, since),
    getResultSeries(ctx.organizationId, monitorId, since),
  ]);

  const base = `/app/monitors/${monitorId}/history`;

  return (
    <div style={{ display: "grid", gap: "var(--space-5)" }}>
      <nav className="fj-tabs" aria-label="History period">
        {Object.entries(PERIODS).map(([key, p]) => {
          const disabled = p.hours > ent.resultRetentionDays * 24;
          const active = key === periodKey;
          if (disabled) {
            return (
              <span key={key} className="fj-tab" aria-disabled="true" style={{ opacity: 0.5 }} title={`Beyond your ${ent.resultRetentionDays}-day retention`}>
                {p.label}
              </span>
            );
          }
          return (
            <Link key={key} href={`${base}?period=${key}`} className="fj-tab" aria-current={active ? "page" : undefined}>
              {p.label}
            </Link>
          );
        })}
      </nav>

      <div className="fj-stat-tiles">
        <Tile label="Uptime" value={formatUptime(stats)} tone={uptimeBand(stats)} />
        <Tile label="Checks" value={String(stats.totalConsidered)} />
        <Tile label="Failed" value={String(stats.failed + stats.errored + stats.timedOut)} />
        <Tile label="Avg response" value={formatResponseTime(stats.avgTotalMs)} />
      </div>

      <BrandCard>
        <h2 className="fj-section-title">Response time, {period.label.toLowerCase()}</h2>
        <ResponseChart points={series} thresholdMs={monitor.responseTimeThresholdMs} />
      </BrandCard>

      <BrandCard>
        <h2 className="fj-section-title">Check results</h2>
        <StatusTimeline points={series} />
      </BrandCard>

      <p className="fj-wiz__hint">
        Detailed check results are available for the last {ent.resultRetentionDays} days. Uptime counts completed
        checks that passed. Manual tests and paused periods are excluded.
      </p>
    </div>
  );
}

function Tile({
  label,
  value,
  tone,
}: {
  label: string;
  value: string;
  tone?: "operational" | "degraded" | "down" | "unknown";
}) {
  return (
    <div className="fj-stat-tile" data-tone={tone}>
      <span className="fj-stat-tile__label">{label}</span>
      <span className="fj-stat-tile__value">{value}</span>
    </div>
  );
}
