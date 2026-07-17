"use client";

import { useState, useTransition } from "react";
import Link from "next/link";
import { useRouter } from "next/navigation";

import { BrandButton } from "@/components/design-system/primitives";
import { BrandIcon } from "@/components/design-system/icons";
import { Dialog } from "@/components/app/dialog";
import { ConfirmDialog } from "@/components/app/confirm-dialog";
import { useToast } from "@/components/app/toast";
import {
  acknowledgeIncidentAction,
  assignIncidentAction,
  cancelIncidentAction,
  changeSeverityAction,
  resolveIncidentAction,
} from "@/lib/app/actions/incidents";
import { ASSIGNABLE_SEVERITIES } from "@/lib/incidents/constants";
import { SEVERITY_LABEL } from "@/lib/incidents/copy";

interface MemberOption {
  userId: string;
  name: string;
}

export function IncidentHeaderActions({
  organizationId,
  incidentId,
  isActive,
  isAcknowledged,
  currentSeverity,
  currentAssigneeId,
  members,
}: {
  organizationId: string;
  incidentId: string;
  isActive: boolean;
  isAcknowledged: boolean;
  currentSeverity: string;
  currentAssigneeId: string | null;
  members: MemberOption[];
}) {
  const router = useRouter();
  const toast = useToast();
  const [pending, start] = useTransition();

  const [assignOpen, setAssignOpen] = useState(false);
  const [severityOpen, setSeverityOpen] = useState(false);
  const [resolveOpen, setResolveOpen] = useState(false);
  const [cancelOpen, setCancelOpen] = useState(false);

  const [assignee, setAssignee] = useState(currentAssigneeId ?? "");
  const [severity, setSeverity] = useState(currentSeverity);
  const [resolution, setResolution] = useState("");

  function run(fn: () => Promise<{ ok: boolean; error?: string }>, ok: string, then?: () => void) {
    start(async () => {
      const res = await fn();
      if (res.ok) {
        toast.success(ok);
        then?.();
        router.refresh();
      } else {
        toast.error(res.error ?? "That did not work.");
      }
    });
  }

  return (
    <div className="fj-inc-actions">
      {isActive ? (
        <BrandButton
          variant={isAcknowledged ? "secondary" : "primary"}
          disabled={pending}
          onClick={() =>
            run(
              () => acknowledgeIncidentAction(organizationId, incidentId, !isAcknowledged),
              isAcknowledged ? "Acknowledgment removed." : "Incident acknowledged.",
            )
          }
        >
          <BrandIcon name="check" size={16} />
          {isAcknowledged ? "Unacknowledge" : "Acknowledge"}
        </BrandButton>
      ) : null}

      <BrandButton variant="secondary" disabled={pending} onClick={() => setAssignOpen(true)}>
        <BrandIcon name="team" size={16} /> Assign
      </BrandButton>

      <Link className="fj-button fj-button--secondary" href={`/app/incidents/${incidentId}/updates`}>
        <BrandIcon name="status-page" size={16} /> Add update
      </Link>

      {isActive ? (
        <details className="fj-rowmenu">
          <summary aria-label="More actions">
            <BrandIcon name="menu" size={16} />
          </summary>
          <div className="fj-rowmenu__panel" role="menu">
            <button type="button" className="fj-menu-item" role="menuitem" onClick={() => setSeverityOpen(true)}>
              <BrandIcon name="warning" size={16} /> Change severity
            </button>
            <button type="button" className="fj-menu-item" role="menuitem" onClick={() => setResolveOpen(true)}>
              <BrandIcon name="recovery" size={16} /> Resolve
            </button>
            <button
              type="button"
              className="fj-menu-item fj-menu-item--danger"
              role="menuitem"
              onClick={() => setCancelOpen(true)}
            >
              <BrandIcon name="close" size={16} /> Cancel incident
            </button>
          </div>
        </details>
      ) : null}

      <Dialog open={assignOpen} onClose={() => setAssignOpen(false)} title="Assign incident" size="sm">
        <div className="fj-field">
          <label htmlFor="inc-assignee">Assignee</label>
          <select
            id="inc-assignee"
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
          <p className="fj-field__hint">Assignment records responsibility. It does not grant new permissions.</p>
        </div>
        <div className="fj-dialog__actions">
          <BrandButton variant="ghost" onClick={() => setAssignOpen(false)} disabled={pending}>
            Cancel
          </BrandButton>
          <BrandButton
            disabled={pending}
            onClick={() =>
              run(
                () => assignIncidentAction(organizationId, incidentId, assignee || null),
                assignee ? "Incident assigned." : "Assignee cleared.",
                () => setAssignOpen(false),
              )
            }
          >
            Save
          </BrandButton>
        </div>
      </Dialog>

      <Dialog open={severityOpen} onClose={() => setSeverityOpen(false)} title="Change severity" size="sm">
        <div className="fj-field">
          <label htmlFor="inc-severity">Severity</label>
          <select
            id="inc-severity"
            className="fj-input"
            value={severity}
            onChange={(e) => setSeverity(e.target.value)}
          >
            {ASSIGNABLE_SEVERITIES.map((s) => (
              <option key={s} value={s}>
                {SEVERITY_LABEL[s]}
              </option>
            ))}
          </select>
        </div>
        <div className="fj-dialog__actions">
          <BrandButton variant="ghost" onClick={() => setSeverityOpen(false)} disabled={pending}>
            Cancel
          </BrandButton>
          <BrandButton
            disabled={pending}
            onClick={() =>
              run(
                () => changeSeverityAction(organizationId, incidentId, severity),
                "Severity updated.",
                () => setSeverityOpen(false),
              )
            }
          >
            Save
          </BrandButton>
        </div>
      </Dialog>

      <Dialog
        open={resolveOpen}
        onClose={() => setResolveOpen(false)}
        title="Resolve this incident"
        description="Resolving records that the incident is over. It does not mark a monitor healthy on its own. If checks are still failing, Fajita keeps the monitor's real state."
        size="sm"
      >
        <div className="fj-field">
          <label htmlFor="inc-resolution">Resolution summary</label>
          <textarea
            id="inc-resolution"
            className="fj-input"
            rows={4}
            maxLength={4000}
            value={resolution}
            onChange={(e) => setResolution(e.target.value)}
            placeholder="What was restored, and any known follow-up."
          />
        </div>
        <div className="fj-dialog__actions">
          <BrandButton variant="ghost" onClick={() => setResolveOpen(false)} disabled={pending}>
            Cancel
          </BrandButton>
          <BrandButton
            disabled={pending}
            onClick={() =>
              run(
                () =>
                  resolveIncidentAction(organizationId, incidentId, {
                    resolutionSummary: resolution || undefined,
                  }),
                "Incident resolved.",
                () => setResolveOpen(false),
              )
            }
          >
            Resolve incident
          </BrandButton>
        </div>
      </Dialog>

      <ConfirmDialog
        open={cancelOpen}
        onClose={() => setCancelOpen(false)}
        title="Cancel this incident?"
        description="Cancel is for incidents opened by mistake (a duplicate, a test, a misconfiguration). It stays in history but is marked canceled, not resolved. Add a short reason."
        confirmLabel="Cancel incident"
        destructive
        onConfirm={async () => {
          const reason = window.prompt("Reason for cancellation");
          if (!reason || reason.trim().length < 3) {
            throw new Error("A short reason is required to cancel.");
          }
          const res = await cancelIncidentAction(organizationId, incidentId, reason.trim());
          if (res.ok) {
            toast.success("Incident canceled.");
            router.refresh();
          } else throw new Error(res.error);
        }}
      />
    </div>
  );
}
