import type { Metadata } from "next";

import { LegalDocument } from "@/components/site/legal-document";
import { AUP_META, aupIntro, aupSections } from "@/lib/legal/acceptable-use";
import { buildMetadata } from "@/lib/site/metadata";

export const metadata: Metadata = buildMetadata({
  title: "Acceptable Use Policy",
  description:
    "What you may and may not monitor with Fajita, and how we prevent abuse.",
  path: "/legal/acceptable-use",
});

export default function AcceptableUsePage() {
  return (
    <LegalDocument
      eyebrow="Legal"
      title={AUP_META.title}
      effectiveLabel={`Effective ${AUP_META.effectiveDate} · Version ${AUP_META.version}`}
      intro={aupIntro}
      sections={aupSections}
    />
  );
}
