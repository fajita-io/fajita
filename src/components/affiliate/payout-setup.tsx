"use client";

import { useEffect, useState, useTransition } from "react";
import { useRouter } from "next/navigation";

import { BrandButton } from "@/components/design-system/primitives";
import {
  refreshPayoutStatusAction,
  startPayoutSetupAction,
} from "@/lib/affiliates/actions/payouts";

interface PayoutSetupProps {
  connectConfigured: boolean;
  enabled: boolean;
  accountStatus: string;
  /** True when the page was reached returning from Stripe onboarding. */
  justReturned: boolean;
  canManage: boolean;
}

const STATUS_LABEL: Record<string, string> = {
  none: "Not started",
  onboarding: "In progress",
  restricted: "Needs attention",
  enabled: "Ready",
  disabled: "Disabled",
  deauthorized: "Disconnected",
};

export function PayoutSetup({
  connectConfigured,
  enabled,
  accountStatus,
  justReturned,
  canManage,
}: PayoutSetupProps) {
  const router = useRouter();
  const [pending, startTransition] = useTransition();
  const [message, setMessage] = useState<string | null>(null);

  // Reconcile status when returning from Stripe onboarding.
  useEffect(() => {
    if (!justReturned || !canManage) return;
    startTransition(async () => {
      const result = await refreshPayoutStatusAction();
      if (result.ok) router.refresh();
    });
  }, [justReturned, canManage, router]);

  if (!connectConfigured) {
    return (
      <div className="fj-payout-setup">
        <p className="fj-body-sm">
          Payouts are settled by our team while automated payouts finish coming
          online. Reach your payable balance and we handle the rest. You will
          get a statement for every payment.
        </p>
      </div>
    );
  }

  if (enabled) {
    return (
      <div className="fj-payout-setup">
        <p className="fj-body-sm">
          Your payout account is ready. Payments arrive after each payout run
          once you clear the minimum.
        </p>
      </div>
    );
  }

  function start() {
    setMessage(null);
    startTransition(async () => {
      const result = await startPayoutSetupAction();
      if (!result.ok) {
        setMessage(result.error);
        return;
      }
      if (result.data?.url) {
        window.location.href = result.data.url;
      } else {
        setMessage("Payout setup is not available yet.");
      }
    });
  }

  function refresh() {
    startTransition(async () => {
      await refreshPayoutStatusAction();
      router.refresh();
    });
  }

  return (
    <div className="fj-payout-setup">
      <p className="fj-body-sm">
        Status: {STATUS_LABEL[accountStatus] ?? accountStatus}. Finish setup so
        we can pay you. Bank and tax details go straight to our payment
        processor. We never see or store them.
      </p>
      <div className="fj-payout-setup__actions">
        {canManage ? (
          <>
            <BrandButton type="button" onClick={start} disabled={pending}>
              {accountStatus === "onboarding" ? "Continue setup" : "Set up payouts"}
            </BrandButton>
            <BrandButton
              type="button"
              variant="secondary"
              onClick={refresh}
              disabled={pending}
            >
              Refresh status
            </BrandButton>
          </>
        ) : (
          <p className="fj-body-sm">
            Payout setup is available when your account is active.
          </p>
        )}
      </div>
      {message ? (
        <p className="fj-form-status fj-form-status--error" role="alert">
          {message}
        </p>
      ) : null}
    </div>
  );
}
