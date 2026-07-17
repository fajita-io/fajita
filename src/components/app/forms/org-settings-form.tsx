"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";

import { BrandButton } from "@/components/design-system/primitives";
import { TimezoneSelect } from "../timezone-select";
import { useToast } from "../toast";
import {
  updateOrganizationAction,
  updateOrganizationSlugAction,
} from "@/lib/app/actions/org";
import { normalizeSlug } from "@/lib/app/slug";

export function OrgSettingsForm({
  organizationId,
  initialName,
  initialTimezone,
  initialSlug,
}: {
  organizationId: string;
  initialName: string;
  initialTimezone: string;
  initialSlug: string;
}) {
  const router = useRouter();
  const toast = useToast();

  const [name, setName] = useState(initialName);
  const [timezone, setTimezone] = useState(initialTimezone);
  const [slug, setSlug] = useState(initialSlug);
  const [savingProfile, setSavingProfile] = useState(false);
  const [savingSlug, setSavingSlug] = useState(false);
  const [profileError, setProfileError] = useState<string | null>(null);
  const [slugError, setSlugError] = useState<string | null>(null);

  async function onSaveProfile(event: React.FormEvent) {
    event.preventDefault();
    if (savingProfile) return;
    setProfileError(null);
    setSavingProfile(true);
    const result = await updateOrganizationAction(organizationId, {
      name: name.trim(),
      defaultTimezone: timezone,
    });
    setSavingProfile(false);
    if (!result.ok) {
      setProfileError(result.error);
      return;
    }
    toast.success("Organization updated.");
    router.refresh();
  }

  async function onSaveSlug(event: React.FormEvent) {
    event.preventDefault();
    if (savingSlug) return;
    setSlugError(null);
    setSavingSlug(true);
    const result = await updateOrganizationSlugAction(organizationId, slug);
    setSavingSlug(false);
    if (!result.ok) {
      setSlugError(result.error);
      return;
    }
    toast.success("Handle updated.");
    router.refresh();
  }

  return (
    <>
      <form className="fj-form-stack" onSubmit={onSaveProfile} noValidate>
        {profileError ? (
          <p className="fj-form-status fj-form-status--error" role="alert">{profileError}</p>
        ) : null}
        <div className="fj-field">
          <label htmlFor="org-name">Organization name</label>
          <input
            id="org-name"
            className="fj-input"
            value={name}
            maxLength={120}
            required
            onChange={(e) => setName(e.target.value)}
          />
        </div>
        <div className="fj-field">
          <label htmlFor="org-tz">Default time zone</label>
          <TimezoneSelect id="org-tz" value={timezone} onChange={setTimezone} />
        </div>
        <div>
          <BrandButton type="submit" disabled={savingProfile}>
            {savingProfile ? "Saving..." : "Save changes"}
          </BrandButton>
        </div>
      </form>

      <form className="fj-form-stack" onSubmit={onSaveSlug} noValidate style={{ marginTop: "var(--space-6)" }}>
        <div className="fj-field">
          <label htmlFor="org-slug">Handle</label>
          <div style={{ display: "flex", alignItems: "center", gap: "var(--space-2)" }}>
            <span style={{ color: "var(--color-text-muted)", fontSize: "0.9rem" }}>fajita.io/</span>
            <input
              id="org-slug"
              className="fj-input"
              value={slug}
              maxLength={32}
              aria-invalid={slugError ? true : undefined}
              onChange={(e) => { setSlug(normalizeSlug(e.target.value)); setSlugError(null); }}
            />
          </div>
          {slugError ? (
            <span className="fj-field__error" role="alert">{slugError}</span>
          ) : (
            <span className="fj-field__hint">
              Changing this updates links that use the handle. The internal ID
              never changes.
            </span>
          )}
        </div>
        <div>
          <BrandButton type="submit" variant="secondary" disabled={savingSlug}>
            {savingSlug ? "Saving..." : "Update handle"}
          </BrandButton>
        </div>
      </form>
    </>
  );
}
