import "server-only";

import { createHmac, timingSafeEqual } from "node:crypto";

import { activeTerms } from "./config";

/**
 * First-party referral cookie.
 *
 * The cookie carries only an OPAQUE attribution session id, a format version,
 * and an expiry. No affiliate identity, no customer identity, no commission
 * data. It is HMAC-signed so a client cannot forge or extend attribution. The
 * server always re-validates the session id against the database; the cookie is
 * a pointer, never a source of truth.
 *
 * Expiry matches the published attribution window (30 days). We never encode a
 * longer window than what is published.
 */

export const REFERRAL_COOKIE_NAME = "fj_ref";
export const REFERRAL_COOKIE_VERSION = "1";

export interface ReferralCookieValue {
  version: string;
  sessionId: string;
  expiresAt: number; // epoch seconds
}

function secret(): string | null {
  // Read directly (optional integration): an unset secret degrades to an
  // unsigned dev cookie rather than forcing full server-env validation here.
  const value = process.env.AFFILIATE_COOKIE_SECRET;
  return value && value.length > 0 ? value : null;
}

function sign(payload: string, key: string): string {
  return createHmac("sha256", key).update(payload).digest("base64url");
}

/** Serialize + sign a cookie value. In dev without a secret, marks it unsigned. */
export function encodeReferralCookie(sessionId: string): {
  value: string;
  maxAgeSeconds: number;
  expiresAt: number;
} {
  const windowDays = activeTerms().attributionWindowDays;
  const maxAgeSeconds = windowDays * 24 * 60 * 60;
  const expiresAt = Math.floor(Date.now() / 1000) + maxAgeSeconds;
  const payload = `${REFERRAL_COOKIE_VERSION}.${sessionId}.${expiresAt}`;
  const key = secret();
  const sig = key ? sign(payload, key) : "unsigned";
  return { value: `${payload}.${sig}`, maxAgeSeconds, expiresAt };
}

/**
 * Parse + verify a referral cookie. Returns null when malformed, tampered, the
 * wrong version, or expired. Verification is constant-time on the signature.
 */
export function decodeReferralCookie(raw: string | undefined | null): ReferralCookieValue | null {
  if (!raw) return null;
  const parts = raw.split(".");
  if (parts.length !== 4) return null;
  const [version, sessionId, expiresRaw, providedSig] = parts;
  if (version !== REFERRAL_COOKIE_VERSION) return null;
  if (!/^[0-9a-f-]{36}$/.test(sessionId)) return null;

  const expiresAt = Number.parseInt(expiresRaw, 10);
  if (!Number.isFinite(expiresAt)) return null;
  if (expiresAt < Math.floor(Date.now() / 1000)) return null;

  const key = secret();
  const payload = `${version}.${sessionId}.${expiresRaw}`;
  if (key) {
    const expectedSig = sign(payload, key);
    const a = Buffer.from(expectedSig);
    const b = Buffer.from(providedSig);
    if (a.length !== b.length || !timingSafeEqual(a, b)) return null;
  } else if (providedSig !== "unsigned") {
    // A secret is not configured but the cookie claims to be signed: reject.
    return null;
  }

  return { version, sessionId, expiresAt };
}

/** Cookie attributes for the referral cookie. */
export function referralCookieOptions(maxAgeSeconds: number) {
  return {
    httpOnly: true,
    secure: process.env.NODE_ENV === "production",
    sameSite: "lax" as const,
    path: "/",
    maxAge: maxAgeSeconds,
  };
}
