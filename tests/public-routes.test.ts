/**
 * Ensures every linked public route resolves to an app router page file.
 * Catches missing pages before they ship as 404s.
 */
import { describe, expect, it } from "vitest";

import {
  legalPublicPaths,
  publicDynamicSamplePaths,
  publicStaticPaths,
  resolveAppPageFile,
} from "@/lib/site/public-routes";

describe("public route integrity", () => {
  it("resolves every static marketing path to page.tsx", () => {
    const missing: string[] = [];
    for (const path of publicStaticPaths) {
      if (!resolveAppPageFile(path)) missing.push(path);
    }
    expect(missing, `missing pages: ${missing.join(", ")}`).toEqual([]);
  });

  it("resolves sample dynamic paths to page.tsx", () => {
    const missing: string[] = [];
    for (const path of publicDynamicSamplePaths()) {
      if (!resolveAppPageFile(path)) missing.push(path);
    }
    expect(missing, `missing pages: ${missing.join(", ")}`).toEqual([]);
  });

  it("includes /security", () => {
    expect(publicStaticPaths).toContain("/security");
    expect(resolveAppPageFile("/security")).toMatch(/security\/page\.tsx$/);
  });

  it("legal hub paths match in-force documents", () => {
    for (const path of legalPublicPaths()) {
      expect(resolveAppPageFile(path), path).toBeTruthy();
    }
  });
});
