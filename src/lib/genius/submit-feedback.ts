import { trackGoal } from "@/lib/analytics/client";
import { DataFastGoals } from "@/lib/analytics/goals";
import type { GeniusCategory, GeniusProductContext } from "@/lib/genius/types";

export interface SubmitFeedbackInput {
  category: GeniusCategory;
  body: string;
  source: string;
  context?: Partial<GeniusProductContext>;
  elapsedMs?: number;
}

export type SubmitFeedbackResult =
  | { ok: true }
  | { ok: false; error: string };

export async function submitGeniusFeedback(
  input: SubmitFeedbackInput,
): Promise<SubmitFeedbackResult> {
  const submit = window.Genius?.submit;
  if (!submit) {
    return {
      ok: false,
      error: "Feedback is still loading. Try again in a moment.",
    };
  }

  return new Promise((resolve) => {
    void submit(
      {
        category: input.category,
        body: input.body,
        source: input.source,
        context: input.context,
        elapsedMs: input.elapsedMs,
      },
      {
        onSuccess: () => {
          trackGoal(DataFastGoals.geniusSubmitted, { category: input.category });
          resolve({ ok: true });
        },
        onError: (error) => {
          resolve({
            ok: false,
            error: error.error ?? "That feedback could not be sent.",
          });
        },
      },
    );
  });
}
