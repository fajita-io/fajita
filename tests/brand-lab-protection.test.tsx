/** @vitest-environment jsdom */
import { describe, expect, it, vi, afterEach } from "vitest";

const notFound = vi.fn(() => {
  throw new Error("NEXT_NOT_FOUND");
});

vi.mock("next/navigation", () => ({ notFound }));

afterEach(() => {
  vi.unstubAllEnvs();
  notFound.mockClear();
  vi.resetModules();
});

describe("brand lab route protection", () => {
  it("is excluded from indexing", async () => {
    const { metadata } = await import("@/app/internal/brand-lab/layout");
    expect(metadata.robots).toMatchObject({ index: false, follow: false });
  });

  it("renders in development", async () => {
    vi.stubEnv("NODE_ENV", "development");
    const { default: Layout } = await import("@/app/internal/brand-lab/layout");
    expect(Layout({ children: "ok" })).toBe("ok");
    expect(notFound).not.toHaveBeenCalled();
  });

  it("404s in production without explicit authorization", async () => {
    vi.stubEnv("NODE_ENV", "production");
    vi.stubEnv("BRAND_LAB_ENABLED", "");
    const { default: Layout } = await import("@/app/internal/brand-lab/layout");
    expect(() => Layout({ children: "x" })).toThrow("NEXT_NOT_FOUND");
    expect(notFound).toHaveBeenCalled();
  });

  it("allows production access only with the explicit flag", async () => {
    vi.stubEnv("NODE_ENV", "production");
    vi.stubEnv("BRAND_LAB_ENABLED", "true");
    const { default: Layout } = await import("@/app/internal/brand-lab/layout");
    expect(Layout({ children: "ok" })).toBe("ok");
  });
});

describe("robots exclusions", () => {
  it("disallows /internal/ and /api/ for all agents", async () => {
    const { default: robots } = await import("@/app/robots");
    const rules = robots().rules;
    const rule = Array.isArray(rules) ? rules[0] : rules;
    expect(rule?.disallow).toContain("/internal/");
    expect(rule?.disallow).toContain("/api/");
  });
});
