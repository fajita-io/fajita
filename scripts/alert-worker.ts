/**
 * Standalone Fajita alert delivery worker.
 *
 * Runs the consume + delivery passes on a fixed interval, off the request path.
 * Use in any Node runtime with the server environment configured (service role
 * key, monitor secret keyring, optional Resend key). Deployments that prefer a
 * scheduled HTTP trigger can instead hit POST /api/internal/alerts/run.
 *
 *   tsx scripts/alert-worker.ts
 *
 * Env:
 *   ALERT_WORKER_INTERVAL_MS  poll interval (default 5000)
 *   ALERT_WORKER_ID           stable worker id for lease attribution
 */

import { consumeOutbox } from "@/lib/alerts/delivery/consumer";
import { runDeliveryPass } from "@/lib/alerts/delivery/worker";

const intervalMs = Number.parseInt(process.env.ALERT_WORKER_INTERVAL_MS ?? "5000", 10);
const workerId = process.env.ALERT_WORKER_ID ?? `alert-worker-${process.pid}`;

let running = true;
let inFlight = false;

async function tick(): Promise<void> {
  if (inFlight) return;
  inFlight = true;
  try {
    const consumed = await consumeOutbox(100);
    const delivered = await runDeliveryPass({ workerId, max: 40, leaseSeconds: 90 });
    if (consumed.processed > 0 || delivered.leased > 0) {
      console.log(
        `[alert-worker] consumed ${consumed.processed} (delivered ${consumed.delivered}, suppressed ${consumed.suppressed}) | ` +
          `leased ${delivered.leased} (delivered ${delivered.delivered}, failed ${delivered.failed}, dead ${delivered.deadLettered})`,
      );
    }
  } catch (error) {
    console.error("[alert-worker] pass failed", error instanceof Error ? error.message : error);
  } finally {
    inFlight = false;
  }
}

async function main(): Promise<void> {
  console.log(`[alert-worker] starting ${workerId}, interval ${intervalMs}ms`);
  while (running) {
    await tick();
    await new Promise((r) => setTimeout(r, intervalMs));
  }
}

for (const sig of ["SIGINT", "SIGTERM"] as const) {
  process.on(sig, () => {
    console.log(`[alert-worker] ${sig} received, stopping after current pass`);
    running = false;
    setTimeout(() => process.exit(0), Math.min(intervalMs, 2000));
  });
}

void main();
