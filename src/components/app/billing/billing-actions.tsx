"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";

import { BrandButton, BrandButtonLink } from "@/components/design-system/primitives";
import { Dialog } from "@/components/app/dialog";
import { useToast } from "@/components/app/toast";
import {
  openBillingPortalAction,
  reactivateSubscriptionAction,
  scheduleCancellationAction,
} from "@/lib/app/actions/billing";

const CANCEL_REASONS = [
  { value: "", label: "Prefer not to say" },
  { value: "too_expensive", label: "Too expensive" },
  { value: "missing_feature", label: "Missing a feature" },
  { value: "other_tool", label: "Monitoring another way" },
  { value: "project_ended", label: "Project ended" },
  { value: "reliability", label: "Reliability concern" },
  { value: "hard_to_use", label: "Difficult to use" },
  { value: "budget", label: "Temporary budget issue" },
  { value: "temporary_pause", label: "Just pausing for now" },
  { value: "other", label: "Other" },
];

/** Honest, non-blocking suggestions per reason. None obstruct cancellation. */
const REASON_PATHS: Record<string, string> = {
  too_expensive:
    "A lower plan might genuinely fit: check your usage on the billing page before the end date. Either way, you can export your data first.",
  missing_feature:
    "Tell us what was missing below; it goes straight into the feature record. No promised dates, but it is read.",
  hard_to_use:
    "The setup checklist can be reopened from Settings if you want another pass. Cancellation continues either way.",
  project_ended:
    "You can export your data from Settings before the end date. History stays available until the retention period ends.",
  temporary_pause:
    "Your data stays available for the retention period after cancellation. Reactivate before it ends and monitoring resumes with the same configuration.",
};

export function BillingActions({
  organizationId,
  canManage,
  hasSubscription,
  cancelScheduled,
  cancellationEffectiveAt,
}: {
  organizationId: string;
  canManage: boolean;
  hasSubscription: boolean;
  cancelScheduled: boolean;
  cancellationEffectiveAt: string | null;
}) {
  const router = useRouter();
  const toast = useToast();
  const [portalBusy, setPortalBusy] = useState(false);
  const [cancelOpen, setCancelOpen] = useState(false);
  const [reasonCode, setReasonCode] = useState("");
  const [feedback, setFeedback] = useState("");
  const [missingFeature, setMissingFeature] = useState("");
  const [followUpOk, setFollowUpOk] = useState(false);
  const [busy, setBusy] = useState(false);

  async function openPortal() {
    if (portalBusy) return;
    setPortalBusy(true);
    const result = await openBillingPortalAction(organizationId);
    setPortalBusy(false);
    if (!result.ok || !result.data) {
      toast.error(result.ok ? "Could not open billing portal." : result.error);
      return;
    }
    window.location.href = result.data.url;
  }

  async function confirmCancel() {
    if (busy) return;
    setBusy(true);
    const result = await scheduleCancellationAction(
      organizationId,
      reasonCode || undefined,
      feedback.trim() || undefined,
      {
        missingFeature:
          reasonCode === "missing_feature" && missingFeature.trim()
            ? missingFeature.trim()
            : undefined,
        followUpOk: followUpOk || undefined,
      },
    );
    setBusy(false);
    if (!result.ok) {
      toast.error(result.error);
      return;
    }
    setCancelOpen(false);
    toast.success("Cancellation scheduled. Access continues until the end date.");
    router.refresh();
  }

  async function reactivate() {
    if (busy) return;
    setBusy(true);
    const result = await reactivateSubscriptionAction(organizationId);
    setBusy(false);
    if (!result.ok) {
      toast.error(result.error);
      return;
    }
    toast.success("Subscription reactivated.");
    router.refresh();
  }

  if (!hasSubscription) {
    return (
      <div className="fj-billing-actions">
        <BrandButtonLink href="/app/settings/billing/plans">
          Choose a plan
        </BrandButtonLink>
      </div>
    );
  }

  return (
    <div className="fj-billing-actions" style={{ display: "flex", gap: "var(--space-3)", flexWrap: "wrap" }}>
      <BrandButtonLink href="/app/settings/billing/plans" variant="secondary">
        Change plan
      </BrandButtonLink>
      {canManage ? (
        <BrandButton variant="secondary" onClick={openPortal} disabled={portalBusy}>
          {portalBusy ? "Opening…" : "Manage billing"}
        </BrandButton>
      ) : null}
      {canManage && cancelScheduled ? (
        <BrandButton variant="secondary" onClick={reactivate} disabled={busy}>
          Keep subscription
        </BrandButton>
      ) : null}
      {canManage && !cancelScheduled ? (
        <BrandButton variant="ghost" onClick={() => setCancelOpen(true)}>
          Cancel subscription
        </BrandButton>
      ) : null}

      <Dialog
        open={cancelOpen}
        onClose={() => setCancelOpen(false)}
        title="Cancel subscription"
        description="Your plan stays active until the end of the current billing period. Fajita will not charge the next renewal. Your data is preserved and you can reactivate before the end date."
      >
        <div style={{ display: "grid", gap: "var(--space-4)" }}>
          <label style={{ display: "grid", gap: "var(--space-2)" }}>
            <span className="fj-field__label">Reason (optional)</span>
            <select
              className="fj-input"
              value={reasonCode}
              onChange={(e) => setReasonCode(e.target.value)}
            >
              {CANCEL_REASONS.map((r) => (
                <option key={r.value} value={r.value}>
                  {r.label}
                </option>
              ))}
            </select>
          </label>
          {reasonCode && REASON_PATHS[reasonCode] ? (
            <p className="fj-app-section__desc" style={{ margin: 0 }} role="status">
              {REASON_PATHS[reasonCode]}
            </p>
          ) : null}
          {reasonCode === "missing_feature" ? (
            <label style={{ display: "grid", gap: "var(--space-2)" }}>
              <span className="fj-field__label">Which feature? (optional)</span>
              <input
                className="fj-input"
                type="text"
                value={missingFeature}
                maxLength={500}
                onChange={(e) => setMissingFeature(e.target.value)}
              />
            </label>
          ) : null}
          <label style={{ display: "grid", gap: "var(--space-2)" }}>
            <span className="fj-field__label">Anything we could have done better? (optional)</span>
            <textarea
              className="fj-input"
              rows={3}
              value={feedback}
              maxLength={2000}
              onChange={(e) => setFeedback(e.target.value)}
            />
          </label>
          <label className="fj-check">
            <input
              type="checkbox"
              checked={followUpOk}
              onChange={(e) => setFollowUpOk(e.target.checked)}
            />
            <span>It is okay to follow up with me about this feedback.</span>
          </label>
          {cancellationEffectiveAt ? (
            <p className="fj-app-section__desc" style={{ margin: 0 }}>
              Access continues until{" "}
              {new Date(cancellationEffectiveAt).toLocaleDateString(undefined, {
                year: "numeric",
                month: "long",
                day: "numeric",
              })}
              .
            </p>
          ) : null}
          <div style={{ display: "flex", gap: "var(--space-3)", justifyContent: "flex-end" }}>
            <BrandButton variant="secondary" onClick={() => setCancelOpen(false)}>
              Keep subscription
            </BrandButton>
            <BrandButton onClick={confirmCancel} disabled={busy}>
              {busy ? "Canceling…" : "Confirm cancellation"}
            </BrandButton>
          </div>
        </div>
      </Dialog>
    </div>
  );
}
