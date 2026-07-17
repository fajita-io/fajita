import { describe, expect, it } from "vitest";

import { DEFAULT_DESTINATION, resolveDestination } from "./destinations";

describe("referral destination allowlist", () => {
  it("accepts approved marketing paths", () => {
    expect(resolveDestination("/")).toBe("/");
    expect(resolveDestination("/pricing")).toBe("/pricing");
    expect(resolveDestination("/features")).toBe("/features");
    expect(resolveDestination("/features/uptime-monitoring")).toBe(
      "/features/uptime-monitoring",
    );
    expect(resolveDestination("/pricing/")).toBe("/pricing");
  });

  it("defaults empty input to the homepage", () => {
    expect(resolveDestination(null)).toBe(DEFAULT_DESTINATION);
    expect(resolveDestination("")).toBe(DEFAULT_DESTINATION);
  });

  it("rejects open-redirect and unsafe inputs", () => {
    expect(resolveDestination("https://evil.example")).toBeNull();
    expect(resolveDestination("//evil.example")).toBeNull();
    expect(resolveDestination("javascript:alert(1)")).toBeNull();
    expect(resolveDestination("/app/settings")).toBeNull();
    expect(resolveDestination("/api/ref")).toBeNull();
    expect(resolveDestination("/billing/checkout/success")).toBeNull();
    expect(resolveDestination("/\\evil")).toBeNull();
  });

  it("strips query and hash before checking the allowlist", () => {
    expect(resolveDestination("/pricing?ref=x#top")).toBe("/pricing");
    expect(resolveDestination("/nope?a=b")).toBeNull();
  });
});
