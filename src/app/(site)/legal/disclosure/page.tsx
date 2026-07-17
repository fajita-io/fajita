import type { Metadata } from "next";

import { LegalDocument } from "@/components/site/legal-document";
import {
  DISCLOSURE_META,
  disclosureIntro,
  disclosureSections,
} from "@/lib/legal/disclosure";
import { buildMetadata } from "@/lib/site/metadata";

export const metadata: Metadata = buildMetadata({
  title: "Responsible Disclosure Policy",
  description:
    "How to report a security vulnerability to Fajita and what to expect.",
  path: "/legal/disclosure",
});

export default function DisclosurePage() {
  return (
    <LegalDocument
      eyebrow="Legal"
      title={DISCLOSURE_META.title}
      effectiveLabel={`Effective ${DISCLOSURE_META.effectiveDate} · Version ${DISCLOSURE_META.version}`}
      intro={disclosureIntro}
      sections={disclosureSections}
    />
  );
}
