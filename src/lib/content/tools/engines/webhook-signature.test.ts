import { webcrypto } from "node:crypto";
import { describe, expect, it } from "vitest";

import {
  buildSignedMessage,
  generateWebhookSignature,
  verifyWebhookSignature,
} from "./webhook-signature";

Object.defineProperty(globalThis, "crypto", {
  value: webcrypto,
});

describe("webhook signature tool", () => {
  it("builds timestamp.body message", () => {
    expect(buildSignedMessage("100", "{\"a\":1}")).toBe('100.{"a":1}');
  });

  it("generates and verifies HMAC SHA-256", async () => {
    const secret = "test_secret";
    const rawBody = '{"ok":true}';
    const timestamp = "1710000000";
    const generated = await generateWebhookSignature({
      secret,
      rawBody,
      timestamp,
    });
    expect(generated.signature).toMatch(/^[a-f0-9]{64}$/);
    const verified = await verifyWebhookSignature({
      secret,
      rawBody,
      timestamp,
      signature: `sha256=${generated.signature}`,
    });
    expect(verified.valid).toBe(true);
  });

  it("rejects bad signatures", async () => {
    const verified = await verifyWebhookSignature({
      secret: "test_secret",
      rawBody: "{}",
      timestamp: "1",
      signature: "deadbeef",
    });
    expect(verified.valid).toBe(false);
  });
});
