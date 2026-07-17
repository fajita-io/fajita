import { describe, expect, it } from "vitest";

import {
  GRACE_POLICY,
  blocksNewResources,
  daysElapsed,
  gracePhase,
  restrictionStartsAt,
} from "@/lib/billing/grace-period";

const DAY = 24 * 60 * 60 * 1000;
const failedAt = "2026-07-01T00:00:00.000Z";

function at(days: number): Date {
  return new Date(new Date(failedAt).getTime() + days * DAY);
}

describe("daysElapsed", () => {
  it("floors to whole days and never goes negative", () => {
    expect(daysElapsed(failedAt, at(0))).toBe(0);
    expect(daysElapsed(failedAt, at(2.9))).toBe(2);
    expect(daysElapsed(failedAt, at(-5))).toBe(0);
  });
});

describe("gracePhase", () => {
  it("warns through day 3", () => {
    expect(gracePhase(failedAt, at(0))).toBe("warn");
    expect(gracePhase(failedAt, at(3))).toBe("warn");
  });

  it("blocks new resources on days 4 through 7", () => {
    expect(gracePhase(failedAt, at(4))).toBe("block_new");
    expect(gracePhase(failedAt, at(7))).toBe("block_new");
  });

  it("restricts after day 7", () => {
    expect(gracePhase(failedAt, at(8))).toBe("restricted");
    expect(gracePhase(failedAt, at(30))).toBe("restricted");
  });
});

describe("blocksNewResources", () => {
  it("only allows creation during the warn phase", () => {
    expect(blocksNewResources("warn")).toBe(false);
    expect(blocksNewResources("block_new")).toBe(true);
    expect(blocksNewResources("restricted")).toBe(true);
  });
});

describe("restrictionStartsAt", () => {
  it("begins the day after the block window ends", () => {
    const startsAt = new Date(restrictionStartsAt(failedAt)).getTime();
    const expected =
      new Date(failedAt).getTime() + (GRACE_POLICY.blockNewUntilDay + 1) * DAY;
    expect(startsAt).toBe(expected);
    // Sanity: phase at that instant is restricted.
    expect(gracePhase(failedAt, new Date(startsAt))).toBe("restricted");
  });
});
