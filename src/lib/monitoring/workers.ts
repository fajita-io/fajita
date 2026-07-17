import "server-only";

import { serviceClient } from "@/lib/supabase/service";

/**
 * Worker registry read/ops for the platform-admin operations view. Worker
 * internals are never exposed to ordinary customers. Only safe operational
 * fields are surfaced, and the only mutation offered is marking a worker to
 * drain; there is no command execution, secret access, or query surface here.
 */

export interface WorkerView {
  id: string;
  workerKey: string;
  region: string;
  version: string | null;
  deploymentId: string | null;
  status: string;
  contractVersion: number;
  lastHeartbeatAt: string | null;
  activeLeaseCount: number;
  queueLagSeconds: number | null;
  recentSuccessCount: number;
  recentFailureCount: number;
  avgExecutionMs: number | null;
  shutdownRequested: boolean;
}

export async function listWorkers(): Promise<WorkerView[]> {
  const db = serviceClient();
  const { data, error } = await db
    .from("monitor_workers")
    .select(
      "id, worker_key, region, version, deployment_id, status, contract_version, last_heartbeat_at, active_lease_count, queue_lag_seconds, recent_success_count, recent_failure_count, avg_execution_ms, shutdown_requested",
    )
    .order("last_heartbeat_at", { ascending: false, nullsFirst: false });
  if (error) throw error;
  return (data ?? []).map((r) => ({
    id: r.id,
    workerKey: r.worker_key,
    region: r.region,
    version: r.version,
    deploymentId: r.deployment_id,
    status: r.status,
    contractVersion: r.contract_version,
    lastHeartbeatAt: r.last_heartbeat_at,
    activeLeaseCount: r.active_lease_count,
    queueLagSeconds: r.queue_lag_seconds,
    recentSuccessCount: r.recent_success_count,
    recentFailureCount: r.recent_failure_count,
    avgExecutionMs: r.avg_execution_ms,
    shutdownRequested: r.shutdown_requested,
  }));
}

/**
 * Request a worker drain. Sets shutdown_requested and marks the status
 * draining. The worker observes this on its next heartbeat and stops accepting
 * new leases while finishing in-flight checks.
 */
export async function markWorkerDraining(workerId: string): Promise<void> {
  const db = serviceClient();
  const { error } = await db
    .from("monitor_workers")
    .update({ shutdown_requested: true, status: "draining" })
    .eq("id", workerId);
  if (error) throw error;
}
