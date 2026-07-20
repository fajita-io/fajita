import type { Metadata } from "next";

import { LegalDocument } from "@/components/site/legal-document";
import { DPA_META, dpaIntro, dpaSections } from "@/lib/legal/dpa";
import { buildMetadata } from "@/lib/site/metadata";

export const metadata: Metadata = buildMetadata({
  title: "Data Processing Addendum",
  description:
    "Processor terms for customers who process personal data through the Fajita Service.",
  path: "/legal/dpa",
  noindex: true,
});

export default function DpaPage() {
  return (
    <LegalDocument
      eyebrow="Legal"
      title={DPA_META.title}
      effectiveLabel={`Effective ${DPA_META.effectiveDate} · Version ${DPA_META.version} · Last updated ${DPA_META.lastUpdated}`}
      intro={dpaIntro}
      sections={dpaSections}
    />
  );
}
