import "server-only";

import type { MonitorConfigSnapshot } from "@contracts/contract";

import { preflightDestination, validateUrl } from "@/lib/monitoring/destination";

export interface HttpExecutionResult {
  status: "success" | "failure" | "error" | "timed_out" | "blocked";
  failureCategory: string | null;
  httpStatus: number | null;
  finalUrl: string | null;
  redirectCount: number;
  responseBytes: number;
  totalMs: number;
  safeErrorMessage: string | null;
}

export async function executeHttpMonitor(
  config: MonitorConfigSnapshot,
): Promise<HttpExecutionResult> {
  const started = Date.now();
  const target = config.target_url?.trim();
  if (!target) {
    return {
      status: "error",
      failureCategory: "configuration_error",
      httpStatus: null,
      finalUrl: null,
      redirectCount: 0,
      responseBytes: 0,
      totalMs: Date.now() - started,
      safeErrorMessage: "Monitor has no target URL.",
    };
  }

  const validated = validateUrl(target);
  if (!validated.ok) {
    return {
      status: "blocked",
      failureCategory: "destination_blocked",
      httpStatus: null,
      finalUrl: null,
      redirectCount: 0,
      responseBytes: 0,
      totalMs: Date.now() - started,
      safeErrorMessage: validated.message ?? "Invalid URL.",
    };
  }

  const pre = await preflightDestination(target);
  if (!pre.ok) {
    return {
      status: "blocked",
      failureCategory: pre.isMetadata ? "metadata_blocked" : "destination_blocked",
      httpStatus: null,
      finalUrl: null,
      redirectCount: 0,
      responseBytes: 0,
      totalMs: Date.now() - started,
      safeErrorMessage: pre.message ?? "Destination blocked.",
    };
  }

  const timeoutMs = Math.min(Math.max(config.timeout_ms ?? 10_000, 1000), 60_000);
  const controller = new AbortController();
  const timer = setTimeout(() => controller.abort(), timeoutMs);

  try {
    const res = await fetch(validated.normalized, {
      method: config.http_method ?? "GET",
      redirect: config.follow_redirects ? "follow" : "manual",
      signal: controller.signal,
      headers: {
        "user-agent": "Fajita-Monitor-Cron/1.0 (+https://fajita.io/monitoring)",
        accept: "*/*",
      },
    });

    const body = await res.arrayBuffer();
    const bytes = body.byteLength;
    const limit = config.body_size_limit_bytes ?? 1_048_576;
    if (bytes > limit) {
      return {
        status: "failure",
        failureCategory: "oversized_response",
        httpStatus: res.status,
        finalUrl: res.url,
        redirectCount: 0,
        responseBytes: bytes,
        totalMs: Date.now() - started,
        safeErrorMessage: "Response exceeded the size limit.",
      };
    }

    const expected = config.expected_status_codes?.length
      ? config.expected_status_codes
      : [200];
    const ok = expected.includes(res.status);

    return {
      status: ok ? "success" : "failure",
      failureCategory: ok ? null : "status_code_mismatch",
      httpStatus: res.status,
      finalUrl: res.url,
      redirectCount: 0,
      responseBytes: bytes,
      totalMs: Date.now() - started,
      safeErrorMessage: ok ? null : `Expected one of ${expected.join(", ")}.`,
    };
  } catch (error) {
    const timedOut = error instanceof Error && error.name === "AbortError";
    return {
      status: timedOut ? "timed_out" : "error",
      failureCategory: timedOut ? "timeout" : "network_error",
      httpStatus: null,
      finalUrl: null,
      redirectCount: 0,
      responseBytes: 0,
      totalMs: Date.now() - started,
      safeErrorMessage: timedOut
        ? "The request timed out."
        : "The request could not be completed.",
    };
  } finally {
    clearTimeout(timer);
  }
}
