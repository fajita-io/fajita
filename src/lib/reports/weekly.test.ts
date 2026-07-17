import { describe, expect, it } from "vitest";

import { computeReportPeriod, tzMidnightUtc } from "./weekly";

/**
 * Weekly report period math. These are the definitions customers see in the
 * report header, so they must be exact: organization timezone, configurable
 * week start, previous seven complete days, human label.
 */

describe("computeReportPeriod", () => {
  // Friday, July 17 2026, 12:00 UTC.
  const reference = new Date("2026-07-17T12:00:00Z");

  it("covers the previous seven complete days ending before the last Monday (UTC)", () => {
    const period = computeReportPeriod("UTC", "monday", reference);
    // Last Monday boundary before the reference is July 13.
    expect(period.periodStart).toBe("2026-07-06");
    expect(period.periodEnd).toBe("2026-07-12");
    expect(period.fromUtc.toISOString()).toBe("2026-07-06T00:00:00.000Z");
    expect(period.toUtc.toISOString()).toBe("2026-07-13T00:00:00.000Z");
  });

  it("produces the exact human label", () => {
    const period = computeReportPeriod("UTC", "monday", reference);
    expect(period.label).toBe("July 6 through July 12, 2026");
  });

  it("supports Sunday week start", () => {
    const period = computeReportPeriod("UTC", "sunday", reference);
    // Last Sunday boundary before the reference is July 12.
    expect(period.periodStart).toBe("2026-07-05");
    expect(period.periodEnd).toBe("2026-07-11");
  });

  it("uses the organization timezone, not UTC, to find the boundary", () => {
    // Monday 2026-07-13 00:30 UTC is still Sunday evening in Los Angeles,
    // so the LA boundary is the prior Monday (July 6).
    const earlyMonday = new Date("2026-07-13T00:30:00Z");
    const utcPeriod = computeReportPeriod("UTC", "monday", earlyMonday);
    const laPeriod = computeReportPeriod(
      "America/Los_Angeles",
      "monday",
      earlyMonday,
    );
    expect(utcPeriod.periodStart).toBe("2026-07-06");
    expect(laPeriod.periodStart).toBe("2026-06-29");
    expect(laPeriod.periodEnd).toBe("2026-07-05");
  });

  it("bounds the query window with timezone-correct midnights", () => {
    const period = computeReportPeriod(
      "America/New_York",
      "monday",
      reference,
    );
    // Midnight New York in July is 04:00 UTC (EDT).
    expect(period.fromUtc.toISOString()).toBe("2026-07-06T04:00:00.000Z");
    expect(period.toUtc.toISOString()).toBe("2026-07-13T04:00:00.000Z");
  });

  it("keeps period length at exactly seven days", () => {
    for (const tz of ["UTC", "America/Los_Angeles", "Asia/Tokyo", "Europe/Berlin"]) {
      for (const start of ["monday", "sunday"] as const) {
        const period = computeReportPeriod(tz, start, reference);
        const days =
          (period.toUtc.getTime() - period.fromUtc.getTime()) /
          (24 * 60 * 60 * 1000);
        expect(days).toBe(7);
      }
    }
  });

  it("falls back to UTC for an empty timezone", () => {
    const period = computeReportPeriod("", "monday", reference);
    expect(period.timezone).toBe("UTC");
    expect(period.periodStart).toBe("2026-07-06");
  });

  it("labels a period that crosses the year boundary with both years", () => {
    // Friday, January 9 2026; last Monday boundary is January 5, so the
    // period runs December 29 2025 through January 4 2026.
    const january = new Date("2026-01-09T12:00:00Z");
    const period = computeReportPeriod("UTC", "monday", january);
    expect(period.periodStart).toBe("2025-12-29");
    expect(period.periodEnd).toBe("2026-01-04");
    expect(period.label).toBe("December 29, 2025 through January 4, 2026");
  });
});

describe("tzMidnightUtc", () => {
  it("resolves UTC midnight directly", () => {
    expect(tzMidnightUtc("2026-07-06", "UTC").toISOString()).toBe(
      "2026-07-06T00:00:00.000Z",
    );
  });

  it("resolves offsets east of UTC", () => {
    // Tokyo is UTC+9 with no DST.
    expect(tzMidnightUtc("2026-07-06", "Asia/Tokyo").toISOString()).toBe(
      "2026-07-05T15:00:00.000Z",
    );
  });

  it("resolves DST-adjusted offsets west of UTC", () => {
    // Los Angeles in July is UTC-7 (PDT).
    expect(
      tzMidnightUtc("2026-07-06", "America/Los_Angeles").toISOString(),
    ).toBe("2026-07-06T07:00:00.000Z");
  });
});
