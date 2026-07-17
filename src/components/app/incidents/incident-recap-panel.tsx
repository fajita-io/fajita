"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";

import { BrandButton } from "@/components/design-system/primitives";
import { useToast } from "../toast";
import {
  createFollowUpActionAction,
  deleteFollowUpActionAction,
  markRecapReviewedAction,
  updateFollowUpActionAction,
  updateRecapRootCauseAction,
} from "@/lib/app/actions/incident-recaps";
import type {
  FollowUpAction,
  IncidentRecapDetail,
} from "@/lib/reports/queries";

function fmt(iso: string | null): string {
  if (!iso) return "n/a";
  return new Date(iso).toLocaleString("en-US", {
    month: "short",
    day: "numeric",
    hour: "numeric",
    minute: "2-digit",
  });
}

export function IncidentRecapPanel({
  organizationId,
  recap,
  followUps,
  canManage,
}: {
  organizationId: string;
  recap: IncidentRecapDetail;
  followUps: FollowUpAction[];
  canManage: boolean;
}) {
  const router = useRouter();
  const toast = useToast();
  const [rootCause, setRootCause] = useState(recap.rootCause ?? "");
  const [editingRootCause, setEditingRootCause] = useState(false);
  const [newTitle, setNewTitle] = useState("");
  const [pending, setPending] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const s = recap.snapshot;

  async function run(fn: () => Promise<{ ok: boolean; error?: string }>) {
    if (pending) return;
    setError(null);
    setPending(true);
    const result = await fn();
    setPending(false);
    if (!result.ok) {
      setError(result.error ?? "Something went wrong.");
      return false;
    }
    router.refresh();
    return true;
  }

  return (
    <div className="fj-form-stack">
      {error ? (
        <p className="fj-form-status fj-form-status--error" role="alert">
          {error}
        </p>
      ) : null}

      <dl className="fj-stat-list">
        <div>
          <dt>Duration</dt>
          <dd className="fj-numeric">{s.durationMinutes} min</dd>
        </div>
        <div>
          <dt>Opened</dt>
          <dd>{fmt(s.openedAt)}</dd>
        </div>
        <div>
          <dt>Acknowledged</dt>
          <dd>{fmt(s.acknowledgedAt)}</dd>
        </div>
        <div>
          <dt>Recovery started</dt>
          <dd>{fmt(s.recoveryStartedAt)}</dd>
        </div>
        <div>
          <dt>Resolved</dt>
          <dd>{fmt(s.resolvedAt)}</dd>
        </div>
        <div>
          <dt>Alerts delivered</dt>
          <dd className="fj-numeric">{s.alertDelivery.delivered}</dd>
        </div>
        <div>
          <dt>Public updates</dt>
          <dd className="fj-numeric">{s.publicUpdateCount}</dd>
        </div>
      </dl>

      <div className="fj-field">
        <span style={{ fontWeight: 600 }}>Root cause</span>
        {recap.rootCause && !editingRootCause ? (
          <>
            <p style={{ margin: "var(--space-1) 0" }}>{recap.rootCause}</p>
            <p className="fj-field__hint">
              Recorded {fmt(recap.rootCauseUpdatedAt)}. Corrections are
              versioned; earlier entries stay in the history.
            </p>
            {canManage ? (
              <button
                type="button"
                className="fj-link-button"
                onClick={() => setEditingRootCause(true)}
              >
                Correct root cause
              </button>
            ) : null}
          </>
        ) : canManage ? (
          <>
            <textarea
              className="fj-input"
              rows={3}
              value={rootCause}
              maxLength={2000}
              placeholder="What actually caused this incident? Left empty until someone on the team knows."
              onChange={(e) => setRootCause(e.target.value)}
              aria-label="Root cause"
            />
            <div style={{ display: "flex", gap: "var(--space-2)" }}>
              <BrandButton
                type="button"
                size="sm"
                disabled={pending || rootCause.trim().length < 3}
                onClick={async () => {
                  const ok = await run(() =>
                    updateRecapRootCauseAction(organizationId, recap.id, {
                      rootCause: rootCause.trim(),
                    }),
                  );
                  if (ok) {
                    setEditingRootCause(false);
                    toast.success("Root cause recorded.");
                  }
                }}
              >
                Save root cause
              </BrandButton>
              {editingRootCause ? (
                <BrandButton
                  type="button"
                  size="sm"
                  variant="ghost"
                  onClick={() => {
                    setEditingRootCause(false);
                    setRootCause(recap.rootCause ?? "");
                  }}
                >
                  Cancel
                </BrandButton>
              ) : null}
            </div>
          </>
        ) : (
          <p className="fj-field__hint">
            Not recorded. Fajita never invents a root cause; someone on the
            team records it when known.
          </p>
        )}
      </div>

      <div className="fj-field">
        <span style={{ fontWeight: 600 }}>Follow-up actions</span>
        {followUps.length > 0 ? (
          <ul className="fj-activity" style={{ marginTop: "var(--space-2)" }}>
            {followUps.map((action) => (
              <li key={action.id} className="fj-activity__item">
                <span
                  style={
                    action.status !== "open"
                      ? { textDecoration: "line-through", opacity: 0.6 }
                      : undefined
                  }
                >
                  {action.title}
                  {action.ownerName ? ` (${action.ownerName})` : ""}
                  {action.dueDate ? ` due ${action.dueDate}` : ""}
                </span>
                {canManage ? (
                  <span style={{ display: "inline-flex", gap: "var(--space-2)" }}>
                    {action.status === "open" ? (
                      <button
                        type="button"
                        className="fj-link-button"
                        disabled={pending}
                        onClick={() =>
                          run(() =>
                            updateFollowUpActionAction(
                              organizationId,
                              action.id,
                              { status: "completed" },
                            ),
                          )
                        }
                      >
                        Complete
                      </button>
                    ) : null}
                    <button
                      type="button"
                      className="fj-link-button"
                      disabled={pending}
                      onClick={() =>
                        run(() =>
                          deleteFollowUpActionAction(organizationId, action.id),
                        )
                      }
                    >
                      Remove
                    </button>
                  </span>
                ) : null}
              </li>
            ))}
          </ul>
        ) : (
          <p className="fj-field__hint">
            No follow-up actions yet. Capture what the team should change so
            this incident pays for itself.
          </p>
        )}
        {canManage ? (
          <div style={{ display: "flex", gap: "var(--space-2)", marginTop: "var(--space-2)" }}>
            <input
              className="fj-input"
              type="text"
              value={newTitle}
              maxLength={200}
              placeholder="Add a follow-up action"
              aria-label="New follow-up action"
              onChange={(e) => setNewTitle(e.target.value)}
            />
            <BrandButton
              type="button"
              variant="secondary"
              size="sm"
              disabled={pending || newTitle.trim().length === 0}
              onClick={async () => {
                const ok = await run(() =>
                  createFollowUpActionAction(
                    organizationId,
                    recap.incidentId,
                    { title: newTitle.trim() },
                  ),
                );
                if (ok) setNewTitle("");
              }}
            >
              Add
            </BrandButton>
          </div>
        ) : null}
      </div>

      <div style={{ display: "flex", alignItems: "center", gap: "var(--space-3)" }}>
        {recap.reviewedAt ? (
          <p className="fj-field__hint" style={{ margin: 0 }}>
            Reviewed by {recap.reviewedByName ?? "a teammate"} on{" "}
            {fmt(recap.reviewedAt)}.
          </p>
        ) : canManage ? (
          <BrandButton
            type="button"
            size="sm"
            variant="secondary"
            disabled={pending}
            onClick={async () => {
              const ok = await run(() =>
                markRecapReviewedAction(organizationId, recap.id),
              );
              if (ok) toast.success("Recap marked reviewed.");
            }}
          >
            Mark recap reviewed
          </BrandButton>
        ) : (
          <p className="fj-field__hint" style={{ margin: 0 }}>
            Not yet reviewed.
          </p>
        )}
      </div>
    </div>
  );
}
