import { describe, expect, it } from "vitest";

import {
  buildFajitaChatSystemPrompt,
  isMetaQuery,
  redactLeaks,
} from "@/lib/ai/fajita-chat/prompt";
import { getFajitaChatKnowledgeMeta } from "@/lib/ai/fajita-chat/knowledge";
import { inferCtasFromResponse, getFallbackResponse } from "@/lib/ai/fajita-chat/ctas";

describe("Fajita AI chat knowledge", () => {
  it("indexes approved sources in the bundle", () => {
    const meta = getFajitaChatKnowledgeMeta();
    expect(meta.sourceCount).toBeGreaterThan(50);
  });

  it("builds a system prompt with knowledge and voice rules", () => {
    const prompt = buildFajitaChatSystemPrompt({ page: "/pricing", mode: "public" });
    expect(prompt).toMatch(/Ask Fajita/);
    expect(prompt).toMatch(/Don Draper/);
    expect(prompt).not.toMatch(/—/);
  });
});

describe("Fajita AI chat guardrails", () => {
  it("detects meta queries", () => {
    expect(isMetaQuery("What AI model are you?")).toBe(true);
    expect(isMetaQuery("How do I add a monitor?")).toBe(false);
  });

  it("redacts vendor leaks", () => {
    const result = redactLeaks("We use Anthropic Claude internally.");
    expect(result.leaked).toBe(true);
    expect(result.text).not.toMatch(/Anthropic/i);
  });
});

describe("Fajita AI chat CTAs", () => {
  it("infers signup CTAs from assistant copy", () => {
    const ctas = inferCtasFromResponse("Ready to **Start monitoring** on Starter?");
    expect(ctas?.some((c) => c.href === "/signup")).toBe(true);
  });

  it("fallback handles pricing objections without em dashes", () => {
    const fb = getFallbackResponse("How much does it cost?");
    expect(fb.content).toMatch(/\$12/);
    expect(fb.content).not.toMatch(/—/);
  });
});
