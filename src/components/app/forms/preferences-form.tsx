"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";

import { BrandButton } from "@/components/design-system/primitives";
import { useToast } from "../toast";
import { updatePreferencesAction } from "@/lib/app/actions/preferences";

export interface PreferenceValues {
  dateFormat: "YYYY-MM-DD" | "MM/DD/YYYY" | "DD/MM/YYYY" | "DD MMM YYYY";
  timeFormat: "12h" | "24h";
  weekStart: "sunday" | "monday";
  defaultLanding: "overview" | "team" | "settings";
  chartDensity: "comfortable" | "compact";
}

export function PreferencesForm({ initial }: { initial: PreferenceValues }) {
  const router = useRouter();
  const toast = useToast();
  const [values, setValues] = useState(initial);
  const [pending, setPending] = useState(false);
  const [error, setError] = useState<string | null>(null);

  function set<K extends keyof PreferenceValues>(key: K, value: PreferenceValues[K]) {
    setValues((v) => ({ ...v, [key]: value }));
  }

  async function onSubmit(event: React.FormEvent) {
    event.preventDefault();
    if (pending) return;
    setError(null);
    setPending(true);
    const result = await updatePreferencesAction(values);
    setPending(false);
    if (!result.ok) {
      setError(result.error);
      return;
    }
    toast.success("Preferences saved.");
    router.refresh();
  }

  return (
    <form className="fj-form-stack" onSubmit={onSubmit} noValidate>
      {error ? (
        <p className="fj-form-status fj-form-status--error" role="alert">{error}</p>
      ) : null}

      <div className="fj-field">
        <label htmlFor="date-format">Date format</label>
        <select id="date-format" className="fj-input" value={values.dateFormat}
          onChange={(e) => set("dateFormat", e.target.value as PreferenceValues["dateFormat"])}>
          <option value="YYYY-MM-DD">2026-07-16</option>
          <option value="MM/DD/YYYY">07/16/2026</option>
          <option value="DD/MM/YYYY">16/07/2026</option>
          <option value="DD MMM YYYY">16 Jul 2026</option>
        </select>
      </div>

      <div className="fj-field">
        <label htmlFor="time-format">Time format</label>
        <select id="time-format" className="fj-input" value={values.timeFormat}
          onChange={(e) => set("timeFormat", e.target.value as PreferenceValues["timeFormat"])}>
          <option value="24h">24-hour</option>
          <option value="12h">12-hour</option>
        </select>
      </div>

      <div className="fj-field">
        <label htmlFor="week-start">Week starts on</label>
        <select id="week-start" className="fj-input" value={values.weekStart}
          onChange={(e) => set("weekStart", e.target.value as PreferenceValues["weekStart"])}>
          <option value="monday">Monday</option>
          <option value="sunday">Sunday</option>
        </select>
      </div>

      <div className="fj-field">
        <label htmlFor="landing">Default landing page</label>
        <select id="landing" className="fj-input" value={values.defaultLanding}
          onChange={(e) => set("defaultLanding", e.target.value as PreferenceValues["defaultLanding"])}>
          <option value="overview">Overview</option>
          <option value="team">Team</option>
          <option value="settings">Settings</option>
        </select>
      </div>

      <div>
        <BrandButton type="submit" disabled={pending}>
          {pending ? "Saving..." : "Save preferences"}
        </BrandButton>
      </div>
    </form>
  );
}
