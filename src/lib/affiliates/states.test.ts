import { describe, expect, it } from "vitest";

import {
  assertFraudDecision,
  canTransitionApplication,
  canTransitionMembership,
  membershipAllowsAccrual,
  membershipAllowsTracking,
} from "./states";

describe("affiliate state machines", () => {
  it("allows a submitted application to reach a decision", () => {
    expect(canTransitionApplication("submitted", "approved")).toBe(true);
    expect(canTransitionApplication("submitted", "rejected")).toBe(true);
    expect(canTransitionApplication("submitted", "waitlisted")).toBe(true);
  });

  it("locks terminal application states", () => {
    expect(canTransitionApplication("approved", "rejected")).toBe(false);
    expect(canTransitionApplication("rejected", "submitted")).toBe(false);
  });

  it("permits suspension and reactivation but not resurrection of terminated", () => {
    expect(canTransitionMembership("active", "suspended")).toBe(true);
    expect(canTransitionMembership("suspended", "active")).toBe(true);
    expect(canTransitionMembership("terminated", "active")).toBe(false);
  });

  it("only tracks and accrues while active", () => {
    expect(membershipAllowsTracking("active")).toBe(true);
    expect(membershipAllowsTracking("suspended")).toBe(false);
    expect(membershipAllowsAccrual("active")).toBe(true);
    expect(membershipAllowsAccrual("paused")).toBe(false);
  });

  it("validates fraud review decisions", () => {
    expect(() => assertFraudDecision("clear")).not.toThrow();
    expect(() => assertFraudDecision("reverse")).not.toThrow();
    expect(() => assertFraudDecision("banish")).toThrow();
  });
});
