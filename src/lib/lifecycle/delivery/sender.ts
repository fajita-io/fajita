import "server-only";

import { serverEnv } from "@/lib/env";
import { emailAppLink } from "@/lib/email/links";
import {
  categorizeHttpStatus,
  resultForCategory,
  type ErrorCategory,
} from "@/lib/alerts/errors";
import type { RenderedLifecycleEmail } from "../emails/shell";
import { lifecycleMessage } from "../messages";
import { sendTransactionalEmail } from "@/lib/email/transport";

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

  const definition = lifecycleMessage(params.messageKey);
  const headers: Record<string, string> = {};
  if (definition && definition.class !== "required") {
    headers["List-Unsubscribe"] =
      `<${emailAppLink("/app/settings/notifications/lifecycle")}>`;
  }

  const result = await sendTransactionalEmail(
    {
      from: lifecycleFrom(params.messageKey),
      to: [params.to],
      subject: params.email.subject,
      html: params.email.html,
      text: params.email.text,
      headers: Object.keys(headers).length > 0 ? headers : undefined,
    },
    SEND_TIMEOUT_MS,
  );

  const durationMs = Date.now() - started;
  if (result.ok) {
    return {
      result: "delivered",
      errorCategory: null,
      safeSummary: result.httpStatus ? `HTTP ${result.httpStatus}` : "Delivered",
      httpStatus: result.httpStatus,
      providerMessageId: result.messageId,
      durationMs,
    };
  }
  if (result.errorSummary === "Email delivery is not configured") {
    return failure("configuration_error", result.errorSummary, null, durationMs);
  }
  if (result.httpStatus === 422) {
    return failure(
      "recipient_invalid",
      "The email provider rejected the recipient",
      result.httpStatus,
      durationMs,
    );
  }
  if (result.errorSummary?.includes("did not respond in time")) {
    return failure("request_timed_out", result.errorSummary, null, durationMs);
  }
  const { category } = result.httpStatus
    ? categorizeHttpStatus(result.httpStatus)
    : { category: "provider_unavailable" as ErrorCategory };
  return failure(
    category ?? "unknown_provider_error",
    result.errorSummary ?? "The email provider is temporarily unavailable",
    result.httpStatus,
    durationMs,
  );
}
