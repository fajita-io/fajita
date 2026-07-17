import Link from "next/link";

import { listWorkers } from "@/lib/monitoring/workers";
import { WorkersClient } from "./workers-client";

/**
 * Platform-admin worker operations view. Shows safe operational fields for each
 * registered worker and offers a single safe action: request drain. No command
 * execution, secret access, or customer data browsing. Access is gated by the
 * parent lab layout (dev or platform admin); the drain action itself requires
 * platform admin.
 */
export default async function WorkerOpsPage() {
  const workers = await listWorkers();

  return (
    <main
      style={{
        maxWidth: 1040,
        margin: "0 auto",
        padding: "2.5rem 1.25rem 4rem",
        display: "flex",
        flexDirection: "column",
        gap: "1.5rem",
      }}
    >
      <header style={{ display: "flex", flexDirection: "column", gap: "0.4rem" }}>
        <p style={{ margin: 0 }}>
          <Link href="/internal/monitor-engine-lab" style={{ fontSize: "0.9rem" }}>
            ← Engine lab
          </Link>
        </p>
        <h1 style={{ fontSize: "1.6rem", margin: 0 }}>Worker operations</h1>
        <p style={{ color: "var(--color-text-muted)", margin: 0, maxWidth: "60ch" }}>
          Registered monitoring workers and their health. The only action here is
          requesting a drain; workers stop accepting new leases and finish
          in-flight checks before exiting.
        </p>
      </header>

      <WorkersClient workers={workers} />
    </main>
  );
}
