"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";

import { BrandButton } from "@/components/design-system/primitives";
import { useToast } from "../toast";
import {
  addReportRecipientAction,
  removeReportRecipientAction,
  updateReportSettingsAction,
} from "@/lib/app/actions/reports";

export interface RecipientRow {
  userId: string;
  displayName: string | null;
}

export interface MemberOption {
  userId: string;
  displayName: string | null;
}

export function ReportSettingsPanel({
  organizationId,
  initialEnabled,
  initialWeekStart,
  recipients,
  members,
  ownerUserId,
}: {
  organizationId: string;
  initialEnabled: boolean;
  initialWeekStart: "monday" | "sunday";
  recipients: RecipientRow[];
  members: MemberOption[];
  ownerUserId: string;
}) {
  const router = useRouter();
  const toast = useToast();
  const [enabled, setEnabled] = useState(initialEnabled);
  const [weekStart, setWeekStart] = useState(initialWeekStart);
  const [addUserId, setAddUserId] = useState("");
  const [pending, setPending] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const recipientIds = new Set(recipients.map((r) => r.userId));
  const addable = members.filter((m) => !recipientIds.has(m.userId));

  async function saveSettings(event: React.FormEvent) {
    event.preventDefault();
    if (pending) return;
    setError(null);
    setPending(true);
    const result = await updateReportSettingsAction(organizationId, {
      enabled,
      weekStart,
    });
    setPending(false);
    if (!result.ok) {
      setError(result.error);
      return;
    }
    toast.success("Report settings saved.");
    router.refresh();
  }

  async function addRecipient() {
    if (!addUserId || pending) return;
    setError(null);
    setPending(true);
    const result = await addReportRecipientAction(organizationId, addUserId);
    setPending(false);
    if (!result.ok) {
      setError(result.error);
      return;
    }
    setAddUserId("");
    toast.success("Recipient added.");
    router.refresh();
  }

  async function removeRecipient(userId: string) {
    if (pending) return;
    setError(null);
    setPending(true);
    const result = await removeReportRecipientAction(organizationId, userId);
    setPending(false);
    if (!result.ok) {
      setError(result.error);
      return;
    }
    toast.success("Recipient removed.");
    router.refresh();
  }

  return (
    <form className="fj-form-stack" onSubmit={saveSettings} noValidate>
      {error ? (
        <p className="fj-form-status fj-form-status--error" role="alert">
          {error}
        </p>
      ) : null}

      <label className="fj-check">
        <input
          type="checkbox"
          checked={enabled}
          onChange={(e) => setEnabled(e.target.checked)}
        />
        <span>
          <strong>Generate a weekly reliability report.</strong> One report per
          week, built from real monitoring data. Nothing is generated for weeks
          without meaningful data.
        </span>
      </label>

      <div className="fj-field">
        <label htmlFor="report-week-start">Week starts on</label>
        <select
          id="report-week-start"
          className="fj-input"
          value={weekStart}
          onChange={(e) =>
            setWeekStart(e.target.value === "sunday" ? "sunday" : "monday")
          }
        >
          <option value="monday">Monday</option>
          <option value="sunday">Sunday</option>
        </select>
        <p className="fj-field__hint">
          The report covers the previous seven complete days in your
          organization timezone.
        </p>
      </div>

      <div className="fj-field">
        <span style={{ fontWeight: 600 }}>Email recipients</span>
        <p className="fj-field__hint">
          Recipients must be active members. Each person&apos;s own weekly
          report preference still applies; nobody receives a report they turned
          off.
        </p>
        {recipients.length > 0 ? (
          <ul className="fj-activity" style={{ marginTop: "var(--space-2)" }}>
            {recipients.map((r) => (
              <li key={r.userId} className="fj-activity__item">
                <span>
                  {r.displayName ?? "Member"}
                  {r.userId === ownerUserId ? " (owner)" : ""}
                </span>
                <button
                  type="button"
                  className="fj-link-button"
                  onClick={() => removeRecipient(r.userId)}
                  disabled={pending}
                >
                  Remove
                </button>
              </li>
            ))}
          </ul>
        ) : (
          <p className="fj-field__hint">
            No explicit recipients. The organization owner receives the report
            by default.
          </p>
        )}
        {addable.length > 0 ? (
          <div style={{ display: "flex", gap: "var(--space-2)", marginTop: "var(--space-2)" }}>
            <select
              className="fj-input"
              aria-label="Add report recipient"
              value={addUserId}
              onChange={(e) => setAddUserId(e.target.value)}
            >
              <option value="">Choose a member…</option>
              {addable.map((m) => (
                <option key={m.userId} value={m.userId}>
                  {m.displayName ?? "Member"}
                </option>
              ))}
            </select>
            <BrandButton
              type="button"
              variant="secondary"
              onClick={addRecipient}
              disabled={!addUserId || pending}
            >
              Add
            </BrandButton>
          </div>
        ) : null}
      </div>

      <div>
        <BrandButton type="submit" disabled={pending}>
          {pending ? "Saving…" : "Save settings"}
        </BrandButton>
      </div>
    </form>
  );
}
