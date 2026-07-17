"use client";

import { useState, useTransition } from "react";
import { useRouter } from "next/navigation";

import { BrandButton } from "@/components/design-system/primitives";
import {
  approvePayoutBatchAction,
  generatePayoutBatchAction,
  markPayoutItemPaidAction,
  processPayoutBatchAction,
} from "@/lib/affiliates/actions/payout-ops";

function defaultPeriod(): string {
  const now = new Date();
  return `${now.getUTCFullYear()}-${String(now.getUTCMonth() + 1).padStart(2, "0")}`;
}

/** Create a new payout batch for a period. */
export function PayoutGenerate() {
  const router = useRouter();
  const [pending, startTransition] = useTransition();
  const [period, setPeriod] = useState(defaultPeriod());
  const [message, setMessage] = useState<string | null>(null);

  function generate() {
    setMessage(null);
    startTransition(async () => {
      const result = await generatePayoutBatchAction(period);
      if (!result.ok) {
        setMessage(result.error);
        return;
      }
      if (result.data) {
        setMessage(
          `Batch created: ${result.data.readyCount} ready, ${result.data.skipped.length} skipped.`,
        );
      }
      router.refresh();
    });
  }

  return (
    <div className="fj-payout-console">
      <div className="fj-field">
        <label htmlFor="payout-period">Period label</label>
        <input
          id="payout-period"
          className="fj-input"
          value={period}
          onChange={(e) => setPeriod(e.target.value)}
          placeholder="2026-07"
        />
      </div>
      <BrandButton type="button" onClick={generate} disabled={pending}>
        Generate batch
      </BrandButton>
      {message ? <p className="fj-body-sm">{message}</p> : null}
    </div>
  );
}

/** Approve and process a batch. Processing moves money. */
export function PayoutBatchActions({
  batchId,
  status,
}: {
  batchId: string;
  status: string;
}) {
  const router = useRouter();
  const [pending, startTransition] = useTransition();
  const [message, setMessage] = useState<string | null>(null);

  function approve() {
    setMessage(null);
    startTransition(async () => {
      const result = await approvePayoutBatchAction(batchId);
      if (!result.ok) setMessage(result.error);
      else router.refresh();
    });
  }

  function process() {
    setMessage(null);
    const confirmed = window.confirm(
      "Process this batch? This transfers money to affiliates and cannot be undone.",
    );
    if (!confirmed) return;
    startTransition(async () => {
      const result = await processPayoutBatchAction(batchId);
      if (!result.ok) {
        setMessage(result.error);
        return;
      }
      if (result.data) {
        setMessage(
          `Processed: ${result.data.paidCount} paid, ${result.data.failedCount} failed.`,
        );
      }
      router.refresh();
    });
  }

  return (
    <div className="fj-payout-console__actions">
      {status === "review" ? (
        <BrandButton type="button" onClick={approve} disabled={pending}>
          Approve batch
        </BrandButton>
      ) : null}
      {status === "approved" || status === "processing" ? (
        <BrandButton type="button" onClick={process} disabled={pending}>
          Process payouts
        </BrandButton>
      ) : null}
      {message ? (
        <p className="fj-form-status" role="status">
          {message}
        </p>
      ) : null}
    </div>
  );
}

/** Settle a manual (non-Connect) scheduled payout item by hand. */
export function ManualSettle({ itemId }: { itemId: string }) {
  const router = useRouter();
  const [pending, startTransition] = useTransition();
  const [reference, setReference] = useState("");

  function settle() {
    startTransition(async () => {
      const result = await markPayoutItemPaidAction({
        itemId,
        providerReference: reference || undefined,
      });
      if (result.ok) router.refresh();
    });
  }

  return (
    <div className="fj-payout-console__settle">
      <input
        className="fj-input"
        value={reference}
        onChange={(e) => setReference(e.target.value)}
        placeholder="Reference"
        aria-label="Payment reference"
      />
      <BrandButton
        type="button"
        variant="secondary"
        onClick={settle}
        disabled={pending}
      >
        Mark paid
      </BrandButton>
    </div>
  );
}
