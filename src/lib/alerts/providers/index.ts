import "server-only";

import { serverEnv } from "@/lib/env";
import {
  type ErrorCategory,
  categorizeHttpStatus,
  resultForCategory,
} from "@/lib/alerts/errors";
import {
  type AlertRenderContext,
  renderDiscord,
  renderEmail,
  renderSlack,
} from "@/lib/alerts/messages";
import { ALERT_LIMITS } from "@/lib/alerts/constants";
import { safePost } from "@/lib/alerts/providers/http";

/**
 * Provider adapters. Each returns a normalized outcome the engine records
 * through record_alert_attempt. No adapter throws for a provider-side failure:
 * failures are classified into the shared error taxonomy so retry, dead-letter,
 * and customer messaging all behave the same across providers. Secrets arrive
 * decrypted in memory and never leave this layer.
 */

export interface ProviderOutcome {
  result: "delivered" | "retryable_failure" | "permanent_failure" | "error";
  errorCategory: ErrorCategory | null;
  safeSummary: string;
  httpStatus: number | null;
  requestId: string | null;
  durationMs: number;
}

function mapBlockedReason(reason: string): ErrorCategory {
  switch (reason) {
    case "timeout":
      return "request_timed_out";
    case "network_error":
      return "provider_unavailable";
    case "blocked_destination":
    case "redirect_not_allowed":
      return "webhook_blocked";
    case "unsupported_scheme":
      return "configuration_error";
    case "invalid_url":
    case "embedded_credentials":
    case "blocked_port":
      return "destination_missing";
    default:
      return "unknown_provider_error";
  }
}

function delivered(durationMs: number, httpStatus: number | null, requestId: string | null): ProviderOutcome {
  return { result: "delivered", errorCategory: null, safeSummary: httpStatus ? `HTTP ${httpStatus}` : "Delivered", httpStatus, requestId, durationMs };
}

function failure(category: ErrorCategory, summary: string, httpStatus: number | null, durationMs: number, requestId: string | null = null): ProviderOutcome {
  return { result: resultForCategory(category), errorCategory: category, safeSummary: summary, httpStatus, requestId, durationMs };
}

function outcomeFromPost(providerLabel: string, res: Awaited<ReturnType<typeof safePost>>): ProviderOutcome {
  if (res.blockedReason) {
    const category = mapBlockedReason(res.blockedReason);
    const summary =
      res.blockedReason === "timeout"
        ? `${providerLabel} did not respond in time`
        : res.blockedReason === "redirect_not_allowed"
          ? `${providerLabel} returned a redirect (${res.status})`
          : res.blockedReason === "blocked_destination"
            ? `${providerLabel} endpoint is a restricted address`
            : `${providerLabel}: ${res.blockedReason}`;
    return failure(category, summary, res.status, res.durationMs, res.requestId);
  }
  if (res.ok) return delivered(res.durationMs, res.status, res.requestId);
  const status = res.status ?? 0;
  const { category } = categorizeHttpStatus(status);
  return failure(category ?? "unknown_provider_error", `HTTP ${status} from ${providerLabel}`, status, res.durationMs, res.requestId);
}

export async function sendSlackAlert(webhookUrl: string, ctx: AlertRenderContext): Promise<ProviderOutcome> {
  const res = await safePost({
    url: webhookUrl,
    body: JSON.stringify(renderSlack(ctx)),
    timeoutMs: ALERT_LIMITS.providerTimeoutMs,
  });
  return outcomeFromPost("Slack", res);
}

export async function sendDiscordAlert(webhookUrl: string, ctx: AlertRenderContext): Promise<ProviderOutcome> {
  const res = await safePost({
    url: `${webhookUrl}${webhookUrl.includes("?") ? "&" : "?"}wait=true`,
    body: JSON.stringify(renderDiscord(ctx)),
    timeoutMs: ALERT_LIMITS.providerTimeoutMs,
  });
  return outcomeFromPost("Discord", res);
}

export async function sendWebhookAlert(params: {
  url: string;
  body: string;
  headers: Record<string, string>;
  timeoutMs: number;
}): Promise<ProviderOutcome> {
  const res = await safePost({
    url: params.url,
    body: params.body,
    headers: params.headers,
    timeoutMs: params.timeoutMs,
    requestIdHeader: "x-request-id",
  });
  return outcomeFromPost("Webhook", res);
}

export async function sendEmailAlert(recipients: string[], ctx: AlertRenderContext): Promise<ProviderOutcome> {
  const started = Date.now();
  const env = serverEnv();
  if (!env.RESEND_API_KEY) {
    return failure("configuration_error", "Email delivery is not configured", null, Date.now() - started);
  }
  if (recipients.length === 0) {
    return failure("recipient_invalid", "No verified recipients", null, Date.now() - started);
  }
  const from = env.ALERT_EMAIL_FROM || "Fajita Alerts <alerts@fajita.io>";
  const email = renderEmail(ctx);

  const controller = new AbortController();
  const timer = setTimeout(() => controller.abort(), ALERT_LIMITS.providerTimeoutMs);
  try {
    const res = await fetch("https://api.resend.com/emails", {
      method: "POST",
      headers: {
        authorization: `Bearer ${env.RESEND_API_KEY}`,
        "content-type": "application/json",
      },
      body: JSON.stringify({
        from,
        to: recipients.slice(0, ALERT_LIMITS.maxEmailRecipientsPerChannel),
        subject: email.subject,
        html: email.html,
        text: email.text,
      }),
      signal: controller.signal,
    });
    const durationMs = Date.now() - started;
    if (res.ok) {
      let requestId: string | null = null;
      try {
        const json = (await res.json()) as { id?: string };
        requestId = json.id ?? null;
      } catch {
        // Ignore body parse errors; delivery already acknowledged.
      }
      return delivered(durationMs, res.status, requestId);
    }
    const { category } = categorizeHttpStatus(res.status);
    return failure(category ?? "unknown_provider_error", `HTTP ${res.status} from the email provider`, res.status, durationMs);
  } catch (err) {
    const durationMs = Date.now() - started;
    if (err instanceof Error && err.name === "AbortError") {
      return failure("request_timed_out", "The email provider did not respond in time", null, durationMs);
    }
    return failure("provider_unavailable", "The email provider is temporarily unavailable", null, durationMs);
  } finally {
    clearTimeout(timer);
  }
}
