import { describe, expect, it } from "vitest";

import { hashToken, normalizeEmail } from "@/lib/app/invitations";

describe("invitation token hashing", () => {
  it("is deterministic for the same token", () => {
    expect(hashToken("abc123")).toBe(hashToken("abc123"));
  });

  it("differs for different tokens and is not the raw token", () => {
    const a = hashToken("token-one");
    const b = hashToken("token-two");
    expect(a).not.toBe(b);
    expect(a).not.toContain("token-one");
    expect(a).toMatch(/^[a-f0-9]{64}$/);
  });
});

describe("normalizeEmail", () => {
  it("lowercases and trims", () => {
    expect(normalizeEmail("  Dana@Example.COM ")).toBe("dana@example.com");
  });
});
