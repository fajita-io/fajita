import type { Metadata } from "next";
import { redirect } from "next/navigation";

import { redeemAppsumoLicenseAndContinueAction } from "@/lib/app/actions/appsumo";
import { resolveActiveOrg } from "@/lib/app/organizations";
import { readActiveOrgId } from "@/lib/app/active-org";
import { getCurrentProfile } from "@/lib/auth/context";
import { loadLicenseByKey } from "@/lib/appsumo/licenses";
import { PLANS } from "@/lib/stripe/plans";
import { shouldSkipPaymentStep } from "@/lib/billing/setup-access";
import { computeOrgBillingState } from "@/lib/billing/engine";

const APP_ORIGIN = (process.env.NEXT_PUBLIC_APP_URL ?? "https://fajita.io").replace(
  /\/$/,
  "",
);

export const metadata: Metadata = {
  title: "Activate your AppSumo license",
  robots: { index: false, follow: false },
};

export default async function AppsumoRedeemPage({
  searchParams,
}: {
  searchParams: Promise<{
    license_key?: string;
    error?: string;
    status?: string;
  }>;
}) {
  const params = await searchParams;
  const licenseKey = params.license_key?.trim();

  const profile = await getCurrentProfile();
  if (!profile || profile.deleted_at) {
    const loginUrl = new URL("/login", APP_ORIGIN);
    if (licenseKey) {
      loginUrl.searchParams.set(
        "redirect_url",
        `/app/start/appsumo?license_key=${encodeURIComponent(licenseKey)}`,
      );
    }
    redirect(loginUrl.pathname + loginUrl.search);
  }

  const oauthError = params.error === "oauth";
  const deactivated = params.status === "deactivated";

  let active;
  try {
    const requestedOrgId = await readActiveOrgId();
    active = await resolveActiveOrg(profile.id, requestedOrgId);
  } catch {
    active = null;
  }

  if (!active) {
    const next = licenseKey
      ? `/app/new-organization?source=appsumo&license_key=${encodeURIComponent(licenseKey)}`
      : "/app/new-organization?source=appsumo";
    redirect(next);
  }

  const billing = await computeOrgBillingState(active.organization.id).catch(
    (error) => {
      console.error("[appsumo redeem] billing state failed", error);
      return null;
    },
  );
  if (billing && shouldSkipPaymentStep(billing)) {
    redirect("/app/onboarding");
  }

  const license = licenseKey ? await loadLicenseByKey(licenseKey) : null;
  const planLabel =
    license && license.plan_key in PLANS
      ? PLANS[license.plan_key as keyof typeof PLANS].name
      : "AppSumo";

  async function activate() {
    "use server";
    if (!licenseKey) return;
    await redeemAppsumoLicenseAndContinueAction(
      active!.organization.id,
      licenseKey,
    );
  }

  return (
    <>
      <ol className="fj-flow__steps" aria-hidden="true">
        <li className="fj-flow__step" data-complete />
        <li className="fj-flow__step" data-active />
        <li className="fj-flow__step" />
      </ol>
      <div className="fj-flow__card" style={{ display: "grid", gap: "var(--space-4)" }}>
        <h1 className="fj-flow__title">Activate your AppSumo license</h1>

        {deactivated ? (
          <p className="fj-flow__lede">
            That license is no longer active. Contact support with your license
            key if you need help.
          </p>
        ) : oauthError ? (
          <p className="fj-flow__lede">
            We could not verify your AppSumo purchase. Start activation again
            from AppSumo, or contact support.
          </p>
        ) : !licenseKey ? (
          <p className="fj-flow__lede">
            Open your AppSumo receipt and click Activate to connect your license
            to Fajita.
          </p>
        ) : (
          <>
            <p className="fj-flow__lede">
              Link your AppSumo license to {active.organization.name}. You get{" "}
              {planLabel} access with no Stripe subscription required.
            </p>
            {params.error ? (
              <p role="alert" className="fj-flow__error">
                {params.error}
              </p>
            ) : null}
            <form action={activate}>
              <button type="submit" className="fj-btn fj-btn--primary">
                Activate license
              </button>
            </form>
          </>
        )}
      </div>
    </>
  );
}
