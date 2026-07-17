import "server-only";

import type { MonitorConfig } from "@/lib/monitoring/config";
import { preflightDestination } from "@/lib/monitoring/destination";
import { recordSecurityEvent } from "@/lib/monitoring/security-events";

/**
 * Internal test-before-save path. This runs the same destination and SSRF gate
 * the scheduled worker applies, confirming a draft configuration targets a
 * permitted, resolvable destination before it is saved or activated. It never
 * creates a schedule, incident, or alert, and it stores no secret values.
 *
 * The authoritative check execution (timings, assertion evaluation, TLS
 * inspection) is performed by the Go worker for scheduled and worker-run test
 * checks. This preflight is the server-side validation gate that the Phase 5
 * monitor wizard will call before allowing save.
 */

export interface TestRunResult {
  ok: boolean;
  outcome: "validated" | "blocked";
  message: string;
}

export async function testMonitorConfig(params: {
  organizationId: string;
  monitorId?: string | null;
  config: MonitorConfig;
}): Promise<TestRunResult> {
  const { config, organizationId } = params;

  // Heartbeat monitors make no outbound request; there is nothing to preflight.
  if (config.monitor_type === "heartbeat") {
    return {
      ok: true,
      outcome: "validated",
      message: "Heartbeat monitors receive pings; no destination check is needed.",
    };
  }

  if (!config.target_url) {
    return { ok: false, outcome: "blocked", message: "A target URL is required." };
  }

  const pre = await preflightDestination(config.target_url);
  if (!pre.ok) {
    await recordSecurityEvent({
      organizationId,
      monitorId: params.monitorId ?? null,
      eventType: pre.isMetadata
        ? "blocked_metadata_address"
        : pre.reason === "unsupported_scheme"
          ? "unsupported_scheme"
          : pre.reason === "blocked_port"
            ? "blocked_port"
            : pre.reason === "embedded_credentials"
              ? "embedded_credentials"
              : "suspicious_destination",
      severity: "warning",
      safeSummary: "A monitor test was blocked by destination validation.",
    }).catch(() => {});
    return {
      ok: false,
      outcome: "blocked",
      message: pre.message ?? "The destination is not permitted.",
    };
  }

  return {
    ok: true,
    outcome: "validated",
    message: "The destination is permitted and resolvable.",
  };
}
