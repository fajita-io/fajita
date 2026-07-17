/**
 * Monitor-secret envelope encryption (AES-256-GCM).
 *
 * The web application encrypts customer request credentials (Authorization
 * headers, API keys, bearer tokens) before they are ever written to the
 * database. The Go worker decrypts them in memory at execution time. Both sides
 * share one wire format so the app can encrypt and the worker can decrypt the
 * same bytes:
 *
 *   v<keyVersion>:<base64std( nonce(12) || ciphertext || tag(16) )>
 *
 * There is no homegrown algorithm here: only Node's standard AES-256-GCM. Keys
 * are 32 raw bytes provided per version through `MONITOR_SECRET_KEYRING`, which
 * supports rotation without re-encrypting historical rows. Plaintext secrets
 * never touch logs, analytics, audit metadata, version snapshots, or error
 * responses (see docs/security/monitor-secret-encryption.md).
 */

import {
  createCipheriv,
  createDecipheriv,
  randomBytes,
  timingSafeEqual,
} from "node:crypto";

const NONCE_BYTES = 12;
const TAG_BYTES = 16;
const KEY_BYTES = 32;

export interface Keyring {
  /** version -> 32-byte key */
  keys: Map<number, Buffer>;
  /** highest version present; the key used for new encryptions */
  activeVersion: number;
}

let cachedRing: Keyring | null = null;

/**
 * Parse `MONITOR_SECRET_KEYRING` into a versioned keyring. Format:
 * `1:<base64key>,2:<base64key>`. Throws a safe error (no key material) when the
 * ring is missing or malformed so a misconfiguration fails loudly at the point
 * of use rather than silently storing weak data.
 */
export function monitorKeyring(): Keyring {
  if (cachedRing) return cachedRing;
  if (typeof window !== "undefined") {
    throw new Error("monitorKeyring() must not be called in the browser");
  }
  const raw = process.env.MONITOR_SECRET_KEYRING;
  if (!raw) {
    throw new Error(
      "MONITOR_SECRET_KEYRING is not configured. Monitor secrets cannot be encrypted.",
    );
  }
  const keys = new Map<number, Buffer>();
  let activeVersion = 0;
  for (const entry of raw.split(",")) {
    const trimmed = entry.trim();
    if (!trimmed) continue;
    const sep = trimmed.indexOf(":");
    if (sep < 1) {
      throw new Error("MONITOR_SECRET_KEYRING entry is malformed.");
    }
    const version = Number.parseInt(trimmed.slice(0, sep), 10);
    if (!Number.isInteger(version) || version < 1) {
      throw new Error("MONITOR_SECRET_KEYRING has an invalid key version.");
    }
    const key = Buffer.from(trimmed.slice(sep + 1), "base64");
    if (key.length !== KEY_BYTES) {
      throw new Error(
        `MONITOR_SECRET_KEYRING key v${version} must be ${KEY_BYTES} bytes.`,
      );
    }
    keys.set(version, key);
    if (version > activeVersion) activeVersion = version;
  }
  if (keys.size === 0) {
    throw new Error("MONITOR_SECRET_KEYRING contains no usable keys.");
  }
  cachedRing = { keys, activeVersion };
  return cachedRing;
}

/**
 * Encrypt a secret with the active key version. Returns both the envelope
 * string (to store in `encrypted_payload`) and the key version (to store in
 * `encryption_key_version`).
 */
export function encryptSecret(plaintext: string): {
  envelope: string;
  keyVersion: number;
} {
  const ring = monitorKeyring();
  const version = ring.activeVersion;
  const key = ring.keys.get(version);
  if (!key) throw new Error("No active monitor secret key.");

  const nonce = randomBytes(NONCE_BYTES);
  const cipher = createCipheriv("aes-256-gcm", key, nonce);
  const ciphertext = Buffer.concat([
    cipher.update(Buffer.from(plaintext, "utf8")),
    cipher.final(),
  ]);
  const tag = cipher.getAuthTag();
  const packed = Buffer.concat([nonce, ciphertext, tag]);
  return {
    envelope: `v${version}:${packed.toString("base64")}`,
    keyVersion: version,
  };
}

/**
 * Decrypt an envelope string. Fails closed on any tampering (GCM authentication)
 * or malformed input. Present mainly for tests and internal tooling; the worker
 * is the normal consumer at execution time.
 */
export function decryptSecret(envelope: string): string {
  const ring = monitorKeyring();
  if (!envelope.startsWith("v")) {
    throw new Error("Malformed secret envelope.");
  }
  const sep = envelope.indexOf(":");
  if (sep < 2) throw new Error("Malformed secret envelope.");
  const version = Number.parseInt(envelope.slice(1, sep), 10);
  if (!Number.isInteger(version)) throw new Error("Bad key version.");
  const key = ring.keys.get(version);
  if (!key) throw new Error(`No key for version ${version}.`);

  const packed = Buffer.from(envelope.slice(sep + 1), "base64");
  if (packed.length < NONCE_BYTES + TAG_BYTES) {
    throw new Error("Secret ciphertext too short.");
  }
  const nonce = packed.subarray(0, NONCE_BYTES);
  const tag = packed.subarray(packed.length - TAG_BYTES);
  const ciphertext = packed.subarray(NONCE_BYTES, packed.length - TAG_BYTES);

  const decipher = createDecipheriv("aes-256-gcm", key, nonce);
  decipher.setAuthTag(tag);
  const plaintext = Buffer.concat([
    decipher.update(ciphertext),
    decipher.final(),
  ]);
  return plaintext.toString("utf8");
}

/**
 * Produce a safe masked label for display after creation. Never returns the
 * full value. For example, "sk-live-abcd...wxyz" for a longer token, or a fixed
 * mask for very short values.
 */
export function maskSecret(plaintext: string): string {
  const len = plaintext.length;
  if (len <= 4) return "****";
  const head = plaintext.slice(0, Math.min(4, len - 4));
  const tail = plaintext.slice(-2);
  return `${head}${"*".repeat(Math.max(4, len - head.length - tail.length))}${tail}`;
}

/** Constant-time compare for hashed-token style checks in the same domain. */
export function safeEqual(a: string, b: string): boolean {
  const ab = Buffer.from(a);
  const bb = Buffer.from(b);
  if (ab.length !== bb.length) return false;
  return timingSafeEqual(ab, bb);
}

/** Reset the cached keyring. Test-only. */
export function _resetKeyringCacheForTests(): void {
  cachedRing = null;
}
