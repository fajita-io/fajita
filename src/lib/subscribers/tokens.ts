import "server-only";

import { generateToken, hashToken, verifyToken } from "@/lib/status-pages/secret";
import { CONFIRMATION_TTL_MS, PREFERENCE_TOKEN_TTL_MS } from "./constants";

/**
 * Confirmation and preference tokens. Reuses the Phase 8 hashing helpers
 * (high-entropy base64url token, SHA-256 hash stored, constant-time verify).
 * Only the hash is ever persisted. Raw tokens live only in the email link and
 * are excluded from logs, analytics, and referrers by construction.
 */

export { generateToken, hashToken, verifyToken };

export interface IssuedToken {
  token: string;
  tokenHash: string;
  expiresAt: string;
}

/** A single-use confirmation token bound to one subscriber, expiring soon. */
export function issueConfirmationToken(): IssuedToken {
  const token = generateToken(32);
  return {
    token,
    tokenHash: hashToken(token),
    expiresAt: new Date(Date.now() + CONFIRMATION_TTL_MS).toISOString(),
  };
}

/** A long-lived, revocable preference-access token. */
export function issuePreferenceToken(): IssuedToken {
  const token = generateToken(32);
  return {
    token,
    tokenHash: hashToken(token),
    expiresAt: new Date(Date.now() + PREFERENCE_TOKEN_TTL_MS).toISOString(),
  };
}
