import { readFileSync } from "node:fs";
import path from "node:path";

import { describe, expect, it } from "vitest";

import { statusSpecs } from "@/components/design-system/status/status";
import { thermalStates } from "@/components/brand/thermal-stack/types";

const themesCss = readFileSync(
  path.join(process.cwd(), "src/styles/themes.css"),
  "utf8",
);
const tokensCss = readFileSync(
  path.join(process.cwd(), "src/styles/tokens.css"),
  "utf8",
);

const allStatuses = [
  "operational",
  "degraded",
  "verifying",
  "down",
  "maintenance",
  "paused",
  "unknown",
  "recovering",
] as const;

describe("status token mappings", () => {
  it("covers all eight operational states", () => {
    expect(Object.keys(statusSpecs).sort()).toEqual([...allStatuses].sort());
  });

  it("every status references defined semantic tokens", () => {
    for (const status of allStatuses) {
      const spec = statusSpecs[status];
      for (const value of [spec.text, spec.bold, spec.soft]) {
        const token = value.match(/var\((--[a-z-]+)\)/)?.[1];
        expect(token, value).toBeTruthy();
        expect(themesCss).toContain(`${token}:`);
      }
      expect(spec.label.length).toBeGreaterThan(0);
    }
  });

  it("defines every status token in both themes", () => {
    for (const status of allStatuses) {
      const occurrences = themesCss.split(`--color-status-${status}:`).length - 1;
      expect(occurrences, status).toBe(2);
    }
  });
});

describe("semantic token availability", () => {
  const required = [
    "--color-background-primary",
    "--color-background-elevated",
    "--color-text-primary",
    "--color-text-muted",
    "--color-brand-ember",
    "--color-brand-heat",
    "--color-border-subtle",
    "--color-focus-ring",
  ];

  it("required semantic tokens exist in both themes", () => {
    for (const token of required) {
      expect(themesCss.split(`${token}:`).length - 1, token).toBe(2);
    }
  });

  it("semantic tokens only reference defined primitives", () => {
    const referenced = [...themesCss.matchAll(/var\((--fj-[a-z0-9-]+)\)/g)].map(
      (m) => m[1],
    );
    expect(referenced.length).toBeGreaterThan(20);
    for (const token of referenced) {
      expect(tokensCss, token).toContain(`${token}:`);
    }
  });
});

describe("thermal stack states", () => {
  it("defines the six brand-object states with valid specs", () => {
    for (const [name, spec] of Object.entries(thermalStates)) {
      expect(spec.label.length, name).toBeGreaterThan(0);
      expect(spec.heatLevel).toBeGreaterThanOrEqual(0);
      expect(spec.heatLevel).toBeLessThanOrEqual(1);
      expect(spec.pulseSeconds).toBeGreaterThan(0);
      expect(["calm", "tense", "spike"]).toContain(spec.waveform);
    }
  });
});
