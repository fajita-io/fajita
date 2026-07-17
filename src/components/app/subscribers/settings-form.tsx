"use client";

import { useState, useTransition } from "react";

import { updateSubscriberSettings } from "@/lib/app/actions/subscribers";
import type { SubscriberSettings } from "@/lib/subscribers/admin";

/**
 * Per-status-page subscriber settings. Operational controls only: which public
 * events generate email, component selection, confirmation cooldown, and the
 * privacy notice link. No marketing options. Disabled for members without
 * settings permission (the server also enforces it).
 */

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
  const [message, setMessage] = useState<string | null>(null);

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
      setMessage(result.ok ? "Settings saved." : result.error);
    });
  }

  const disabled = !canManage || pending;

  return (
    <div className="card" style={{ padding: 20 }}>
      <h2 style={{ margin: "0 0 4px", fontSize: 16 }}>Subscriber settings</h2>
      <p style={{ margin: "0 0 16px", fontSize: 13, color: "var(--muted, #666)" }}>
        Operational email only. Subscribers confirm by double opt-in and can
        unsubscribe from any message.
      </p>

      {s.autoPausedAt ? (
        <p
          role="alert"
          style={{
            fontSize: 13,
            background: "#fff4ed",
            border: "1px solid #f2c4bd",
            borderRadius: 8,
            padding: "8px 12px",
            marginBottom: 14,
          }}
        >
          New subscriptions are paused ({s.pauseReason ?? "safety hold"}). Existing
          subscribers still receive updates. Resolve the issue, then re-enable.
        </p>
      ) : null}

      <label style={{ display: "flex", gap: 10, alignItems: "center", marginBottom: 14 }}>
        <input
          type="checkbox"
          checked={s.subscriptionsEnabled}
          disabled={disabled}
          onChange={(e) => set("subscriptionsEnabled", e.target.checked)}
        />
        <span>Subscriptions enabled (show the form and deliver updates)</span>
      </label>

      <fieldset style={{ border: 0, padding: 0, margin: "0 0 14px" }}>
        <legend style={{ fontSize: 13, fontWeight: 600, marginBottom: 8 }}>
          Which events generate email
        </legend>
        {EVENT_FIELDS.map((f) => (
          <label
            key={f.key}
            style={{ display: "flex", gap: 10, alignItems: "center", padding: "3px 0" }}
          >
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

      <label style={{ display: "flex", gap: 10, alignItems: "center", marginBottom: 8 }}>
        <input
          type="checkbox"
          checked={s.componentSelectionEnabled}
          disabled={disabled}
          onChange={(e) => set("componentSelectionEnabled", e.target.checked)}
        />
        <span>Let subscribers choose specific components</span>
      </label>
      <label style={{ display: "flex", gap: 10, alignItems: "center", marginBottom: 14 }}>
        <input
          type="checkbox"
          checked={s.allComponentsDefault}
          disabled={disabled}
          onChange={(e) => set("allComponentsDefault", e.target.checked)}
        />
        <span>Default new subscribers to all components</span>
      </label>

      <label style={{ display: "block", marginBottom: 14 }}>
        <span style={{ display: "block", fontSize: 13, marginBottom: 4 }}>
          Subscriber privacy notice URL
        </span>
        <input
          type="url"
          value={s.privacyUrl}
          disabled={disabled}
          placeholder="https://example.com/status/privacy"
          onChange={(e) => set("privacyUrl", e.target.value)}
          style={{ width: "100%", maxWidth: 460, padding: "8px 10px", borderRadius: 8, border: "1px solid #d5d5d8" }}
        />
      </label>

      <label style={{ display: "block", marginBottom: 18 }}>
        <span style={{ display: "block", fontSize: 13, marginBottom: 4 }}>
          Confirmation resend cooldown (seconds)
        </span>
        <input
          type="number"
          min={30}
          max={3600}
          value={s.confirmationCooldownSeconds}
          disabled={disabled}
          onChange={(e) =>
            set("confirmationCooldownSeconds", Number.parseInt(e.target.value || "120", 10))
          }
          style={{ width: 140, padding: "8px 10px", borderRadius: 8, border: "1px solid #d5d5d8" }}
        />
      </label>

      <div style={{ display: "flex", gap: 12, alignItems: "center" }}>
        <button
          type="button"
          onClick={save}
          disabled={disabled}
          className="btn btn--primary"
          style={{
            padding: "10px 18px",
            borderRadius: 8,
            background: disabled ? "#9ca3af" : "#1a1a1a",
            color: "#fff",
            border: 0,
            fontWeight: 600,
            cursor: disabled ? "not-allowed" : "pointer",
          }}
        >
          {pending ? "Saving…" : "Save settings"}
        </button>
        {message ? (
          <span role="status" style={{ fontSize: 13, color: "var(--muted, #666)" }}>
            {message}
          </span>
        ) : null}
      </div>
      {!canManage ? (
        <p style={{ fontSize: 12, color: "var(--muted, #666)", marginTop: 10 }}>
          You can view these settings. Changing them requires an admin or owner.
        </p>
      ) : null}
    </div>
  );
}
