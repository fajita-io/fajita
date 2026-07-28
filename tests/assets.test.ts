import { existsSync, readFileSync } from "node:fs";
import path from "node:path";

import { describe, expect, it } from "vitest";

const root = process.cwd();

const requiredAssets = [
  "public/brand/logos/fajita-mark.svg",
  "public/brand/logos/fajita-mark-dark.svg",
  "public/brand/logos/fajita-mark-mono.svg",
  "public/brand/logos/fajita-wordmark.svg",
  "public/brand/logos/fajita-wordmark-dark.svg",
  "public/brand/logos/fajita-wordmark-mono.svg",
  "public/brand/logos/fajita-logo-horizontal.svg",
  "public/brand/logos/fajita-logo-horizontal-dark.svg",
  "public/brand/logos/fajita-logo-stacked.svg",
  "public/brand/logos/fajita-logo-stacked-dark.svg",
  "public/brand/icons/app-icon.svg",
  "public/brand/icons/social-avatar.svg",
  "public/brand/social/og-template.svg",
  "public/brand/social/x-header.svg",
  "public/brand/email/email-header.svg",
  "public/brand/email/fajita-app-icon.png",
  "public/brand/email/memo-app-icon.png",
  "src/app/icon.svg",
];

describe("brand asset inventory", () => {
  it("all required exports exist", () => {
    for (const asset of requiredAssets) {
      expect(existsSync(path.join(root, asset)), asset).toBe(true);
    }
  });

  it("exports are clean vectors: no rasters, no filters, no external refs", () => {
    for (const asset of requiredAssets.filter((a) => a.endsWith(".svg"))) {
      const svg = readFileSync(path.join(root, asset), "utf8");
      expect(svg, asset).not.toMatch(/<image/i);
      expect(svg, asset).not.toMatch(/<filter/i);
      expect(svg, asset).not.toMatch(/xlink:href\s*=\s*"http/i);
      expect(svg, asset).not.toMatch(/data:image\/(png|jpe?g)/i);
    }
  });

  it("og share template uses the held-pulse editorial composition", () => {
    const svg = readFileSync(
      path.join(root, "public/brand/social/og-template.svg"),
      "utf8",
    );
    expect(svg).toMatch(/viewBox="0 0 1200 630"/);
    expect(svg).toMatch(/og-heat-grid/);
    expect(svg).toMatch(/og-pulse-glow/);
    expect(svg).not.toMatch(/<text/i);
    expect(svg).toMatch(/aria-label="Fajita\. Know when your software gets too hot\."/);
  });

  it("assets referenced by components exist on disk", () => {
    const sources = [
      "src/app/internal/brand-lab/sections/social-section.tsx",
      "src/app/internal/brand-lab/sections/logo-section.tsx",
      "src/app/internal/brand-lab/sections/email-proto.tsx",
    ];
    for (const source of sources) {
      const code = readFileSync(path.join(root, source), "utf8");
      const refs = [...code.matchAll(/["'](\/brand\/[a-z0-9/.-]+)["']/g)].map(
        (m) => m[1],
      );
      for (const ref of refs) {
        expect(existsSync(path.join(root, "public", ref)), ref).toBe(true);
      }
    }
  });
});
