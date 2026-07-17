"use client";

import { trackGoal } from "@/lib/analytics/client";
import { DataFastGoals } from "@/lib/analytics/goals";
import type { FaqItem } from "@/lib/site/faq";

/**
 * Accessible FAQ: native details/summary (keyboard and screen-reader
 * behavior for free), one analytics goal per first expansion.
 */
export function FaqList({ items, id }: { items: FaqItem[]; id?: string }) {
  return (
    <div className="fj-faq" id={id}>
      {items.map((item) => (
        <details
          key={item.question}
          className="fj-faq__item"
          onToggle={(e) => {
            if ((e.target as HTMLDetailsElement).open) {
              trackGoal(DataFastGoals.faqExpanded);
            }
          }}
        >
          <summary>
            {item.question}
            <svg
              className="fj-faq__marker"
              width="14"
              height="14"
              viewBox="0 0 14 14"
              aria-hidden
            >
              <path
                d="M7 1v12M1 7h12"
                stroke="currentColor"
                strokeWidth="1.5"
                strokeLinecap="round"
              />
            </svg>
          </summary>
          <p className="fj-body fj-faq__answer">{item.answer}</p>
        </details>
      ))}
    </div>
  );
}
