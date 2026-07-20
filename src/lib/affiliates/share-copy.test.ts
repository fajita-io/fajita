import { describe, expect, it } from "vitest";

import { buildAffiliateShareSnippets } from "./share-copy";

describe("buildAffiliateShareSnippets", () => {
  it("embeds the referral link in every snippet", () => {
    const link = "https://fajita.io/?ref=alex";
    const snippets = buildAffiliateShareSnippets(link);
    expect(snippets.length).toBeGreaterThan(0);
    for (const snippet of snippets) {
      expect(snippet.value).toContain(link);
      expect(snippet.label.length).toBeGreaterThan(0);
    }
  });
});
