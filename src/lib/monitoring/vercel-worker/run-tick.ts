import "server-only";

import {
  detectMissedHeartbeats,
  expireStaleLeases,
  finalizeCheck,
  leaseDueChecks,
  loadMonitor,
  nextCheckAt,
  openMonitorDb,
  processIncidentEvaluations,
  registerWorker,
  workerHeartbeat,
} from "./db";
import { executeHttpMonitor } from "./execute-http";

export interface MonitorCronResult {
  workerId: string;
  leased: number;
  executed: number;
  succeeded: number;
  failed: number;
  expiredLeases: number;
  incidentEvaluations: number;
  heartbeatMisses: number;
}

/** Run one monitor cron pass: lease, execute HTTP checks, finalize, evaluate incidents. */
export async function runMonitorCronTick(): Promise<MonitorCronResult> {
  const sql = openMonitorDb();
  const result: MonitorCronResult = {
    workerId: "",
    leased: 0,
    executed: 0,
    succeeded: 0,
    failed: 0,
    expiredLeases: 0,
    incidentEvaluations: 0,
    heartbeatMisses: 0,
  };

  try {
    result.workerId = await registerWorker(sql);
    result.expiredLeases = await expireStaleLeases(sql);
    result.heartbeatMisses = await detectMissedHeartbeats(sql);

    const work = await leaseDueChecks(sql, result.workerId);
    result.leased = work.length;
    const leasedAt = new Date();

    for (const item of work) {
      const loaded = await loadMonitor(sql, item.monitorId, item.monitorVersionId);
      if (!loaded) continue;

      const startedAt = new Date();
      let outcome;

      if (loaded.config.monitor_type === "heartbeat") {
        outcome = {
          status: "success" as const,
          failureCategory: null,
          httpStatus: null,
          finalUrl: null,
          redirectCount: 0,
          responseBytes: 0,
          totalMs: 0,
          safeErrorMessage: null,
        };
      } else {
        outcome = await executeHttpMonitor(loaded.config);
      }

      const completedAt = new Date();
      await finalizeCheck(sql, {
        workerId: result.workerId,
        work: item,
        leasedAt,
        startedAt,
        completedAt,
        attemptCount: 1,
        status: outcome.status,
        failureCategory: outcome.failureCategory,
        httpStatus: outcome.httpStatus,
        finalUrl: outcome.finalUrl,
        redirectCount: outcome.redirectCount,
        responseBytes: outcome.responseBytes,
        totalMs: outcome.totalMs,
        safeErrorMessage: outcome.safeErrorMessage,
        nextCheckAt: nextCheckAt(loaded.config.check_interval_seconds ?? 300),
      });

      result.executed += 1;
      if (outcome.status === "success") result.succeeded += 1;
      else result.failed += 1;
    }

    result.incidentEvaluations = await processIncidentEvaluations(sql);
    await workerHeartbeat(sql, result.workerId, result.leased);
    return result;
  } finally {
    await sql.end({ timeout: 5 });
  }
}
