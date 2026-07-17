import { AskFajitaRoot } from "@/components/support/ask-fajita-root";
import { suggestedPromptsFor } from "@/lib/support/suggested-prompts";
import type { ConversationMode, PageContext } from "@/lib/support/types";

export function AskFajitaMount({
  mode,
  pageContext,
}: {
  mode: ConversationMode;
  pageContext?: PageContext;
}) {
  return (
    <AskFajitaRoot
      mode={mode}
      pageContext={pageContext}
      suggestedPrompts={suggestedPromptsFor(mode, pageContext)}
    />
  );
}
