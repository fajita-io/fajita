import { describe, expect, it } from "vitest";

import { explainCron } from "./cron";

describe("cron explainer", () => {
  it("explains hourly at minute 0", () => {
    const result = explainCron("0 * * * *", "UTC", 3, new Date("2026-07-17T12:30:00Z"));
    expect(result.ok).toBe(true);
    if (!result.ok) return;
    expect(result.nextRuns[0]).toBe("2026-07-17T13:00:00Z");
    expect(result.human).toContain("minute 0");
  });

  it("rejects six-field expressions", () => {
    const result = explainCron("0 0 * * * *");
    expect(result.ok).toBe(false);
  });

  it("rejects out of range minutes", () => {
    const result = explainCron("99 * * * *");
    expect(result.ok).toBe(false);
  });
});
