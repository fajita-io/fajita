import { existsSync } from "node:fs";
import path from "node:path";

import { describe, expect, it } from "vitest";
import { getSortedRoutes } from "next/dist/shared/lib/router/utils/sorted-routes";

/**
 * Regression for Sentry b69f60d2387d4c878c997588c56c7915:
 * Next.js SortedRoutes throws "Catch-all must be the last part of the URL"
 * when a metadata route is nested under a catch-all (e.g.
 * /docs/[...slug]/opengraph-image-*). Docs OG images must live under a
 * sibling segment such as /docs/og/[...slug].
 */
describe("docs opengraph catch-all routing", () => {
  const appRoot = path.join(process.cwd(), "src/app/(docs)/docs");

  it("does not nest opengraph-image under docs/[...slug]", () => {
    expect(
      existsSync(path.join(appRoot, "[...slug]/opengraph-image.tsx")),
    ).toBe(false);
    expect(
      existsSync(path.join(appRoot, "[...slug]/opengraph-image.ts")),
    ).toBe(false);
    expect(existsSync(path.join(appRoot, "og/[...slug]/route.ts"))).toBe(true);
  });

  it("allows SortedRoutes for docs catch-alls when OG is a sibling", () => {
    expect(() =>
      getSortedRoutes([
        "/docs/[...slug]",
        "/docs/raw/[...slug]",
        "/docs/og/[...slug]",
      ]),
    ).not.toThrow();
  });

  it("still throws for the historical nested OG pattern", () => {
    expect(() =>
      getSortedRoutes(["/docs/[...slug]/opengraph-image-1emtgt"]),
    ).toThrow(/Catch-all must be the last part of the URL/);
  });
});
