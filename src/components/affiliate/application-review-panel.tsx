"use client";

import { useState, useTransition } from "react";
import { useRouter } from "next/navigation";

import { BrandButton } from "@/components/design-system/primitives";
import {
  approveApplicationAction,
  reviewApplicationAction,
} from "@/lib/affiliates/actions/admin";

type Decision =
  | "reject"
  | "waitlist"
  | "request_information"
  | "block"
  | "note";

const DECISIONS: { value: Decision; label: string }[] = [
  { value: "request_information", label: "Request information" },
  { value: "waitlist", label: "Waitlist" },
  { value: "reject", label: "Reject" },
  { value: "block", label: "Block" },
  { value: "note", label: "Add note" },
];

export function ApplicationReviewPanel({
  applicationId,
  decided,
}: {
  applicationId: string;
  decided: boolean;
}) {
  const router = useRouter();
  const [pending, startTransition] = useTransition();
  const [message, setMessage] = useState<
    { kind: "ok"; text: string } | { kind: "error"; text: string } | null
  >(null);
  const [decision, setDecision] = useState<Decision>("request_information");

  const onApprove = () => {
    setMessage(null);
    startTransition(async () => {
      const result = await approveApplicationAction(applicationId);
      if (result.ok) {
        setMessage({
          kind: "ok",
          text: `Approved. Default code: ${result.data?.defaultCode ?? ""}`,
        });
        router.refresh();
      } else {
        setMessage({ kind: "error", text: result.error });
      }
    });
  };

  const onDecision = (e: React.FormEvent<HTMLFormElement>) => {
    e.preventDefault();
    const data = new FormData(e.currentTarget);
    setMessage(null);
    startTransition(async () => {
      const result = await reviewApplicationAction({
        applicationId,
        decision,
        reason: String(data.get("reason") ?? "").trim() || undefined,
        internalNotes: String(data.get("internalNotes") ?? "").trim() || undefined,
      });
      if (result.ok) {
        setMessage({ kind: "ok", text: `Recorded: ${result.data?.state}` });
        router.refresh();
      } else {
        setMessage({ kind: "error", text: result.error });
      }
    });
  };

  return (
    <div style={{ display: "grid", gap: "var(--space-6)" }}>
      {message ? (
        <div
          className={`fj-form-status fj-form-status--${
            message.kind === "ok" ? "success" : "error"
          }`}
          role={message.kind === "ok" ? "status" : "alert"}
        >
          {message.text}
        </div>
      ) : null}

      {decided ? (
        <p className="fj-body-sm">
          This application has been decided. No further action is available.
        </p>
      ) : (
        <>
          <div>
            <BrandButton type="button" onClick={onApprove} disabled={pending}>
              {pending ? "Working…" : "Approve and provision"}
            </BrandButton>
          </div>

          <form
            className="fj-affiliate__form"
            onSubmit={onDecision}
            style={{ marginTop: "var(--space-4)" }}
          >
            <h3 className="fj-heading-3">Other decisions</h3>
            <div className="fj-field">
              <label htmlFor="decision">Decision</label>
              <select
                id="decision"
                className="fj-input"
                value={decision}
                onChange={(e) => setDecision(e.target.value as Decision)}
              >
                {DECISIONS.map((d) => (
                  <option key={d.value} value={d.value}>
                    {d.label}
                  </option>
                ))}
              </select>
            </div>
            <div className="fj-field">
              <label htmlFor="reason">Reason (shared with applicant)</label>
              <textarea id="reason" name="reason" className="fj-input" rows={2} />
            </div>
            <div className="fj-field">
              <label htmlFor="internalNotes">Internal notes (admin only)</label>
              <textarea
                id="internalNotes"
                name="internalNotes"
                className="fj-input"
                rows={2}
              />
            </div>
            <BrandButton
              type="submit"
              size="sm"
              variant="secondary"
              disabled={pending}
            >
              {pending ? "Working…" : "Record decision"}
            </BrandButton>
          </form>
        </>
      )}
    </div>
  );
}
