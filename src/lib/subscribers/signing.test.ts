import { beforeAll, describe, expect, it } from "vitest";

// A signing/encryption key must exist before the keyring is first read. Use a
// deterministic 32-byte test key. This is a throwaway value, never a real key.
process.env.MONITOR_SECRET_KEYRING = `1:${Buffer.alloc(32, 7).toString("base64")}`;

import {
  signPreferenceToken,
  verifyPreferenceTokenSignature,
  _resetSigningKeyCacheForTests,
} from "./signing";

const SUB = "11111111-1111-1111-1111-111111111111";

describe("preference token signing", () => {
  beforeAll(() => _resetSigningKeyCacheForTests());

  it("round-trips a signed token", () => {
    const token = signPreferenceToken(SUB, 1);
    const verified = verifyPreferenceTokenSignature(token);
    expect(verified).toEqual({ subscriberId: SUB, version: 1 });
  });

  it("rejects a token whose version was rotated (different signature)", () => {
    const v1 = signPreferenceToken(SUB, 1);
    const v2 = signPreferenceToken(SUB, 2);
    expect(v1).not.toBe(v2);
    // v1 still verifies structurally, but its version is 1; the caller compares
    // against link_token_version. A tampered version string fails the HMAC.
    const tampered = v1.replace(/^([^.]+)\.1\./, "$1.2.");
    expect(verifyPreferenceTokenSignature(tampered)).toBeNull();
  });

  it("rejects structurally malformed tokens", () => {
    expect(verifyPreferenceTokenSignature("")).toBeNull();
    expect(verifyPreferenceTokenSignature("a.b")).toBeNull();
    expect(verifyPreferenceTokenSignature(`${SUB}.1.notavalidsig`)).toBeNull();
    expect(verifyPreferenceTokenSignature("not-a-uuid.1.sig")).toBeNull();
  });

  it("rejects a forged signature", () => {
    const token = signPreferenceToken(SUB, 1);
    const forged = `${token.slice(0, -3)}aaa`;
    expect(verifyPreferenceTokenSignature(forged)).toBeNull();
  });
});
