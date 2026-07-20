import type { GeniusCategory } from "@/lib/genius/types";

export interface FeedbackCategoryOption {
  value: GeniusCategory;
  label: string;
  prompt: string;
  cta: string;
}

export const FEEDBACK_CATEGORIES: FeedbackCategoryOption[] = [
  {
    value: "idea",
    label: "Idea",
    prompt: "What should this do?",
    cta: "Send idea",
  },
  {
    value: "confusion",
    label: "Something is confusing",
    prompt: "What felt unclear?",
    cta: "Send feedback",
  },
  {
    value: "bug",
    label: "Something broke",
    prompt: "What happened?",
    cta: "Send report",
  },
  {
    value: "praise",
    label: "I love this",
    prompt: "What is working really well?",
    cta: "Send praise",
  },
];

export function feedbackCategoryByValue(
  value: GeniusCategory | null | undefined,
): FeedbackCategoryOption | null {
  if (!value) return null;
  return FEEDBACK_CATEGORIES.find((category) => category.value === value) ?? null;
}
