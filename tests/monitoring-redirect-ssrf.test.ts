import { describe, expect, it } from "vitest";

import { isBlockedIp, validateUrl } from "@/lib/monitoring/destination";

/**
 * Redirect SSRF defenses in the Vercel cron worker revalidate every hop with
 * the same URL rules as the initial destination. These unit tests cover the
 * redirect-location parsing path without opening sockets.
 */
describe("redirect target URL validation", () => {
  it("rejects a redirect with embedded credentials", () => {
    const r = validateUrl("https://user:pass@hooks.example.com/callback");
    expect(r.ok).toBe(false);
    if (!r.ok) expect(r.reason).toBe("embedded_credentials");
  });

  it("accepts a public https redirect target", () => {
    const r = validateUrl("https://hooks.example.com/callback");
    expect(r.ok).toBe(true);
  });

  it("resolves relative redirect locations against the prior hop", () => {
    const base = "https://example.com/a/b";
    const location = "/c/d";
    const resolved = new URL(location, base).toString();
    const r = validateUrl(resolved);
    expect(r.ok).toBe(true);
    if (r.ok) expect(r.normalized).toContain("example.com/c/d");
  });
});

describe("redirect target IP blocking", () => {
  it("blocks loopback and RFC1918 literal hosts used as redirect targets", () => {
    expect(isBlockedIp("127.0.0.1")).toBe(true);
    expect(isBlockedIp("192.168.0.1")).toBe(true);
  });
});
