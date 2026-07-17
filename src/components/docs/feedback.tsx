"use client";

import { useState } from "react";

import { trackGoal } from "@/lib/analytics/client";
import { DataFastGoals } from "@/lib/analytics/goals";

const REASONS = [
  { id: "not_found", label: "Could not find the answer" },
  { id: "unclear", label: "Steps were unclear" },
  { id: "mismatch", label: "Product did not match the page" },
  { id: "example_failed", label: "Example failed" },
  { id: "outdated", label: "Page appears outdated" },
  { id: "other", label: "Other" },
];

/**
 * Page-level feedback. No login required. Written feedback is length-limited,
 * carries a no-secrets notice, and is submitted to a first-party endpoint that
 * sanitizes and rate limits. Nothing here is sent verbatim to third parties.
 */
export function DocsFeedback({ slug, docsVersion }: { slug: string; docsVersion: string }) {
  const [helpful, setHelpful] = useState<boolean | null>(null);
  const [reason, setReason] = useState<string>("");
  const [comment, setComment] = useState("");
  const [done, setDone] = useState(false);

  async function submit(isHelpful: boolean, withDetail = false) {
    setHelpful(isHelpful);
    if (isHelpful && !withDetail) {
      await send({ helpful: true });
      setDone(true);
    }
  }

  async function send(payload: { helpful: boolean; reason?: string; comment?: string }) {
    trackGoal(DataFastGoals.docsFeedback, { helpful: String(payload.helpful) });
    try {
      await fetch("/api/docs/feedback", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ slug, docsVersion, ...payload }),
      });
    } catch {
      /* Feedback is best-effort; never block the reader. */
    }
  }

  if (done) {
    return (
      <div className="fj-docs-feedback" aria-live="polite">
        <p className="fj-docs-feedback__thanks">Thanks. This helps us improve the docs.</p>
      </div>
    );
  }

  return (
    <div className="fj-docs-feedback">
      <p className="fj-docs-feedback__q">Was this page helpful?</p>
      <div className="fj-docs-feedback__actions">
        <button
          type="button"
          className="fj-button fj-button--secondary fj-button--sm"
          aria-pressed={helpful === true}
          onClick={() => submit(true)}
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
            <legend>What went wrong?</legend>
            {REASONS.map((r) => (
              <label key={r.id} className="fj-docs-feedback__reason">
                <input
                  type="radio"
                  name="reason"
                  value={r.id}
                  checked={reason === r.id}
                  onChange={() => setReason(r.id)}
                />
                {r.label}
              </label>
            ))}
          </fieldset>
          <label className="fj-docs-feedback__comment">
            <span>Optional detail</span>
            <textarea
              maxLength={500}
              value={comment}
              onChange={(e) => setComment(e.target.value)}
              placeholder="Do not include secrets, tokens, or personal data."
            />
          </label>
          <p className="fj-caption">
            Do not include API keys, tokens, or personal data. Feedback is sanitized before storage.
          </p>
          <button type="submit" className="fj-button fj-button--primary fj-button--sm">
            Send feedback
          </button>
        </form>
      ) : null}
    </div>
  );
}
