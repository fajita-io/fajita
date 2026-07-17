import { describe, expect, it } from "vitest";

import {
  baseFeatureMap,
  FEATURE_REGISTRY,
  isStageAvailable,
} from "@/lib/app/feature-flags";
import { buildNav } from "@/lib/app/nav-model";
import { permissionsFor } from "@/lib/auth/roles";

describe("feature stages", () => {
  it("only public_beta and ga are customer-available", () => {
    expect(isStageAvailable("ga")).toBe(true);
    expect(isStageAvailable("public_beta")).toBe(true);
    expect(isStageAvailable("development")).toBe(false);
    expect(isStageAvailable("private_beta")).toBe(false);
    expect(isStageAvailable("disabled")).toBe(false);
  });

  it("later-phase product features are hidden and shell features are GA", () => {
    const map = baseFeatureMap();
    // Monitors reached public beta in Phase 5.
    expect(map.monitors).toBe(true);
    // Incidents/maintenance are private beta in Phase 6 (not customer-available).
    expect(map.incidents).toBe(false);
    expect(map.maintenance).toBe(false);
    expect(map.statusPages).toBe(false);
    expect(map.billing).toBe(false);
    expect(map.commandPalette).toBe(true);
    expect(map.notificationCenter).toBe(true);
    expect(FEATURE_REGISTRY.monitors.stage).toBe("public_beta");
  });
});

describe("navigation gating", () => {
  const features = baseFeatureMap();

  it("hides not-yet-available product routes from a member", () => {
    const nav = buildNav({
      features,
      permissions: permissionsFor("member"),
      isPlatformAdmin: false,
    });
    const labels = nav.flatMap((g) => g.items.map((i) => i.label));
    expect(labels).toContain("Overview");
    expect(labels).toContain("Team");
    // Monitors is public beta and visible; incidents/maintenance are not yet.
    expect(labels).toContain("Monitors");
    expect(labels).not.toContain("Incidents");
    expect(labels).not.toContain("Maintenance");
  });

  it("shows reserved product routes to a platform admin", () => {
    const nav = buildNav({
      features,
      permissions: permissionsFor("owner"),
      isPlatformAdmin: true,
    });
    const labels = nav.flatMap((g) => g.items.map((i) => i.label));
    expect(labels).toContain("Monitors");
  });
});
