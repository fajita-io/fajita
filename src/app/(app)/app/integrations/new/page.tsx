import type { Metadata } from "next";
import Link from "next/link";
import { notFound } from "next/navigation";

import { BrandIcon } from "@/components/design-system/icons";
import { AppSection, PageHeader } from "@/components/app/ui";
import { ChannelCreateForm } from "@/components/app/alerts/channel-create-form";
import { requireAlertsPage } from "@/lib/alerts/alerts-page";
import { ALERT_PROVIDERS, type AlertProvider } from "@/lib/alerts/constants";
import { getOrgEntitlements } from "@/lib/billing/engine";
import { enabledAlertProviders } from "@/lib/billing/product-access";

export const metadata: Metadata = {
  title: "Add alert channel",
  robots: { index: false, follow: false },
};

export default async function NewChannelPage({
  searchParams,
}: {
  searchParams: Promise<{ provider?: string }>;
}) {
  const ctx = await requireAlertsPage();
  if (!ctx.canManageAlerts) notFound();

  const { provider } = await searchParams;
  const entitlements = await getOrgEntitlements(ctx.organizationId);
  const enabledProviders = enabledAlertProviders(entitlements);
  const initial = ALERT_PROVIDERS.includes(provider as AlertProvider) ? (provider as AlertProvider) : undefined;

  return (
    <div className="fj-alerts">
      <Link className="fj-back-link" href="/app/integrations">
        <BrandIcon name="chevron-right" size={14} className="fj-flip-up" /> Integrations
      </Link>

      <PageHeader
        title="Add alert channel"
        description="Pick where alerts should go. You will test it before any real alert is sent."
      />

      <AppSection>
        <ChannelCreateForm organizationId={ctx.organizationId} initialProvider={initial} enabledProviders={enabledProviders} />
      </AppSection>
    </div>
  );
}
