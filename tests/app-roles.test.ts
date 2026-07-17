import { describe, expect, it } from "vitest";

import {
  can,
  canAssignRole,
  permissionsFor,
  roleAtLeast,
} from "@/lib/auth/roles";

describe("role permissions", () => {
  it("owner can do everything admin and member can, plus ownership", () => {
    expect(can("owner", "org:delete")).toBe(true);
    expect(can("owner", "org:transfer_ownership")).toBe(true);
    expect(can("owner", "billing:manage")).toBe(true);
    expect(can("owner", "members:invite")).toBe(true);
    expect(can("owner", "org:read")).toBe(true);
  });

  it("admin manages members and org but not ownership or billing", () => {
    expect(can("admin", "members:invite")).toBe(true);
    expect(can("admin", "members:remove")).toBe(true);
    expect(can("admin", "org:update")).toBe(true);
    expect(can("admin", "audit:read")).toBe(true);
    expect(can("admin", "org:delete")).toBe(false);
    expect(can("admin", "org:transfer_ownership")).toBe(false);
    expect(can("admin", "billing:manage")).toBe(false);
  });

  it("member cannot manage members, org, or billing", () => {
    expect(can("member", "members:read")).toBe(true);
    expect(can("member", "members:invite")).toBe(false);
    expect(can("member", "members:change_role")).toBe(false);
    expect(can("member", "org:update")).toBe(false);
    expect(can("member", "org:delete")).toBe(false);
    expect(can("member", "audit:read")).toBe(false);
  });

  it("roleAtLeast respects hierarchy", () => {
    expect(roleAtLeast("owner", "admin")).toBe(true);
    expect(roleAtLeast("admin", "owner")).toBe(false);
    expect(roleAtLeast("member", "member")).toBe(true);
  });
});

describe("role assignment (privilege escalation guards)", () => {
  it("nobody can assign owner via role change", () => {
    expect(canAssignRole("owner", "owner")).toBe(false);
    expect(canAssignRole("admin", "owner")).toBe(false);
    expect(canAssignRole("member", "owner")).toBe(false);
  });

  it("owner may assign admin or member", () => {
    expect(canAssignRole("owner", "admin")).toBe(true);
    expect(canAssignRole("owner", "member")).toBe(true);
  });

  it("admin may assign only member", () => {
    expect(canAssignRole("admin", "member")).toBe(true);
    expect(canAssignRole("admin", "admin")).toBe(false);
  });

  it("member may assign nothing (no self-promotion)", () => {
    expect(canAssignRole("member", "admin")).toBe(false);
    expect(canAssignRole("member", "member")).toBe(false);
  });
});

describe("permissionsFor", () => {
  it("returns a stable list for each role", () => {
    expect(permissionsFor("member")).toContain("org:read");
    expect(permissionsFor("admin")).toContain("members:invite");
    expect(permissionsFor("owner")).toContain("org:delete");
  });
});
