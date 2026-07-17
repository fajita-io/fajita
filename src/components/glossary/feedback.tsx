"use client";

import { useState } from "react";

import { trackGoal } from "@/lib/analytics/client";
import { DataFastGoals } from "@/lib/analytics/goals";

const REASONS = [
  { id: "too_technical", label: "Too technical" },
  { id: "too_basic", label: "Too basic" },
  { id: "missing_example", label: "Missing an example" },
  { id: "outdated", label: "Appears outdated" },
  { id: "did_not_answer", label: "Did not answer my question" },
  { id: "other", label: "Other" },
];

export function GlossaryFeedback({
  slug,
  contentVersion,
}: {
  slug: string;
  contentVersion: string;
}) {
  const [helpful, setHelpful] = useState<boolean | null>(null);
  const [reason, setReason] = useState("");
  const [comment, setComment] = useState("");
  const [done, setDone] = useState(false);

  async function send(payload: {
    helpful: boolean;
    reason?: string;
    comment?: string;
  }) {
    trackGoal(DataFastGoals.glossaryFeedback, {
      helpful: String(payload.helpful),
    });
    try {
      await fetch("/api/glossary/feedback", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ slug, contentVersion, ...payload }),
      });
    } catch {
      /* best-effort */
    }
  }

  if (done) {
    return (
      <div className="fj-docs-feedback" aria-live="polite">
        <p className="fj-docs-feedback__thanks">Thanks. This helps improve the glossary.</p>
      </div>
    );
  }

  return (
    <div className="fj-docs-feedback">
      <p className="fj-docs-feedback__q">Was this definition clear?</p>
      <div className="fj-docs-feedback__actions">
        <button
          type="button"
          className="fj-button fj-button--secondary fj-button--sm"
          aria-pressed={helpful === true}
          onClick={async () => {
            setHelpful(true);
            await send({ helpful: true });
            setDone(true);
          }}
        >
          Yes
        </button>
        <button
          type="button"
          className="fj-button fj-button--secondary fj-button--sm"
          aria-pressed={helpful === false}
          onClick={() => setHelpful(false)}
        >
          No
        </button>
      </div>
      {helpful === false ? (
        <form
          className="fj-docs-feedback__form"
          onSubmit={async (e) => {
            e.preventDefault();
            await send({ helpful: false, reason, comment });
            setDone(true);
          }}
        >
          <fieldset>
            <legend className="fj-docs-feedback__legend">What was off?</legend>
            {REASONS.map((r) => (
              <label key={r.id} className="fj-docs-feedback__reason">
                <input
                  type="radio"
                  name="reason"
                  value={r.id}
                  checked={reason === r.id}
                  onChange={() => setReason(r.id)}
                  required
                />
                {r.label}
              </label>
            ))}
          </fieldset>
          <label className="fj-docs-feedback__comment-label">
            Optional detail
            <textarea
              value={comment}
              onChange={(e) => setComment(e.target.value.slice(0, 500))}
              maxLength={500}
              rows={3}
            />
          </label>
          <p className="fj-docs-feedback__notice">
            Do not include secrets, API keys, or personal data. Feedback is anonymous.
          </p>
          <button type="submit" className="fj-button fj-button--primary fj-button--sm">
            Submit feedback
          </button>
        </form>
      ) : null}
    </div>
  );
}
