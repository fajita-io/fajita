"use client";

import { useState, useTransition } from "react";
import { useRouter } from "next/navigation";

import { BrandButton } from "@/components/design-system/primitives";
import { useToast } from "@/components/app/toast";
import {
  createMaintenanceWindowAction,
  updateMaintenanceWindowAction,
} from "@/lib/app/actions/maintenance";
import { SUPPRESSION_POLICIES } from "@/lib/incidents/constants";
import { STATUS_PAGE_SUMMARY_SAVED_NOTICE } from "@/lib/incidents/copy";

interface Option {
  id: string;
  name: string;
}

const SUPPRESSION_LABEL: Record<(typeof SUPPRESSION_POLICIES)[number], string> = {
  suppress_incidents: "Keep checking, do not open incidents (recommended)",
  annotate_only: "Keep checking, record failures in this window only",
  do_not_suppress: "Do not suppress (informational only)",
};

/** Offset in ms of an IANA timezone at a given instant. */
function tzOffsetMs(timeZone: string, date: Date): number {
  const dtf = new Intl.DateTimeFormat("en-US", {
    timeZone,
    hourCycle: "h23",
    year: "numeric",
    month: "2-digit",
    day: "2-digit",
    hour: "2-digit",
    minute: "2-digit",
    second: "2-digit",
  });
  const parts = dtf.formatToParts(date);
  const map: Record<string, string> = {};
  for (const p of parts) map[p.type] = p.value;
  const asUtc = Date.UTC(
    Number(map.year),
    Number(map.month) - 1,
    Number(map.day),
    Number(map.hour),
    Number(map.minute),
    Number(map.second),
  );
  return asUtc - date.getTime();
}

/** Convert a wall-clock "YYYY-MM-DDTHH:mm" in `timeZone` to a UTC ISO string. */
function zonedToUtcIso(local: string, timeZone: string): string {
  if (!local) return "";
  const guess = new Date(`${local}:00Z`);
  const offset = tzOffsetMs(timeZone, guess);
  return new Date(guess.getTime() - offset).toISOString();
}

export interface MaintenanceInitial {
  windowId?: string;
  name?: string;
  description?: string | null;
  publicSummary?: string | null;
  internalNotes?: string | null;
  timezone?: string;
  startsLocal?: string;
  endsLocal?: string;
  suppressionPolicy?: (typeof SUPPRESSION_POLICIES)[number];
  monitorIds?: string[];
}

