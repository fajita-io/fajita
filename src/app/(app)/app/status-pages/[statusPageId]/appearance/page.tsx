import type { Metadata } from "next";

import { AppSection } from "@/components/app/ui";
import { AppearanceEditor } from "@/components/app/status-pages/appearance-editor";
import { requireStatusPage } from "@/lib/app/status-page-context";

export const metadata: Metadata = {
  title: "Status page appearance",
  robots: { index: false, follow: false },
};

export default async function AppearancePage({
  params,
}: {
  params: Promise<{ statusPageId: string }>;
}) {
  const { statusPageId } = await params;
  const ctx = await requireStatusPage(statusPageId);

  return (
    <AppSection
      title="Appearance"
      description="Pick a theme and accent that match your brand. Fajita keeps the layout calm and status semantics untouched."
    >
      <AppearanceEditor
        organizationId={ctx.organizationId}
        statusPageId={statusPageId}
        themeKey={ctx.statusPage.themeKey}
        appearance={ctx.statusPage.appearance}
        canManage={ctx.canManage}
      />
    </AppSection>
  );
}
