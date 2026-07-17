import "server-only";

import { serverEnv, appUrl } from "@/lib/env";
import {
  categorizeHttpStatus,
  resultForCategory,
  type ErrorCategory,
} from "@/lib/alerts/errors";
import type { RenderedLifecycleEmail } from "../emails/shell";
import { lifecycleMessage } from "../messages";

/**
 * Lifecycle email sender (Resend transactional stream, shared with Phase 7
 * alerts and Phase 9 subscriber email). Never throws for provider failures:
 * outcomes map onto the shared error taxonomy and the engine records them.
 *
 * Sender identity: "Fajita" for account and setup mail, "Fajita Reports" for
 * weekly reports and incident recaps. Both use the same verified address; the
 * display name changes, never the domain. Optional message classes carry a
 * List-Unsubscribe header pointing at authenticated preference management.
 */

const SEND_TIMEOUT_MS = 15_000;

export interface LifecycleSendOutcome {
  result: "delivered" | "retryable_failure" | "permanent_failure" | "error";
  errorCategory: ErrorCategory | null;
  safeSummary: string;
  httpStatus: number | null;
  providerMessageId: string | null;
  durationMs: number;
}

function verifiedAddress(): string {
  const base = serverEnv().ALERT_EMAIL_FROM || "Fajita <hello@fajita.io>";
  const angle = base.match(/<([^>]+)>/);
  return angle ? angle[1] : base;
}

/** From identity by message key (reports get their own display name). */
export function lifecycleFrom(messageKey: string): string {
  const definition = lifecycleMessage(messageKey);
  const name = definition?.class === "report" ? "Fajita Reports" : "Fajita";
  return `${name} <${verifiedAddress()}>`;
}

function failure(
  category: ErrorCategory,
  summary: string,
  status: number | null,
  durationMs: number,
): LifecycleSendOutcome {
  return {
    result: resultForCategory(category),
    errorCategory: category,
    safeSummary: summary,
    httpStatus: status,
    providerMessageId: null,
    durationMs,
  };
}

export async function sendLifecycleEmail(params: {
  to: string;
  messageKey: string;
  email: RenderedLifecycleEmail;
}): Promise<LifecycleSendOutcome> {
  const started = Date.now();
  const env = serverEnv();
  if (!env.RESEND_API_KEY) {
    return failure(
      "configuration_error",
      "Email delivery is not configured",
      null,
      Date.now() - started,
    );
  }

  const definition = lifecycleMessage(params.messageKey);
  const headers: Record<string, string> = {};
  if (definition && definition.class !== "required") {
    headers["List-Unsubscribe"] =
      `<${appUrl}/app/settings/notifications/lifecycle>`;
  }

  const payload: Record<string, unknown> = {
    from: lifecycleFrom(params.messageKey),
    to: [params.to],
    subject: params.email.subject,
    html: params.email.html,
    text: params.email.text,
  };
  if (Object.keys(headers).length > 0) payload.headers = headers;

  const controller = new AbortController();
  const timer = setTimeout(() => controller.abort(), SEND_TIMEOUT_MS);
  try {
    const res = await fetch("https://api.resend.com/emails", {
      method: "POST",
      headers: {
        authorization: `Bearer ${env.RESEND_API_KEY}`,
        "content-type": "application/json",
      },
      body: JSON.stringify(payload),
      signal: controller.signal,
    });
    const durationMs = Date.now() - started;
    if (res.ok) {
      let id: string | null = null;
      try {
        const json = (await res.json()) as { id?: string };
        id = json.id ?? null;
      } catch {
        // Delivery already acknowledged; ignore body parse errors.
      }
      return {
        result: "delivered",
        errorCategory: null,
        safeSummary: `HTTP ${res.status}`,
        httpStatus: res.status,
        providerMessageId: id,
        durationMs,
      };
    }
    if (res.status === 422) {
      return failure(
        "recipient_invalid",
        "The email provider rejected the recipient",
        res.status,
        durationMs,
      );
    }
    const { category } = categorizeHttpStatus(res.status);
    return failure(
      category ?? "unknown_provider_error",
      `HTTP ${res.status} from the email provider`,
      res.status,
      durationMs,
    );
  } catch (err) {
    const durationMs = Date.now() - started;
    if (err instanceof Error && err.name === "AbortError") {
      return failure(
        "request_timed_out",
        "The email provider did not respond in time",
        null,
        durationMs,
      );
    }
    return failure(
      "provider_unavailable",
      "The email provider is temporarily unavailable",
      null,
      durationMs,
    );
  } finally {
    clearTimeout(timer);
  }
}
