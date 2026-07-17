import { listKnowledgeSources } from "./registry";
import type { KnowledgeChunk } from "./types";
import type { ConversationMode } from "../types";

function tokenize(q: string): string[] {
  return q
    .toLowerCase()
    .replace(/[^\w\s/-]/g, " ")
    .split(/\s+/)
    .filter((t) => t.length > 1)
    .slice(0, 24);
}

function scoreSource(
  body: string,
  title: string,
  keywords: string[],
  tokens: string[],
  authorityLevel: number,
): number {
  const hay = `${title}\n${keywords.join(" ")}\n${body}`.toLowerCase();
  let score = 0;
  for (const token of tokens) {
    if (title.toLowerCase().includes(token)) score += 8;
    if (keywords.some((k) => k.toLowerCase().includes(token))) score += 5;
    if (hay.includes(token)) score += 2;
  }
  score += authorityLevel * 0.35;
  return score;
}

export function retrieveSupportKnowledge(
  query: string,
  options: {
    mode: ConversationMode;
    productArea?: string;
    limit?: number;
  },
): KnowledgeChunk[] {
  const tokens = tokenize(query);
  if (tokens.length === 0) return [];

  const limit = options.limit ?? 6;
  const sources = listKnowledgeSources().filter((s) => {
    if (options.mode === "public" && !s.supportsPublicMode) return false;
    if (options.mode === "authenticated" && !s.supportsAuthenticatedMode) {
      return false;
    }
    if (s.visibility === "internal") return false;
    return true;
  });

  const ranked = sources
    .map((source) => {
      let score = scoreSource(
        source.body,
        source.title,
        source.keywords,
        tokens,
        source.authorityLevel,
      );
      if (
        options.productArea &&
        source.productArea.toLowerCase().includes(options.productArea.toLowerCase())
      ) {
        score += 3;
      }
      const excerpt = source.body.slice(0, 420);
      return { source, excerpt, score, section: undefined as string | undefined };
    })
    .filter((c) => c.score > 4)
    .sort((a, b) => b.score - a.score)
    .slice(0, limit);

  return ranked;
}
