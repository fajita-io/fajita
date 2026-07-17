"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";

import { BrandButton, BrandCard } from "@/components/design-system/primitives";
import { useToast } from "@/components/app/toast";
import {
  changePlanAction,
  startCheckoutAction,
} from "@/lib/app/actions/billing";

export interface PlanCardData {
  key: string;
  name: string;
  description: string;
  highlights: string[];
}

export function PlanChooser({
  organizationId,
  canManage,
  hasSubscription,
  currentPlanKey,
  currentInterval,
  plans,
}: {
  organizationId: string;
  canManage: boolean;
  hasSubscription: boolean;
  currentPlanKey: string | null;
  currentInterval: "month" | "year" | null;
  plans: PlanCardData[];
}) {
  const router = useRouter();
  const toast = useToast();
  const [interval, setInterval] = useState<"month" | "year">(
    currentInterval ?? "month",
  );
  const [busyKey, setBusyKey] = useState<string | null>(null);

  async function choose(planKey: string) {
    if (!canManage) {
      toast.error("You do not have permission to change billing.");
      return;
    }
    if (busyKey) return;
    setBusyKey(planKey);

    const result = hasSubscription
      ? await changePlanAction(organizationId, planKey, interval)
      : await startCheckoutAction(organizationId, planKey, interval);

    setBusyKey(null);

    if (!result.ok) {
      toast.error(result.error);
      return;
    }

    if ("url" in (result.data ?? {})) {
      window.location.href = (result.data as { url: string }).url;
      return;
    }

    const effect = (result.data as { effect?: string } | undefined)?.effect;
    if (effect === "scheduled") {
      toast.success("Downgrade scheduled for the end of your billing period.");
    } else {
      toast.success("Plan updated.");
    }
    router.refresh();
  }

  return (
    <div>
      <div
        role="group"
        aria-label="Billing interval"
        className="fj-interval-toggle"
        style={{ display: "inline-flex", gap: "var(--space-2)", marginBottom: "var(--space-5)" }}
      >
        <BrandButton
          variant={interval === "month" ? "primary" : "secondary"}
          size="sm"
          onClick={() => setInterval("month")}
          aria-pressed={interval === "month"}
        >
          Monthly
        </BrandButton>
        <BrandButton
          variant={interval === "year" ? "primary" : "secondary"}
          size="sm"
          onClick={() => setInterval("year")}
          aria-pressed={interval === "year"}
        >
          Annual
        </BrandButton>
      </div>

      <div
        className="fj-plan-grid"
        style={{
          display: "grid",
          gap: "var(--space-4)",
          gridTemplateColumns: "repeat(auto-fit, minmax(240px, 1fr))",
        }}
      >
        {plans.map((plan) => {
          const isCurrent =
            plan.key === currentPlanKey && interval === currentInterval;
          return (
            <BrandCard key={plan.key}>
              <div style={{ display: "grid", gap: "var(--space-3)" }}>
                <div>
                  <h3 style={{ margin: 0 }}>{plan.name}</h3>
                  <p className="fj-app-section__desc" style={{ margin: "var(--space-1) 0 0" }}>
                    {plan.description}
                  </p>
                </div>
                <ul className="fj-plan-highlights" style={{ margin: 0, paddingLeft: "1.1rem" }}>
                  {plan.highlights.map((h) => (
                    <li key={h}>{h}</li>
                  ))}
                </ul>
                <BrandButton
                  onClick={() => choose(plan.key)}
                  disabled={!canManage || isCurrent || busyKey !== null}
                  variant={isCurrent ? "secondary" : "primary"}
                >
                  {isCurrent
                    ? "Current plan"
                    : busyKey === plan.key
                      ? "Working…"
                      : hasSubscription
                        ? "Switch to this plan"
                        : "Start with this plan"}
                </BrandButton>
              </div>
            </BrandCard>
          );
        })}
      </div>
      <p className="fj-app-section__desc" style={{ marginTop: "var(--space-4)" }}>
        Upgrades take effect right away. Downgrades take effect at the end of your
        billing period, and your data is always preserved. Taxes may be calculated
        at checkout based on your billing information.
      </p>
    </div>
  );
}
