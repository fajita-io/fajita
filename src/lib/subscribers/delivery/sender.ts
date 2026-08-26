import "server-only";

import { serverEnv } from "@/lib/env";
import { type ErrorCategory, categorizeHttpStatus, resultForCategory } from "@/lib/alerts/errors";
import { sendTransactionalEmail } from "@/lib/email/transport";
import { SUBSCRIBER_EMAIL_TIMEOUT_MS } from "../constants";
import type { RenderedEmail } from "../templates";

/**
 * Subscriber email sender (Resend transactional stream). Mirrors the Phase 7
 * email adapter: never throws for a provider-side failure, classifies into the
 * shared taxonomy, and returns a normalized outcome the engine records. Adds
 * List-Unsubscribe + one-click headers so operational mail is compliant and
 * inboxes can offer a native unsubscribe. No open-tracking pixel is added.
 */

export interface SendOutcome {
  result: "delivered" | "retryable_failure" | "permanent_failure" | "error";
  errorCategory: ErrorCategory | null;
  safeSummary: string;
  httpStatus: number | null;
  providerMessageId: string | null;
  durationMs: number;
}

export interface SendParams {
  to: string;
  email: RenderedEmail;
  replyTo?: string | null;
  /** Raw one-click unsubscribe URL (RFC 8058) and human unsubscribe URL. */
  oneClickUnsubscribeUrl?: string | null;
  unsubscribeMailto?: string | null;
}

function delivered(durationMs: number, status: number | null, id: string | null): SendOutcome {
  return { result: "delivered", errorCategory: null, safeSummary: status ? `HTTP ${status}` : "Delivered", httpStatus: status, providerMessageId: id, durationMs };
}

function failure(category: ErrorCategory, summary: string, status: number | null, durationMs: number): SendOutcome {
  return { result: resultForCategory(category), errorCategory: category, safeSummary: summary, httpStatus: status, providerMessageId: null, durationMs };
}

/** From identity: "<Status Page Name> via Fajita <verified@domain>". */
export function senderFrom(statusPageName: string): string {
  const env = serverEnv();
  const base = env.ALERT_EMAIL_FROM || "Fajita Status <status@fajita.io>";
  // Keep the verified address, prepend a friendly, non-spoofing display name.
  const angle = base.match(/<([^>]+)>/);
  const address = angle ? angle[1] : base;
  const cleanName = statusPageName.replace(/[<>"\r\n]/g, "").slice(0, 60);
  return `${cleanName} via Fajita <${address}>`;
}

export async function sendSubscriberEmail(from: string, params: SendParams): Promise<SendOutcome> {
  const started = Date.now();

  const headers: Record<string, string> = {};
  const unsubParts: string[] = [];
  if (params.unsubscribeMailto) unsubParts.push(`<mailto:${params.unsubscribeMailto}>`);
  if (params.oneClickUnsubscribeUrl) unsubParts.push(`<${params.oneClickUnsubscribeUrl}>`);
  if (unsubParts.length > 0) {
    headers["List-Unsubscribe"] = unsubParts.join(", ");
    if (params.oneClickUnsubscribeUrl) headers["List-Unsubscribe-Post"] = "List-Unsubscribe=One-Click";
  }

  const result = await sendTransactionalEmail(
    {
      from,
      to: [params.to],
      subject: params.email.subject,
      html: params.email.html,
      text: params.email.text,
      replyTo: params.replyTo,
      headers: Object.keys(headers).length > 0 ? headers : undefined,
    },
    SUBSCRIBER_EMAIL_TIMEOUT_MS,
  );

  const durationMs = Date.now() - started;
  if (result.ok) {
    return delivered(durationMs, result.httpStatus, result.messageId);
  }
  if (result.errorSummary === "Email delivery is not configured") {
    return failure("configuration_error", result.errorSummary, null, durationMs);
  }
  if (result.httpStatus === 422) {
    return failure("recipient_invalid", "The email provider rejected the recipient", result.httpStatus, durationMs);
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
