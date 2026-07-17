import Link from "next/link";
import { notFound } from "next/navigation";

import { BrandCard } from "@/components/design-system/primitives";
import { ResponseChart } from "@/components/app/monitors/response-chart";
import { StatusTimeline } from "@/components/app/monitors/status-timeline";
import { ResultBadge } from "@/components/app/monitors/monitor-bits";
import { OperationalBadge } from "@/components/app/incidents/incident-bits";
import { requireMonitorPage, loadMonitorDetail } from "@/lib/app/monitor-page";
import { isFeatureEnabled } from "@/lib/app/feature-flags.server";
import { isPlatformAdmin } from "@/lib/auth/context";
import { getMonitorOperationalState } from "@/lib/incidents/queries";
import { OPERATIONAL_STATE_COPY } from "@/lib/incidents/copy";
import {
  getResultSeries,
  listHeartbeatEvents,
  listMonitorActivity,
  statsForMonitor,
} from "@/lib/monitoring/queries";
import { formatResponseTime, formatUptime, uptimeBand } from "@/lib/monitoring/uptime";
import { absoluteTime, activityLabel, exactDate, relativeTime } from "@/lib/monitoring/display";
import { intervalLabel } from "@/lib/monitoring/entitlements";

export default async function MonitorOverviewPage({
  params,
}: {
  params: Promise<{ monitorId: string }>;
}) {
  const { monitorId } = await params;
  const ctx = await requireMonitorPage();
  const monitor = await loadMonitorDetail(ctx.organizationId, monitorId);
  if (!monitor) notFound();

  const isHeartbeat = monitor.monitorType === "heartbeat";
  const since24h = new Date(Date.now() - 24 * 60 * 60 * 1000);
  const since7d = new Date(Date.now() - 7 * 24 * 60 * 60 * 1000);

  const [stats24h, stats7d, series, activity, heartbeats, incidentsEnabled, admin] =
    await Promise.all([
      statsForMonitor(ctx.organizationId, monitorId, since24h),
      statsForMonitor(ctx.organizationId, monitorId, since7d),
      isHeartbeat ? Promise.resolve([]) : getResultSeries(ctx.organizationId, monitorId, since7d),
      listMonitorActivity(ctx.organizationId, monitorId, 8),
      isHeartbeat ? listHeartbeatEvents(ctx.organizationId, monitorId, 20) : Promise.resolve([]),
      isFeatureEnabled("incidents", ctx.organizationId),
      isPlatformAdmin(),
    ]);

  const opState =
    incidentsEnabled || admin
      ? await getMonitorOperationalState(ctx.organizationId, monitorId)
      : null;

  const latest = monitor.latestResult;

  return (
    <div className="fj-mon-overview">
      <div style={{ display: "grid", gap: "var(--space-5)" }}>
        <div className="fj-stat-tiles">
          <Tile label="Latest result" node={<ResultBadge result={latest?.status ?? null} size="sm" />} />
          <Tile
            label="Uptime, 7 days"
            value={formatUptime(stats7d)}
            tone={uptimeBand(stats7d)}
          />
          <Tile
            label="Uptime, 24 hours"
            value={formatUptime(stats24h)}
            tone={uptimeBand(stats24h)}
          />
          <Tile
            label="Avg response, 7 days"
            value={formatResponseTime(stats7d.avgTotalMs)}
          />
        </div>

        {!isHeartbeat ? (
          <>
            <BrandCard>
              <h2 className="fj-section-title">Response time, last 7 days</h2>
              <ResponseChart
                points={series}
                thresholdMs={monitor.responseTimeThresholdMs}
              />
            </BrandCard>
            <BrandCard>
              <h2 className="fj-section-title">Recent checks</h2>
              <StatusTimeline points={series.slice(-60)} />
            </BrandCard>
          </>
        ) : (
          <BrandCard>
            <h2 className="fj-section-title">Recent heartbeats</h2>
            {heartbeats.length === 0 ? (
              <p className="fj-wiz__hint" style={{ marginTop: 0 }}>
                No pings received yet. Call the ping URL from your job to start the timeline.
              </p>
            ) : (
              <ul className="fj-activity">
                {heartbeats.map((h) => (
                  <li className="fj-activity__item" key={h.id}>
                    <span>Ping received{h.source ? ` from ${h.source}` : ""}</span>
                    <time className="fj-activity__time" dateTime={h.receivedAt} title={absoluteTime(h.receivedAt)}>
                      {relativeTime(h.receivedAt)}
                    </time>
                  </li>
                ))}
              </ul>
            )}
          </BrandCard>
        )}
      </div>

      <aside style={{ display: "grid", gap: "var(--space-5)" }}>
        {opState ? (
          <BrandCard>
            <h2 className="fj-section-title">Operational state</h2>
            <div className="fj-inc-state" style={{ marginBottom: "var(--space-3)" }}>
              <OperationalBadge state={opState.state} />
            </div>
            <p className="fj-inc-state__copy">{OPERATIONAL_STATE_COPY[opState.state]}</p>
            <dl className="fj-review-list" style={{ marginTop: "var(--space-3)" }}>
              <dt>Monitor</dt>
              <dd style={{ textTransform: "capitalize" }}>{monitor.status}</dd>
              <dt>Latest check</dt>
              <dd>
                <ResultBadge result={latest?.status ?? null} size="sm" />
              </dd>
              {opState.state === "verifying_failure" ? (
                <>
                  <dt>Confirming</dt>
                  <dd>{opState.consecutiveFailures} eligible failure(s)</dd>
                </>
              ) : null}
              {opState.state === "recovering" ? (
                <>
                  <dt>Recovery</dt>
                  <dd>{opState.consecutiveSuccesses} success(es) confirmed</dd>
                </>
              ) : null}
              {opState.flappingSince ? (
                <>
                  <dt>Flapping</dt>
                  <dd>Switching between pass and fail</dd>
                </>
              ) : null}
              <dt>Incident</dt>
              <dd>
                {opState.activeIncidentId ? (
                  <Link className="fj-link-button" href={`/app/incidents/${opState.activeIncidentId}`}>
                    View active incident
                  </Link>
                ) : (
                  "Not opened"
                )}
              </dd>
            </dl>
          </BrandCard>
        ) : null}

        <BrandCard>
          <h2 className="fj-section-title">Configuration</h2>
          <dl className="fj-review-list">
            {!isHeartbeat ? (
              <>
                <dt>Destination</dt><dd><code>{monitor.safeDestination}</code></dd>
                <dt>Method</dt><dd>{monitor.httpMethod}</dd>
                <dt>Interval</dt><dd>{intervalLabel(monitor.checkIntervalSeconds)}</dd>
                <dt>Timeout</dt><dd>{Math.round(monitor.timeoutMs / 1000)} s</dd>
                {monitor.responseTimeThresholdMs ? (
                  <><dt>Response limit</dt><dd>{formatResponseTime(monitor.responseTimeThresholdMs)}</dd></>
                ) : null}
                <dt>Assertions</dt><dd>{monitor.assertions.length}</dd>
              </>
            ) : (
              <>
                <dt>Type</dt><dd>Heartbeat</dd>
                <dt>Region</dt><dd>{monitor.region}</dd>
              </>
            )}
            <dt>Version</dt><dd>{monitor.versionNumber ? `v${monitor.versionNumber}` : "Draft"}</dd>
          </dl>
        </BrandCard>

        {monitor.monitorType === "ssl" && latest?.tls ? (
          <BrandCard>
            <h2 className="fj-section-title">Certificate</h2>
            <dl className="fj-review-list">
              <dt>Days left</dt><dd>{latest.tls.daysRemaining ?? "—"}</dd>
              <dt>Expires</dt><dd>{exactDate(latest.tls.notAfter)}</dd>
              <dt>Issuer</dt><dd>{latest.tls.issuer ?? "—"}</dd>
              <dt>Hostname</dt><dd>{latest.tls.hostnameMatch ? "Matches" : "Mismatch"}</dd>
            </dl>
          </BrandCard>
        ) : null}

        <BrandCard>
          <h2 className="fj-section-title">Recent activity</h2>
          {activity.length === 0 ? (
            <p className="fj-wiz__hint" style={{ marginTop: 0 }}>Nothing yet.</p>
          ) : (
            <ul className="fj-activity">
              {activity.map((a) => (
                <li className="fj-activity__item" key={a.id}>
                  <span>{activityLabel(a.action)}{a.actorName ? ` · ${a.actorName}` : ""}</span>
                  <time className="fj-activity__time" dateTime={a.createdAt} title={absoluteTime(a.createdAt)}>
                    {relativeTime(a.createdAt)}
                  </time>
                </li>
              ))}
            </ul>
          )}
        </BrandCard>
      </aside>
    </div>
  );
}

function Tile({
  label,
  value,
  node,
  tone,
}: {
  label: string;
  value?: string;
  node?: React.ReactNode;
  tone?: "operational" | "degraded" | "down" | "unknown";
}) {
  return (
    <div className="fj-stat-tile" data-tone={tone}>
      <span className="fj-stat-tile__label">{label}</span>
      <span className="fj-stat-tile__value">{node ?? value}</span>
    </div>
  );
}
