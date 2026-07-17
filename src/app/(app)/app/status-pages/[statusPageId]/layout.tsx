import type { ReactNode } from "react";

import { PageHeader } from "@/components/app/ui";
import { BrandButtonLink } from "@/components/design-system/primitives";
import { BrandIcon } from "@/components/design-system/icons";
import { StatusPageSubnav } from "@/components/app/status-pages/subnav";
import { hostedStatusUrl } from "@/lib/status-pages/config";
import { requireStatusPage } from "@/lib/app/status-page-context";

export default async function StatusPageDetailLayout({
  children,
  params,
}: {
  children: ReactNode;
  params: Promise<{ statusPageId: string }>;
}) {
  const { statusPageId } = await params;
  const ctx = await requireStatusPage(statusPageId);
  const page = ctx.statusPage;
  const isLive = page.status === "published";

  return (
    <div>
      <PageHeader
        title={page.name}
        description={`Hosted at ${page.slug}. ${isLive ? "Live." : "Not published yet."}`}
        actions={
          isLive ? (
            <BrandButtonLink
              href={hostedStatusUrl(page.slug)}
              variant="secondary"
              target="_blank"
              rel="noopener"
            >
              <BrandIcon name="external" size={16} /> View live page
            </BrandButtonLink>
          ) : undefined
        }
      />
      <StatusPageSubnav statusPageId={statusPageId} />
      {children}
    </div>
  );
}
