import type { Metadata } from "next";

import { DomainsManager } from "@/components/app/status-pages/domains-manager";
import { requireStatusPage } from "@/lib/app/status-page-context";
import { hostedSubdomain } from "@/lib/status-pages/config";
import { listDomains } from "@/lib/status-pages/domains";

export const metadata: Metadata = {
  title: "Status page domain",
  robots: { index: false, follow: false },
};

export default async function DomainPage({
  params,
}: {
  params: Promise<{ statusPageId: string }>;
}) {
  const { statusPageId } = await params;
  const ctx = await requireStatusPage(statusPageId);
  const domains = await listDomains(ctx.organizationId, statusPageId);

  return (
    <DomainsManager
      organizationId={ctx.organizationId}
      statusPageId={statusPageId}
      hostedDomain={hostedSubdomain(ctx.statusPage.slug)}
      domains={domains}
      canManage={ctx.canPublish}
    />
  );
}
