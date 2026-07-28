"use client";

import { useState } from "react";

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
  initialError = null,
  paymentsReady = true,
}: {
  organizationId: string;
  planKey: PlanId | null;
  interval: BillingInterval;
  plans: PlanCardData[];
  initialError?: string | null;
  paymentsReady?: boolean;
}) {
  const toast = useToast();
  const [error, setError] = useState<string | null>(initialError);
  const [retrying, setRetrying] = useState(false);

  const checkoutError = error ?? initialError;

  async function openCheckout() {
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
        const message = result.ok ? "Could not start checkout." : result.error;
        setError(message);
        toast.error(message);
        return;
      }
      window.location.href = result.data.url;
    } catch {
      const message = "Checkout did not open. Try again in a moment.";
      setError(message);
      toast.error(message);
    } finally {
      setRetrying(false);
    }
  }

  if (planKey) {
    return (
      <div className="fj-flow__card" style={{ display: "grid", gap: "var(--space-4)" }}>
        <h1 className="fj-flow__title">Secure your plan</h1>
        <p className="fj-flow__lede">
          {checkoutError
            ? "Checkout did not open. Try again, or pick a different plan below."
            : paymentsReady
              ? "Continue to Stripe to complete payment for your organization."
              : "Live card payments are still activating. Apply a promo code in Stripe if you have one. When the total is $0, subscribe without a card."}
        </p>
        {checkoutError ? (
          <p className="fj-form-status fj-form-status--error" role="alert">
            {checkoutError}
          </p>
        ) : null}
        <div style={{ display: "flex", gap: "var(--space-3)", flexWrap: "wrap" }}>
          <BrandButton onClick={openCheckout} disabled={retrying}>
            {retrying ? "Opening checkout…" : checkoutError ? "Try checkout again" : "Continue to checkout"}
          </BrandButton>
        </div>
        {checkoutError ? (
          <PlanChooser
            organizationId={organizationId}
            canManage
            hasSubscription={false}
            currentPlanKey={null}
            currentInterval={null}
            plans={plans}
          />
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
