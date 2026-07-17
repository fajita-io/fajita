import { pamphletClient } from "@/lib/pamphlet/client";

import type { KnowledgeSource } from "./types";

export async function syncKnowledgeToPamphlet(source: KnowledgeSource): Promise<{
  sourceId: string;
  state: "failed" | "synchronized" | "partial";
  errorCategory?: string;
}> {
  const result = await pamphletClient().syncKnowledge({
    sourceId: source.sourceId,
    contentVersion: source.contentVersion,
    canonicalUrl: source.canonicalUrl,
    title: source.title,
    body: source.body.slice(0, 20_000),
  });

  if (!result.ok) {
    return {
      sourceId: source.sourceId,
      state: "failed",
      errorCategory: result.code,
    };
  }

  return {
    sourceId: source.sourceId,
    state: result.data.state === "synchronized" ? "synchronized" : "partial",
    errorCategory: result.data.errorCategory,
  };
}
