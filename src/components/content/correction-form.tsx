"use client";

import { useState } from "react";

import { trackGoal } from "@/lib/analytics/client";
import { DataFastGoals } from "@/lib/analytics/goals";

export function ComparisonCorrectionForm({ slug }: { slug: string }) {
  const [claim, setClaim] = useState("");
  const [correction, setCorrection] = useState("");
  const [source, setSource] = useState("");
  const [email, setEmail] = useState("");
  const [done, setDone] = useState(false);
  const [error, setError] = useState<string | null>(null);

  async function onSubmit(e: React.FormEvent) {
    e.preventDefault();
    setError(null);
    try {
      const res = await fetch("/api/content/corrections", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          slug,
          claim: claim.slice(0, 400),
          correction: correction.slice(0, 800),
          source: source.slice(0, 400),
          email: email.slice(0, 120) || undefined,
        }),
      });
      if (!res.ok) {
        setError("We could not accept that correction. Try again shortly.");
        return;
      }
      setDone(true);
      trackGoal(DataFastGoals.comparisonCorrectionStarted, { slug });
    } catch {
      setError("We could not accept that correction. Try again shortly.");
    }
  }

  if (done) {
    return (
      <p role="status">
        Correction received. We review sources before changing the page. Reporter
        identity is not published.
      </p>
    );
  }

  return (
    <form className="fj-content-correction" onSubmit={onSubmit}>
      <h2 className="fj-heading-3">Spot an outdated detail? Send a correction.</h2>
      <label>
        Claim on this page
        <input value={claim} onChange={(e) => setClaim(e.target.value)} required maxLength={400} />
      </label>
      <label>
        Suggested correction
        <textarea
          value={correction}
          onChange={(e) => setCorrection(e.target.value)}
          required
          rows={4}
          maxLength={800}
        />
      </label>
      <label>
        Source URL
        <input
          value={source}
          onChange={(e) => setSource(e.target.value)}
          required
          maxLength={400}
          inputMode="url"
        />
      </label>
      <label>
        Contact email (optional)
        <input
          type="email"
          value={email}
          onChange={(e) => setEmail(e.target.value)}
          maxLength={120}
        />
      </label>
      <p className="fj-body-sm">
        Do not include secrets. Corrections are reviewed before any public change.
      </p>
      {error ? <p className="fj-form-error">{error}</p> : null}
      <button type="submit" className="fj-button fj-button--secondary">
        Submit correction
      </button>
    </form>
  );
}
