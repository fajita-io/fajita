import { describe, expect, it } from "vitest";

import {
  platformCan,
  permissionsForRoles,
  PLATFORM_ROLES,
  STEP_UP_ACTIONS,
} from "@/lib/platform/permissions";

describe("platform permissions", () => {
  it("keeps platform roles separate from org roles", () => {
    expect(PLATFORM_ROLES).toContain("platform_owner");
    expect(PLATFORM_ROLES).not.toContain("owner");
    expect(PLATFORM_ROLES).not.toContain("admin");
  });

  it("grants overview read to analysts", () => {
    expect(platformCan(["read_only_analyst"], "platform.overview.read")).toBe(
      true,
    );
    expect(
      platformCan(["read_only_analyst"], "platform.customers.restrict"),
    ).toBe(false);
  });

  it("does not let support approve refunds", () => {
    expect(platformCan(["support"], "platform.billing.refund_review")).toBe(
      false,
    );
  });

  it("lets billing ops review refunds", () => {
    expect(
      platformCan(["billing_operations"], "platform.billing.refund_review"),
    ).toBe(true);
  });

  it("unions permissions across roles", () => {
    const set = permissionsForRoles(["support", "billing_operations"]);
    expect(set.has("platform.support.read")).toBe(true);
    expect(set.has("platform.revenue.read")).toBe(true);
  });

  it("lists step-up actions for high-risk work", () => {
    expect(STEP_UP_ACTIONS).toContain("acquisition.export");
    expect(STEP_UP_ACTIONS).toContain("monitoring.worker.drain");
    expect(STEP_UP_ACTIONS).toContain("scale.campaign.launch");
  });

  it("gives scale overview to analysts but not capacity manage", () => {
    expect(platformCan(["read_only_analyst"], "scale.overview.read")).toBe(true);
    expect(platformCan(["read_only_analyst"], "scale.capacity.manage")).toBe(
      false,
    );
  });

  it("does not give content editors infrastructure scale controls", () => {
    expect(platformCan(["content_editor"], "scale.capacity.manage")).toBe(false);
    expect(platformCan(["operations"], "scale.capacity.manage")).toBe(true);
  });
});
