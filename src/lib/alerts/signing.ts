import "server-only";

import { createHmac, randomBytes, timingSafeEqual } from "node:crypto";

import { WEBHOOK_SCHEMA_VERSION } from "@/lib/alerts/constants";

/**
 * Generic-webhook request signing (HMAC-SHA-256).
 *
 * The signing secret is generated once, shown to the customer a single time,
 * then stored encrypted in alert_channel_secrets and masked afterward. The
 * signature covers a stable, documented input so receivers can verify:
 *
 *   signature_input = "<key_id>.<timestamp>.<event_id>.<body>"
 *   signature       = hex( HMAC_SHA256(secret, signature_input) )
 *
 * The signature header carries the key id so a receiver can select the right
 * key during rotation:  "t=<timestamp>,kid=<key_id>,v1=<hex signature>"
 */

const SECRET_BYTES = 32;

export interface SigningKeyMaterial {
  keyId: string;
  secret: string;
}

/** Generate a new signing key id + secret. The secret is returned once only. */
export function generateSigningKey(): SigningKeyMaterial {
  return {
    keyId: `whsk_${randomBytes(6).toString("hex")}`,
    secret: `whsec_${randomBytes(SECRET_BYTES).toString("base64url")}`,
  };
}

export function signatureInput(params: {
  keyId: string;
  timestamp: number;
  eventId: string;
  body: string;
}): string {
  return `${params.keyId}.${params.timestamp}.${params.eventId}.${params.body}`;
}

export function computeSignature(params: {
  secret: string;
  keyId: string;
  timestamp: number;
  eventId: string;
  body: string;
}): string {
  const input = signatureInput(params);
  return createHmac("sha256", params.secret).update(input).digest("hex");
}

/** Build the full signature header value. */
export function signatureHeader(params: {
  secret: string;
  keyId: string;
  timestamp: number;
  eventId: string;
  body: string;
}): string {
  const sig = computeSignature(params);
  return `t=${params.timestamp},kid=${params.keyId},v1=${sig}`;
}

/**
 * Verify a signature. Exposed so tests and the documentation examples share the
 * exact verification the docs describe. Constant-time comparison.
 */
export function verifySignature(params: {
  secret: string;
  keyId: string;
  timestamp: number;
  eventId: string;
  body: string;
  signatureHex: string;
}): boolean {
  const expected = computeSignature(params);
  const a = Buffer.from(expected);
  const b = Buffer.from(params.signatureHex);
  if (a.length !== b.length) return false;
  return timingSafeEqual(a, b);
}

export const CURRENT_SCHEMA_VERSION = WEBHOOK_SCHEMA_VERSION;
