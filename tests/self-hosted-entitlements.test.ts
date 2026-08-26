import { describe, expect, it } from "vitest";

import {
  BETA_ENTITLEMENTS,
  SELF_HOSTED_ENTITLEMENTS,
} from "@/lib/billing/catalog";

describe("SELF_HOSTED_ENTITLEMENTS", () => {
  it("includes full monitoring capabilities", () => {
    expect(SELF_HOSTED_ENTITLEMENTS.monitoring_enabled).toBe(true);
    expect(SELF_HOSTED_ENTITLEMENTS.heartbeat_monitoring_enabled).toBe(true);
    expect(SELF_HOSTED_ENTITLEMENTS.ssl_monitoring_enabled).toBe(true);
    expect(SELF_HOSTED_ENTITLEMENTS.max_active_monitors).toBeNull();
  });

  it("is more generous than beta for status pages", () => {
    expect(SELF_HOSTED_ENTITLEMENTS.max_status_pages).toBeNull();
    expect(BETA_ENTITLEMENTS.max_status_pages).not.toBeNull();
  });
});
