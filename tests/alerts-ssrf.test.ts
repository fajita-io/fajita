import { describe, expect, it } from "vitest";

import { isBlockedIp, isMetadataIp, validateUrl } from "@/lib/monitoring/destination";

/**
 * The alert delivery path reuses the monitor SSRF defenses at send time. These
 * assert the guarantees the generic-webhook provider depends on: HTTPS only,
 * no embedded credentials, and private/metadata addresses refused.
 */
describe("webhook destination validation", () => {
  it("accepts a public https endpoint", () => {
    const r = validateUrl("https://api.example.com/hooks/fajita");
    expect(r.ok).toBe(true);
    if (r.ok) expect(r.scheme).toBe("https");
  });

  it("refuses non-web schemes (ftp, file)", () => {
    // http is permitted by the shared validator; the webhook sender additionally
    // enforces https before it will connect.
    expect(validateUrl("ftp://example.com").ok).toBe(false);
    expect(validateUrl("file:///etc/passwd").ok).toBe(false);
  });

  it("refuses embedded credentials", () => {
    const r = validateUrl("https://user:pass@example.com/hook");
    expect(r.ok).toBe(false);
    if (!r.ok) expect(r.reason).toBe("embedded_credentials");
  });

  it("refuses control characters and empty urls", () => {
    expect(validateUrl("").ok).toBe(false);
    expect(validateUrl("https://exa mple.com").ok).toBe(false);
  });
});

describe("blocked address ranges", () => {
  it("blocks loopback, private, and link-local ranges", () => {
    for (const ip of ["127.0.0.1", "10.1.2.3", "172.16.5.5", "192.168.0.10", "169.254.1.1", "0.0.0.0"]) {
      expect(isBlockedIp(ip)).toBe(true);
    }
  });

  it("blocks cloud metadata endpoints", () => {
    expect(isMetadataIp("169.254.169.254")).toBe(true);
    expect(isMetadataIp("100.100.100.200")).toBe(true);
  });

  it("allows an ordinary public address", () => {
    expect(isBlockedIp("93.184.216.34")).toBe(false);
    expect(isMetadataIp("93.184.216.34")).toBe(false);
  });
});
