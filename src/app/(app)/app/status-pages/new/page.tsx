import type { Metadata } from "next";
import { notFound } from "next/navigation";

import { AppSection, PageHeader } from "@/components/app/ui";
import { CreateStatusPageForm } from "@/components/app/status-pages/create-form";
import { requireStatusPageContext } from "@/lib/app/status-page-context";

export const metadata: Metadata = {
  title: "New status page",
  robots: { index: false, follow: false },
};

export default async function NewStatusPage() {
  const ctx = await requireStatusPageContext();
  if (!ctx.canManage) notFound();

  return (
    <div>
      <PageHeader
        title="Create a status page"
        description="Name it, claim a hosted address, and set the timezone. You will add components and publish next."
      />
      <AppSection>
        <CreateStatusPageForm organizationId={ctx.organizationId} defaultTimezone={ctx.timezone} />
      </AppSection>
    </div>
  );
}
