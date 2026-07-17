import type { Metadata } from "next";

import {
  OpsBreadcrumbs,
  OpsLinkButton,
  OpsMetricCard,
  OpsPageHeader,
  OpsPanel,
  OpsStatus,
} from "@/components/platform/ops-ui";
import { loadMonitoringOps } from "@/lib/platform/monitoring/ops";

export const metadata: Metadata = {
  title: "Monitoring engine",
  robots: { index: false, follow: false },
};

export const dynamic = "force-dynamic";

export default async function MonitoringOpsPage() {
  const data = await loadMonitoringOps();

  return (
    <>
      <OpsBreadcrumbs
        items={[
          { href: "/internal/command-center", label: "Ops" },
          { label: "Monitoring" },
        ]}
      />
      <OpsPageHeader
        title="Monitoring engine"
        deck="Scheduler, workers, leases, and check health. Secrets never appear here."
        actions={
          <>
            <OpsLinkButton href="/internal/monitoring/workers">Workers</OpsLinkButton>
            <OpsLinkButton href="/internal/monitoring/queues">Queues</OpsLinkButton>
            <OpsLinkButton href="/internal/monitoring/checks">Checks</OpsLinkButton>
          </>
        }
      />

      <div className="fj-ops-grid">
        <OpsMetricCard
          label="Active monitors"
          value={data.completeness === "unavailable" ? null : data.activeMonitors}
          completeness={data.completeness}
        />
        <OpsMetricCard
          label="Active leases"
          value={data.completeness === "unavailable" ? null : data.leaseCount}
          completeness={data.completeness}
        />
        <OpsMetricCard
          label="Workers"
          value={data.workers.length}
          completeness={data.completeness}
        />
        <OpsMetricCard
          label="Offline workers"
          value={data.offlineWorkerCount}
          completeness={data.completeness}
        />
        <OpsMetricCard
          label="Draining"
          value={data.drainingCount}
          completeness={data.completeness}
        />
      </div>

      <OpsPanel title="Workers">
        {data.workers.length === 0 ? (
          <p className="fj-ops-empty">No workers registered.</p>
        ) : (
          <table className="fj-ops-table">
            <thead>
              <tr>
                <th>Worker</th>
                <th>Region</th>
                <th>Version</th>
                <th>Health</th>
                <th>Leases</th>
                <th>Heartbeat</th>
              </tr>
            </thead>
            <tbody>
              {data.workers.map((w) => (
                <tr key={w.id}>
                  <td>{w.workerKey}</td>
                  <td>{w.region}</td>
                  <td>{w.version ?? "—"}</td>
                  <td>
                    <OpsStatus
                      state={
                        w.draining
                          ? "maintenance"
                          : w.healthy
                            ? "operational"
                            : "degraded"
                      }
                    />
                  </td>
                  <td>{w.activeLeaseCount}</td>
                  <td>{w.lastHeartbeatAt?.slice(0, 19) ?? "—"}</td>
                </tr>
              ))}
            </tbody>
          </table>
        )}
      </OpsPanel>
    </>
  );
}
