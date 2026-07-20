import {
  FAJITA_CHAT_KNOWLEDGE_BUNDLE,
  FAJITA_CHAT_KNOWLEDGE_META,
} from "./knowledge-bundle.generated";

export function getFajitaChatKnowledge(): string {
  return FAJITA_CHAT_KNOWLEDGE_BUNDLE;
}

export function getFajitaChatKnowledgeMeta() {
  return FAJITA_CHAT_KNOWLEDGE_META;
}

/** Trim knowledge for prompt budget while keeping high-authority content first. */
export function getFajitaChatKnowledgeForPrompt(maxChars = 120_000): string {
  const full = getFajitaChatKnowledge();
  if (full.length <= maxChars) return full;
  return (
    full.slice(0, maxChars) +
    "\n\n[Knowledge truncated for prompt budget. Answer only from content above.]"
  );
}
