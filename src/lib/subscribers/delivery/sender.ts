import "server-only";

import { serverEnv } from "@/lib/env";
import { type ErrorCategory, categorizeHttpStatus, resultForCategory } from "@/lib/alerts/errors";
import { withEmailBrandAttachments } from "@/lib/email/inline-assets";
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
  const env = serverEnv();
  if (!env.RESEND_API_KEY) {
    return failure("configuration_error", "Email delivery is not configured", null, Date.now() - started);
  }

  const headers: Record<string, string> = {};
  const unsubParts: string[] = [];
  if (params.unsubscribeMailto) unsubParts.push(`<mailto:${params.unsubscribeMailto}>`);
  if (params.oneClickUnsubscribeUrl) unsubParts.push(`<${params.oneClickUnsubscribeUrl}>`);
  if (unsubParts.length > 0) {
    headers["List-Unsubscribe"] = unsubParts.join(", ");
    if (params.oneClickUnsubscribeUrl) headers["List-Unsubscribe-Post"] = "List-Unsubscribe=One-Click";
  }

  const payload: Record<string, unknown> = withEmailBrandAttachments({
    from,
    to: [params.to],
    subject: params.email.subject,
    html: params.email.html,
    text: params.email.text,
  });
  if (params.replyTo) payload.reply_to = params.replyTo;
  if (Object.keys(headers).length > 0) payload.headers = headers;

  const controller = new AbortController();
  const timer = setTimeout(() => controller.abort(), SUBSCRIBER_EMAIL_TIMEOUT_MS);
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
      return delivered(durationMs, res.status, id);
    }
    if (res.status === 422) {
      return failure("recipient_invalid", "The email provider rejected the recipient", res.status, durationMs);
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
