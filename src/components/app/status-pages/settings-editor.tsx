"use client";

import { useState, useTransition } from "react";
import { useRouter } from "next/navigation";

import { BrandButton } from "@/components/design-system/primitives";
import {
  deleteStatusPageAction,
  updateDisplayAction,
  updateStatusPageSettingsAction,
} from "@/lib/app/actions/status-pages";
import type { StatusPageRecord } from "@/lib/status-pages/status-pages";

export function SettingsEditor({
  organizationId,
  statusPageId,
  page,
  canManage,
  canPublish,
  isPlatformAdmin,
}: {
  organizationId: string;
  statusPageId: string;
  page: StatusPageRecord;
  canManage: boolean;
  canPublish: boolean;
  isPlatformAdmin: boolean;
}) {
  const router = useRouter();
  const [pending, startTransition] = useTransition();
  const [message, setMessage] = useState<{ tone: "error" | "success"; text: string } | null>(null);

  const [name, setName] = useState(page.name);
  const [title, setTitle] = useState(page.title ?? "");
  const [description, setDescription] = useState(page.description ?? "");
  const [headline, setHeadline] = useState(page.headline ?? "");
  const [supportUrl, setSupportUrl] = useState(page.supportUrl ?? "");
  const [websiteUrl, setWebsiteUrl] = useState(page.websiteUrl ?? "");

  const [display, setDisplay] = useState({
    showUptimeHistory: page.showUptimeHistory,
    showResponseTime: page.showResponseTime,
    showIncidentHistory: page.showIncidentHistory,
    showScheduledMaintenance: page.showScheduledMaintenance,
    showComponentDescriptions: page.showComponentDescriptions,
    showSubscriberForm: page.showSubscriberForm,
    poweredByVisible: page.poweredByVisible,
    uptimeHistoryDays: page.uptimeHistoryDays as 7 | 30 | 90,
  });

  function saveSettings() {
    setMessage(null);
    startTransition(async () => {
      const result = await updateStatusPageSettingsAction(organizationId, statusPageId, {
        name: name.trim(),
        title: title.trim() || null,
        description: description.trim() || null,
        headline: headline.trim() || null,
        supportUrl: supportUrl.trim() || null,
        websiteUrl: websiteUrl.trim() || null,
      });
      if (!result.ok) {
        setMessage({ tone: "error", text: result.error });
        return;
      }
      setMessage({ tone: "success", text: "Details saved." });
      router.refresh();
    });
  }

  function saveDisplay(next: typeof display) {
    setDisplay(next);
    startTransition(async () => {
      const result = await updateDisplayAction(organizationId, statusPageId, next);
      if (!result.ok) {
        setMessage({ tone: "error", text: result.error });
        setDisplay(display);
        return;
      }
      router.refresh();
    });
  }

  function remove() {
    if (!confirm("Delete this status page? It will be unpublished and removed.")) return;
    startTransition(async () => {
      const result = await deleteStatusPageAction(organizationId, statusPageId);
      if (!result.ok) {
        setMessage({ tone: "error", text: result.error });
        return;
      }
      router.push("/app/status-pages");
    });
  }

  return (
    <div style={{ display: "grid", gap: "var(--space-5)" }}>
      {message ? (
        <div className="fj-sp-alert" data-tone={message.tone} role="status">
          {message.text}
        </div>
      ) : null}

      <section className="fj-app-section">
        <div className="fj-app-section__head">
          <h2 className="fj-app-section__title">Page details</h2>
        </div>
        <div className="fj-app-section__body">
          <div className="fj-sp-form">
            <Field id="s-name" label="Name" value={name} onChange={setName} disabled={!canManage} max={120} />
            <Field id="s-title" label="Browser title (optional)" value={title} onChange={setTitle} disabled={!canManage} max={120} />
            <Field id="s-headline" label="Header line (optional)" value={headline} onChange={setHeadline} disabled={!canManage} max={200} />
            <div className="fj-sp-field">
              <label htmlFor="s-desc">Description (optional)</label>
              <textarea
                id="s-desc"
                className="fj-sp-textarea"
                value={description}
                onChange={(e) => setDescription(e.target.value)}
                maxLength={2000}
                disabled={!canManage}
              />
            </div>
            <Field id="s-website" label="Website URL (optional)" value={websiteUrl} onChange={setWebsiteUrl} disabled={!canManage} placeholder="https://yourcompany.com" />
            <Field id="s-support" label="Support URL (optional)" value={supportUrl} onChange={setSupportUrl} disabled={!canManage} placeholder="https://yourcompany.com/support" />
            {canManage ? (
              <div className="fj-sp-actions">
                <BrandButton type="button" onClick={saveSettings} disabled={pending}>
                  {pending ? "Saving…" : "Save details"}
                </BrandButton>
              </div>
            ) : null}
          </div>
        </div>
      </section>

      <section className="fj-app-section">
        <div className="fj-app-section__head">
          <h2 className="fj-app-section__title">What visitors see</h2>
        </div>
        <div className="fj-app-section__body">
          <Toggle label="Uptime history" hint="Show the daily uptime bars per component." checked={display.showUptimeHistory} disabled={!canManage} onChange={(v) => saveDisplay({ ...display, showUptimeHistory: v })} />
          <Toggle label="Response time" hint="Show aggregated response time where enabled per component." checked={display.showResponseTime} disabled={!canManage} onChange={(v) => saveDisplay({ ...display, showResponseTime: v })} />
          <Toggle label="Incident history" hint="Show the past incidents section and archive." checked={display.showIncidentHistory} disabled={!canManage} onChange={(v) => saveDisplay({ ...display, showIncidentHistory: v })} />
          <Toggle label="Scheduled maintenance" hint="Show upcoming and active maintenance windows." checked={display.showScheduledMaintenance} disabled={!canManage} onChange={(v) => saveDisplay({ ...display, showScheduledMaintenance: v })} />
          <Toggle label="Component descriptions" checked={display.showComponentDescriptions} disabled={!canManage} onChange={(v) => saveDisplay({ ...display, showComponentDescriptions: v })} />
          <Toggle label="Subscriber form" hint="Subscriber email is not available yet. The form stays hidden until delivery is enabled." checked={display.showSubscriberForm} disabled={!canManage} onChange={(v) => saveDisplay({ ...display, showSubscriberForm: v })} />
          <Toggle
            label="Powered by Fajita"
            hint={isPlatformAdmin ? "You can hide the attribution." : "Removing the attribution requires a higher plan."}
            checked={display.poweredByVisible}
            disabled={!canManage || (!isPlatformAdmin && display.poweredByVisible)}
            onChange={(v) => saveDisplay({ ...display, poweredByVisible: v })}
          />
          <div className="fj-sp-field" style={{ marginTop: "var(--space-3)" }}>
            <label htmlFor="s-uptime-days">Uptime history window</label>
            <select
              id="s-uptime-days"
              className="fj-sp-select"
              value={display.uptimeHistoryDays}
              disabled={!canManage}
              onChange={(e) => saveDisplay({ ...display, uptimeHistoryDays: Number(e.target.value) as 7 | 30 | 90 })}
            >
              <option value={7}>7 days</option>
              <option value={30}>30 days</option>
              <option value={90}>90 days</option>
            </select>
          </div>
        </div>
      </section>

      {canPublish ? (
        <section className="fj-app-section">
          <div className="fj-app-section__head">
            <h2 className="fj-app-section__title">Danger zone</h2>
            <p className="fj-app-section__desc">Deleting unpublishes the page and removes it from your organization.</p>
          </div>
          <div className="fj-app-section__body">
            <BrandButton type="button" variant="secondary" onClick={remove} disabled={pending}>
              Delete status page
            </BrandButton>
          </div>
        </section>
      ) : null}
    </div>
  );
}

function Field({
  id,
  label,
  value,
  onChange,
  disabled,
  max = 2000,
  placeholder,
}: {
  id: string;
  label: string;
  value: string;
  onChange: (v: string) => void;
  disabled?: boolean;
  max?: number;
  placeholder?: string;
}) {
  return (
    <div className="fj-sp-field">
      <label htmlFor={id}>{label}</label>
      <input
        id={id}
        className="fj-sp-input"
        value={value}
        onChange={(e) => onChange(e.target.value)}
        maxLength={max}
        disabled={disabled}
        placeholder={placeholder}
      />
    </div>
  );
}

function Toggle({
  label,
  hint,
  checked,
  onChange,
  disabled,
}: {
  label: string;
  hint?: string;
  checked: boolean;
  onChange: (v: boolean) => void;
  disabled?: boolean;
}) {
  return (
    <label className="fj-sp-toggle-row">
      <span>
        <span className="fj-sp-toggle-row__label">{label}</span>
        {hint ? <div className="fj-sp-toggle-row__hint">{hint}</div> : null}
      </span>
      <input type="checkbox" checked={checked} onChange={(e) => onChange(e.target.checked)} disabled={disabled} />
    </label>
  );
}
