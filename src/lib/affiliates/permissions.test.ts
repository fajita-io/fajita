import { describe, expect, it } from "vitest";

import { affiliateCan, affiliatePermissionsFor } from "./permissions";

describe("affiliate permissions", () => {
  it("grants active affiliates full access", () => {
    expect(affiliateCan("active", "affiliate.links.manage")).toBe(true);
    expect(affiliateCan("active", "affiliate.payout_profile.manage")).toBe(true);
    expect(affiliateCan("active", "affiliate.export")).toBe(true);
  });

  it("freezes payout and tax changes when paused but keeps tracking editable", () => {
    expect(affiliateCan("paused", "affiliate.links.manage")).toBe(true);
    expect(affiliateCan("paused", "affiliate.payout_profile.manage")).toBe(false);
    expect(affiliateCan("paused", "affiliate.tax.manage")).toBe(false);
  });

  it("reduces suspended affiliates to read-only", () => {
    expect(affiliateCan("suspended", "affiliate.dashboard.read")).toBe(true);
    expect(affiliateCan("suspended", "affiliate.commissions.read")).toBe(true);
    expect(affiliateCan("suspended", "affiliate.links.manage")).toBe(false);
    expect(affiliateCan("suspended", "affiliate.export")).toBe(false);
  });

  it("keeps terminated affiliates read-only for legally required history", () => {
    const perms = affiliatePermissionsFor("terminated");
    expect(perms.has("affiliate.payouts.read")).toBe(true);
    expect(perms.has("affiliate.links.manage")).toBe(false);
  });
});
