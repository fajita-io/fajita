/**
 * SEO foundation: sitemap coverage, robots exclusions, canonical and
 * noindex behavior of the metadata builder.
 */
import { describe, expect, it } from "vitest";

import robots from "@/app/robots";
import sitemap from "@/app/sitemap";
import { featureOrder } from "@/lib/site/features";
import { buildMetadata } from "@/lib/site/metadata";

describe("sitemap", () => {
  const urls = sitemap().map((entry) => new URL(entry.url).pathname);

  it("includes every public route", () => {
    for (const path of [
      "/",
      "/pricing",
      "/features",
      "/integrations",
      "/security",
      "/about",
      "/contact",
      "/changelog",
      "/roadmap",
      "/status",
      "/early-access",
      "/legal",
      ...featureOrder.map((slug) => `/features/${slug}`),
    ]) {
      expect(urls, `missing ${path}`).toContain(path);
    }
  });

  it("excludes noindex and internal routes", () => {
    expect(urls).not.toContain("/login");
    expect(urls).not.toContain("/signup");
    expect(urls.some((u) => u.startsWith("/app"))).toBe(false);
    expect(urls.some((u) => u.startsWith("/internal"))).toBe(false);
    expect(urls.some((u) => u.startsWith("/api"))).toBe(false);
  });

  it("has no duplicate entries", () => {
    expect(new Set(urls).size).toBe(urls.length);
  });
});

describe("robots", () => {
  it("disallows api and internal routes and references the sitemap", () => {
    const config = robots();
    const rules = Array.isArray(config.rules) ? config.rules : [config.rules];
    const disallow = rules.flatMap((r) =>
      Array.isArray(r.disallow) ? r.disallow : [r.disallow],
    );
    expect(disallow).toContain("/api/");
    expect(disallow).toContain("/internal/");
    expect(String(config.sitemap)).toMatch(/\/sitemap\.xml$/);
  });
});

describe("metadata builder", () => {
  it("produces unique canonical paths and mirrored social metadata", () => {
    const meta = buildMetadata({
      title: "Pricing",
      description: "Plans for small teams.",
      path: "/pricing",
    });
    expect(meta.alternates?.canonical).toBe("/pricing");
    expect(meta.openGraph?.title).toBe("Pricing · Fajita");
    expect((meta.twitter as { card?: string })?.card).toBe("summary_large_image");
    expect(meta.robots).toBeUndefined();
  });

  it("applies noindex when requested", () => {
    const meta = buildMetadata({
      title: "Log in",
      description: "x",
      path: "/login",
      noindex: true,
    });
    expect(meta.robots).toEqual({ index: false, follow: false });
  });
});
