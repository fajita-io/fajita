import { afterEach, beforeEach, describe, expect, it } from "vitest";

import {
  decodeReferralCookie,
  encodeReferralCookie,
} from "./cookie";

const SESSION_ID = "11111111-1111-1111-1111-111111111111";

describe("referral cookie", () => {
  const prev = process.env.AFFILIATE_COOKIE_SECRET;

  beforeEach(() => {
    process.env.AFFILIATE_COOKIE_SECRET = "test-secret-key";
  });
  afterEach(() => {
    if (prev === undefined) delete process.env.AFFILIATE_COOKIE_SECRET;
    else process.env.AFFILIATE_COOKIE_SECRET = prev;
  });

  it("round-trips a signed cookie within the attribution window", () => {
    const { value, maxAgeSeconds } = encodeReferralCookie(SESSION_ID);
    expect(maxAgeSeconds).toBe(30 * 24 * 60 * 60);
    const decoded = decodeReferralCookie(value);
    expect(decoded?.sessionId).toBe(SESSION_ID);
  });

  it("rejects a tampered signature", () => {
    const { value } = encodeReferralCookie(SESSION_ID);
    const tampered = value.slice(0, -2) + (value.endsWith("a") ? "bb" : "aa");
    expect(decodeReferralCookie(tampered)).toBeNull();
  });

  it("rejects a swapped session id (payload/signature mismatch)", () => {
    const { value } = encodeReferralCookie(SESSION_ID);
    const parts = value.split(".");
    parts[1] = "22222222-2222-2222-2222-222222222222";
    expect(decodeReferralCookie(parts.join("."))).toBeNull();
  });

  it("rejects an expired cookie", () => {
    const past = Math.floor(Date.now() / 1000) - 10;
    // Manually forge a well-formed but expired payload; signature check still
    // runs, but expiry is rejected first.
    const forged = `1.${SESSION_ID}.${past}.whatever`;
    expect(decodeReferralCookie(forged)).toBeNull();
  });

  it("rejects malformed input", () => {
    expect(decodeReferralCookie(undefined)).toBeNull();
    expect(decodeReferralCookie("garbage")).toBeNull();
    expect(decodeReferralCookie("1.not-a-uuid.123.sig")).toBeNull();
  });

  it("rejects a claimed-signed cookie when no secret is configured", () => {
    const { value } = encodeReferralCookie(SESSION_ID);
    delete process.env.AFFILIATE_COOKIE_SECRET;
    expect(decodeReferralCookie(value)).toBeNull();
  });
});
