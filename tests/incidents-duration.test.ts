import { describe, expect, it } from "vitest";

import {
  durationMs,
  formatDuration,
  incidentDuration,
  relativeTime,
} from "@/lib/incidents/duration";

describe("duration", () => {
  it("computes non-negative UTC durations", () => {
    expect(durationMs("2026-07-20T00:00:00Z", "2026-07-20T00:05:00Z")).toBe(300000);
    expect(durationMs("2026-07-20T00:05:00Z", "2026-07-20T00:00:00Z")).toBe(0);
    expect(durationMs(null, "2026-07-20T00:05:00Z")).toBe(0);
  });

  it("formats compact durations", () => {
    expect(formatDuration(45_000)).toBe("45s");
    expect(formatDuration(12 * 60_000)).toBe("12m");
    expect(formatDuration((3 * 60 + 20) * 60_000)).toBe("3h 20m");
    expect(formatDuration(2 * 24 * 3600_000 + 4 * 3600_000)).toBe("2d 4h");
  });

  it("uses opened-to-resolved as the primary incident duration", () => {
    expect(
      incidentDuration("2026-07-20T00:00:00Z", "2026-07-20T01:30:00Z"),
    ).toBe("1h 30m");
  });

  it("renders relative time relative to a fixed now", () => {
    const now = Date.parse("2026-07-20T00:10:00Z");
    expect(relativeTime("2026-07-20T00:05:00Z", now)).toBe("5m ago");
    expect(relativeTime("2026-07-20T00:20:00Z", now)).toBe("in 10m");
  });
});
