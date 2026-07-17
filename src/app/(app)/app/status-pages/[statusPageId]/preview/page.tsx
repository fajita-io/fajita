import type { Metadata } from "next";

import "@/app/(status)/status-page.css";
import { AppSection } from "@/components/app/ui";
import { StatusPageView } from "@/components/status-public/status-page-view";
import { requireStatusPage } from "@/lib/app/status-page-context";
import { buildSnapshotData } from "@/lib/status-pages/projection";

export const metadata: Metadata = {
  title: "Status page preview",
  robots: { index: false, follow: false },
};

export default async function PreviewPage({
  params,
}: {
  params: Promise<{ statusPageId: string }>;
}) {
  const { statusPageId } = await params;
  const ctx = await requireStatusPage(statusPageId);
  const built = await buildSnapshotData(ctx.organizationId, statusPageId);

  return (
    <AppSection
      title="Preview"
      description="This reflects your current draft using live component data. Publish to make it public."
    >
      {built ? (
        <div className="sp-root sp-preview" data-theme={ctx.statusPage.themeKey}>
          <StatusPageView
            data={built.data}
            basePath={`/status/${ctx.statusPage.slug}`}
            generatedAt={new Date().toISOString()}
          />
        </div>
      ) : (
        <p style={{ margin: 0, color: "var(--color-text-muted)" }}>
          Add at least one component to preview the page.
        </p>
      )}
    </AppSection>
  );
}
