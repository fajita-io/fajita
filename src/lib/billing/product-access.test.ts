import { describe, expect, it } from "vitest";

import { BETA_ENTITLEMENTS, LOCKED_ENTITLEMENTS } from "@/lib/billing/catalog";
import {
  alertsAvailable,
  statusPagesAvailable,
} from "@/lib/billing/product-access";

describe("product access helpers", () => {
  it("detects alert availability from entitlements", () => {
    expect(alertsAvailable(BETA_ENTITLEMENTS)).toBe(true);
    expect(alertsAvailable(LOCKED_ENTITLEMENTS)).toBe(false);
  });

  it("detects status page availability from entitlements", () => {
    expect(statusPagesAvailable(BETA_ENTITLEMENTS)).toBe(true);
    expect(statusPagesAvailable(LOCKED_ENTITLEMENTS)).toBe(false);
  });
});
