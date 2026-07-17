import { describe, expect, it } from "vitest";

import { eventStatusLabel, lifecycleLabel, severityLabel } from "./labels";

describe("severityLabel", () => {
  it("maps known severities to customer-safe labels", () => {
    expect(severityLabel("major")).toBe("Major Service Disruption");
    expect(severityLabel("critical")).toBe("Critical Service Disruption");
  });

  it("falls back to a neutral label for unknown or missing severity", () => {
    expect(severityLabel(null)).toBe("Incident");
    expect(severityLabel("weird")).toBe("Incident");
  });
});

describe("eventStatusLabel", () => {
  it("maps resolution and reopen deterministically", () => {
    expect(eventStatusLabel("incident_resolved", "resolved")).toBe("Resolved");
    expect(eventStatusLabel("incident_reopened", "down")).toBe("Reopened");
  });

  it("maps maintenance lifecycle", () => {
    expect(eventStatusLabel("maintenance_scheduled", null)).toBe("Scheduled");
    expect(eventStatusLabel("maintenance_completed", null)).toBe("Completed");
    expect(eventStatusLabel("maintenance_canceled", null)).toBe("Canceled");
  });

  it("uses the lifecycle label for updates", () => {
    expect(eventStatusLabel("incident_update", "identified")).toBe("Identified");
  });
});

describe("lifecycleLabel", () => {
  it("maps known lifecycle values", () => {
    expect(lifecycleLabel("monitoring")).toBe("Monitoring");
  });

  it("falls back to Update", () => {
    expect(lifecycleLabel(undefined)).toBe("Update");
  });
});
