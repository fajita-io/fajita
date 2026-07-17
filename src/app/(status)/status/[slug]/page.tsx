import { cache } from "react";
import type { Metadata } from "next";
import { notFound } from "next/navigation";

import { StatusPageView } from "@/components/status-public/status-page-view";
import { OVERALL_STATE_LABEL } from "@/lib/status-pages/constants";
import { getPublicSnapshotBySlug } from "@/lib/status-pages/projection";

/**
 * Public hosted status page at /status/<slug>. Reads only the allowlisted public
 * snapshot with the service role: no authenticated tables, no auth session, no
 * customer secrets. Revalidated periodically so the origin stays light and the
 * page can be served from cache during traffic spikes.
 */
export const revalidate = 30;

const loadSnapshot = cache(async (slug: string) => getPublicSnapshotBySlug(slug));

interface Params {
  params: Promise<{ slug: string }>;
}

export async function generateMetadata({ params }: Params): Promise<Metadata> {
  const { slug } = await params;
  const snapshot = await loadSnapshot(slug);
  if (!snapshot || snapshot.visibility !== "public") {
    return { title: "Status", robots: { index: false, follow: false } };
  }
  const { page } = snapshot.data;
  const statusLabel = OVERALL_STATE_LABEL[snapshot.overallStatus];
  const title = page.title || `${page.name} Status`;
  const description =
    page.description || `Current status and incident history for ${page.name}. ${statusLabel}.`;
  const index = snapshot.data.seo.indexing;

  return {
    title,
    description,
    robots: index
      ? { index: true, follow: true }
      : { index: false, follow: false },
    alternates: { canonical: `/status/${slug}` },
    openGraph: {
      title,
      description,
      type: "website",
      images: [{ url: `/status/${slug}/opengraph-image` }],
    },
    twitter: { card: "summary_large_image", title, description },
  };
}

export default async function PublicStatusPage({ params }: Params) {
  const { slug } = await params;
  const snapshot = await loadSnapshot(slug);
  if (!snapshot) notFound();

  // Password-protected and organization-only pages are not anonymously
  // viewable. The full gate (cookie session) ships with the private-access
  // work; until then anonymous visitors get a not-found rather than content.
  if (snapshot.visibility === "password_protected" || snapshot.visibility === "organization_only") {
    notFound();
  }

  return (
    <StatusPageView
      data={snapshot.data}
      basePath={`/status/${slug}`}
      generatedAt={snapshot.generatedAt}
      subscribeSlug={slug}
    />
  );
}
