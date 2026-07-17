import { describe, expect, it } from "vitest";

import {
  getMetricDefinition,
  listMetricDefinitions,
  METRIC_DEFINITIONS,
} from "@/lib/platform/metrics/definitions";
import {
  resolveComparison,
  resolveDateRange,
} from "@/lib/platform/dates";
import { sanitizeExportCell } from "@/lib/platform/exports/service";

describe("metric definitions registry", () => {
  it("defines MRR and ARR with recurring basis", () => {
    const mrr = getMetricDefinition("mrr");
    const arr = getMetricDefinition("arr");
    expect(mrr?.basis).toBe("recurring");
    expect(arr?.basis).toBe("recurring");
    expect(mrr?.calculationVersion).toBeTruthy();
  });

  it("keeps cash collected distinct from MRR", () => {
    const cash = getMetricDefinition("gross_collected_revenue");
    expect(cash?.basis).toBe("cash");
    expect(cash?.description.toLowerCase()).toContain("not profit");
  });

  it("exposes all categories without duplicate keys", () => {
    const keys = Object.keys(METRIC_DEFINITIONS);
    expect(new Set(keys).size).toBe(keys.length);
    expect(listMetricDefinitions("revenue").length).toBeGreaterThan(3);
  });
});

describe("date ranges", () => {
  it("labels partial current periods", () => {
    const range = resolveDateRange("today", null, null, new Date("2026-07-17T15:00:00Z"));
    expect(range.partial).toBe(true);
    expect(range.label).toContain("partial");
  });

  it("computes previous period comparison", () => {
    const range = resolveDateRange("last_7_days", null, null, new Date("2026-07-17T12:00:00Z"));
    const cmp = resolveComparison(range, "previous_period");
    expect(cmp.start).not.toBeNull();
    expect(cmp.end!.getTime()).toBeLessThan(range.start.getTime());
  });
});

describe("export sanitization", () => {
  it("neutralizes formula injection prefixes", () => {
    expect(sanitizeExportCell("=cmd")).toBe("'=cmd");
    expect(sanitizeExportCell("+123")).toBe("'+123");
    expect(sanitizeExportCell("safe")).toBe("safe");
  });
});
