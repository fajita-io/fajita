"use client";

import { useTransition } from "react";
import { useRouter } from "next/navigation";

import { BrandButton } from "@/components/design-system/primitives";
import { BrandIcon } from "@/components/design-system/icons";
import { useToast } from "@/components/app/toast";
import {
  dismissDeadLetterAction,
  exportDeliveriesAction,
  retryDeadLetterAction,
} from "@/lib/app/actions/alerts";

export function ExportDeliveriesButton({ organizationId }: { organizationId: string }) {
  const toast = useToast();
  const [pending, start] = useTransition();

  function exportCsv() {
    start(async () => {
      const res = await exportDeliveriesAction(organizationId);
      if (!res.ok || !res.data) {
        toast.error((res.ok ? "" : res.error) || "Export failed.");
        return;
      }
      const blob = new Blob([res.data.csv], { type: "text/csv;charset=utf-8" });
      const href = URL.createObjectURL(blob);
      const a = document.createElement("a");
      a.href = href;
      a.download = `fajita-deliveries-${new Date().toISOString().slice(0, 10)}.csv`;
      document.body.appendChild(a);
      a.click();
      a.remove();
      URL.revokeObjectURL(href);
      toast.success("Export ready.");
    });
  }

  return (
    <BrandButton size="sm" variant="secondary" disabled={pending} onClick={exportCsv}>
      <BrandIcon name="external" size={14} /> Export CSV
    </BrandButton>
  );
}

export function DeadLetterActions({
  organizationId,
  deadLetterId,
  canRetry,
}: {
  organizationId: string;
  deadLetterId: string;
  canRetry: boolean;
}) {
  const router = useRouter();
  const toast = useToast();
  const [pending, start] = useTransition();

  function retry() {
    start(async () => {
      const res = await retryDeadLetterAction(organizationId, deadLetterId);
      if (res.ok) {
        toast.success("Queued a fresh attempt.");
        router.refresh();
      } else toast.error(res.error ?? "That did not work.");
    });
  }

  function dismiss() {
    start(async () => {
      const res = await dismissDeadLetterAction(organizationId, deadLetterId);
      if (res.ok) {
        toast.success("Cleared from review.");
        router.refresh();
      } else toast.error(res.error ?? "That did not work.");
    });
  }

  return (
    <span className="fj-dl-actions">
      {canRetry ? (
        <BrandButton size="sm" variant="secondary" disabled={pending} onClick={retry}>
          Retry
        </BrandButton>
      ) : null}
      <BrandButton size="sm" variant="ghost" disabled={pending} onClick={dismiss}>
        Dismiss
      </BrandButton>
    </span>
  );
}
