"use client";

import { useMemo, useState, useTransition } from "react";
import { useRouter } from "next/navigation";

import { BrandButton } from "@/components/design-system/primitives";
import { trackGoal } from "@/lib/analytics/client";
import { DataFastGoals } from "@/lib/analytics/goals";
import {
  checkSubdomainAction,
  createStatusPageAction,
} from "@/lib/app/actions/status-pages";
import { STATUS_PAGE_ZONE } from "@/lib/status-pages/config";

function timezones(): string[] {
  try {
    const values = (Intl as unknown as { supportedValuesOf?: (k: string) => string[] })
      .supportedValuesOf?.("timeZone");
    if (values && values.length > 0) return values;
  } catch {
    /* fall through */
  }
  return ["UTC", "America/New_York", "America/Chicago", "America/Denver", "America/Los_Angeles", "Europe/London", "Europe/Berlin", "Asia/Tokyo"];
}

function slugify(value: string): string {
  return value
    .toLowerCase()
    .trim()
    .replace(/[^a-z0-9]+/g, "-")
    .replace(/^-+|-+$/g, "")
    .slice(0, 40);
}

export function CreateStatusPageForm({
  organizationId,
  defaultTimezone,
}: {
  organizationId: string;
  defaultTimezone: string;
}) {
  const router = useRouter();
  const zones = useMemo(timezones, []);
  const [name, setName] = useState("");
  const [subdomain, setSubdomain] = useState("");
  const [subdomainTouched, setSubdomainTouched] = useState(false);
  const [timezone, setTimezone] = useState(defaultTimezone);
  const [availability, setAvailability] = useState<null | { available: boolean; slug: string }>(null);
  const [checking, setChecking] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [pending, startTransition] = useTransition();

  const effectiveSubdomain = subdomainTouched ? subdomain : slugify(name);

  function onNameChange(value: string) {
    setName(value);
    if (!subdomainTouched) setAvailability(null);
    trackGoal(DataFastGoals.statusPageCreationStarted);
  }

  async function checkAvailability() {
    const candidate = effectiveSubdomain;
    if (!candidate) return;
    setChecking(true);
    setError(null);
    const result = await checkSubdomainAction(organizationId, candidate);
    setChecking(false);
    if (!result.ok) {
      setAvailability(null);
      setError(result.error);
      return;
    }
    setAvailability({ available: result.data!.available, slug: result.data!.slug });
    trackGoal(DataFastGoals.statusPageSubdomainSelected);
  }

  function submit() {
    setError(null);
    startTransition(async () => {
      const result = await createStatusPageAction(organizationId, {
        name: name.trim(),
        subdomain: effectiveSubdomain,
        timezone,
      });
      if (!result.ok) {
        setError(result.error);
        return;
      }
      router.push(`/app/status-pages/${result.data!.statusPageId}/components`);
    });
  }

  const canSubmit = name.trim().length > 0 && effectiveSubdomain.length >= 3 && !pending;

  return (
    <form
      className="fj-sp-form"
      onSubmit={(e) => {
        e.preventDefault();
        submit();
      }}
    >
      {error ? (
        <div className="fj-sp-alert" data-tone="error" role="alert">
          {error}
        </div>
      ) : null}

      <div className="fj-sp-field">
        <label htmlFor="sp-name">Status page name</label>
        <input
          id="sp-name"
          className="fj-sp-input"
          value={name}
          onChange={(e) => onNameChange(e.target.value)}
          placeholder="Acme Status"
          maxLength={120}
          required
          autoFocus
        />
        <span className="fj-sp-field__hint">Shown in the page header and browser title.</span>
      </div>

      <div className="fj-sp-field">
        <label htmlFor="sp-subdomain">Hosted address</label>
        <div style={{ display: "flex", gap: "0.5rem", alignItems: "center", flexWrap: "wrap" }}>
          <input
            id="sp-subdomain"
            className="fj-sp-input"
            style={{ flex: "1 1 12rem" }}
            value={effectiveSubdomain}
            onChange={(e) => {
              setSubdomainTouched(true);
              setSubdomain(slugify(e.target.value));
              setAvailability(null);
            }}
            placeholder="acme"
            maxLength={40}
          />
          <span className="fj-sp-hostpreview">.{STATUS_PAGE_ZONE}</span>
          <BrandButton type="button" variant="secondary" size="sm" onClick={checkAvailability} disabled={checking}>
            {checking ? "Checking…" : "Check"}
          </BrandButton>
        </div>
        {availability ? (
          availability.available ? (
            <span className="fj-sp-field__hint" style={{ color: "var(--color-status-operational-bold)" }}>
              {availability.slug}.{STATUS_PAGE_ZONE} is available.
            </span>
          ) : (
            <span className="fj-sp-field__error">That address is taken. Try another.</span>
          )
        ) : (
          <span className="fj-sp-field__hint">
            You can connect a custom domain after publishing.
          </span>
        )}
      </div>

      <div className="fj-sp-field">
        <label htmlFor="sp-timezone">Timezone</label>
        <select
          id="sp-timezone"
          className="fj-sp-select"
          value={timezone}
          onChange={(e) => setTimezone(e.target.value)}
        >
          {zones.map((z) => (
            <option key={z} value={z}>
              {z}
            </option>
          ))}
        </select>
        <span className="fj-sp-field__hint">Incident and maintenance times display in this zone.</span>
      </div>

      <div className="fj-sp-actions">
        <BrandButton type="submit" disabled={!canSubmit}>
          {pending ? "Creating…" : "Create status page"}
        </BrandButton>
        <span className="fj-sp-field__hint">Nothing is public until you publish.</span>
      </div>
    </form>
  );
}
