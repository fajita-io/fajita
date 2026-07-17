import { createHmac, timingSafeEqual } from "node:crypto";

import { describe, expect, it } from "vitest";

import { computeSignature, signatureHeader } from "@/lib/alerts/signing";
import { allDocs, llmDocs, publicDocs, buildNavigation, orderedPublicSlugs, getDoc } from "@/lib/docs/registry";
import { redactQuery, searchDocs } from "@/lib/docs/search";
import { pageToPlainText, pagesToFullText } from "@/lib/docs/serialize";
import { parseInline } from "@/lib/docs/inline";
import { frontmatterSchema } from "@/lib/docs/frontmatter";

describe("docs registry", () => {
  it("loads without integrity errors and has content", () => {
    expect(allDocs().length).toBeGreaterThan(20);
  });

  it("has unique slugs", () => {
    const slugs = allDocs().map((d) => d.meta.slug);
    expect(new Set(slugs).size).toBe(slugs.length);
  });

  it("every related page resolves", () => {
    for (const page of allDocs()) {
      for (const related of page.meta.relatedPages) {
        expect(getDoc(related), `${page.meta.slug} -> ${related}`).toBeTruthy();
      }
    }
  });

  it("frontmatter validates for every page", () => {
    for (const page of allDocs()) {
      expect(frontmatterSchema.safeParse(page.meta).success).toBe(true);
    }
  });

  it("builds navigation grouped by model", () => {
    const nav = buildNavigation();
    expect(nav.length).toBeGreaterThan(0);
    expect(nav.map((n) => n.model)).toContain("build");
  });

  it("prev/next chain covers ordered public slugs", () => {
    expect(orderedPublicSlugs().length).toBe(publicDocs().length);
  });
});

describe("internal-content exclusion", () => {
  it("llm docs are all published, indexable, and llm-eligible", () => {
    for (const page of llmDocs()) {
      expect(page.meta.status).toBe("published");
      expect(page.meta.noindex).toBe(false);
      expect(page.meta.llmInclude).toBe(true);
    }
  });

  it("serialized content contains no obvious internal terms, phase numbers, or em dashes", () => {
    const text = pagesToFullText(llmDocs());
    expect(text).not.toContain("\u2014"); // em dash
    expect(text).not.toMatch(/phase\s*\d+/i);
    expect(text.toLowerCase()).not.toContain("cursor");
    expect(text.toLowerCase()).not.toContain("supabase");
    expect(text).not.toContain("SUPABASE_SERVICE_ROLE");
    expect(text).not.toMatch(/whsec_[A-Za-z0-9]/);
  });

  it("per-page plain text includes a canonical URL and no script tags", () => {
    const page = getDoc("webhooks/signatures")!;
    const text = pageToPlainText(page);
    expect(text).toContain("Canonical:");
    expect(text).not.toContain("<script");
  });
});

describe("webhook signature examples match implementation", () => {
  // Reimplements exactly what the documented Node example does, then verifies
  // it accepts a real Fajita signature and rejects tampering and stale timestamps.
  const secret = "whsec_testonly_not_a_real_secret";
  const keyId = "whsk_testkey";
  const eventId = "evt_test_01";
  const body = JSON.stringify({ id: eventId, type: "incident.opened" });

  function docExampleVerify(
    rawBody: string,
    headers: Record<string, string>,
    signingSecret: string,
    toleranceSeconds = 300,
    now = Math.floor(Date.now() / 1000),
  ): boolean {
    const parts = Object.fromEntries(
      headers["fajita-signature"].split(",").map((p) => p.split("=")),
    ) as Record<string, string>;
    const timestamp = Number(parts.t);
    if (!Number.isFinite(timestamp) || Math.abs(now - timestamp) > toleranceSeconds) return false;
    const signedInput = `${parts.kid}.${timestamp}.${headers["fajita-event-id"]}.${rawBody}`;
    const expected = createHmac("sha256", signingSecret).update(signedInput).digest("hex");
    const a = Buffer.from(expected);
    const b = Buffer.from(parts.v1 ?? "");
    if (a.length !== b.length) return false;
    return timingSafeEqual(a, b);
  }

  it("computeSignature and the documented input agree", () => {
    const timestamp = 1_760_000_000;
    const sig = computeSignature({ secret, keyId, timestamp, eventId, body });
    const manual = createHmac("sha256", secret)
      .update(`${keyId}.${timestamp}.${eventId}.${body}`)
      .digest("hex");
    expect(sig).toBe(manual);
  });

  it("documented verification accepts a genuine signature", () => {
    const timestamp = Math.floor(Date.now() / 1000);
    const header = signatureHeader({ secret, keyId, timestamp, eventId, body });
    const headers = { "fajita-signature": header, "fajita-event-id": eventId };
    expect(docExampleVerify(body, headers, secret)).toBe(true);
  });

  it("rejects a tampered body", () => {
    const timestamp = Math.floor(Date.now() / 1000);
    const header = signatureHeader({ secret, keyId, timestamp, eventId, body });
    const headers = { "fajita-signature": header, "fajita-event-id": eventId };
    expect(docExampleVerify(body + "x", headers, secret)).toBe(false);
  });

  it("rejects a stale timestamp outside the window", () => {
    const timestamp = 1_000_000_000; // far in the past
    const header = signatureHeader({ secret, keyId, timestamp, eventId, body });
    const headers = { "fajita-signature": header, "fajita-event-id": eventId };
    expect(docExampleVerify(body, headers, secret)).toBe(false);
  });
});

describe("search", () => {
  it("ranks an exact title match first", () => {
    const hits = searchDocs("Verify webhook signatures");
    expect(hits[0]?.slug).toBe("webhooks/signatures");
  });

  it("resolves synonyms (cron -> heartbeat)", () => {
    const hits = searchDocs("cron job");
    expect(hits.some((h) => h.slug === "monitors/heartbeat-monitoring")).toBe(true);
  });

  it("tolerates a small typo", () => {
    const hits = searchDocs("hearbeat"); // missing 't'
    expect(hits.some((h) => h.slug.includes("heartbeat"))).toBe(true);
  });

  it("returns nothing for an empty query", () => {
    expect(searchDocs("")).toEqual([]);
  });

  it("favors troubleshooting for error-style queries", () => {
    const hits = searchDocs("why did my alert fail");
    expect(hits[0]?.slug).toBe("troubleshooting/alert-not-delivered");
  });
});

describe("query redaction", () => {
  it("redacts emails, urls, and secret-like tokens", () => {
    expect(redactQuery("contact me at a@b.com")).toContain("[email]");
    expect(redactQuery("https://example.com/x?token=1")).toContain("[url]");
    expect(redactQuery("whsec_abcdefgh12345678")).toContain("[secret]");
    expect(redactQuery("bearer abcdefgh12345678zzz")).toContain("[secret]");
  });

  it("caps length", () => {
    expect(redactQuery("a".repeat(500)).length).toBeLessThanOrEqual(120);
  });
});

describe("inline safety", () => {
  it("renders safe internal and https links but not unsafe schemes", () => {
    const segs = parseInline("see [docs](/docs) and [evil](javascript:alert(1)) and [ext](https://x.com)");
    const links = segs.filter((s) => s.type === "link");
    expect(links).toHaveLength(2);
    expect(segs.some((s) => s.type === "text" && s.value.includes("javascript:"))).toBe(true);
  });
});
