import { describe, expect, it } from "vitest";

import { BETA_ENTITLEMENTS, LOCKED_ENTITLEMENTS, entitlementsForPlan } from "@/lib/billing/catalog";
import {
  alertsAvailable,
  enabledAlertProviders,
  providerAlertsEnabled,
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

  it("Core can email, not Slack or Discord or webhook", () => {
    const core = entitlementsForPlan("starter");
    expect(providerAlertsEnabled(core, "email")).toBe(true);
    expect(providerAlertsEnabled(core, "slack")).toBe(false);
    expect(providerAlertsEnabled(core, "discord")).toBe(false);
    expect(providerAlertsEnabled(core, "webhook")).toBe(false);
    expect(enabledAlertProviders(core)).toEqual(["email"]);
  });

  it("Team can use every alert provider", () => {
    expect(enabledAlertProviders(entitlementsForPlan("pro"))).toEqual([
      "email",
      "slack",
      "discord",
      "webhook",
    ]);
  });
});
