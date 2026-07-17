// @vitest-environment node
import { afterEach, beforeEach, describe, expect, it } from "vitest";

import {
  _resetKeyringCacheForTests,
  decryptSecret,
  encryptSecret,
  maskSecret,
  monitorKeyring,
} from "@/lib/monitoring/secret-crypto";

// Deterministic 32-byte keys, base64 encoded, for tests only.
const KEY_V1 = Buffer.alloc(32, 0x11).toString("base64");
const KEY_V2 = Buffer.alloc(32, 0x22).toString("base64");

beforeEach(() => {
  process.env.MONITOR_SECRET_KEYRING = `1:${KEY_V1},2:${KEY_V2}`;
  _resetKeyringCacheForTests();
});

afterEach(() => {
  delete process.env.MONITOR_SECRET_KEYRING;
  _resetKeyringCacheForTests();
});

describe("monitor secret crypto", () => {
  it("round-trips a secret with the active key version", () => {
    const secret = "Bearer sk-live-abcdef1234567890";
    const { envelope, keyVersion } = encryptSecret(secret);
    expect(keyVersion).toBe(2); // highest version is active
    expect(envelope.startsWith("v2:")).toBe(true);
    expect(decryptSecret(envelope)).toBe(secret);
  });

  it("uses a fresh nonce each time", () => {
    const a = encryptSecret("same").envelope;
    const b = encryptSecret("same").envelope;
    expect(a).not.toBe(b);
  });

  it("decrypts an older key version during rotation", () => {
    // Encrypt under a ring where v1 is active, then decrypt with the full ring.
    process.env.MONITOR_SECRET_KEYRING = `1:${KEY_V1}`;
    _resetKeyringCacheForTests();
    const { envelope, keyVersion } = encryptSecret("legacy");
    expect(keyVersion).toBe(1);

    process.env.MONITOR_SECRET_KEYRING = `1:${KEY_V1},2:${KEY_V2}`;
    _resetKeyringCacheForTests();
    expect(decryptSecret(envelope)).toBe("legacy");
  });

  it("fails closed on tampered ciphertext", () => {
    const { envelope } = encryptSecret("secret");
    const sep = envelope.indexOf(":");
    const raw = Buffer.from(envelope.slice(sep + 1), "base64");
    raw[raw.length - 1] ^= 0xff; // flip a tag byte
    const tampered = `${envelope.slice(0, sep + 1)}${raw.toString("base64")}`;
    expect(() => decryptSecret(tampered)).toThrow();
  });

  it("rejects an unknown key version", () => {
    const { envelope } = encryptSecret("secret");
    process.env.MONITOR_SECRET_KEYRING = `1:${KEY_V1}`; // drop v2
    _resetKeyringCacheForTests();
    expect(() => decryptSecret(envelope)).toThrow();
  });

  it("rejects malformed envelopes", () => {
    for (const bad of ["", "x1:abc", "v:abc", "v1:not base64!!!", "v1:AAAA"]) {
      expect(() => decryptSecret(bad)).toThrow();
    }
  });

  it("throws a safe error when the keyring is missing", () => {
    delete process.env.MONITOR_SECRET_KEYRING;
    _resetKeyringCacheForTests();
    expect(() => monitorKeyring()).toThrow(/MONITOR_SECRET_KEYRING/);
  });

  it("rejects keys of the wrong size", () => {
    process.env.MONITOR_SECRET_KEYRING = `1:${Buffer.from("short").toString("base64")}`;
    _resetKeyringCacheForTests();
    expect(() => monitorKeyring()).toThrow();
  });

  it("masks secrets without revealing the full value", () => {
    expect(maskSecret("sk-live-abcdefwxyz")).not.toContain("cdefwx");
    expect(maskSecret("ab")).toBe("****");
    const masked = maskSecret("sk-live-abcdefwxyz");
    expect(masked.startsWith("sk-l")).toBe(true);
    expect(masked.endsWith("yz")).toBe(true);
  });

  it("produces the shared wire format the worker can decrypt", () => {
    // The envelope must be v<version>:base64(nonce(12)||ciphertext||tag(16)).
    const { envelope } = encryptSecret("interop");
    const [prefix, b64] = envelope.split(":");
    expect(prefix).toMatch(/^v\d+$/);
    const packed = Buffer.from(b64, "base64");
    expect(packed.length).toBeGreaterThanOrEqual(12 + 16);
  });
});
