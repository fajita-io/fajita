import { describe, expect, it } from "vitest";

import {
  computeSignature,
  generateSigningKey,
  signatureHeader,
  verifySignature,
} from "@/lib/alerts/signing";

describe("webhook signing", () => {
  const params = {
    secret: "whsec_testsecret",
    keyId: "whsk_abc123",
    timestamp: 1_753_099_200,
    eventId: "evt_1",
    body: JSON.stringify({ type: "incident.opened", id: "evt_1" }),
  };

  it("generates a key id and secret with the expected prefixes", () => {
    const key = generateSigningKey();
    expect(key.keyId).toMatch(/^whsk_/);
    expect(key.secret).toMatch(/^whsec_/);
  });

  it("computes a stable hex signature", () => {
    const sig = computeSignature(params);
    expect(sig).toMatch(/^[0-9a-f]{64}$/);
    // Deterministic for the same input.
    expect(computeSignature(params)).toBe(sig);
  });

  it("verifies a matching signature and rejects a tampered body", () => {
    const sig = computeSignature(params);
    expect(verifySignature({ ...params, signatureHex: sig })).toBe(true);
    expect(verifySignature({ ...params, body: params.body + "x", signatureHex: sig })).toBe(false);
  });

  it("builds a header carrying timestamp, key id, and signature", () => {
    const header = signatureHeader(params);
    expect(header).toMatch(/^t=\d+,kid=whsk_[^,]+,v1=[0-9a-f]{64}$/);
  });

  it("changing the key id changes the signature", () => {
    const a = computeSignature(params);
    const b = computeSignature({ ...params, keyId: "whsk_other" });
    expect(a).not.toBe(b);
  });
});
