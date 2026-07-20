import type { GeniusOpenSource } from "@/lib/genius/client";
import type { GeniusCategory, GeniusProductContext } from "@/lib/genius/types";

export const FEEDBACK_OPEN_EVENT = "fajita:feedback-open";
export const FEEDBACK_CLOSE_EVENT = "fajita:feedback-close";

export interface FeedbackOpenDetail {
  source: GeniusOpenSource;
  category?: GeniusCategory;
  context?: Partial<GeniusProductContext>;
}

export function dispatchFeedbackOpen(detail: FeedbackOpenDetail): void {
  if (typeof window === "undefined") return;
  window.dispatchEvent(new CustomEvent<FeedbackOpenDetail>(FEEDBACK_OPEN_EVENT, { detail }));
}

export function dispatchFeedbackClose(): void {
  if (typeof window === "undefined") return;
  window.dispatchEvent(new CustomEvent(FEEDBACK_CLOSE_EVENT));
}

export function subscribeFeedbackOpen(listener: (detail: FeedbackOpenDetail) => void): () => void {
  const handler = (event: Event) => {
    const custom = event as CustomEvent<FeedbackOpenDetail>;
    if (custom.detail) listener(custom.detail);
  };
  window.addEventListener(FEEDBACK_OPEN_EVENT, handler);
  return () => window.removeEventListener(FEEDBACK_OPEN_EVENT, handler);
}

export function subscribeFeedbackClose(listener: () => void): () => void {
  window.addEventListener(FEEDBACK_CLOSE_EVENT, listener);
  return () => window.removeEventListener(FEEDBACK_CLOSE_EVENT, listener);
}
