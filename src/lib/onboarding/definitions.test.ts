import { describe, expect, it } from "vitest";

import {
  CORE_STEP_KEYS,
  CURRENT_ONBOARDING_VERSION,
  isKnownStepKey,
  ONBOARDING_V2_STEPS,
  OPTIONAL_STEP_KEYS,
  PRODUCT_TOURS,
  recommendMonitor,
} from "./definitions";

/**
 * Onboarding definition integrity: unique ordered steps, permission-tagged
 * actions, bounded tours, and deterministic monitor recommendations.
 */

describe("onboarding step definitions", () => {
  it("targets the current version", () => {
    for (const step of ONBOARDING_V2_STEPS) {
      expect(step.version).toBe(CURRENT_ONBOARDING_VERSION);
    }
  });

  it("has unique keys and unique order values", () => {
    const keys = ONBOARDING_V2_STEPS.map((s) => s.key);
    const orders = ONBOARDING_V2_STEPS.map((s) => s.order);
    expect(new Set(keys).size).toBe(keys.length);
    expect(new Set(orders).size).toBe(orders.length);
  });

  it("splits cleanly into core and optional", () => {
    expect(CORE_STEP_KEYS.length + OPTIONAL_STEP_KEYS.length).toBe(
      ONBOARDING_V2_STEPS.length,
    );
    expect(CORE_STEP_KEYS.length).toBeGreaterThanOrEqual(5);
  });

  it("gives every step a title and an in-app destination where actionable", () => {
    for (const step of ONBOARDING_V2_STEPS) {
      expect(step.title.length).toBeGreaterThan(0);
      // "organization" is completed before the checklist exists, so it has
      // no destination; every other step links into the app.
      if (step.href !== null) {
        expect(step.href.startsWith("/app")).toBe(true);
      }
    }
  });

  it("recognizes known keys and rejects unknown ones", () => {
    expect(isKnownStepKey(CORE_STEP_KEYS[0])).toBe(true);
    expect(isKnownStepKey("made_up_step")).toBe(false);
  });

  it("uses no em dashes in customer-facing step copy", () => {
    for (const step of ONBOARDING_V2_STEPS) {
      expect(step.title).not.toContain("\u2014");
      expect(step.description).not.toContain("\u2014");
    }
  });
});

describe("product tours", () => {
  it("keeps every tour at five steps or fewer", () => {
    for (const tour of PRODUCT_TOURS) {
      expect(tour.steps.length).toBeGreaterThan(0);
      expect(tour.steps.length).toBeLessThanOrEqual(5);
    }
  });

  it("has unique tour keys", () => {
    const keys = PRODUCT_TOURS.map((t) => t.key);
    expect(new Set(keys).size).toBe(keys.length);
  });
});

describe("recommendMonitor", () => {
  it("recommends an SSL monitor for certificate concerns", () => {
    const rec = recommendMonitor("ssl_expiry", "A SaaS product");
    expect(rec.monitorType).toBe("ssl");
  });

  it("recommends a heartbeat monitor for missed cron jobs", () => {
    const rec = recommendMonitor("missed_cron", "Internal jobs");
    expect(rec.monitorType).toBe("heartbeat");
  });

  it("lets the concern outrank the use case", () => {
    // API use case but a certificate concern: the concern wins.
    const rec = recommendMonitor("ssl_expiry", "An API");
    expect(rec.monitorType).toBe("ssl");
  });

  it("uses the use case when no concern was selected", () => {
    expect(recommendMonitor(null, "An API").monitorType).toBe("api");
    expect(recommendMonitor(null, "Internal jobs").monitorType).toBe(
      "heartbeat",
    );
  });

  it("falls back to a website monitor with no answers", () => {
    const rec = recommendMonitor(null, null);
    expect(rec.monitorType).toBe("https");
    expect(rec.title.length).toBeGreaterThan(0);
  });

  it("is deterministic for the same inputs", () => {
    expect(recommendMonitor("api_failure", "An API")).toEqual(
      recommendMonitor("api_failure", "An API"),
    );
  });
});
