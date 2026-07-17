import type { Metadata } from "next";
import Link from "next/link";
import { notFound } from "next/navigation";

import { CtaButtons } from "@/components/site/cta-buttons";
import { buildMetadata } from "@/lib/site/metadata";
import {
  getIntegrationBySlug,
  INTEGRATION_DIRECTORY,
} from "@/lib/site/integration-directory";

export const dynamic = "force-static";

export function generateStaticParams() {
  return INTEGRATION_DIRECTORY.map((i) => ({
    "integration-slug": i.slug,
  }));
}

export async function generateMetadata({
  params,
}: {
  params: Promise<{ "integration-slug": string }>;
}): Promise<Metadata> {
  const { "integration-slug": slug } = await params;
  const entry = getIntegrationBySlug(slug);
  if (!entry) return {};
  return buildMetadata({
    title: `${entry.name} integration`,
    description: entry.summary,
    path: `/integrations/${entry.slug}`,
  });
}

function kindLabel(kind: string): string {
  switch (kind) {
    case "native":
      return "Native integration";
    case "webhook_recipe":
      return "Webhook recipe";
    case "documentation_guide":
      return "Documentation guide";
    default:
      return kind;
  }
}

export default async function IntegrationDetailPage({
  params,
}: {
  params: Promise<{ "integration-slug": string }>;
}) {
  const { "integration-slug": slug } = await params;
  const entry = getIntegrationBySlug(slug);
  if (!entry) notFound();

  return (
    <>
      <section className="fj-page-hero">
        <div className="fj-container">
          <p className="fj-eyebrow fj-page-hero__eyebrow">{kindLabel(entry.kind)}</p>
          <h1 className="fj-display-2">{entry.name}</h1>
          <p className="fj-body-lg fj-page-hero__lede">{entry.summary}</p>
          <p className="fj-body-sm fj-page-hero__note">
            {entry.kind === "native"
              ? "Fully implemented alert channel."
              : "Verified setup guidance. Not a native connector logo wall."}
          </p>
        </div>
      </section>

      <section className="fj-band--tight">
        <div className="fj-container">
          <p className="fj-body">
            Setup path:{" "}
            <Link href={entry.setupPath}>{entry.setupPath}</Link>
          </p>
          <div className="fj-band-actions">
            <CtaButtons
              secondaryHref="/integrations"
              secondaryLabel="All integrations"
            />
          </div>
        </div>
      </section>
    </>
  );
}
