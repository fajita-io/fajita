"use client";

import { useMemo, useState } from "react";
import { useRouter } from "next/navigation";

import { BrandButton, BrandButtonLink } from "@/components/design-system/primitives";
import { BrandIcon, type BrandIconName } from "@/components/design-system/icons";
import { saveOnboardingContextAction } from "@/lib/app/actions/onboarding";
import {
  FIRST_CONCERN_OPTIONS,
  RESPONSIBILITY_ROLES,
  USE_CASE_OPTIONS,
  recommendMonitor,
} from "@/lib/onboarding/definitions";
import { useToast } from "../toast";

export interface FirstSessionInitial {
  useCase: string;
  firstConcern: string;
  responsibilityRole: string;
}

const TYPE_SEGMENT: Record<string, string> = {
  https: "website",
  api: "api",
  ssl: "ssl",
  heartbeat: "heartbeat",
};

const TYPE_ICON: Record<string, BrandIconName> = {
  https: "monitor-http",
  api: "monitor-api",
  ssl: "monitor-ssl",
  heartbeat: "monitor-cron",
};

export function FirstSession({
  organizationId,
  canCreateMonitor,
  initial,
}: {
  organizationId: string;
  canCreateMonitor: boolean;
  initial: FirstSessionInitial;
}) {
  const router = useRouter();
  const toast = useToast();
  const [useCase, setUseCase] = useState(initial.useCase);
  const [concern, setConcern] = useState(initial.firstConcern);
  const [role, setRole] = useState(initial.responsibilityRole);
  const [pending, setPending] = useState(false);

  const recommendation = useMemo(
    () => recommendMonitor(concern || null, useCase || null),
    [concern, useCase],
  );
  const segment = TYPE_SEGMENT[recommendation.monitorType] ?? "website";

  async function save(): Promise<boolean> {
    const result = await saveOnboardingContextAction(organizationId, {
      useCase: useCase || undefined,
      firstConcern: concern || undefined,
      responsibilityRole: role || undefined,
    });
    if (!result.ok) {
      toast.show(result.error, "error");
      return false;
    }
    return true;
  }

  async function onCreateMonitor() {
    if (pending) return;
    setPending(true);
    await save();
    setPending(false);
    router.push(`/app/monitors/new/${segment}`);
  }

  async function onFinishLater() {
    if (pending) return;
    setPending(true);
    await save();
    setPending(false);
    router.push("/app");
    router.refresh();
  }

  return (
    <div className="fj-onboard">
      <fieldset className="fj-onboard__field">
        <legend>What are you responsible for?</legend>
        <div className="fj-onboard__options">
          {USE_CASE_OPTIONS.map((option) => (
            <button
              key={option}
              type="button"
              className="fj-onboard__chip"
              data-selected={useCase === option || undefined}
              aria-pressed={useCase === option}
              onClick={() => setUseCase(useCase === option ? "" : option)}
            >
              {option}
            </button>
          ))}
        </div>
      </fieldset>

      <fieldset className="fj-onboard__field">
        <legend>What do you want to catch first?</legend>
        <div className="fj-onboard__options">
          {FIRST_CONCERN_OPTIONS.map((option) => (
            <button
              key={option.key}
              type="button"
              className="fj-onboard__chip"
              data-selected={concern === option.key || undefined}
              aria-pressed={concern === option.key}
              onClick={() =>
                setConcern(concern === option.key ? "" : option.key)
              }
            >
              {option.label}
            </button>
          ))}
        </div>
      </fieldset>

      <fieldset className="fj-onboard__field">
        <legend>Your role, if you want guidance tuned to it</legend>
        <div className="fj-onboard__options">
          {RESPONSIBILITY_ROLES.map((option) => (
            <button
              key={option.key}
              type="button"
              className="fj-onboard__chip"
              data-selected={role === option.key || undefined}
              aria-pressed={role === option.key}
              onClick={() => setRole(role === option.key ? "" : option.key)}
            >
              {option.label}
            </button>
          ))}
        </div>
      </fieldset>

      <div className="fj-onboard__field" aria-live="polite">
        <div
          style={{
            display: "flex",
            gap: "var(--space-3)",
            alignItems: "flex-start",
            padding: "var(--space-4)",
            border: "1px solid var(--color-border)",
            borderRadius: "var(--radius-md)",
          }}
        >
          <span aria-hidden="true" style={{ color: "var(--color-accent)" }}>
            <BrandIcon
              name={TYPE_ICON[recommendation.monitorType] ?? "monitor-http"}
              size={22}
            />
          </span>
          <span>
            <strong style={{ display: "block" }}>
              Recommended first monitor: {recommendation.title}
            </strong>
            <span style={{ color: "var(--color-text-muted)" }}>
              {recommendation.reason} Fajita tests the setup before monitoring
              begins; nothing goes live until the test passes or you accept the
              result.
            </span>
          </span>
        </div>
      </div>

      <div className="fj-onboard__actions">
        {canCreateMonitor ? (
          <BrandButton onClick={onCreateMonitor} disabled={pending}>
            {pending ? "Saving..." : "Create first monitor"}
          </BrandButton>
        ) : (
          <BrandButtonLink href="/app/monitors">
            View monitors
          </BrandButtonLink>
        )}
        <BrandButton variant="ghost" onClick={onFinishLater} disabled={pending}>
          Finish later
        </BrandButton>
      </div>
      <p className="fj-onboard__note">
        Both questions are optional; they only shape the recommendations.
        Nothing here starts monitoring, and the whole app stays open either
        way. Setup usually takes under three minutes.
      </p>
    </div>
  );
}
