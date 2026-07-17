import { describe, expect, it } from "vitest";

import { ASSISTED_CONVERSION_DEFINITIONS } from "./attribution";
import { scanAntiAiSlop } from "./quality";
import {
  contentManifest,
  publicArticles,
  publicComparisons,
  publicTools,
} from "./registry";
import { sanitizeSearchQuery, searchContent } from "./search";

describe("content growth platform", () => {
  it("publishes the launch article set", () => {
    expect(publicArticles().length).toBeGreaterThanOrEqual(8);
  });

  it("publishes comparisons including methodology", () => {
    const slugs = publicComparisons().map((c) => c.meta.slug);
    expect(slugs).toContain("comparison-methodology");
    expect(slugs).toContain("fajita-vs-uptimerobot");
  });

  it("publishes four client-side tools", () => {
    expect(publicTools()).toHaveLength(4);
    expect(publicTools().every((t) => t.meta.clientSideOnly)).toBe(true);
    expect(publicTools().every((t) => !t.meta.networkAccess)).toBe(true);
  });

  it("builds a content manifest without internal fields", () => {
    const manifest = contentManifest();
    const json = JSON.stringify(manifest);
    expect(json).not.toContain("reviewer emails");
    expect(json).not.toContain("keyword volume");
    expect(manifest.entries.length).toBeGreaterThan(10);
  });

  it("flags em dashes in anti-slop scan", () => {
    const findings = scanAntiAiSlop("Hello — world", "test");
    expect(findings.some((f) => f.code === "em-dash")).toBe(true);
  });

  it("redacts secret-like search queries", () => {
    const { query, redacted } = sanitizeSearchQuery(
      "sk_live_abcdefghijklmnopqrstuv",
    );
    expect(redacted).toBe(true);
    expect(query).toContain("[redacted]");
  });

  it("searches articles", () => {
    const hits = searchContent("heartbeat cron");
    expect(hits.some((h) => h.type === "article")).toBe(true);
  });

  it("documents assisted conversion definitions", () => {
    expect(ASSISTED_CONVERSION_DEFINITIONS.length).toBeGreaterThanOrEqual(4);
  });

  it("keeps Fajita limitations on versus pages", () => {
    for (const page of publicComparisons().filter(
      (c) => c.meta.comparisonType === "versus",
    )) {
      expect(page.meta.fajitaLimitations.length).toBeGreaterThan(0);
      expect(page.meta.competitorStrengths?.length ?? 0).toBeGreaterThan(0);
    }
  });
});
