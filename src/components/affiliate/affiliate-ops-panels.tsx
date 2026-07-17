"use client";

import { useState, useTransition } from "react";
import { useRouter } from "next/navigation";

import { BrandButton } from "@/components/design-system/primitives";
import { setAffiliateMembershipAction } from "@/lib/affiliates/actions/admin";
import {
  adjustCommissionAction,
  resolveFraudReviewAction,
  runReconciliationAction,
} from "@/lib/affiliates/actions/ops";

function Status({ text, ok }: { text: string | null; ok?: boolean }) {
  if (!text) return null;
  return (
    <p
      className={`fj-form-status${ok === false ? " fj-form-status--error" : ""}`}
      role={ok === false ? "alert" : "status"}
    >
      {text}
    </p>
  );
}

export function MembershipControls({
  affiliateId,
  current,
}: {
  affiliateId: string;
  current: string;
}) {
  const router = useRouter();
  const [pending, startTransition] = useTransition();
  const [next, setNext] = useState(current);
  const [reason, setReason] = useState("");
  const [message, setMessage] = useState<string | null>(null);
  const [ok, setOk] = useState<boolean | undefined>();

  function submit() {
    setMessage(null);
    startTransition(async () => {
      const result = await setAffiliateMembershipAction({
        affiliateId,
        next: next as "active" | "paused" | "suspended" | "terminated" | "closed",
        reason: reason || undefined,
      });
      if (!result.ok) {
        setOk(false);
        setMessage(result.error);
        return;
      }
      setOk(true);
      setMessage(`Set to ${result.data?.state ?? next}.`);
      router.refresh();
    });
  }

  return (
    <div className="fj-payout-console">
      <div className="fj-field">
        <label htmlFor="aff-membership">Membership</label>
        <select
          id="aff-membership"
          className="fj-input"
          value={next}
          onChange={(e) => setNext(e.target.value)}
        >
          <option value="active">Active</option>
          <option value="paused">Paused</option>
          <option value="suspended">Suspended</option>
          <option value="terminated">Terminated</option>
          <option value="closed">Closed</option>
        </select>
      </div>
      <div className="fj-field">
        <label htmlFor="aff-membership-reason">Reason (optional)</label>
        <input
          id="aff-membership-reason"
          className="fj-input"
          value={reason}
          onChange={(e) => setReason(e.target.value)}
        />
      </div>
      <BrandButton type="button" onClick={submit} disabled={pending || next === current}>
        Update membership
      </BrandButton>
      <Status text={message} ok={ok} />
    </div>
  );
}

export function FraudReviewPanel({ affiliateId }: { affiliateId: string }) {
  const router = useRouter();
  const [pending, startTransition] = useTransition();
  const [decision, setDecision] = useState("clear");
  const [reason, setReason] = useState("");
  const [message, setMessage] = useState<string | null>(null);
  const [ok, setOk] = useState<boolean | undefined>();

  function submit() {
    setMessage(null);
    if (
      ["suspend", "terminate", "reverse"].includes(decision) &&
      !window.confirm(
        "This decision can freeze payouts or reverse commissions. Continue?",
      )
    ) {
      return;
    }
    startTransition(async () => {
      const result = await resolveFraudReviewAction({
        affiliateId,
        decision: decision as
          | "clear"
          | "hold"
          | "suspend"
          | "terminate"
          | "reverse"
          | "request_information"
          | "escalate",
        reason: reason || undefined,
      });
      if (!result.ok) {
        setOk(false);
        setMessage(result.error);
        return;
      }
      setOk(true);
      setMessage(`Fraud state: ${result.data?.fraudState ?? "updated"}.`);
      router.refresh();
    });
  }

  return (
    <div className="fj-payout-console">
      <div className="fj-field">
        <label htmlFor="fraud-decision">Decision</label>
        <select
          id="fraud-decision"
          className="fj-input"
          value={decision}
          onChange={(e) => setDecision(e.target.value)}
        >
          <option value="clear">Clear</option>
          <option value="hold">Hold payouts</option>
          <option value="request_information">Request information</option>
          <option value="escalate">Escalate</option>
          <option value="suspend">Suspend</option>
          <option value="terminate">Terminate</option>
          <option value="reverse">Reverse unpaid commissions</option>
        </select>
      </div>
      <div className="fj-field">
        <label htmlFor="fraud-reason">Reason</label>
        <input
          id="fraud-reason"
          className="fj-input"
          value={reason}
          onChange={(e) => setReason(e.target.value)}
        />
      </div>
      <BrandButton type="button" onClick={submit} disabled={pending}>
        Resolve review
      </BrandButton>
      <Status text={message} ok={ok} />
    </div>
  );
}

