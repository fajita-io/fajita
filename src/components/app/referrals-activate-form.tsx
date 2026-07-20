"use client";

import { useState } from "react";
import Link from "next/link";
import { useRouter } from "next/navigation";

import { ReferralStatGrid } from "@/components/app/referrals/referral-stat-grid";
import { BrandButton } from "@/components/design-system/primitives";
import { activateAffiliateAction } from "@/lib/affiliates/actions/activate";
import {
  commissionRatePercentLabel,
  activeTerms,
} from "@/lib/affiliates/config";

const terms = activeTerms();

const activationStats = [
  { value: commissionRatePercentLabel(), label: "Recurring commission" },
  {
    value: `${terms.recurringEligibilityMonths} mo`,
    label: "Per referral",
  },
  {
    value: `${terms.attributionWindowDays} days`,
    label: "Attribution window",
  },
] as const;

/**
 * One-step affiliate activation from the in-app referrals page. Accepts program
 * terms, provisions the account, and applies the default referral link.
 */
export function ReferralsActivateForm() {
  const router = useRouter();
  const [status, setStatus] = useState<
    | { kind: "idle" }
    | { kind: "working" }
    | { kind: "failed"; detail: string }
  >({ kind: "idle" });

  const onSubmit = async (e: React.FormEvent<HTMLFormElement>) => {
    e.preventDefault();
    const form = e.currentTarget;
    const data = new FormData(form);
    setStatus({ kind: "working" });

    const result = await activateAffiliateAction({
      acceptTerms: data.get("acceptTerms") === "on" ? true : (false as never),
    });

    if (result.ok) {
      router.refresh();
      return;
    }

    setStatus({ kind: "failed", detail: result.error });
  };

  return (
    <form className="fj-referrals-activate" onSubmit={onSubmit}>
      <ReferralStatGrid stats={[...activationStats]} />

      <div className="fj-referrals-activate__terms">
        <label className="fj-check">
          <input type="checkbox" name="acceptTerms" required />
          <span>
            I agree to the{" "}
            <Link href="/legal/affiliate-agreement">Affiliate Program Agreement</Link>{" "}
            and{" "}
            <Link href="/legal/affiliate-privacy">Affiliate Privacy Notice</Link>.
            Income is not guaranteed.
          </span>
        </label>
      </div>

      {status.kind === "failed" ? (
        <p className="fj-form-status fj-form-status--error" role="alert">
          {status.detail}
        </p>
      ) : null}

      <div className="fj-referrals-activate__action">
        <BrandButton type="submit" disabled={status.kind === "working"}>
          {status.kind === "working" ? "Setting up your link…" : "Get my referral link"}
        </BrandButton>
      </div>
    </form>
  );
}
