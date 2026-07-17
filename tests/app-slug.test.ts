import { describe, expect, it } from "vitest";

import {
  RESERVED_SLUGS,
  normalizeSlug,
  suggestSlug,
  validateSlug,
} from "@/lib/app/slug";

describe("normalizeSlug", () => {
  it("lowercases, strips accents, and collapses separators", () => {
    expect(normalizeSlug("Café Del Mar")).toBe("cafe-del-mar");
    expect(normalizeSlug("  Hello   World  ")).toBe("hello-world");
    expect(normalizeSlug("under_scores!!and**symbols")).toBe("under-scores-and-symbols");
  });

  it("trims leading and trailing dashes", () => {
    expect(normalizeSlug("--edge--")).toBe("edge");
  });
});

describe("validateSlug", () => {
  it("rejects too-short slugs", () => {
    const r = validateSlug("ab");
    expect(r.ok).toBe(false);
  });

  it("rejects reserved words", () => {
    for (const word of ["app", "api", "settings", "admin"]) {
      expect(validateSlug(word).ok).toBe(false);
      expect(RESERVED_SLUGS.has(word)).toBe(true);
    }
  });

  it("accepts a normal handle", () => {
    const r = validateSlug("northwind-labs");
    expect(r.ok).toBe(true);
    if (r.ok) expect(r.slug).toBe("northwind-labs");
  });
});

describe("suggestSlug", () => {
  it("derives from a name and pads very short bases", () => {
    expect(suggestSlug("Northwind")).toBe("northwind");
    expect(suggestSlug("Ab")).toContain("team");
  });
});
