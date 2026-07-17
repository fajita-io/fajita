"use client";

import { useState, useTransition } from "react";
import { useRouter } from "next/navigation";

import { BrandButton } from "@/components/design-system/primitives";
import {
  createNoticeAction,
  publishIncidentAction,
  unpublishIncidentAction,
} from "@/lib/app/actions/status-pages";
import type { PublishableIncident } from "@/lib/status-pages/publication";

const SEVERITY_TONE: Record<string, "ok" | "warn" | "down"> = {
  minor: "warn",
  major: "down",
  critical: "down",
};

export function IncidentsManager({
  organizationId,
  statusPageId,
  incidents,
  canPublish,
}: {
  organizationId: string;
  statusPageId: string;
  incidents: PublishableIncident[];
  canPublish: boolean;
}) {
  const router = useRouter();
  const [pending, startTransition] = useTransition();
  const [message, setMessage] = useState<{ tone: "error" | "success"; text: string } | null>(null);
  const [publishing, setPublishing] = useState<string | null>(null);
  const [publicTitle, setPublicTitle] = useState("");
  const [publicSummary, setPublicSummary] = useState("");

  const [notice, setNotice] = useState({ title: "", body: "", type: "notice" as const });

  function beginPublish(inc: PublishableIncident) {
    setPublishing(inc.incidentId);
    setPublicTitle(inc.publicTitle ?? "");
    setPublicSummary("");
    setMessage(null);
  }

  function confirmPublish(incidentId: string) {
    startTransition(async () => {
      const result = await publishIncidentAction(organizationId, statusPageId, {
        incidentId,
        publicTitle: publicTitle.trim() || undefined,
        publicSummary: publicSummary.trim() || undefined,
      });
      if (!result.ok) {
        setMessage({ tone: "error", text: result.error });
        return;
      }
      setPublishing(null);
      setMessage({ tone: "success", text: "Incident published to your status page." });
      router.refresh();
    });
  }

  function unpublish(incidentId: string) {
    startTransition(async () => {
      const result = await unpublishIncidentAction(organizationId, statusPageId, incidentId);
      if (!result.ok) setMessage({ tone: "error", text: result.error });
      else router.refresh();
    });
  }

  function postNotice() {
    if (!notice.title.trim() || !notice.body.trim()) return;
    startTransition(async () => {
      const result = await createNoticeAction(organizationId, statusPageId, {
        title: notice.title.trim(),
        body: notice.body.trim(),
        noticeType: notice.type,
        publish: true,
      });
      if (!result.ok) {
        setMessage({ tone: "error", text: result.error });
        return;
      }
      setNotice({ title: "", body: "", type: "notice" });
      setMessage({ tone: "success", text: "Notice posted." });
      router.refresh();
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
          <h2 className="fj-app-section__title">Incidents</h2>
          <p className="fj-app-section__desc">
            Publishing shows a customer-safe version. Internal notes, evidence, and monitor names never appear on the public page.
          </p>
        </div>
        <div className="fj-app-section__body">
          {incidents.length === 0 ? (
            <p style={{ margin: 0, color: "var(--color-text-muted)" }}>No incidents yet.</p>
          ) : (
            <ul style={{ listStyle: "none", margin: 0, padding: 0, display: "grid", gap: "var(--space-3)" }}>
              {incidents.map((inc) => {
                const isPublished = inc.attached && inc.publicationState === "published";
                return (
                  <li key={inc.incidentId} className="fj-sp-incident">
                    <div className="fj-sp-incident__row">
                      <div>
                        <div className="fj-sp-incident__title">
                          {inc.publicTitle ?? inc.internalTitle}
                          {!inc.publicTitle ? (
                            <span className="fj-sp-incident__hint"> (internal title, add a public one)</span>
                          ) : null}
                        </div>
                        <div className="fj-sp-incident__meta">
                          <span className="fj-sp-badge" data-tone={SEVERITY_TONE[inc.severity] ?? "warn"}>
                            {inc.severity}
                          </span>
                          <span>{inc.lifecycleStatus}</span>
                          {isPublished ? <span className="fj-sp-badge" data-tone="ok">Published</span> : null}
                        </div>
                      </div>
                      {canPublish ? (
                        <div className="fj-sp-incident__actions">
                          {isPublished ? (
                            <BrandButton type="button" variant="secondary" onClick={() => unpublish(inc.incidentId)} disabled={pending}>
                              Unpublish
                            </BrandButton>
                          ) : (
                            <BrandButton type="button" onClick={() => beginPublish(inc)} disabled={pending}>
                              Publish
                            </BrandButton>
                          )}
                        </div>
                      ) : null}
                    </div>

                    {publishing === inc.incidentId ? (
                      <div className="fj-sp-incident__publish">
                        <p className="fj-sp-incident__warn">
                          This update will be visible to anyone who can access the status page.
                        </p>
                        <div className="fj-sp-field">
                          <label htmlFor={`pt-${inc.incidentId}`}>Public title</label>
                          <input
                            id={`pt-${inc.incidentId}`}
                            className="fj-sp-input"
                            value={publicTitle}
                            onChange={(e) => setPublicTitle(e.target.value)}
                            maxLength={200}
                            placeholder="Elevated error rates on the API"
                          />
                        </div>
                        <div className="fj-sp-field">
                          <label htmlFor={`ps-${inc.incidentId}`}>Public summary (optional)</label>
                          <textarea
                            id={`ps-${inc.incidentId}`}
                            className="fj-sp-textarea"
                            value={publicSummary}
                            onChange={(e) => setPublicSummary(e.target.value)}
                            maxLength={2000}
                          />
                        </div>
                        <div className="fj-sp-actions">
                          <BrandButton type="button" onClick={() => confirmPublish(inc.incidentId)} disabled={pending}>
                            Publish incident
                          </BrandButton>
                          <BrandButton type="button" variant="secondary" onClick={() => setPublishing(null)} disabled={pending}>
                            Cancel
                          </BrandButton>
                        </div>
                      </div>
                    ) : null}
                  </li>
                );
              })}
            </ul>
          )}
        </div>
      </section>

      {canPublish ? (
        <section className="fj-app-section">
          <div className="fj-app-section__head">
            <h2 className="fj-app-section__title">Post a notice</h2>
            <p className="fj-app-section__desc">
              A general message not tied to a monitor: a third-party provider issue, a service note, or a heads-up.
            </p>
          </div>
          <div className="fj-app-section__body">
            <div className="fj-sp-form">
              <div className="fj-sp-field">
                <label htmlFor="n-title">Title</label>
                <input
                  id="n-title"
                  className="fj-sp-input"
                  value={notice.title}
                  onChange={(e) => setNotice({ ...notice, title: e.target.value })}
                  maxLength={160}
                />
              </div>
              <div className="fj-sp-field">
                <label htmlFor="n-body">Message</label>
                <textarea
                  id="n-body"
                  className="fj-sp-textarea"
                  value={notice.body}
                  onChange={(e) => setNotice({ ...notice, body: e.target.value })}
                  maxLength={4000}
                />
              </div>
              <div className="fj-sp-actions">
                <BrandButton type="button" onClick={postNotice} disabled={pending || !notice.title.trim() || !notice.body.trim()}>
                  Post notice
                </BrandButton>
              </div>
            </div>
          </div>
        </section>
      ) : null}
    </div>
  );
}
