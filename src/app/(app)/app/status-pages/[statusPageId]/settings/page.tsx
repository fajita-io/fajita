import type { Metadata } from "next";

import { SettingsEditor } from "@/components/app/status-pages/settings-editor";
import { requireStatusPage } from "@/lib/app/status-page-context";

export const metadata: Metadata = {
  title: "Status page settings",
  robots: { index: false, follow: false },
};

export default async function SettingsPage({
  params,
}: {
  params: Promise<{ statusPageId: string }>;
}) {
  const { statusPageId } = await params;
  const ctx = await requireStatusPage(statusPageId);

  return (
    <SettingsEditor
      organizationId={ctx.organizationId}
      statusPageId={statusPageId}
      page={ctx.statusPage}
      canManage={ctx.canManage}
      canPublish={ctx.canPublish}
      isPlatformAdmin={ctx.isPlatformAdmin}
    />
  );
}
