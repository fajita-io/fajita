"use client";

import { useId, useState } from "react";

import { BrandButton } from "@/components/design-system/primitives";
import { createFirstOrganizationAndContinue } from "@/lib/app/actions/org";
import { normalizeSlug, suggestSlug, validateSlug } from "@/lib/app/slug";
import { trackGoal } from "@/lib/analytics/client";
import { DataFastGoals } from "@/lib/analytics/goals";
import { TimezoneSelect, detectTimezone } from "./timezone-select";

import type { BillingInterval, PlanId } from "@/lib/stripe/plans";

export function NewOrganizationForm({
  suggestedName,
  planKey,
  interval,
  licenseKey,
}: {
  suggestedName: string;
  planKey?: PlanId;
  interval?: BillingInterval;
  licenseKey?: string;
}) {
  const nameId = useId();
  const slugId = useId();
  const tzId = useId();

  const [name, setName] = useState(suggestedName);
  const [slug, setSlug] = useState(suggestSlug(suggestedName));
  const [slugTouched, setSlugTouched] = useState(false);
  const [timezone, setTimezone] = useState(detectTimezone());
  const [error, setError] = useState<string | null>(null);
  const [slugError, setSlugError] = useState<string | null>(null);
  const [pending, setPending] = useState(false);

  function onNameChange(next: string) {
    setName(next);
    if (!slugTouched) setSlug(suggestSlug(next));
  }

  function onSlugChange(next: string) {
    setSlugTouched(true);
    setSlug(normalizeSlug(next));
    setSlugError(null);
  }

  async function onSubmit(event: React.FormEvent) {
    event.preventDefault();
    if (pending) return;
    setError(null);
    setSlugError(null);

    const check = validateSlug(slug);
    if (!check.ok) {
      setSlugError(check.reason);
      return;
    }

    setPending(true);
    trackGoal(DataFastGoals.organizationCreated, { role: "owner" });
    const result = await createFirstOrganizationAndContinue({
      name: name.trim(),
      slug: check.slug,
      timezone,
      planKey,
      interval,
      licenseKey,
    });
    if (!result.ok) {
      setPending(false);
      if (result.kind === "conflict") setSlugError(result.error);
      else setError(result.error);
      return;
    }
    // Success redirects server-side to payment setup.
  }

  return (
    <form className="fj-field" onSubmit={onSubmit} noValidate style={{ gap: "var(--space-5)" }}>
      {error ? (
        <p className="fj-form-status fj-form-status--error" role="alert">
          {error}
        </p>
      ) : null}

      <div className="fj-field">
        <label htmlFor={nameId}>Organization name</label>
        <input
          id={nameId}
          className="fj-input"
          value={name}
          maxLength={120}
          autoFocus
          required
          onChange={(e) => onNameChange(e.target.value)}
        />
        <span className="fj-field__hint">
          This is how your team and status pages will refer to you.
        </span>
      </div>

      <div className="fj-field">
        <label htmlFor={slugId}>Handle</label>
        <div style={{ display: "flex", alignItems: "center", gap: "var(--space-2)" }}>
          <span style={{ color: "var(--color-text-muted)", fontSize: "0.9rem" }}>
            fajita.io/
          </span>
          <input
            id={slugId}
            className="fj-input"
            value={slug}
            maxLength={32}
            aria-invalid={slugError ? true : undefined}
            aria-describedby={slugError ? `${slugId}-err` : undefined}
            onChange={(e) => onSlugChange(e.target.value)}
          />
        </div>
        {slugError ? (
          <span className="fj-field__error" id={`${slugId}-err`} role="alert">
            {slugError}
          </span>
        ) : (
          <span className="fj-field__hint">
            Letters, numbers, and hyphens. You can change this later in settings.
          </span>
        )}
      </div>

      <div className="fj-field">
        <label htmlFor={tzId}>Time zone</label>
        <TimezoneSelect id={tzId} value={timezone} onChange={setTimezone} />
        <span className="fj-field__hint">
          Sets the default for reports and future monitoring schedules.
        </span>
      </div>

      <BrandButton type="submit" disabled={pending}>
        {pending ? "Creating..." : "Create organization"}
      </BrandButton>
    </form>
  );
}
