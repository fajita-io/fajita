import { createHmac } from "node:crypto";
import { describe, expect, it, beforeEach, afterEach } from "vitest";

import { verifyAppsumoWebhookSignature } from "@/lib/appsumo/verify";

describe("verifyAppsumoWebhookSignature", () => {
  const original = process.env.APPSUMO_LICENSING_KEY;

  beforeEach(() => {
    process.env.APPSUMO_LICENSING_KEY = "test-api-key";
  });

  afterEach(() => {
    if (original === undefined) delete process.env.APPSUMO_LICENSING_KEY;
    else process.env.APPSUMO_LICENSING_KEY = original;
  });

  it("returns null when no API key is configured", () => {
    delete process.env.APPSUMO_LICENSING_KEY;
    expect(
      verifyAppsumoWebhookSignature({
        rawBody: "{}",
        signature: "abc",
        timestamp: "123",
      }),
    ).toBeNull();
  });

  it("validates a correct HMAC signature", () => {
    const timestamp = "1318781876";
    const rawBody = '{"event":"purchase"}';
    const signature = createHmac("sha256", "test-api-key")
      .update(`${timestamp}${rawBody}`)
      .digest("hex");

    expect(
      verifyAppsumoWebhookSignature({ rawBody, signature, timestamp }),
    ).toBe(true);
  });

  it("rejects an invalid signature", () => {
    expect(
      verifyAppsumoWebhookSignature({
        rawBody: "{}",
        signature: "bad",
        timestamp: "123",
      }),
    ).toBe(false);
  });
});