export function MaintenanceForm({
  organizationId,
  monitors,
  defaultTimezone,
  initial,
}: {
  organizationId: string;
  monitors: Option[];
  defaultTimezone: string;
  initial?: MaintenanceInitial;
}) {
  const router = useRouter();
  const toast = useToast();
  const [pending, start] = useTransition();
  const isEdit = Boolean(initial?.windowId);

  const [name, setName] = useState(initial?.name ?? "");
  const [description, setDescription] = useState(initial?.description ?? "");
  const [publicSummary, setPublicSummary] = useState(initial?.publicSummary ?? "");
  const [timezone] = useState(initial?.timezone ?? defaultTimezone ?? "UTC");
  const [startsLocal, setStartsLocal] = useState(initial?.startsLocal ?? "");
  const [endsLocal, setEndsLocal] = useState(initial?.endsLocal ?? "");
  const [suppressionPolicy, setSuppressionPolicy] = useState<
    (typeof SUPPRESSION_POLICIES)[number]
  >(initial?.suppressionPolicy ?? "suppress_incidents");
  const [monitorIds, setMonitorIds] = useState<string[]>(initial?.monitorIds ?? []);

  function toggleMonitor(id: string) {
    setMonitorIds((prev) => (prev.includes(id) ? prev.filter((m) => m !== id) : [...prev, id]));
  }

  function submit() {
    if (name.trim().length < 1) {
      toast.error("Name the maintenance window.");
      return;
    }
    if (!startsLocal || !endsLocal) {
      toast.error("Set a start and end time.");
      return;
    }
    const startsAt = zonedToUtcIso(startsLocal, timezone);
    const endsAt = zonedToUtcIso(endsLocal, timezone);
    if (new Date(endsAt) <= new Date(startsAt)) {
      toast.error("End time must be after the start time.");
      return;
    }

    const payload = {
      name: name.trim(),
      description: description.trim() || undefined,
      publicSummary: publicSummary.trim() || undefined,
      timezone,
      startsAt,
      endsAt,
      suppressionPolicy,
      monitorIds,
    };

    start(async () => {
      const res = isEdit
        ? await updateMaintenanceWindowAction(organizationId, initial!.windowId!, payload)
        : await createMaintenanceWindowAction(organizationId, payload);
      if (res.ok) {
        toast.success(isEdit ? "Maintenance updated." : "Maintenance scheduled.");
        router.push("/app/maintenance");
        router.refresh();
      } else {
        toast.error(res.error ?? "That did not work.");
      }
    });
  }

  return (
    <div className="fj-maintenance-form">
      <div className="fj-maintenance-form__section">
        <div className="fj-field">
          <label htmlFor="mw-name">Name</label>
          <input
            id="mw-name"
            className="fj-input"
            value={name}
            maxLength={160}
            onChange={(e) => setName(e.target.value)}
            placeholder="Database maintenance"
          />
        </div>
      </div>

      <div className="fj-maintenance-form__section">
        <p className="fj-maintenance-form__section-label">Time window</p>
        <div className="fj-maintenance-form__time-panel">
          <div className="fj-inc-composer__row">
            <div className="fj-field">
              <label htmlFor="mw-start">Start</label>
              <input
                id="mw-start"
                type="datetime-local"
                className="fj-input"
                value={startsLocal}
                onChange={(e) => setStartsLocal(e.target.value)}
              />
            </div>
            <div className="fj-field">
              <label htmlFor="mw-end">End</label>
              <input
                id="mw-end"
                type="datetime-local"
                className="fj-input"
                value={endsLocal}
                onChange={(e) => setEndsLocal(e.target.value)}
              />
            </div>
          </div>
          <p className="fj-field__hint">
            Times are in {timezone}. Fajita stores the exact instant and shows it in your
            organization timezone.
          </p>
        </div>
      </div>

      <div className="fj-maintenance-form__section">
        <div className="fj-field">
          <label htmlFor="mw-policy">Suppression</label>
          <select
            id="mw-policy"
            className="fj-input"
            value={suppressionPolicy}
            onChange={(e) =>
              setSuppressionPolicy(e.target.value as (typeof SUPPRESSION_POLICIES)[number])
            }
          >
            {SUPPRESSION_POLICIES.map((p) => (
              <option key={p} value={p}>
                {SUPPRESSION_LABEL[p]}
              </option>
            ))}
          </select>
          <p className="fj-field__hint">
            Checks keep running during maintenance. This controls whether failures open an incident.
          </p>
        </div>
      </div>

      <div className="fj-maintenance-form__section">
        <p className="fj-maintenance-form__section-label">Notes (optional)</p>
        <div className="fj-maintenance-form__notes">
          <div className="fj-field">
            <label htmlFor="mw-desc">Internal description</label>
            <textarea
              id="mw-desc"
              className="fj-input fj-maintenance-form__textarea"
              rows={3}
              maxLength={4000}
              value={description}
              onChange={(e) => setDescription(e.target.value)}
            />
          </div>

          <div className="fj-field">
            <label htmlFor="mw-public">Public summary</label>
            <textarea
              id="mw-public"
              className="fj-input fj-maintenance-form__textarea"
              rows={3}
              maxLength={4000}
              value={publicSummary}
              onChange={(e) => setPublicSummary(e.target.value)}
            />
            <p className="fj-field__hint">{STATUS_PAGE_SUMMARY_SAVED_NOTICE}</p>
          </div>
        </div>
      </div>

      {monitors.length > 0 ? (
        <div className="fj-maintenance-form__section">
          <div className="fj-field">
            <span className="fj-field__label">Affected monitors</span>
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
          </div>
        </div>
      ) : null}

      <div className="fj-maintenance-form__actions">
        <BrandButton disabled={pending} onClick={submit}>
          {isEdit ? "Save changes" : "Schedule maintenance"}
        </BrandButton>
      </div>
    </div>
  );
}
