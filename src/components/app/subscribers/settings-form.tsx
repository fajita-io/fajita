"use client";

import { useState, useTransition } from "react";

import { BrandButton } from "@/components/design-system/primitives";
import { AppSection } from "@/components/app/ui";
import { updateSubscriberSettings } from "@/lib/app/actions/subscribers";
import type { SubscriberSettings } from "@/lib/subscribers/admin";

type Bools = Omit<
  SubscriberSettings,
  "confirmationCooldownSeconds" | "privacyUrl" | "autoPausedAt" | "pauseReason"
>;

const EVENT_FIELDS: { key: keyof Bools; label: string }[] = [
  { key: "incidentOpened", label: "Incident opened" },
  { key: "incidentUpdates", label: "Incident updates" },
  { key: "incidentResolved", label: "Incident resolved" },
  { key: "incidentReopened", label: "Incident reopened" },
  { key: "maintenanceScheduled", label: "Maintenance scheduled" },
  { key: "maintenanceStarted", label: "Maintenance started" },
  { key: "maintenanceUpdated", label: "Maintenance updated" },
  { key: "maintenanceCompleted", label: "Maintenance completed" },
  { key: "maintenanceCanceled", label: "Maintenance canceled" },
];

export function SubscriberSettingsForm({
  organizationId,
  statusPageId,
  initial,
  canManage,
}: {
  organizationId: string;
  statusPageId: string;
  initial: SubscriberSettings;
  canManage: boolean;
}) {
  const [s, setS] = useState<SubscriberSettings>(initial);
  const [pending, startTransition] = useTransition();
  const [message, setMessage] = useState<{ tone: "success" | "error"; text: string } | null>(
    null,
  );

  function set<K extends keyof SubscriberSettings>(key: K, value: SubscriberSettings[K]) {
    setS((prev) => ({ ...prev, [key]: value }));
  }

  function save() {
    setMessage(null);
    startTransition(async () => {
      const result = await updateSubscriberSettings(organizationId, statusPageId, {
        subscriptionsEnabled: s.subscriptionsEnabled,
        incidentOpened: s.incidentOpened,
        incidentUpdates: s.incidentUpdates,
        incidentResolved: s.incidentResolved,
        incidentReopened: s.incidentReopened,
        maintenanceScheduled: s.maintenanceScheduled,
        maintenanceStarted: s.maintenanceStarted,
        maintenanceUpdated: s.maintenanceUpdated,
        maintenanceCompleted: s.maintenanceCompleted,
        maintenanceCanceled: s.maintenanceCanceled,
        componentSelectionEnabled: s.componentSelectionEnabled,
        allComponentsDefault: s.allComponentsDefault,
        confirmationCooldownSeconds: s.confirmationCooldownSeconds,
        privacyUrl: s.privacyUrl,
      });
      setMessage(
        result.ok
          ? { tone: "success", text: "Settings saved." }
          : { tone: "error", text: result.error ?? "That did not save." },
      );
    });
  }

  const disabled = !canManage || pending;

  return (
    <AppSection
      title="Subscriber settings"
      description="Operational email only. Subscribers confirm by double opt-in and can unsubscribe from any message."
      footer={
        <div className="fj-sub-settings__footer">
          <BrandButton disabled={disabled} onClick={save}>
            {pending ? "Saving…" : "Save settings"}
          </BrandButton>
          {message ? (
            <p
              className={
                message.tone === "error" ? "fj-field__error" : "fj-field__hint"
              }
              role="status"
            >
              {message.text}
            </p>
          ) : null}
        </div>
      }
    >
      {s.autoPausedAt ? (
        <div className="fj-notice fj-notice--warning" role="alert">
          <p style={{ margin: 0 }}>
            New subscriptions are paused ({s.pauseReason ?? "safety hold"}).
            Existing subscribers still receive updates. Resolve the issue, then
            re-enable.
          </p>
        </div>
      ) : null}

      <div className="fj-form-stack">
        <label className="fj-check">
          <input
            type="checkbox"
            checked={s.subscriptionsEnabled}
            disabled={disabled}
            onChange={(e) => set("subscriptionsEnabled", e.target.checked)}
          />
          <span>Subscriptions enabled (show the form and deliver updates)</span>
        </label>

        <fieldset className="fj-sub-settings__fieldset">
          <legend className="fj-field__label">Which events generate email</legend>
          {EVENT_FIELDS.map((f) => (
            <label key={f.key} className="fj-check">
              <input
                type="checkbox"
                checked={s[f.key]}
                disabled={disabled}
                onChange={(e) => set(f.key, e.target.checked)}
              />
              <span>{f.label}</span>
            </label>
          ))}
        </fieldset>

        <label className="fj-check">
          <input
            type="checkbox"
            checked={s.componentSelectionEnabled}
            disabled={disabled}
            onChange={(e) => set("componentSelectionEnabled", e.target.checked)}
          />
          <span>Let subscribers choose specific components</span>
        </label>

        <label className="fj-check">
          <input
            type="checkbox"
            checked={s.allComponentsDefault}
            disabled={disabled}
            onChange={(e) => set("allComponentsDefault", e.target.checked)}
          />
          <span>Default new subscribers to all components</span>
        </label>

        <div className="fj-field">
          <label htmlFor="sub-privacy-url">Subscriber privacy notice URL</label>
          <input
            id="sub-privacy-url"
            type="url"
            className="fj-input"
            value={s.privacyUrl}
            disabled={disabled}
            placeholder="https://example.com/status/privacy"
            onChange={(e) => set("privacyUrl", e.target.value)}
          />
        </div>

        <div className="fj-field">
          <label htmlFor="sub-cooldown">Confirmation resend cooldown (seconds)</label>
          <input
            id="sub-cooldown"
            type="number"
            min={30}
            max={3600}
            className="fj-input fj-input--sm"
            value={s.confirmationCooldownSeconds}
            disabled={disabled}
            onChange={(e) =>
              set("confirmationCooldownSeconds", Number.parseInt(e.target.value || "120", 10))
            }
          />
        </div>

        {!canManage ? (
          <p className="fj-field__hint">
            You can view these settings. Changing them requires an admin or owner.
          </p>
        ) : null}
      </div>
    </AppSection>
  );
}
