/**
 * Standalone Fajita status-page subscriber delivery worker.
 *
 * Runs the fan-out + delivery passes on a fixed interval, off the request path.
 * Publishing a public incident/maintenance event only enqueues a subscriber
 * event; this worker turns eligible subscribers into delivery intents and
 * sends the operational email through Resend. Deployments that prefer a
 * scheduled HTTP trigger can instead hit POST /api/internal/subscribers/run.
 *
 *   tsx scripts/subscriber-worker.ts
 *
 * Env:
 *   SUBSCRIBER_WORKER_INTERVAL_MS  poll interval (default 5000)
 *   SUBSCRIBER_WORKER_ID           stable worker id for lease attribution
 */

import { runFanoutPass } from "@/lib/subscribers/delivery/fanout";
import { runSubscriberDeliveryPass } from "@/lib/subscribers/delivery/worker";

const intervalMs = Number.parseInt(
  process.env.SUBSCRIBER_WORKER_INTERVAL_MS ?? "5000",
  10,
);
const workerId =
  process.env.SUBSCRIBER_WORKER_ID ?? `subscriber-worker-${process.pid}`;

let running = true;
let inFlight = false;

async function tick(): Promise<void> {
  if (inFlight) return;
  inFlight = true;
  try {
    const fanout = await runFanoutPass({ max: 20 });
    const delivered = await runSubscriberDeliveryPass({
      workerId,
      max: 40,
      leaseSeconds: 90,
    });
    if (fanout.events > 0 || delivered.leased > 0) {
      console.log(
        `[subscriber-worker] fanned out ${fanout.events} event(s) -> ${fanout.intents} intent(s) | ` +
          `leased ${delivered.leased} (delivered ${delivered.delivered}, failed ${delivered.failed}, dead ${delivered.deadLettered})`,
      );
    }
  } catch (error) {
    console.error(
      "[subscriber-worker] pass failed",
      error instanceof Error ? error.message : error,
    );
  } finally {
    inFlight = false;
  }
}

async function main(): Promise<void> {
  console.log(
    `[subscriber-worker] starting ${workerId}, interval ${intervalMs}ms`,
  );
  while (running) {
    await tick();
    await new Promise((r) => setTimeout(r, intervalMs));
  }
}

for (const sig of ["SIGINT", "SIGTERM"] as const) {
  process.on(sig, () => {
    console.log(`[subscriber-worker] ${sig} received, stopping after current pass`);
    running = false;
    setTimeout(() => process.exit(0), Math.min(intervalMs, 2000));
  });
}

void main();
