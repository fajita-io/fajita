"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import Link from "next/link";

import { BrandIcon } from "@/components/design-system/icons";
import {
  dismissChecklistAction,
  reopenChecklistAction,
  skipChecklistStepAction,
} from "@/lib/app/actions/onboarding";
import { useToast } from "../toast";

export interface ChecklistStepView {
  key: string;
  title: string;
  description: string;
  done: boolean;
  optional?: boolean;
  skipped?: boolean;
  href?: string;
  /** False when the viewer lacks the permission for the step's action. */
  actionable: boolean;
  /** Explains why the step is unavailable to this viewer, when it is. */
  unavailableReason?: string;
}

function StepRow({
  step,
  pending,
  onSkip,
}: {
  step: ChecklistStepView;
  pending: boolean;
  onSkip: (key: string) => void;
}) {
  const body = (
    <>
      <span
        className="fj-checklist__mark"
        data-done={step.done || undefined}
        aria-hidden="true"
      >
        {step.done ? <BrandIcon name="check" size={14} /> : null}
      </span>
      <span className="fj-checklist__text">
        <span className="fj-checklist__title">
          {step.title}
          {step.done ? (
            <span className="fj-visually-hidden"> (done)</span>
          ) : step.skipped ? (
            <span className="fj-visually-hidden"> (skipped)</span>
          ) : null}
        </span>
        <span className="fj-checklist__desc">
          {step.unavailableReason ?? step.description}
        </span>
      </span>
      {step.optional && !step.done ? (
        <span className="fj-checklist__badge fj-role-badge">
          {step.skipped ? "Skipped" : "Optional"}
        </span>
      ) : null}
    </>
  );

  return (
    <li className="fj-checklist__item">
      {step.href && step.actionable && !step.done ? (
        <Link
          href={step.href}
          className="fj-checklist__link"
          style={{ display: "contents", color: "inherit", textDecoration: "none" }}
        >
          {body}
        </Link>
      ) : (
        body
      )}
      {step.optional && !step.done && !step.skipped && step.actionable ? (
        <button
          type="button"
          className="fj-link-button"
          disabled={pending}
          onClick={() => onSkip(step.key)}
          aria-label={`Skip ${step.title}`}
        >
          Skip
        </button>
      ) : null}
    </li>
  );
}

export function ActivationChecklist({
  organizationId,
  steps,
  activated,
  canDismiss,
}: {
  organizationId: string;
  steps: ChecklistStepView[];
  activated: boolean;
  canDismiss: boolean;
}) {
  const router = useRouter();
  const toast = useToast();
  const [pending, setPending] = useState(false);

  const core = steps.filter((s) => !s.optional);
  const optional = steps.filter((s) => s.optional);
  const remaining = core.filter((s) => !s.done).length;

  async function skip(key: string) {
    if (pending) return;
    setPending(true);
    const result = await skipChecklistStepAction(organizationId, key);
    setPending(false);
    if (!result.ok) {
      toast.show(result.error, "error");
      return;
    }
    router.refresh();
  }

  async function dismiss() {
    if (pending) return;
    setPending(true);
    const result = await dismissChecklistAction(organizationId);
    setPending(false);
    if (!result.ok) {
      toast.show(result.error, "error");
      return;
    }
    toast.success("Checklist hidden. Reopen it anytime from Settings.");
    router.refresh();
  }

  return (
    <div>
      <p
        className="fj-app-section__desc"
        role="status"
        style={{ marginBottom: "var(--space-3)" }}
      >
        {activated
          ? "Everything is connected. Monitor, alert path, and status page are all live."
          : remaining === 1
            ? "1 core step remaining."
            : `${remaining} core steps remaining.`}
      </p>
      <ul className="fj-checklist">
        {core.map((step) => (
          <StepRow key={step.key} step={step} pending={pending} onSkip={skip} />
        ))}
      </ul>
      {optional.length > 0 ? (
        <>
          <h3
            style={{
              font: "inherit",
              fontWeight: 600,
              margin: "var(--space-4) 0 var(--space-2)",
            }}
          >
            Worth doing when you have a minute
          </h3>
          <ul className="fj-checklist">
            {optional.map((step) => (
              <StepRow
                key={step.key}
                step={step}
                pending={pending}
                onSkip={skip}
              />
            ))}
          </ul>
        </>
      ) : null}
      {activated && canDismiss ? (
        <div style={{ marginTop: "var(--space-3)" }}>
          <button
            type="button"
            className="fj-link-button"
            disabled={pending}
            onClick={dismiss}
          >
            Hide this checklist
          </button>
        </div>
      ) : null}
    </div>
  );
}

/** Small settings control to bring a dismissed checklist back. */
export function ReopenChecklistButton({
  organizationId,
}: {
  organizationId: string;
}) {
  const router = useRouter();
  const toast = useToast();
  const [pending, setPending] = useState(false);

  return (
    <button
      type="button"
      className="fj-link-button"
      disabled={pending}
      onClick={async () => {
        setPending(true);
        const result = await reopenChecklistAction(organizationId);
        setPending(false);
        if (!result.ok) {
          toast.show(result.error, "error");
          return;
        }
        toast.success("Checklist reopened on the overview page.");
        router.refresh();
      }}
    >
      Reopen setup checklist
    </button>
  );
}
