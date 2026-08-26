import "server-only";

import type { MonitorConfigSnapshot } from "@contracts/contract";

import { preflightDestination, validateUrl } from "@/lib/monitoring/destination";
import {
  SafeHttpBlockedError,
  safeMonitorFetch,
  type SafeHttpResponse,
} from "@/lib/monitoring/safe-http";

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
  const maxRedirects = Math.max(config.max_redirects ?? 5, 0);
  const followRedirects = config.follow_redirects ?? true;
  const monitorUserAgent =
    process.env.MONITOR_HTTP_USER_AGENT?.trim() ||
    "Fajita-Monitor-Cron/1.0 (+https://fajita.io/monitoring)";

  try {
    let currentUrl = validated.normalized;
    let redirectCount = 0;
    let res: SafeHttpResponse;

    for (;;) {
      const hopValidated = validateUrl(currentUrl);
      if (!hopValidated.ok) {
        return {
          status: "blocked",
          failureCategory: "redirect_blocked",
          httpStatus: null,
          finalUrl: currentUrl,
          redirectCount,
          responseBytes: 0,
          totalMs: Date.now() - started,
          safeErrorMessage: hopValidated.message ?? "Redirect target blocked.",
        };
      }

      const hopPreflight = await preflightDestination(currentUrl);
      if (!hopPreflight.ok) {
        return {
          status: "blocked",
          failureCategory: hopPreflight.isMetadata
            ? "metadata_blocked"
            : "redirect_blocked",
          httpStatus: null,
          finalUrl: currentUrl,
          redirectCount,
          responseBytes: 0,
          totalMs: Date.now() - started,
          safeErrorMessage: hopPreflight.message ?? "Redirect target blocked.",
        };
      }

      try {
        res = await safeMonitorFetch(hopValidated.normalized, {
          method: config.http_method ?? "GET",
          signal: controller.signal,
          headers: {
            "user-agent": monitorUserAgent,
            accept: "*/*",
          },
        });
      } catch (error) {
        if (error instanceof SafeHttpBlockedError) {
          return {
            status: "blocked",
            failureCategory: "destination_blocked",
            httpStatus: null,
            finalUrl: currentUrl,
            redirectCount,
            responseBytes: 0,
            totalMs: Date.now() - started,
            safeErrorMessage: error.message,
          };
        }
        throw error;
      }

      const isRedirect =
        res.status >= 300 &&
        res.status < 400 &&
        res.headers.has("location");

      if (!isRedirect) {
        break;
      }

      if (!followRedirects) {
        return {
          status: "failure",
          failureCategory: "redirect_not_followed",
          httpStatus: res.status,
          finalUrl: currentUrl,
          redirectCount,
          responseBytes: 0,
          totalMs: Date.now() - started,
          safeErrorMessage: "The server returned a redirect.",
        };
      }

      redirectCount += 1;
      if (redirectCount > maxRedirects) {
        return {
          status: "failure",
          failureCategory: "redirect_limit_exceeded",
          httpStatus: res.status,
          finalUrl: currentUrl,
          redirectCount,
          responseBytes: 0,
          totalMs: Date.now() - started,
          safeErrorMessage: "Too many redirects.",
        };
      }

      const location = res.headers.get("location")?.trim();
      if (!location) {
        return {
          status: "error",
          failureCategory: "network_error",
          httpStatus: res.status,
          finalUrl: currentUrl,
          redirectCount,
          responseBytes: 0,
          totalMs: Date.now() - started,
          safeErrorMessage: "The redirect response had no location.",
        };
      }

      try {
        currentUrl = new URL(location, currentUrl).toString();
      } catch {
        return {
          status: "blocked",
          failureCategory: "redirect_blocked",
          httpStatus: res.status,
          finalUrl: currentUrl,
          redirectCount,
          responseBytes: 0,
          totalMs: Date.now() - started,
          safeErrorMessage: "The redirect location could not be parsed.",
        };
      }
    }

    const body = await res.arrayBuffer();
    const bytes = body.byteLength;
    const limit = config.body_size_limit_bytes ?? 1_048_576;
    if (bytes > limit) {
      return {
        status: "failure",
        failureCategory: "oversized_response",
        httpStatus: res.status,
        finalUrl: res.url || currentUrl,
        redirectCount,
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
      finalUrl: res.url || currentUrl,
      redirectCount,
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