export function AdjustmentPanel({ affiliateId }: { affiliateId: string }) {
  const router = useRouter();
  const [pending, startTransition] = useTransition();
  const [dollars, setDollars] = useState("");
  const [type, setType] = useState("correction");
  const [reason, setReason] = useState("");
  const [message, setMessage] = useState<string | null>(null);
  const [ok, setOk] = useState<boolean | undefined>();

  function submit() {
    setMessage(null);
    const amountCents = Math.round(Number.parseFloat(dollars) * 100);
    if (!Number.isFinite(amountCents) || amountCents === 0) {
      setOk(false);
      setMessage("Enter a non-zero dollar amount (use a minus for a debit).");
      return;
    }
    startTransition(async () => {
      const result = await adjustCommissionAction({
        affiliateId,
        amountCents,
        adjustmentType: type as
          | "correction"
          | "goodwill"
          | "fraud_reversal"
          | "refund_correction"
          | "payout_correction"
          | "tax_withholding_correction"
          | "currency_correction",
        reason,
      });
      if (!result.ok) {
        setOk(false);
        setMessage(result.error);
        return;
      }
      setOk(true);
      setMessage("Adjustment recorded.");
      setDollars("");
      setReason("");
      router.refresh();
    });
  }

  return (
    <div className="fj-payout-console">
      <div className="fj-field">
        <label htmlFor="adj-amount">Amount (USD, signed)</label>
        <input
          id="adj-amount"
          className="fj-input"
          value={dollars}
          onChange={(e) => setDollars(e.target.value)}
          placeholder="12.50 or -5.00"
        />
      </div>
      <div className="fj-field">
        <label htmlFor="adj-type">Type</label>
        <select
          id="adj-type"
          className="fj-input"
          value={type}
          onChange={(e) => setType(e.target.value)}
        >
          <option value="correction">Correction</option>
          <option value="goodwill">Goodwill</option>
          <option value="fraud_reversal">Fraud reversal</option>
          <option value="refund_correction">Refund correction</option>
          <option value="payout_correction">Payout correction</option>
        </select>
      </div>
      <div className="fj-field">
        <label htmlFor="adj-reason">Reason</label>
        <input
          id="adj-reason"
          className="fj-input"
          value={reason}
          onChange={(e) => setReason(e.target.value)}
          required
        />
      </div>
      <BrandButton type="button" onClick={submit} disabled={pending}>
        Apply adjustment
      </BrandButton>
      <Status text={message} ok={ok} />
    </div>
  );
}

export function ReconciliationControls() {
  const router = useRouter();
  const [pending, startTransition] = useTransition();
  const [message, setMessage] = useState<string | null>(null);
  const [ok, setOk] = useState<boolean | undefined>();

  function run(
    kind: "commission" | "payout" | "attribution",
    dryRun: boolean,
  ) {
    setMessage(null);
    if (
      !dryRun &&
      !window.confirm("Run live reconciliation with repairs? This changes data.")
    ) {
      return;
    }
    startTransition(async () => {
      const result = await runReconciliationAction({ kind, dryRun });
      if (!result.ok) {
        setOk(false);
        setMessage(result.error);
        return;
      }
      const r = result.data;
      setOk(true);
      setMessage(
        r
          ? `${kind}: checked ${r.checked}, found ${r.differencesFound}, repaired ${r.differencesRepaired}${dryRun ? " (dry)" : ""}.`
          : "Done.",
      );
      router.refresh();
    });
  }

  return (
    <div className="fj-payout-console" style={{ maxWidth: "36rem" }}>
      <div className="fj-payout-setup__actions">
        <BrandButton
          type="button"
          variant="secondary"
          onClick={() => run("commission", true)}
          disabled={pending}
        >
          Commission dry-run
        </BrandButton>
        <BrandButton
          type="button"
          variant="secondary"
          onClick={() => run("payout", true)}
          disabled={pending}
        >
          Payout dry-run
        </BrandButton>
        <BrandButton
          type="button"
          variant="secondary"
          onClick={() => run("attribution", true)}
          disabled={pending}
        >
          Attribution dry-run
        </BrandButton>
      </div>
      <div className="fj-payout-setup__actions">
        <BrandButton
          type="button"
          onClick={() => run("payout", false)}
          disabled={pending}
        >
          Repair stranded payouts
        </BrandButton>
        <BrandButton
          type="button"
          onClick={() => run("attribution", false)}
          disabled={pending}
        >
          Unlock orphan attributions
        </BrandButton>
      </div>
      <Status text={message} ok={ok} />
    </div>
  );
}
