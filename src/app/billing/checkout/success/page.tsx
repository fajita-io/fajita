import type { Metadata } from "next";

import { BrandButtonLink } from "@/components/design-system/primitives";
import { CheckoutPoller } from "@/components/app/billing/checkout-poller";
import { getCurrentProfile } from "@/lib/auth/context";
import { serviceClient } from "@/lib/supabase/service";
import { computeOrgBillingState } from "@/lib/billing/engine";
import { BILLING_CATALOG } from "@/lib/billing/catalog";

export const metadata: Metadata = {
  title: "Confirming your subscription",
  robots: { index: false, follow: false },
};

async function resolveState(intentId: string | undefined, profileId: string) {
  if (!intentId) return null;
  const db = serviceClient();
  const { data: intent } = await db
    .from("billing_checkout_intents")
    .select("organization_id, plan_key")
    .eq("id", intentId)
    .maybeSingle();
  if (!intent) return null;

  // Verify the caller belongs to the intent's organization before revealing.
  const { data: membership } = await db
    .from("organization_members")
    .select("id")
    .eq("organization_id", intent.organization_id)
    .eq("user_id", profileId)
    .eq("status", "active")
    .maybeSingle();
  if (!membership) return null;

  const state = await computeOrgBillingState(intent.organization_id);
  return { state, planKey: intent.plan_key as keyof typeof BILLING_CATALOG };
}

export default async function CheckoutSuccessPage({
  searchParams,
}: {
  searchParams: Promise<{ intent?: string }>;
}) {
  const { intent } = await searchParams;
  const profile = await getCurrentProfile();

  const resolved = profile ? await resolveState(intent, profile.id) : null;
  const active =
    resolved != null &&
    ["active", "trialing", "cancellation_scheduled"].includes(
      resolved.state.status,
    );
  const planName = resolved?.planKey
    ? BILLING_CATALOG[resolved.planKey]?.name
    : null;

  return (
    <main className="fj-checkout-return" style={{ maxWidth: 560, margin: "0 auto", padding: "var(--space-8) var(--space-4)" }}>
      <CheckoutPoller done={active} />
      <div className="fj-notice" style={{ display: "grid", gap: "var(--space-4)" }}>
        {active ? (
          <>
            <h1 style={{ margin: 0 }}>You are all set</h1>
            <p style={{ margin: 0 }}>
              Your{planName ? ` ${planName}` : ""} subscription is active. Full
              Fajita access is ready.
            </p>
          </>
        ) : (
          <>
            <h1 style={{ margin: 0 }}>Confirming your subscription</h1>
            <p style={{ margin: 0 }}>
              Stripe accepted the checkout. Fajita is confirming your
              subscription. This usually takes a few seconds. This page updates
              on its own.
            </p>
          </>
        )}
        <div style={{ display: "flex", gap: "var(--space-3)", flexWrap: "wrap" }}>
          <BrandButtonLink href="/app">Continue to Fajita</BrandButtonLink>
          <BrandButtonLink href="/app/settings/billing" variant="secondary">
            Go to billing
          </BrandButtonLink>
        </div>
      </div>
    </main>
  );
}
