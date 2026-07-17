import "server-only";

import { createHmac, timingSafeEqual } from "node:crypto";

/**
 * Verified subscriber-email provider callbacks (Resend, which signs with Svix).
 * We verify the signature and timestamp before trusting any status change, then
 * map the payload to a small, safe classification. Full provider payloads are
 * never retained; only a safe summary and mapped fields reach the database.
 *
 * Signature scheme (Svix): the signed content is `${id}.${timestamp}.${body}`,
 * HMAC-SHA256 with the base64-decoded secret (the part after `whsec_`),
 * base64-encoded, compared constant-time against each `v1,<sig>` entry in the
 * `svix-signature` header. Timestamps outside a tolerance window are rejected
 * to prevent replay.
 */

const TOLERANCE_SECONDS = 300;

export interface CallbackHeaders {
  id: string | null;
  timestamp: string | null;
  signature: string | null;
}

export function verifyResendSignature(
  secret: string,
  headers: CallbackHeaders,
  rawBody: string,
  now: number = Date.now(),
): boolean {
  if (!headers.id || !headers.timestamp || !headers.signature) return false;

  const ts = Number.parseInt(headers.timestamp, 10);
  if (!Number.isFinite(ts)) return false;
  const skew = Math.abs(Math.floor(now / 1000) - ts);
  if (skew > TOLERANCE_SECONDS) return false;

  const key = secret.startsWith("whsec_") ? secret.slice(6) : secret;
  let keyBytes: Buffer;
  try {
    keyBytes = Buffer.from(key, "base64");
  } catch {
    return false;
  }
  const signed = `${headers.id}.${headers.timestamp}.${rawBody}`;
  const expected = createHmac("sha256", keyBytes).update(signed).digest("base64");

  // svix-signature is space-delimited "v1,<sig> v1,<sig2>".
  for (const part of headers.signature.split(" ")) {
    const comma = part.indexOf(",");
    const sig = comma >= 0 ? part.slice(comma + 1) : part;
    const a = Buffer.from(sig);
    const b = Buffer.from(expected);
    if (a.length === b.length && timingSafeEqual(a, b)) return true;
  }
  return false;
}

export interface MappedCallback {
  eventId: string;              // idempotency key (svix message id)
  providerMessageId: string | null;
  eventType: "delivered" | "bounced" | "complained" | "other";
  bounceClass: "hard" | "soft" | null;
  safeSummary: string;
}

interface ResendPayload {
  type?: string;
  data?: {
    email_id?: string;
    bounce?: { type?: string; subType?: string } | string;
  };
}

/** Parse a verified Resend payload into a safe, mapped callback. */
export function mapResendPayload(svixId: string, body: unknown): MappedCallback | null {
  const p = body as ResendPayload;
  if (!p || typeof p.type !== "string") return null;
  const messageId = p.data?.email_id ?? null;

  let eventType: MappedCallback["eventType"] = "other";
  let bounceClass: MappedCallback["bounceClass"] = null;
  if (p.type === "email.delivered") eventType = "delivered";
  else if (p.type === "email.complained") eventType = "complained";
  else if (p.type === "email.bounced") {
    eventType = "bounced";
    const b = p.data?.bounce;
    const raw = typeof b === "string" ? b : (b?.type ?? "");
    // Treat anything not explicitly transient/soft as a hard bounce.
    bounceClass = /transient|soft|delay/i.test(raw) ? "soft" : "hard";
  } else if (p.type === "email.delivery_delayed") {
    eventType = "bounced";
    bounceClass = "soft";
  }

  return {
    eventId: svixId,
    providerMessageId: messageId,
    eventType,
    bounceClass,
    safeSummary: p.type.slice(0, 80),
  };
}
