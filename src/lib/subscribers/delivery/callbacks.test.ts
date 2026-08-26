import { createHmac } from "node:crypto";

import { describe, expect, it } from "vitest";

import { mapResendPayload, verifyResendSignature } from "./callbacks";

describe("mapResendPayload", () => {
  it("maps a delivered event", () => {
    const m = mapResendPayload("msg_1", {
      type: "email.delivered",
      data: { email_id: "e1" },
    });
    expect(m?.eventType).toBe("delivered");
    expect(m?.providerMessageId).toBe("e1");
  });

  it("maps a complaint", () => {
    const m = mapResendPayload("msg_2", {
      type: "email.complained",
      data: { email_id: "e2" },
    });
    expect(m?.eventType).toBe("complained");
  });

  it("classifies a hard bounce", () => {
    const m = mapResendPayload("msg_3", {
      type: "email.bounced",
      data: { email_id: "e3", bounce: { type: "Permanent" } },
    });
    expect(m?.eventType).toBe("bounced");
    expect(m?.bounceClass).toBe("hard");
  });

  it("classifies a soft bounce and delivery_delayed", () => {
    const soft = mapResendPayload("msg_4", {
      type: "email.bounced",
      data: { email_id: "e4", bounce: { type: "Transient" } },
    });
    expect(soft?.bounceClass).toBe("soft");
    const delayed = mapResendPayload("msg_5", {
      type: "email.delivery_delayed",
      data: { email_id: "e5" },
    });
    expect(delayed?.eventType).toBe("bounced");
    expect(delayed?.bounceClass).toBe("soft");
  });

  it("returns null for a malformed payload", () => {
    expect(mapResendPayload("x", null)).toBeNull();
    expect(mapResendPayload("x", { data: {} })).toBeNull();
  });

  it("carries the svix id as the idempotency key and keeps summary bounded", () => {
    const m = mapResendPayload("svix_abc", {
      type: "email.delivered",
      data: { email_id: "e" },
    });
    expect(m?.eventId).toBe("svix_abc");
    expect((m?.safeSummary.length ?? 0)).toBeLessThanOrEqual(80);
  });
});

describe("verifyResendSignature", () => {
  const secret = `whsec_${Buffer.alloc(24, 3).toString("base64")}`;
  const id = "msg_1";
  const body = JSON.stringify({ type: "email.delivered" });

  function sign(ts: string): string {
    const key = Buffer.from(secret.slice(6), "base64");
    const sig = createHmac("sha256", key).update(`${id}.${ts}.${body}`).digest("base64");
    return `v1,${sig}`;
  }

  it("accepts a valid, in-window signature", () => {
    const now = Date.now();
    const ts = String(Math.floor(now / 1000));
    const ok = verifyResendSignature(
      secret,
      { id, timestamp: ts, signature: sign(ts) },
      body,
      now,
    );
    expect(ok).toBe(true);
  });

  it("rejects a replayed (stale) timestamp", () => {
    const now = Date.now();
    const oldTs = String(Math.floor(now / 1000) - 10_000);
    const ok = verifyResendSignature(
      secret,
      { id, timestamp: oldTs, signature: sign(oldTs) },
      body,
      now,
    );
    expect(ok).toBe(false);
  });

  it("rejects a bad signature and missing headers", () => {
    const now = Date.now();
    const ts = String(Math.floor(now / 1000));
    expect(
      verifyResendSignature(secret, { id, timestamp: ts, signature: "v1,AAAA" }, body, now),
    ).toBe(false);
    expect(
      verifyResendSignature(secret, { id: null, timestamp: ts, signature: sign(ts) }, body, now),
    ).toBe(false);
  });

  it("accepts secrets whose base64 payload includes plus signs", () => {
    const plusSecret = "whsec_dGVzdCtwbHVzK3NpZ24vYXBpK2tleQ==";
    const now = Date.now();
    const ts = String(Math.floor(now / 1000));
    const keyBytes = Buffer.from(plusSecret.slice(6), "base64");
    const sig = createHmac("sha256", keyBytes)
      .update(`${id}.${ts}.${body}`)
      .digest("base64");
    expect(
      verifyResendSignature(
        plusSecret,
        { id, timestamp: ts, signature: `v1,${sig}` },
        body,
        now,
      ),
    ).toBe(true);
  });
});
