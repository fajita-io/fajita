"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";

import { BrandButton } from "@/components/design-system/primitives";
import { useToast } from "../toast";
import { updateNotificationPreferencesAction } from "@/lib/app/actions/notification-prefs";

export interface NotificationValues {
  productUpdates: boolean;
  changelogDigest: boolean;
  featureAnnouncements: boolean;
  education: boolean;
  marketing: boolean;
}

const GROUPS: {
  legend: string;
  hint?: string;
  items: { key: keyof NotificationValues; label: string; desc: string }[];
}[] = [
  {
    legend: "Product",
    items: [
      { key: "productUpdates", label: "Product updates", desc: "Meaningful changes to how Fajita works." },
      { key: "featureAnnouncements", label: "New features", desc: "When something worth trying ships." },
      { key: "changelogDigest", label: "Changelog digest", desc: "A periodic summary instead of individual notes." },
    ],
  },
  {
    legend: "Education",
    items: [
      { key: "education", label: "Setup guidance", desc: "Occasional tips while you get set up." },
    ],
  },
  {
    legend: "Marketing",
    hint: "Optional. Off by default.",
    items: [
      { key: "marketing", label: "Promotions and offers", desc: "News about Fajita and related products." },
    ],
  },
];

export function NotificationPrefsForm({ initial }: { initial: NotificationValues }) {
  const router = useRouter();
  const toast = useToast();
  const [values, setValues] = useState(initial);
  const [pending, setPending] = useState(false);
  const [error, setError] = useState<string | null>(null);

  function toggle(key: keyof NotificationValues, checked: boolean) {
    setValues((v) => ({ ...v, [key]: checked }));
  }

  async function onSubmit(event: React.FormEvent) {
    event.preventDefault();
    if (pending) return;
    setError(null);
    setPending(true);
    const result = await updateNotificationPreferencesAction(values);
    setPending(false);
    if (!result.ok) {
      setError(result.error);
      return;
    }
    toast.success("Notification preferences saved.");
    router.refresh();
  }

  return (
    <form className="fj-form-stack" onSubmit={onSubmit} noValidate>
      {error ? (
        <p className="fj-form-status fj-form-status--error" role="alert">{error}</p>
      ) : null}

      <div className="fj-notice">
        Account and security messages, like invitations, role changes, and
        security alerts, are always on. You need them to run the account safely.
      </div>

      {GROUPS.map((group) => (
        <fieldset key={group.legend} className="fj-field" style={{ border: "none", padding: 0, margin: 0 }}>
          <legend style={{ fontWeight: 600, marginBottom: "var(--space-2)" }}>
            {group.legend}
            {group.hint ? (
              <span style={{ fontWeight: 400, color: "var(--color-text-muted)" }}>. {group.hint}</span>
            ) : null}
          </legend>
          {group.items.map((item) => (
            <label key={item.key} className="fj-check">
              <input
                type="checkbox"
                checked={values[item.key]}
                onChange={(e) => toggle(item.key, e.target.checked)}
              />
              <span>
                <strong>{item.label}.</strong> {item.desc}
              </span>
            </label>
          ))}
        </fieldset>
      ))}

      <div>
        <BrandButton type="submit" disabled={pending}>
          {pending ? "Saving..." : "Save preferences"}
        </BrandButton>
      </div>
    </form>
  );
}
