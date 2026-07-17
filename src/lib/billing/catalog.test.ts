import { describe, expect, it } from "vitest";

import {
  BILLING_CATALOG,
  CATALOG_PLANS,
  LOCKED_ENTITLEMENTS,
  effectiveEntitlements,
  entitlementsForPlan,
  monthlyValueCents,
} from "@/lib/billing/catalog";

describe("billing catalog", () => {
  it("exposes the three approved plan keys in display order", () => {
    expect(CATALOG_PLANS.map((p) => p.key)).toEqual([
      "starter",
      "pro",
      "business",
    ]);
  });

  it("increases capacity from starter to business", () => {
    expect(BILLING_CATALOG.starter.entitlements.max_active_monitors).toBe(10);
    expect(BILLING_CATALOG.pro.entitlements.max_active_monitors).toBe(50);
    expect(BILLING_CATALOG.business.entitlements.max_active_monitors).toBeNull();
  });

  it("lets faster plans check more often", () => {
    expect(
      BILLING_CATALOG.starter.entitlements.minimum_check_interval_seconds,
    ).toBe(300);
    expect(
      BILLING_CATALOG.pro.entitlements.minimum_check_interval_seconds,
    ).toBe(60);
  });

  it("only grants plan entitlements when access is active or grace", () => {
    expect(effectiveEntitlements("pro", "active")).toEqual(
      entitlementsForPlan("pro"),
    );
    expect(effectiveEntitlements("pro", "grace_period")).toEqual(
      entitlementsForPlan("pro"),
    );
    expect(effectiveEntitlements("pro", "restricted")).toEqual(
      LOCKED_ENTITLEMENTS,
    );
    expect(effectiveEntitlements("pro", "canceled")).toEqual(
      LOCKED_ENTITLEMENTS,
    );
    expect(effectiveEntitlements(null, "active")).toEqual(LOCKED_ENTITLEMENTS);
  });

  it("locks monitoring off with no create allowance", () => {
    expect(LOCKED_ENTITLEMENTS.monitoring_enabled).toBe(false);
    expect(LOCKED_ENTITLEMENTS.max_active_monitors).toBe(0);
    // Data-related access stays reachable.
    expect(LOCKED_ENTITLEMENTS.billing_export_enabled).toBe(true);
  });

  it("normalizes annual price to a monthly value", () => {
    // Provisional: starter is 9000 cents / year -> 750 cents / month.
    expect(monthlyValueCents("starter", "year")).toBe(750);
    expect(monthlyValueCents("starter", "month")).toBe(900);
  });
});
