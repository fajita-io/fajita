import type { Metadata } from "next";

import { LegalDocument } from "@/components/site/legal-document";
import { PRIVACY_META, privacyIntro, privacySections } from "@/lib/legal/privacy";
import { buildMetadata } from "@/lib/site/metadata";

export const metadata: Metadata = buildMetadata({
  title: "Privacy Policy",
  description:
    "What Fajita collects, why, how long we keep it, and how to get it removed.",
  path: "/legal/privacy",
});

export default function PrivacyPage() {
  return (
    <LegalDocument
      eyebrow="Legal"
      title={PRIVACY_META.title}
      effectiveLabel={`Effective ${PRIVACY_META.effectiveDate} · Version ${PRIVACY_META.version} · Last updated ${PRIVACY_META.lastUpdated}`}
      intro={privacyIntro}
      sections={privacySections}
    />
  );
}
