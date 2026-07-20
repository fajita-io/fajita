"use client";

import { useState } from "react";
import Link from "next/link";
import { useRouter } from "next/navigation";

import { BrandButton } from "@/components/design-system/primitives";
import { activateAffiliateAction } from "@/lib/affiliates/actions/activate";
import {
  commissionRatePercentLabel,
  activeTerms,
} from "@/lib/affiliates/config";

const terms = activeTerms();

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
    <form className="fj-form" onSubmit={onSubmit}>
      <div className="fj-affiliate__stats">
        <div className="fj-affiliate__stat">
          <span className="fj-affiliate__stat-value">
            {commissionRatePercentLabel()}
          </span>
          <span className="fj-affiliate__stat-label">Recurring commission</span>
        </div>
        <div className="fj-affiliate__stat">
          <span className="fj-affiliate__stat-value">
            {terms.recurringEligibilityMonths} mo
          </span>
          <span className="fj-affiliate__stat-label">Per referral</span>
        </div>
        <div className="fj-affiliate__stat">
          <span className="fj-affiliate__stat-value">
            {terms.attributionWindowDays} days
          </span>
          <span className="fj-affiliate__stat-label">Attribution window</span>
        </div>
      </div>

      <label className="fj-checkbox">
        <input type="checkbox" name="acceptTerms" required />
        <span>
          I agree to the{" "}
          <Link href="/legal/affiliate-agreement">Affiliate Program Agreement</Link>{" "}
          and{" "}
          <Link href="/legal/affiliate-privacy">Affiliate Privacy Notice</Link>.
          Income is not guaranteed.
        </span>
      </label>

      {status.kind === "failed" ? (
        <p className="fj-form-error" role="alert">
          {status.detail}
        </p>
      ) : null}

      <BrandButton type="submit" disabled={status.kind === "working"}>
        {status.kind === "working" ? "Setting up your link…" : "Get my referral link"}
      </BrandButton>
    </form>
  );
}
