"use client";

import { useState } from "react";

import { trackGoal } from "@/lib/analytics/client";
import { DataFastGoals } from "@/lib/analytics/goals";

const REASONS = [
  { id: "missing-detail", label: "Missing detail" },
  { id: "too-technical", label: "Too technical" },
  { id: "too-basic", label: "Too basic" },
  { id: "outdated", label: "Outdated" },
  { id: "example-failed", label: "Example failed" },
  { id: "result-wrong", label: "Result seems wrong" },
  { id: "comparison-inaccurate", label: "Comparison seems inaccurate" },
  { id: "citation-issue", label: "Citation issue" },
  { id: "other", label: "Other" },
] as const;

export function ContentFeedback({
  contentType,
  slug,
  prompt,
}: {
  contentType: "article" | "comparison" | "tool" | "research";
  slug: string;
  prompt: string;
}) {
  const [sent, setSent] = useState<"yes" | "no" | null>(null);
  const [reason, setReason] = useState("");
  const [note, setNote] = useState("");
  const [error, setError] = useState<string | null>(null);

  async function submit(useful: "yes" | "no") {
    setError(null);
    try {
      const res = await fetch("/api/content/feedback", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          contentType,
          slug,
          useful,
          reason: reason || undefined,
          note: note.slice(0, 500) || undefined,
        }),
      });
      if (!res.ok) {
        setError("That did not save. Try again in a moment.");
        return;
      }
      setSent(useful);
      trackGoal(DataFastGoals.contentFeedback, {
        type: contentType,
        useful,
      });
    } catch {
      setError("That did not save. Try again in a moment.");
    }
  }

  if (sent) {
    return (
      <p className="fj-content-feedback__thanks" role="status">
        Thanks. Your note stays private to the editorial team.
      </p>
    );
  }

  return (
    <div className="fj-content-feedback">
      <p className="fj-content-feedback__prompt">{prompt}</p>
      <div className="fj-content-feedback__actions">
        <button type="button" className="fj-button fj-button--secondary" onClick={() => submit("yes")}>
          Yes
        </button>
        <button type="button" className="fj-button fj-button--secondary" onClick={() => submit("no")}>
          No
        </button>
      </div>
      <label className="fj-content-feedback__label">
        Reason (optional)
        <select value={reason} onChange={(e) => setReason(e.target.value)}>
          <option value="">Select</option>
          {REASONS.map((r) => (
            <option key={r.id} value={r.id}>
              {r.label}
            </option>
          ))}
        </select>
      </label>
      <label className="fj-content-feedback__label">
        Note (optional, no secrets)
        <textarea
          value={note}
          onChange={(e) => setNote(e.target.value)}
          rows={3}
          maxLength={500}
        />
      </label>
      {error ? <p className="fj-form-error">{error}</p> : null}
    </div>
  );
}
