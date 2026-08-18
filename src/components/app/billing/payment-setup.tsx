"use client";

import { useEffect, useState } from "react";

import { BrandButton } from "@/components/design-system/primitives";
import { useToast } from "@/components/app/toast";
import { startCheckoutAction } from "@/lib/app/actions/billing";
import { redeemPromoCodeAction } from "@/lib/app/actions/promo";
import type { BillingInterval, PlanId } from "@/lib/stripe/plans";
import { PlanChooser, type PlanCardData } from "@/components/app/billing/plan-chooser";

export function PaymentSetup({
  organizationId,
  planKey,
  interval,
  plans,
  initialError = null,
  initialCheckoutUrl = null,
  paymentsReady = true,
}: {
  organizationId: string;
  planKey: PlanId | null;
  interval: BillingInterval;
  plans: PlanCardData[];
  initialError?: string | null;
  initialCheckoutUrl?: string | null;
  paymentsReady?: boolean;
}) {
  const toast = useToast();
  const [error, setError] = useState<string | null>(initialError);
  const [retrying, setRetrying] = useState(false);
  const [redirecting, setRedirecting] = useState(Boolean(initialCheckoutUrl));
  const [promoCode, setPromoCode] = useState("");
  const [promoBusy, setPromoBusy] = useState(false);

  const checkoutError = error ?? initialError;

  useEffect(() => {
    if (!initialCheckoutUrl) return;
    window.location.assign(initialCheckoutUrl);
  }, [initialCheckoutUrl]);

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


  async function redeemPromo() {
    if (!promoCode.trim() || promoBusy) return;
    setPromoBusy(true);
    setError(null);
    try {
      const result = await redeemPromoCodeAction(organizationId, promoCode);
      if (!result.ok) {
        setError(result.error);
        toast.error(result.error);
        return;
      }
      toast.success("Code applied. Continuing to setup.");
      window.location.assign("/app/onboarding");
    } catch {
      const message = "That code could not be applied. Try again.";
      setError(message);
      toast.error(message);
    } finally {
      setPromoBusy(false);
    }
  }

  if (planKey) {
    return (
      <div className="fj-flow__card" style={{ display: "grid", gap: "var(--space-4)" }}>
        <h1 className="fj-flow__title">Secure your plan</h1>
        <p className="fj-flow__lede">
          {redirecting && !checkoutError
            ? "Opening Stripe checkout…"
            : checkoutError
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
          <BrandButton
            onClick={openCheckout}
            disabled={retrying || (redirecting && !checkoutError)}
          >
            {retrying || (redirecting && !checkoutError)
              ? "Opening checkout…"
              : checkoutError
                ? "Try checkout again"
                : "Continue to checkout"}
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

      <div style={{ display: "grid", gap: "var(--space-2)" }}>
        <label htmlFor="fajita-promo-code" className="fj-body-sm">
          Have a code?
        </label>
        <div style={{ display: "flex", gap: "var(--space-3)", flexWrap: "wrap" }}>
          <input
            id="fajita-promo-code"
            name="promoCode"
            autoComplete="off"
            spellCheck={false}
            value={promoCode}
            onChange={(event) => setPromoCode(event.target.value)}
            placeholder="Enter code"
            className="fj-input"
            style={{ minWidth: "12rem", flex: "1 1 12rem" }}
          />
          <BrandButton
            type="button"
            onClick={redeemPromo}
            disabled={promoBusy || !promoCode.trim()}
          >
            {promoBusy ? "Applying…" : "Apply code"}
          </BrandButton>
        </div>
      </div>
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

      <div style={{ display: "grid", gap: "var(--space-2)" }}>
        <label htmlFor="fajita-promo-code" className="fj-body-sm">
          Have a code?
        </label>
        <div style={{ display: "flex", gap: "var(--space-3)", flexWrap: "wrap" }}>
          <input
            id="fajita-promo-code"
            name="promoCode"
            autoComplete="off"
            spellCheck={false}
            value={promoCode}
            onChange={(event) => setPromoCode(event.target.value)}
            placeholder="Enter code"
            className="fj-input"
            style={{ minWidth: "12rem", flex: "1 1 12rem" }}
          />
          <BrandButton
            type="button"
            onClick={redeemPromo}
            disabled={promoBusy || !promoCode.trim()}
          >
            {promoBusy ? "Applying…" : "Apply code"}
          </BrandButton>
        </div>
      </div>
    </div>
  );
}
