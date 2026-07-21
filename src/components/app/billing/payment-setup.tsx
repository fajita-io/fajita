"use client";

import { useEffect, useRef, useState } from "react";

import { BrandButton } from "@/components/design-system/primitives";
import { useToast } from "@/components/app/toast";
import { startCheckoutAction } from "@/lib/app/actions/billing";
import type { BillingInterval, PlanId } from "@/lib/stripe/plans";
import { PlanChooser, type PlanCardData } from "@/components/app/billing/plan-chooser";

export function PaymentSetup({
  organizationId,
  planKey,
  interval,
  plans,
}: {
  organizationId: string;
  planKey: PlanId | null;
  interval: BillingInterval;
  plans: PlanCardData[];
}) {
  const toast = useToast();
  const [error, setError] = useState<string | null>(null);
  const [retrying, setRetrying] = useState(false);
  const started = useRef(false);

  useEffect(() => {
    if (!planKey || started.current) return;
    started.current = true;

    void (async () => {
      try {
        const result = await startCheckoutAction(
          organizationId,
          planKey,
          interval,
        );
        if (!result.ok || !result.data?.url) {
          setError(result.ok ? "Could not start checkout." : result.error);
          started.current = false;
          return;
        }
        window.location.href = result.data.url;
      } catch {
        setError("Checkout did not open. Try again in a moment.");
        started.current = false;
      }
    })();
  }, [organizationId, planKey, interval]);

  async function retryCheckout() {
    if (!planKey || retrying) return;
    setRetrying(true);
    setError(null);
    try {
      const result = await startCheckoutAction(
        organizationId,
        planKey,
        interval,
      );
      if (!result.ok || !result.data?.url) {
        toast.error(result.ok ? "Could not start checkout." : result.error);
        return;
      }
      window.location.href = result.data.url;
    } catch {
      toast.error("Checkout did not open. Try again in a moment.");
    } finally {
      setRetrying(false);
    }
  }

  if (planKey) {
    return (
      <div className="fj-flow__card" style={{ display: "grid", gap: "var(--space-4)" }}>
        <h1 className="fj-flow__title">Secure your plan</h1>
        <p className="fj-flow__lede">
          {error
            ? "Checkout did not open. Try again, or pick a different plan below."
            : "Redirecting to Stripe to complete payment. This usually takes a moment."}
        </p>
        {error ? (
          <>
            <div style={{ display: "flex", gap: "var(--space-3)", flexWrap: "wrap" }}>
              <BrandButton onClick={retryCheckout} disabled={retrying}>
                {retrying ? "Opening checkout…" : "Try checkout again"}
              </BrandButton>
            </div>
            <PlanChooser
              organizationId={organizationId}
              canManage
              hasSubscription={false}
              currentPlanKey={null}
              currentInterval={null}
              plans={plans}
            />
          </>
        ) : null}
      </div>
    );
  }

  return (
    <div className="fj-flow__card" style={{ display: "grid", gap: "var(--space-4)" }}>
      <h1 className="fj-flow__title">Choose your plan</h1>
      <p className="fj-flow__lede">
        Every Fajita plan is paid. Pick the one that fits your stack, then
        continue to setup.
      </p>
      <PlanChooser
        organizationId={organizationId}
        canManage
        hasSubscription={false}
        currentPlanKey={null}
        currentInterval={null}
        plans={plans}
      />
    </div>
  );
}
