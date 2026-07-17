"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";

import { BrandButton } from "@/components/design-system/primitives";
import { TimezoneSelect } from "../timezone-select";
import { useToast } from "../toast";
import { updateProfileAction } from "@/lib/app/actions/profile";

export interface ProfileFormValues {
  displayName: string;
  timezone: string;
  theme: "light" | "dark" | "system";
  reducedMotion: "reduce" | "no-preference" | "system";
  productEmail: boolean;
  marketingEmail: boolean;
}

export function ProfileForm({ initial }: { initial: ProfileFormValues }) {
  const router = useRouter();
  const toast = useToast();
  const [values, setValues] = useState(initial);
  const [pending, setPending] = useState(false);
  const [error, setError] = useState<string | null>(null);

  function set<K extends keyof ProfileFormValues>(key: K, value: ProfileFormValues[K]) {
    setValues((v) => ({ ...v, [key]: value }));
  }

  async function onSubmit(event: React.FormEvent) {
    event.preventDefault();
    if (pending) return;
    setError(null);
    setPending(true);
    const result = await updateProfileAction(values);
    setPending(false);
    if (!result.ok) {
      setError(result.error);
      return;
    }
    toast.success("Profile saved.");
    router.refresh();
  }

  return (
    <form className="fj-form-stack" onSubmit={onSubmit} noValidate>
      {error ? (
        <p className="fj-form-status fj-form-status--error" role="alert">{error}</p>
      ) : null}

      <div className="fj-field">
        <label htmlFor="display-name">Display name</label>
        <input
          id="display-name"
          className="fj-input"
          value={values.displayName}
          maxLength={120}
          required
          onChange={(e) => set("displayName", e.target.value)}
        />
      </div>

      <div className="fj-field">
        <label htmlFor="tz">Time zone</label>
        <TimezoneSelect id="tz" value={values.timezone} onChange={(v) => set("timezone", v)} />
      </div>

      <div className="fj-field">
        <label htmlFor="theme">Theme</label>
        <select
          id="theme"
          className="fj-input"
          value={values.theme}
          onChange={(e) => set("theme", e.target.value as ProfileFormValues["theme"])}
        >
          <option value="system">Match system</option>
          <option value="light">Light</option>
          <option value="dark">Dark</option>
        </select>
      </div>

      <div className="fj-field">
        <label htmlFor="rm">Motion</label>
        <select
          id="rm"
          className="fj-input"
          value={values.reducedMotion}
          onChange={(e) => set("reducedMotion", e.target.value as ProfileFormValues["reducedMotion"])}
        >
          <option value="system">Match system</option>
          <option value="reduce">Reduce motion</option>
          <option value="no-preference">Full motion</option>
        </select>
      </div>

      <fieldset className="fj-field" style={{ border: "none", padding: 0, margin: 0 }}>
        <legend style={{ fontWeight: 600, marginBottom: "var(--space-2)" }}>Email</legend>
        <label className="fj-check">
          <input
            type="checkbox"
            checked={values.productEmail}
            onChange={(e) => set("productEmail", e.target.checked)}
          />
          <span>
            Product emails. Important account and product updates.
          </span>
        </label>
        <label className="fj-check">
          <input
            type="checkbox"
            checked={values.marketingEmail}
            onChange={(e) => set("marketingEmail", e.target.checked)}
          />
          <span>Marketing emails. Occasional news and offers. Optional.</span>
        </label>
      </fieldset>

      <div>
        <BrandButton type="submit" disabled={pending}>
          {pending ? "Saving..." : "Save changes"}
        </BrandButton>
      </div>
    </form>
  );
}
