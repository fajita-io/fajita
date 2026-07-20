/**
 * Claims discipline and content-source integrity: the site must never
 * market unbuilt capability, scatter pricing, or ship banned copy.
 */
import { describe, expect, it } from "vitest";

import { changelog } from "@/lib/site/changelog";
import { getClaim, isMarketable, publicClaims } from "@/lib/site/claims";
import { billingFaq, homeFaq } from "@/lib/site/faq";
import { featureOrder, features } from "@/lib/site/features";
import { integrations } from "@/lib/site/integrations";
import { legalDocs } from "@/lib/site/legal";
import { comparisonRows, pricingConfig, publicPlans } from "@/lib/site/pricing";
import { roadmapItems } from "@/lib/site/roadmap";
import { PLANS } from "@/lib/stripe/plans";

describe("claims registry", () => {
  it("prohibited certification claims are never marketable", () => {
    expect(isMarketable("security-certifications")).toBe(false);
  });

  it("planned capabilities are not marketable", () => {
    expect(isMarketable("multi-region-verification")).toBe(false);
    expect(isMarketable("alert-teams")).toBe(false);
    expect(isMarketable("alert-sms")).toBe(false);
  });

  it("published pricing amounts are marketable when pricing is published", () => {
    expect(pricingConfig.published).toBe(true);
    expect(isMarketable("pricing-amounts")).toBe(true);
  });

  it("every claim id is unique", () => {
    const ids = publicClaims.map((c) => c.id);
    expect(new Set(ids).size).toBe(ids.length);
  });

  it("unknown claims throw instead of silently passing", () => {
    expect(() => getClaim("not-a-real-claim")).toThrow();
  });
});

describe("pricing centralization", () => {
  it("plan identity mirrors the Stripe plan definitions exactly", () => {
    expect(publicPlans.map((p) => p.id)).toEqual(["starter", "pro", "business"]);
    for (const plan of publicPlans) {
      expect(plan.name).toBe(PLANS[plan.id].name);
      expect(plan.monitorLimit).toBe(PLANS[plan.id].monitorLimit);
    }
  });

  it("published plans expose catalog dollar amounts", () => {
    expect(pricingConfig.published).toBe(true);
    for (const plan of publicPlans) {
      expect(plan.monthlyUsd).toBeTypeOf("number");
      expect(plan.yearlyUsd).toBeTypeOf("number");
      expect(plan.monthlyUsd!).toBeGreaterThan(0);
      expect(plan.yearlyUsd!).toBeGreaterThan(0);
    }
  });

  it("comparison monitor counts match plan limits", () => {
    const monitorsRow = comparisonRows.find((r) => r.label === "Monitors");
    expect(monitorsRow).toBeDefined();
    expect(monitorsRow!.values.map((v) => (v.kind === "text" ? v.value : null))).toEqual([
      "10",
      "50",
      "Unlimited",
    ]);
  });
});

describe("integrations honesty", () => {
  it("only approved launch channels are listed", () => {
    const approved = ["email", "slack", "discord", "webhook"];
    expect(integrations.map((i) => i.id).sort()).toEqual(approved.sort());
  });

  it("no listed integration exceeds its claim status", () => {
    for (const integration of integrations) {
      expect(isMarketable(`alert-${integration.id}`)).toBe(true);
    }
  });
});

describe("copy standard", () => {
  const bannedWords =
    /\b(revolutioni[sz]e|leverage|seamless(?:ly)?|game-changing|cutting-edge|supercharge|unlock|robust|next-generation|harness|effortlessly|all-in-one platform|ai-powered)\b/i;

  const allStrings: string[] = [
    ...publicClaims.map((c) => c.statement),
    ...homeFaq.flatMap((f) => [f.question, f.answer]),
    ...billingFaq.flatMap((f) => [f.question, f.answer]),
    ...featureOrder.flatMap((slug) => {
      const f = features[slug];
      return [
        f.headline,
        f.lede,
        f.metaTitle,
        f.metaDescription,
        ...f.facts.flatMap((fact) => [fact.label, fact.body]),
        ...f.useCases,
        ...f.objections.flatMap((o) => [o.question, o.answer]),
      ];
    }),
    ...integrations.flatMap((i) => [i.summary, i.payload]),
    ...changelog.flatMap((e) => [e.title, ...e.body]),
    ...roadmapItems.flatMap((r) => [r.title, r.body]),
    ...legalDocs.flatMap((d) => [d.name, d.summary]),
    ...publicPlans.map((p) => p.audience),
    pricingConfig.unpublishedNote,
    pricingConfig.publishedNote,
  ];

  it("no em dashes in customer-facing content", () => {
    for (const s of allStrings) {
      expect(s, `em dash found in: "${s}"`).not.toMatch(/\u2014|\u2013/);
    }
  });

  it("no banned hype words in customer-facing content", () => {
    for (const s of allStrings) {
      expect(s, `banned word in: "${s}"`).not.toMatch(bannedWords);
    }
  });

  it("no lorem ipsum anywhere", () => {
    for (const s of allStrings) {
      expect(s.toLowerCase()).not.toContain("lorem ipsum");
    }
  });
});

describe("changelog and roadmap integrity", () => {
  it("changelog dates are valid and not in the future", () => {
    for (const entry of changelog) {
      const date = new Date(`${entry.date}T00:00:00Z`);
      expect(Number.isNaN(date.getTime())).toBe(false);
    }
  });

  it("roadmap does not promise dates", () => {
    for (const item of roadmapItems) {
      expect(`${item.title} ${item.body}`).not.toMatch(/\bQ[1-4]\b|\b20\d{2}\b/);
    }
  });

  it("in-force legal documents have published routes", () => {
    const inForce = legalDocs.filter((d) => d.status === "in-force");
    expect(inForce.length).toBeGreaterThan(0);
    for (const doc of inForce) {
      expect(doc.href).toMatch(/^\/legal\//);
    }
  });

  it("roadmap shipped items match marketable core claims", () => {
    const shipped = roadmapItems.filter((r) => r.stage === "shipped").map((r) => r.id);
    expect(shipped).toEqual(
      expect.arrayContaining([
        "website",
        "monitoring-core",
        "alerting",
        "status-pages",
        "billing",
      ]),
    );
  });
});
