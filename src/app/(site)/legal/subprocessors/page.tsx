import type { Metadata } from "next";

import { LegalDocument } from "@/components/site/legal-document";
import {
  SUBPROCESSORS_META,
  subprocessorsIntro,
  subprocessorsSections,
} from "@/lib/legal/subprocessors";
import { buildMetadata } from "@/lib/site/metadata";

export const metadata: Metadata = buildMetadata({
  title: "Subprocessor List",
  description:
    "Third-party subprocessors that may process personal data on Fajita's behalf.",
  path: "/legal/subprocessors",
  noindex: true,
});

export default function SubprocessorsPage() {
  return (
    <LegalDocument
      eyebrow="Legal"
      title={SUBPROCESSORS_META.title}
      effectiveLabel={`Effective ${SUBPROCESSORS_META.effectiveDate} · Version ${SUBPROCESSORS_META.version} · Last updated ${SUBPROCESSORS_META.lastUpdated}`}
      intro={subprocessorsIntro}
      sections={subprocessorsSections}
    />
  );
}
