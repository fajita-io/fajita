import { createHash } from "node:crypto";

import { beforeAll, describe, expect, it } from "vitest";

process.env.MONITOR_SECRET_KEYRING = `1:${Buffer.alloc(32, 9).toString("base64")}`;

import {
  decryptEmail,
  emailHash,
  encryptEmail,
  ipHash,
  _resetEmailSaltCacheForTests,
} from "./email-crypto";

describe("email hashing", () => {
  beforeAll(() => _resetEmailSaltCacheForTests());

  it("is deterministic for the same address", () => {
    expect(emailHash("alice@example.com")).toBe(emailHash("alice@example.com"));
  });

  it("differs for different addresses", () => {
    expect(emailHash("alice@example.com")).not.toBe(emailHash("bob@example.com"));
  });

  it("is not a plain sha256 of the address (keyed)", () => {
    // A plain sha256 would be reproducible without the key; ours is keyed, so
    // it must not equal the naive digest.
    const naive = createHash("sha256").update("alice@example.com").digest("hex");
    expect(emailHash("alice@example.com")).not.toBe(naive);
  });
});

describe("email envelope encryption", () => {
  it("round-trips an address", () => {
    const enc = encryptEmail("alice@example.com");
    expect(enc.keyVersion).toBe(1);
    expect(enc.envelope).not.toContain("alice@example.com");
    expect(decryptEmail(enc.envelope)).toBe("alice@example.com");
  });
});

describe("ipHash", () => {
  it("hashes an ip deterministically and returns empty for unknown", () => {
    expect(ipHash("203.0.113.5")).toBe(ipHash("203.0.113.5"));
    expect(ipHash("unknown")).toBe("");
    expect(ipHash("")).toBe("");
  });
});
