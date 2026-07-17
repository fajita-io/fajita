import { describe, expect, it } from "vitest";

import {
  calculateUptime,
  commonUptimeTable,
  formatDuration,
} from "./uptime";

describe("uptime calculator", () => {
  it("computes 99.9% over 30 days", () => {
    const result = calculateUptime({ percentage: 99.9, period: "30d" });
    expect(result.ok).toBe(true);
    if (!result.ok) return;
    // 0.001 * 30 * 86400 = 2592 seconds = 43 minutes 12 seconds
    expect(result.allowedDowntimeSeconds).toBeCloseTo(2592, 5);
    expect(result.humanDowntime).toContain("43 minute");
  });

  it("computes 99.99% over 365 days", () => {
    const result = calculateUptime({ percentage: 99.99, period: "365d" });
    expect(result.ok).toBe(true);
    if (!result.ok) return;
    expect(result.allowedDowntimeSeconds).toBeCloseTo(3153.6, 1);
  });

  it("rejects invalid percentage", () => {
    const result = calculateUptime({ percentage: 101, period: "24h" });
    expect(result.ok).toBe(false);
  });

  it("supports custom hours", () => {
    const result = calculateUptime({
      percentage: 99,
      period: "custom-hours",
      customValue: 100,
    });
    expect(result.ok).toBe(true);
    if (!result.ok) return;
    expect(result.allowedDowntimeSeconds).toBeCloseTo(3600, 5);
  });

  it("formats durations", () => {
    expect(formatDuration(90)).toContain("1 minute");
    expect(formatDuration(3661)).toContain("1 hour");
  });

  it("builds common table", () => {
    const table = commonUptimeTable("30d");
    expect(table).toHaveLength(4);
    expect(table[0].percentage).toBe(99);
  });
});
