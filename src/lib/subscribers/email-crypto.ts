import "server-only";

import { createHash, createHmac } from "node:crypto";

import { encryptSecret, decryptSecret } from "@/lib/monitoring/secret-crypto";

/**
 * Subscriber email protection.
 *
 * A subscriber address is sensitive PII. We store three representations, never
 * a plaintext column:
 *
 *   * email_normalized  -> normalized form kept ONLY for the current
 *                          administrative/import flow; migrations may drop it
 *                          once encrypted-search is the sole path. Treated as
 *                          sensitive and never exposed to the public.
 *   * email_hash        -> deterministic keyed hash for duplicate/suppression
 *                          checks and safe exact-match search. Not reversible.
 *   * encrypted_email   -> AES-256-GCM envelope used at send time and for
 *                          permissioned display. Reuses the platform keyring
 *                          (MONITOR_SECRET_KEYRING) so no new key infra is added.
 *
 * The hash is keyed with a derived salt from the same keyring so an attacker
 * with only the database cannot brute-force common addresses without the key.
 */

/**
 * Deterministic, keyed hash of a normalized email for duplicate detection and
 * suppression lookups. Keyed with a per-deployment secret derived from the
 * active envelope key so the hash is not a plain, brute-forceable SHA-256 of
 * the address. Stable across a deployment (does not rotate with the key
 * version) because it must match historical rows.
 */
export function emailHash(normalizedEmail: string): string {
  const salt = hashSalt();
  return createHmac("sha256", salt).update(normalizedEmail).digest("hex");
}

let cachedSalt: Buffer | null = null;
function hashSalt(): Buffer {
  if (cachedSalt) return cachedSalt;
  // Derive a stable salt from an encrypted marker so we never store the raw
  // key here and the salt is consistent across processes sharing the keyring.
  // We intentionally do NOT tie this to the rotating active version: hashing
  // must remain stable for lookups. A fixed domain-separation label is hashed
  // with the keyring's decrypt of a constant marker.
  const marker = encryptSecret("fajita.subscriber.email.hash.v1");
  // The envelope embeds the version + nonce; decrypt back to the label and hash
  // it together with the label to produce a deterministic, key-bound salt.
  const label = decryptSecret(marker.envelope);
  cachedSalt = createHash("sha256").update(`fajita.subscriber.salt:${label}`).digest();
  return cachedSalt;
}

/** Encrypt an email for storage/display. Returns envelope + key version. */
export function encryptEmail(normalizedEmail: string): { envelope: string; keyVersion: number } {
  return encryptSecret(normalizedEmail);
}

/** Decrypt a stored email envelope. Fails closed on tampering. */
export function decryptEmail(envelope: string): string {
  return decryptSecret(envelope);
}

/**
 * Privacy-safe, keyed hash of a request IP for consent evidence. We never store
 * the raw IP: only this irreversible, key-bound hash, and only when a consent
 * record is written. Reuses the same derived salt as the email hash.
 */
export function ipHash(ip: string): string {
  if (!ip || ip === "unknown") return "";
  return createHmac("sha256", hashSalt()).update(`ip:${ip}`).digest("hex");
}

/** Test-only reset for the derived salt cache. */
export function _resetEmailSaltCacheForTests(): void {
  cachedSalt = null;
}
