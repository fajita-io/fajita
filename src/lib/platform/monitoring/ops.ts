import "server-only";

import { listWorkers } from "@/lib/monitoring/workers";
import { serviceClient } from "@/lib/supabase/service";
import type { DataCompleteness } from "../metrics/definitions";

export async function loadMonitoringOps() {
  const db = serviceClient();
  let completeness: DataCompleteness = "complete";

  const [workers, monitors, leases] = await Promise.all([
    listWorkers().catch(() => {
      completeness = "partial";
      return [];
    }),
    db
      .from("monitors")
      .select("id", { count: "exact", head: true })
      .eq("status", "active"),
    db.from("monitor_leases").select("id", { count: "exact", head: true }),
  ]);

  if (monitors.error) completeness = "unavailable";

  const now = Date.now();
  const offlineWorkers = workers.filter((w) => {
    const hb = w.lastHeartbeatAt ? new Date(w.lastHeartbeatAt).getTime() : 0;
    return !hb || now - hb > 5 * 60 * 1000;
  });
  const draining = workers.filter(
    (w) => w.shutdownRequested || w.status === "draining",
  );

  return {
    completeness,
    activeMonitors: monitors.count ?? 0,
    leaseCount: leases.count ?? 0,
    workers: workers.map((w) => ({
      id: w.id,
      workerKey: w.workerKey,
      region: w.region,
      version: w.version,
      draining: w.shutdownRequested || w.status === "draining",
      lastHeartbeatAt: w.lastHeartbeatAt,
      activeLeaseCount: w.activeLeaseCount,
      healthy:
        Boolean(w.lastHeartbeatAt) &&
        now - new Date(w.lastHeartbeatAt!).getTime() < 5 * 60 * 1000,
    })),
    offlineWorkerCount: offlineWorkers.length,
    drainingCount: draining.length,
  };
}
