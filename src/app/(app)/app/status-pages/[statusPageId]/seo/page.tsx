import type { Metadata } from "next";

import { AppSection } from "@/components/app/ui";
import { SeoEditor } from "@/components/app/status-pages/seo-editor";
import { requireStatusPage } from "@/lib/app/status-page-context";

export const metadata: Metadata = {
  title: "Status page SEO",
  robots: { index: false, follow: false },
};

export default async function SeoPage({
  params,
}: {
  params: Promise<{ statusPageId: string }>;
}) {
  const { statusPageId } = await params;
  const ctx = await requireStatusPage(statusPageId);

  return (
    <AppSection
      title="Search visibility"
      description="Control what search engines can index. Password-protected and private pages are always noindex."
    >
      <SeoEditor
        organizationId={ctx.organizationId}
        statusPageId={statusPageId}
        page={ctx.statusPage}
        canManage={ctx.canManage}
      />
    </AppSection>
  );
}
