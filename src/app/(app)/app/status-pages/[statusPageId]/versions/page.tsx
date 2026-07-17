import type { Metadata } from "next";

import { VersionsManager } from "@/components/app/status-pages/versions-manager";
import { requireStatusPage } from "@/lib/app/status-page-context";
import { listVersions } from "@/lib/status-pages/versions";

export const metadata: Metadata = {
  title: "Status page versions",
  robots: { index: false, follow: false },
};

export default async function VersionsPage({
  params,
}: {
  params: Promise<{ statusPageId: string }>;
}) {
  const { statusPageId } = await params;
  const ctx = await requireStatusPage(statusPageId);
  const versions = await listVersions(ctx.organizationId, statusPageId);

  return (
    <VersionsManager
      organizationId={ctx.organizationId}
      statusPageId={statusPageId}
      versions={versions}
      publishedVersionId={ctx.statusPage.publishedVersionId}
      timezone={ctx.statusPage.timezone}
      locale={ctx.statusPage.locale}
      canPublish={ctx.canPublish}
    />
  );
}
