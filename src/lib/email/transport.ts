import "server-only";

import { serverEnv } from "@/lib/env";
import { withEmailBrandAttachments } from "@/lib/email/inline-assets";

export type EmailProviderKind = "resend" | "smtp" | "disabled";

export interface TransactionalEmailPayload {
  from: string;
  to: string[];
  subject: string;
  html: string;
  text: string;
  replyTo?: string | null;
  headers?: Record<string, string>;
}

export interface EmailSendResult {
  ok: boolean;
  provider: EmailProviderKind;
  httpStatus: number | null;
  messageId: string | null;
  errorSummary: string | null;
}

/** Which email backend is active for this deployment. */
export function activeEmailProvider(): EmailProviderKind {
  const env = serverEnv();
  if (env.RESEND_API_KEY?.trim()) return "resend";
  if (
    env.SMTP_HOST?.trim() &&
    env.SMTP_PORT &&
    env.SMTP_FROM?.trim()
  ) {
    return "smtp";
  }
  return "disabled";
}

async function sendViaResend(
  payload: TransactionalEmailPayload,
  timeoutMs: number,
): Promise<EmailSendResult> {
  const env = serverEnv();
  const apiKey = env.RESEND_API_KEY;
  if (!apiKey) {
    return {
      ok: false,
      provider: "disabled",
      httpStatus: null,
      messageId: null,
      errorSummary: "Email delivery is not configured",
    };
  }

  const body: Record<string, unknown> = withEmailBrandAttachments({
    from: payload.from,
    to: payload.to,
    subject: payload.subject,
    html: payload.html,
    text: payload.text,
  });
  if (payload.replyTo) body.reply_to = payload.replyTo;
  if (payload.headers && Object.keys(payload.headers).length > 0) {
    body.headers = payload.headers;
  }

  const controller = new AbortController();
  const timer = setTimeout(() => controller.abort(), timeoutMs);
  try {
    const res = await fetch("https://api.resend.com/emails", {
      method: "POST",
      headers: {
        authorization: `Bearer ${apiKey}`,
        "content-type": "application/json",
      },
      body: JSON.stringify(body),
      signal: controller.signal,
    });
    if (res.ok) {
      let messageId: string | null = null;
      try {
        const json = (await res.json()) as { id?: string };
        messageId = json.id ?? null;
      } catch {
        // Delivery acknowledged; ignore parse errors.
      }
      return {
        ok: true,
        provider: "resend",
        httpStatus: res.status,
        messageId,
        errorSummary: null,
      };
    }
    return {
      ok: false,
      provider: "resend",
      httpStatus: res.status,
      messageId: null,
      errorSummary: `HTTP ${res.status} from the email provider`,
    };
  } catch (err) {
    const timedOut = err instanceof Error && err.name === "AbortError";
    return {
      ok: false,
      provider: "resend",
      httpStatus: null,
      messageId: null,
      errorSummary: timedOut
        ? "The email provider did not respond in time"
        : "The email provider is temporarily unavailable",
    };
  } finally {
    clearTimeout(timer);
  }
}

async function sendViaSmtp(
  payload: TransactionalEmailPayload,
  timeoutMs: number,
): Promise<EmailSendResult> {
  const env = serverEnv();
  const host = env.SMTP_HOST?.trim();
  const port = env.SMTP_PORT ?? 587;
  const from = env.SMTP_FROM?.trim() || payload.from;
  if (!host || !from) {
    return {
      ok: false,
      provider: "disabled",
      httpStatus: null,
      messageId: null,
      errorSummary: "SMTP is not configured",
    };
  }

  try {
    const nodemailer = await import("nodemailer");
    const transporter = nodemailer.createTransport({
      host,
      port,
      secure: port === 465,
      auth:
        env.SMTP_USER && env.SMTP_PASSWORD
          ? { user: env.SMTP_USER, pass: env.SMTP_PASSWORD }
          : undefined,
      connectionTimeout: timeoutMs,
      greetingTimeout: timeoutMs,
      socketTimeout: timeoutMs,
    });

    const info = await transporter.sendMail({
      from: payload.from || from,
      to: payload.to.join(", "),
      subject: payload.subject,
      html: payload.html,
      text: payload.text,
      replyTo: payload.replyTo ?? undefined,
      headers: payload.headers,
    });

    return {
      ok: true,
      provider: "smtp",
      httpStatus: null,
      messageId: typeof info.messageId === "string" ? info.messageId : null,
      errorSummary: null,
    };
  } catch (err) {
    return {
      ok: false,
      provider: "smtp",
      httpStatus: null,
      messageId: null,
      errorSummary:
        err instanceof Error ? err.message : "SMTP delivery failed",
    };
  }
}

/** Send a transactional email through the configured provider (Resend or SMTP). */
export async function sendTransactionalEmail(
  payload: TransactionalEmailPayload,
  timeoutMs: number,
): Promise<EmailSendResult> {
  const provider = activeEmailProvider();
  if (provider === "disabled") {
    return {
      ok: false,
      provider: "disabled",
      httpStatus: null,
      messageId: null,
      errorSummary: "Email delivery is not configured",
    };
  }
  if (provider === "smtp") {
    return sendViaSmtp(payload, timeoutMs);
  }
  return sendViaResend(payload, timeoutMs);
}
