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

  it("uses check-volume allowances and monitor caps", () => {
    expect(BILLING_CATALOG.starter.entitlements.max_monthly_checks).toBe(
      100_000,
    );
    expect(BILLING_CATALOG.pro.entitlements.max_monthly_checks).toBe(500_000);
    expect(BILLING_CATALOG.business.entitlements.max_monthly_checks).toBe(
      2_000_000,
    );
    expect(BILLING_CATALOG.starter.entitlements.max_active_monitors).toBe(10);
    expect(BILLING_CATALOG.pro.entitlements.max_active_monitors).toBe(50);
    expect(BILLING_CATALOG.business.entitlements.max_active_monitors).toBe(
      150,
    );
  });

  it("lists margin-aligned prices", () => {
    expect(BILLING_CATALOG.starter.pricing.monthlyCents).toBe(1200);
    expect(BILLING_CATALOG.pro.pricing.monthlyCents).toBe(4900);
    expect(BILLING_CATALOG.business.pricing.monthlyCents).toBe(9900);
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
    expect(LOCKED_ENTITLEMENTS.max_monthly_checks).toBe(0);
    expect(LOCKED_ENTITLEMENTS.billing_export_enabled).toBe(true);
  });

  it("normalizes annual price to a monthly value", () => {
    expect(monthlyValueCents("starter", "year")).toBe(1000);
    expect(monthlyValueCents("starter", "month")).toBe(1200);
  });
});
