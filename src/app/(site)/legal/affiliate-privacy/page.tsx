import type { Metadata } from "next";

import { LegalDocument } from "@/components/site/legal-document";
import {
  AFFILIATE_PRIVACY_META,
  affiliatePrivacyIntro,
  affiliatePrivacySections,
} from "@/lib/legal/affiliate-privacy";
import { buildMetadata } from "@/lib/site/metadata";

export const metadata: Metadata = buildMetadata({
  title: "Affiliate Privacy Notice",
  description:
    "How Fajita collects and uses personal information for affiliate applicants and partners.",
  path: "/legal/affiliate-privacy",
});

export default function AffiliatePrivacyPage() {
  return (
    <LegalDocument
      eyebrow="Legal"
      title={AFFILIATE_PRIVACY_META.title}
      effectiveLabel={`Effective ${AFFILIATE_PRIVACY_META.effectiveDate} · Version ${AFFILIATE_PRIVACY_META.version} · Last updated ${AFFILIATE_PRIVACY_META.lastUpdated}`}
      intro={affiliatePrivacyIntro}
      sections={affiliatePrivacySections}
    />
  );
}
