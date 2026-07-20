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

  it("product and shell features are GA for customers", () => {
    const map = baseFeatureMap();
    expect(map.monitors).toBe(true);
    expect(map.incidents).toBe(true);
    expect(map.maintenance).toBe(true);
    expect(map.statusPages).toBe(true);
    expect(map.billing).toBe(true);
    expect(map.commandPalette).toBe(true);
    expect(map.notificationCenter).toBe(true);
    expect(FEATURE_REGISTRY.monitors.stage).toBe("ga");
  });
});

describe("navigation gating", () => {
  const features = baseFeatureMap();

  it("shows product routes to a member", () => {
    const nav = buildNav({
      features,
      permissions: permissionsFor("member"),
      isPlatformAdmin: false,
    });
    const labels = nav.flatMap((g) => g.items.map((i) => i.label));
    expect(labels).toContain("Overview");
    expect(labels).toContain("Team");
    expect(labels).toContain("Monitors");
    expect(labels).toContain("Incidents");
    expect(labels).toContain("Maintenance");
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
