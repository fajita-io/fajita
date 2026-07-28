import { describe, expect, it } from "vitest";

import {
  allTerms,
  featuredTerms,
  getTerm,
  llmTerms,
  publicTerms,
  termsInCategory,
} from "@/lib/glossary/registry";
import { searchGlossary, redactQuery } from "@/lib/glossary/search";
import { resolveGlossaryRedirect, GLOSSARY_REDIRECTS } from "@/lib/glossary/redirects";
import { termToPlainText } from "@/lib/glossary/serialize";
import { uptimeDowntimeRows } from "@/lib/glossary/uptime-tables";
import { GLOSSARY_SYNONYMS, resolveSynonymSlug } from "@/lib/glossary/synonyms";
import { validatePublicClaimsForGlossary } from "@/lib/glossary/claims";

describe("glossary registry", () => {
  it("has unique slugs and published terms meet editorial rules", () => {
    const slugs = allTerms().map((t) => t.meta.slug);
    expect(new Set(slugs).size).toBe(slugs.length);
    for (const term of publicTerms()) {
      expect(term.meta.shortAnswer.trim().split(/\s+/).length).toBeGreaterThanOrEqual(35);
      expect(term.meta.shortAnswer.trim().split(/\s+/).length).toBeLessThanOrEqual(70);
    }
  });

  it("exposes featured and category inventories", () => {
    expect(featuredTerms().length).toBeGreaterThan(0);
    expect(termsInCategory("monitoring").length).toBeGreaterThan(5);
    expect(getTerm("uptime-monitoring")?.meta.foundational).toBe(true);
  });

  it("keeps llm corpus on published indexable terms only", () => {
    for (const term of llmTerms()) {
      expect(term.meta.status).toBe("published");
      expect(term.meta.noindex).toBe(false);
      expect(term.meta.deprecated).toBe(false);
    }
  });
});

describe("glossary search", () => {
  it("ranks exact term, acronym, and synonym", () => {
    const exact = searchGlossary("uptime monitoring");
    expect(exact[0]?.slug).toBe("uptime-monitoring");

    const acronym = searchGlossary("MTTR");
    expect(acronym[0]?.slug).toBe("mean-time-to-recovery");

    const synonymSlug = resolveSynonymSlug("cron monitoring");
    expect(synonymSlug).toBe("heartbeat-monitoring");
    const synonym = searchGlossary("cron monitoring");
    expect(synonym[0]?.slug).toBe("heartbeat-monitoring");
  });

  it("redacts credential-like queries", () => {
    const redacted = redactQuery("Bearer sk_live_abcdefghijklmnop https://x.test?token=1");
    expect(redacted).not.toMatch(/sk_live/);
    expect(redacted).toContain("[url]");
  });
});

describe("glossary redirects and synonyms", () => {
  it("has no redirect chains", () => {
    for (const [from, to] of Object.entries(GLOSSARY_REDIRECTS)) {
      expect(GLOSSARY_REDIRECTS[to]).toBeUndefined();
      expect(resolveGlossaryRedirect(from)).toBe(to);
      expect(getTerm(to)).toBeTruthy();
    }
  });

  it("maps controlled synonyms to canonical slugs", () => {
    expect(GLOSSARY_SYNONYMS["ssl monitoring"]).toBe("ssl-certificate-monitoring");
    expect(GLOSSARY_SYNONYMS.mttr).toBe("mean-time-to-recovery");
  });
});

describe("glossary serialize and formulas", () => {
  it("includes publisher attribution in plain text", () => {
    const term = getTerm("uptime-monitoring")!;
    const plain = termToPlainText(term);
    expect(plain).toContain("Publisher: Fajita");
    expect(plain).not.toMatch(/\u2014/);
  });

  it("computes uptime downtime rows programmatically", () => {
    const rows = uptimeDowntimeRows();
    expect(rows[0]?.uptimeLabel).toBe("99%");
    expect(rows[0]?.monthDowntime).toContain("hour");
  });
});

describe("glossary claims", () => {
  it("validates referenced public claims", () => {
    expect(validatePublicClaimsForGlossary()).toEqual([]);
  });
});
