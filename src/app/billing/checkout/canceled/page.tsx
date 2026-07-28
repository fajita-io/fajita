import type { Metadata } from "next";

import { BrandButtonLink } from "@/components/design-system/primitives";
import { getCurrentProfile } from "@/lib/auth/context";
import { buildPaymentSetupUrl } from "@/lib/auth/paid-signup-flow";
import { isBillingInterval, isPlanId } from "@/lib/stripe/plans";
import { serviceClient } from "@/lib/supabase/service";

export const metadata: Metadata = {
  title: "Checkout canceled",
  robots: { index: false, follow: false },
};

async function resolveRetryUrl(intentId: string | undefined, profileId: string) {
  if (!intentId) return "/app/start/payment";
  try {
    const db = serviceClient();
    const { data: intent } = await db
      .from("billing_checkout_intents")
      .select("organization_id, plan_key, billing_interval")
      .eq("id", intentId)
      .maybeSingle();
    if (!intent) return "/app/start/payment";

    const { data: membership } = await db
      .from("organization_members")
      .select("id")
      .eq("organization_id", intent.organization_id)
      .eq("user_id", profileId)
      .eq("status", "active")
      .maybeSingle();
    if (!membership) return "/app/settings/billing/plans";

    const plan =
      intent.plan_key && isPlanId(intent.plan_key) ? intent.plan_key : undefined;
    const interval =
      intent.billing_interval && isBillingInterval(intent.billing_interval)
        ? intent.billing_interval
        : undefined;
    return buildPaymentSetupUrl(plan, interval);
  } catch (error) {
    console.error("[checkout canceled] resolveRetryUrl failed", error);
    return "/app/start/payment";
  }
}

export default async function CheckoutCanceledPage({
  searchParams,
}: {
  searchParams: Promise<{ intent?: string }>;
}) {
  const { intent } = await searchParams;
  const profile = await getCurrentProfile();
  const retryHref = profile
    ? await resolveRetryUrl(intent, profile.id)
    : "/signup";

  return (
    <main
      className="fj-checkout-return"
      style={{ maxWidth: 560, margin: "0 auto", padding: "var(--space-8) var(--space-4)" }}
    >
      <div className="fj-notice" style={{ display: "grid", gap: "var(--space-4)" }}>
        <h1 style={{ margin: 0 }}>Checkout canceled</h1>
        <p style={{ margin: 0 }}>
          No charge was completed and your current plan is unchanged. You can
          pick a plan whenever you are ready.
        </p>
        <div style={{ display: "flex", gap: "var(--space-3)", flexWrap: "wrap" }}>
          <BrandButtonLink href={retryHref}>Try checkout again</BrandButtonLink>
          <BrandButtonLink href="/app/settings/billing/plans" variant="secondary">
            Compare plans
          </BrandButtonLink>
        </div>
      </div>
    </main>
  );
}
