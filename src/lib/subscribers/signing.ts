import "server-only";

import { createHash, createHmac, timingSafeEqual } from "node:crypto";

import { encryptSecret, decryptSecret } from "@/lib/monitoring/secret-crypto";

/**
 * Stateless, signed preference/unsubscribe tokens.
 *
 * A subscriber's routine preference and unsubscribe links must be stable across
 * many emails without ever storing a raw token (we store only hashes elsewhere)
 * and without minting a new DB row per send. We sign a compact token bound to
 * the subscriber id and a per-subscriber version:
 *
 *   <subscriberId>.<version>.<base64url(HMAC-SHA256(key, "id:version"))>
 *
 * Bumping link_token_version on the subscriber row invalidates every previously
 * issued link (rotation / revocation) without a token table lookup. The HMAC
 * key is derived from the platform keyring, so no new secret infrastructure is
 * introduced. Tokens are high entropy, opaque, and kept out of logs, analytics,
 * and referrers by construction (they only appear in email links and the token
 * query param the server consumes and never re-emits).
 */

let cachedKey: Buffer | null = null;
function signingKey(): Buffer {
  if (cachedKey) return cachedKey;
  // Derive a stable, key-bound secret without persisting raw key material.
  const marker = encryptSecret("fajita.subscriber.link.sign.v1");
  const label = decryptSecret(marker.envelope);
  cachedKey = createHash("sha256").update(`fajita.subscriber.link:${label}`).digest();
  return cachedKey;
}

function sign(subscriberId: string, version: number): string {
  return createHmac("sha256", signingKey())
    .update(`${subscriberId}:${version}`)
    .digest("base64url");
}

export function signPreferenceToken(subscriberId: string, version: number): string {
  return `${subscriberId}.${version}.${sign(subscriberId, version)}`;
}

export interface VerifiedToken {
  subscriberId: string;
  version: number;
}

/**
 * Verify a token's signature only (constant time). The caller must still load
 * the subscriber and confirm the version matches link_token_version to honor
 * rotation. Returns null on any structural or signature failure.
 */
export function verifyPreferenceTokenSignature(raw: string): VerifiedToken | null {
  if (!raw || raw.length > 400) return null;
  const parts = raw.split(".");
  if (parts.length !== 3) return null;
  const [subscriberId, versionStr, sig] = parts;
  const version = Number.parseInt(versionStr, 10);
  if (!Number.isInteger(version) || version < 1) return null;
  if (!/^[0-9a-f-]{36}$/.test(subscriberId)) return null;

  const expected = sign(subscriberId, version);
  const a = Buffer.from(sig);
  const b = Buffer.from(expected);
  if (a.length !== b.length) return null;
  if (!timingSafeEqual(a, b)) return null;
  return { subscriberId, version };
}

/** Test-only reset. */
export function _resetSigningKeyCacheForTests(): void {
  cachedKey = null;
}
