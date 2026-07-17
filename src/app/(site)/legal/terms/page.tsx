import type { Metadata } from "next";

import { LegalDocument } from "@/components/site/legal-document";
import { TERMS_META, termsIntro, termsSections } from "@/lib/legal/terms";
import { buildMetadata } from "@/lib/site/metadata";

export const metadata: Metadata = buildMetadata({
  title: "Terms of Service",
  description: "The agreement that governs your Fajita account and use of the service.",
  path: "/legal/terms",
});

export default function TermsPage() {
  return (
    <LegalDocument
      eyebrow="Legal"
      title={TERMS_META.title}
      effectiveLabel={`Effective ${TERMS_META.effectiveDate} · Version ${TERMS_META.version}`}
      intro={termsIntro}
      sections={termsSections}
    />
  );
}
