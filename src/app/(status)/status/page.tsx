import type { Metadata } from "next";

import { StatusPageView } from "@/components/status-public/status-page-view";
import { OVERALL_STATE_LABEL } from "@/lib/status-pages/constants";
import { loadFajitaServiceStatus } from "@/lib/platform/service-status";

export const revalidate = 30;

export async function generateMetadata(): Promise<Metadata> {
  const status = await loadFajitaServiceStatus();
  const title = status.data.page.title ?? "Fajita Service Status";
  const statusLabel = OVERALL_STATE_LABEL[status.overallStatus];
  const description =
    status.data.page.description ??
    `Current status of Fajita services. ${statusLabel}.`;

  return {
    title,
    description,
    alternates: { canonical: "/status" },
    openGraph: {
      title,
      description,
      type: "website",
      url: "/status",
    },
    twitter: {
      card: "summary",
      title,
      description,
    },
  };
}

export default async function FajitaServiceStatusPage() {
  const status = await loadFajitaServiceStatus();

  return (
    <StatusPageView
      data={status.data}
      basePath="/status"
      generatedAt={status.generatedAt}
      brandLockup="fajita"
      subscribeSlug={
        status.source === "snapshot" && status.data.display.showSubscriberForm
          ? status.subscribeSlug
          : undefined
      }
    />
  );
}
