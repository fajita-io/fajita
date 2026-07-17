"use client";

import { useState, useTransition } from "react";
import { useRouter } from "next/navigation";

import { BrandButton } from "@/components/design-system/primitives";
import { useToast } from "@/components/app/toast";
import { deleteRuleAction, toggleRuleAction } from "@/lib/app/actions/alerts";

export function RuleRowActions({
  organizationId,
  ruleId,
  status,
}: {
  organizationId: string;
  ruleId: string;
  status: string;
}) {
  const router = useRouter();
  const toast = useToast();
  const [pending, start] = useTransition();
  const [confirm, setConfirm] = useState(false);

  function toggle() {
    const next = status === "active" ? "disabled" : "active";
    start(async () => {
      const res = await toggleRuleAction(organizationId, ruleId, next);
      if (res.ok) {
        toast.success(next === "active" ? "Rule enabled." : "Rule disabled.");
        router.refresh();
      } else toast.error(res.error ?? "That did not work.");
    });
  }

  if (confirm) {
    return (
      <span className="fj-confirm-inline">
        <BrandButton size="sm" variant="ghost" disabled={pending} onClick={() => setConfirm(false)}>
          Keep
        </BrandButton>
        <BrandButton
          size="sm"
          className="fj-button--danger"
          disabled={pending}
          onClick={() =>
            start(async () => {
              const res = await deleteRuleAction(organizationId, ruleId);
              if (res.ok) {
                toast.success("Rule deleted.");
                router.refresh();
              } else toast.error(res.error ?? "That did not work.");
            })
          }
        >
          Delete
        </BrandButton>
      </span>
    );
  }

  return (
    <span className="fj-rule-row__actions">
      <BrandButton size="sm" variant="ghost" disabled={pending} onClick={toggle}>
        {status === "active" ? "Disable" : "Enable"}
      </BrandButton>
      <BrandButton size="sm" variant="ghost" disabled={pending} onClick={() => setConfirm(true)}>
        Delete
      </BrandButton>
    </span>
  );
}
