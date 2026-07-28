import { describe, expect, it } from "vitest";

import {
  computeComponentState,
  computeOverallState,
  monitorToPublicState,
  overallToBadgeStatus,
} from "@/lib/status-pages/public-state";
import {
  renderSafeRichText,
  isSafeUrl,
  sanitizePlainText,
} from "@/lib/status-pages/sanitize";
import { validateSubdomain, suggestSubdomain } from "@/lib/status-pages/slug";
import { normalizeCustomDomain } from "@/lib/status-pages/domain-util";
import { validateAppearance, contrastRatio } from "@/lib/status-pages/appearance";
import { STATUS_PAGE_FIXTURES } from "@/lib/status-pages/fixtures";

describe("public component state", () => {
  it("keeps internal verification private by default", () => {
    expect(monitorToPublicState({ internalState: "verifying_failure", isCritical: true })).toBe(
      "operational",
    );
    expect(
      monitorToPublicState(
        { internalState: "verifying_failure", isCritical: true },
        { exposeVerifyingAsDegraded: true },
      ),
    ).toBe("degraded_performance");
  });

  it("treats a confirmed-down critical monitor as a major outage", () => {
    expect(monitorToPublicState({ internalState: "down", isCritical: true })).toBe("major_outage");
    expect(monitorToPublicState({ internalState: "down", isCritical: false })).toBe("partial_outage");
  });

  it("surfaces missing monitor data as degraded, not a confirmed outage", () => {
    expect(
      monitorToPublicState({ internalState: "unknown", isCritical: true, hasData: false }),
    ).toBe("degraded_performance");
    expect(monitorToPublicState({ internalState: "unknown", isCritical: true })).toBe(
      "operational",
    );
  });

  it("any_critical mode reflects the worst critical monitor", () => {
    const state = computeComponentState({
      mode: "any_critical",
      monitors: [
        { internalState: "operational", isCritical: true },
        { internalState: "down", isCritical: true },
      ],
    });
    expect(state).toBe("major_outage");
  });

  it("manual override always wins", () => {
    const state = computeComponentState({
      mode: "any_critical",
      monitors: [{ internalState: "down", isCritical: true }],
      manualStatus: "under_maintenance",
    });
    expect(state).toBe("under_maintenance");
  });

  it("empty component reports operational", () => {
    expect(computeComponentState({ mode: "any_critical", monitors: [] })).toBe("operational");
  });
});

describe("overall state", () => {
  it("is calculated, never hardcoded", () => {
    expect(computeOverallState({ componentStates: ["operational", "operational"] })).toBe(
      "operational",
    );
  });

  it("maintenance never hides an unrelated outage", () => {
    const overall = computeOverallState({
      componentStates: ["under_maintenance", "major_outage"],
      hasActiveMaintenance: true,
    });
    expect(overall).toBe("major_outage");
  });

  it("surfaces maintenance only when nothing worse is happening", () => {
    expect(
      computeOverallState({ componentStates: ["operational"], hasActiveMaintenance: true }),
    ).toBe("maintenance");
  });

  it("maps overall to a badge vocabulary", () => {
    expect(overallToBadgeStatus("major_outage")).toBe("down");
    expect(overallToBadgeStatus("degraded")).toBe("degraded");
  });
});

describe("content sanitization", () => {
  it("strips control characters and clamps length", () => {
    expect(sanitizePlainText("a\u0000b")).toBe("ab");
    expect(sanitizePlainText("abcdef", 3)).toBe("abc");
  });

  it("never emits script or event handlers", () => {
    const html = renderSafeRichText('<script>alert(1)</script> <img onerror="x">');
    expect(html).not.toContain("<script");
    expect(html).not.toContain("<img");
    // The dangerous markup is escaped to text, never emitted as real tags.
    expect(html).toContain("&lt;script&gt;");
  });

  it("only allows safe link protocols", () => {
    expect(isSafeUrl("https://example.com")).toBe(true);
    expect(isSafeUrl("javascript:alert(1)")).toBe(false);
    expect(isSafeUrl("data:text/html,x")).toBe(false);
    const html = renderSafeRichText("[x](javascript:alert(1))");
    expect(html).not.toContain('href="javascript:');
    expect(html).not.toContain("<a ");
  });

  it("renders bold and safe links", () => {
    const html = renderSafeRichText("**bold** and [site](https://example.com)");
    expect(html).toContain("<strong>bold</strong>");
    expect(html).toContain('href="https://example.com"');
    expect(html).toContain('rel="nofollow noopener noreferrer"');
  });
});

describe("subdomain validation", () => {
  it("rejects reserved words", () => {
    expect(validateSubdomain("api").ok).toBe(false);
    expect(validateSubdomain("admin").ok).toBe(false);
  });

  it("blocks platform impersonation", () => {
    expect(validateSubdomain("fajita-status").ok).toBe(false);
    expect(validateSubdomain("fajitaio").ok).toBe(false);
  });

  it("accepts a normal slug", () => {
    const result = validateSubdomain("northwind");
    expect(result.ok).toBe(true);
  });

  it("suggests a fallback for reserved names", () => {
    expect(suggestSubdomain("api")).toContain("status");
  });
});

describe("custom domain normalization", () => {
  it("requires a subdomain, not an apex", () => {
    expect(normalizeCustomDomain("example.com").ok).toBe(false);
    expect(normalizeCustomDomain("status.example.com").ok).toBe(true);
  });

  it("strips scheme and path", () => {
    const result = normalizeCustomDomain("https://status.example.com/path");
    expect(result.ok && result.domain).toBe("status.example.com");
  });

  it("blocks fajita.io hostnames", () => {
    expect(normalizeCustomDomain("status.fajita.io").ok).toBe(false);
  });

  it("rejects non-ascii for homograph safety", () => {
    expect(normalizeCustomDomain("stàtus.example.com").ok).toBe(false);
  });
});

describe("appearance contrast", () => {
  it("blocks a low-contrast accent", () => {
    const result = validateAppearance({ accentColor: "#fefefe" }, "signal");
    expect(result.ok).toBe(false);
  });

  it("accepts an accessible accent", () => {
    const result = validateAppearance({ accentColor: "#c2410c" }, "signal");
    expect(result.ok).toBe(true);
  });

  it("computes a plausible contrast ratio", () => {
    const ratio = contrastRatio("#000000", "#ffffff");
    expect(ratio).toBeGreaterThan(20);
  });
});

describe("fixtures", () => {
  it("are deterministic and cover every documented scenario", () => {
    expect(STATUS_PAGE_FIXTURES.length).toBeGreaterThanOrEqual(20);
    for (const f of STATUS_PAGE_FIXTURES) {
      expect(f.data.schemaVersion).toBeGreaterThan(0);
      expect(f.data.page.name).toBe("Northwind");
      // No fixture leaks anything that looks like an internal field.
      const json = JSON.stringify(f.data);
      expect(json).not.toContain("internal");
      expect(json).not.toContain("secret");
    }
  });
});
