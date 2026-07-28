"use client";

import { useState, useTransition } from "react";
import { useRouter } from "next/navigation";

import { BrandButton } from "@/components/design-system/primitives";
import { useToast } from "@/components/app/toast";
import { createManualIncidentAction } from "@/lib/app/actions/incidents";
import { ASSIGNABLE_SEVERITIES } from "@/lib/incidents/constants";
import { SEVERITY_COPY, SEVERITY_LABEL } from "@/lib/incidents/copy";

interface Option {
  id: string;
  name: string;
}
interface MemberOption {
  userId: string;
  name: string;
}

const OPERATIONAL_CHOICES: { value: string; label: string }[] = [
  { value: "down", label: "Down" },
  { value: "degraded", label: "Degraded" },
  { value: "unknown", label: "Unknown" },
  { value: "operational", label: "Operational" },
];

export function ManualIncidentForm({
  organizationId,
  monitors,
  members,
}: {
  organizationId: string;
  monitors: Option[];
  members: MemberOption[];
}) {
  const router = useRouter();
  const toast = useToast();
  const [pending, start] = useTransition();

  const [title, setTitle] = useState("");
  const [severity, setSeverity] = useState<(typeof ASSIGNABLE_SEVERITIES)[number]>("major");
  const [operationalStatus, setOperationalStatus] = useState("down");
  const [internalSummary, setInternalSummary] = useState("");
  const [publicSummary, setPublicSummary] = useState("");
  const [publicVisibility, setPublicVisibility] = useState("internal");
  const [assignee, setAssignee] = useState("");
  const [monitorIds, setMonitorIds] = useState<string[]>([]);

  function toggleMonitor(id: string) {
    setMonitorIds((prev) => (prev.includes(id) ? prev.filter((m) => m !== id) : [...prev, id]));
  }

  function submit() {
    if (title.trim().length < 3) {
      toast.error("Give the incident a clear title.");
      return;
    }
    start(async () => {
      const res = await createManualIncidentAction(organizationId, {
        title: title.trim(),
        severity,
        operationalStatus,
        internalSummary: internalSummary.trim() || undefined,
        publicSummary: publicSummary.trim() || undefined,
        publicVisibility,
        assigneeUserId: assignee || null,
        monitorIds,
      });
      if (res.ok && res.data) {
        toast.success("Incident created.");
        router.push(`/app/incidents/${res.data.incidentId}`);
      } else {
        toast.error(res.ok ? "That did not work." : (res.error ?? "That did not work."));
      }
    });
  }

  return (
    <div className="fj-inc-form">
      <div className="fj-inc-form__section">
        <div className="fj-field">
          <label htmlFor="mi-title">Title</label>
          <input
            id="mi-title"
            className="fj-input"
            value={title}
            maxLength={160}
            onChange={(e) => setTitle(e.target.value)}
            placeholder="Checkout API is returning errors"
          />
          <p className="fj-field__hint">Specific and safe. No secret URLs or private values.</p>
        </div>
      </div>

      <div className="fj-inc-form__section">
        <p className="fj-maintenance-form__section-label">Classification</p>
        <div className="fj-inc-form__panel">
          <div className="fj-inc-composer__row">
            <div className="fj-field">
              <label htmlFor="mi-severity">Severity</label>
              <select
                id="mi-severity"
                className="fj-input"
                value={severity}
                onChange={(e) =>
                  setSeverity(e.target.value as (typeof ASSIGNABLE_SEVERITIES)[number])
                }
              >
                {ASSIGNABLE_SEVERITIES.map((s) => (
                  <option key={s} value={s}>
                    {SEVERITY_LABEL[s]}
                  </option>
                ))}
              </select>
              <p className="fj-field__hint">{SEVERITY_COPY[severity]}</p>
            </div>
            <div className="fj-field">
              <label htmlFor="mi-op">Operational status</label>
              <select
                id="mi-op"
                className="fj-input"
                value={operationalStatus}
                onChange={(e) => setOperationalStatus(e.target.value)}
              >
                {OPERATIONAL_CHOICES.map((c) => (
                  <option key={c.value} value={c.value}>
                    {c.label}
                  </option>
                ))}
              </select>
            </div>
          </div>
        </div>
      </div>

      <div className="fj-inc-form__section">
        <p className="fj-maintenance-form__section-label">Summaries</p>
        <div className="fj-inc-form__panel">
          <div className="fj-field">
            <label htmlFor="mi-internal">Internal summary</label>
            <textarea
              id="mi-internal"
              className="fj-input fj-maintenance-form__textarea"
              rows={3}
              maxLength={4000}
              value={internalSummary}
              onChange={(e) => setInternalSummary(e.target.value)}
              placeholder="What you know so far. Visible only to your team."
            />
          </div>

          <div className="fj-field">
            <label htmlFor="mi-public">Public summary (optional)</label>
            <textarea
              id="mi-public"
              className="fj-input fj-maintenance-form__textarea"
              rows={3}
              maxLength={4000}
              value={publicSummary}
              onChange={(e) => setPublicSummary(e.target.value)}
              placeholder="A customer-safe description for a future status page."
            />
            <p className="fj-field__hint">
              Saved only. Nothing is published or sent to anyone in this release.
            </p>
          </div>
        </div>
      </div>

      <div className="fj-inc-form__section">
        <p className="fj-maintenance-form__section-label">Assignment</p>
        <div className="fj-inc-form__panel">
          <div className="fj-inc-composer__row">
            <div className="fj-field">
              <label htmlFor="mi-vis">Visibility</label>
              <select
                id="mi-vis"
                className="fj-input"
                value={publicVisibility}
                onChange={(e) => setPublicVisibility(e.target.value)}
              >
                <option value="internal">Internal only</option>
                <option value="status_page_ready">Ready for a future status page</option>
              </select>
            </div>
            <div className="fj-field">
              <label htmlFor="mi-assignee">Assignee (optional)</label>
              <select
                id="mi-assignee"
                className="fj-input"
                value={assignee}
                onChange={(e) => setAssignee(e.target.value)}
              >
                <option value="">Unassigned</option>
                {members.map((m) => (
                  <option key={m.userId} value={m.userId}>
                    {m.name}
                  </option>
                ))}
              </select>
            </div>
          </div>
        </div>
      </div>

      {monitors.length > 0 ? (
        <div className="fj-inc-form__section">
          <div className="fj-field">
            <span className="fj-field__label">Affected monitors (optional)</span>
            <div className="fj-inc-monitor-picker">
              {monitors.map((m) => (
                <label key={m.id} className="fj-check-chip">
                  <input
                    type="checkbox"
                    checked={monitorIds.includes(m.id)}
                    onChange={() => toggleMonitor(m.id)}
                  />
                  {m.name}
                </label>
              ))}
            </div>
            <p className="fj-field__hint">A manual incident does not require a monitor.</p>
          </div>
        </div>
      ) : null}

      <div className="fj-inc-form__actions">
        <BrandButton disabled={pending} onClick={submit}>
          Create incident
        </BrandButton>
      </div>
    </div>
  );
}
