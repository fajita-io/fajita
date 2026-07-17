import type { Metadata } from "next";

import { LegalDocument } from "@/components/site/legal-document";
import {
  AFFILIATE_AGREEMENT_META,
  affiliateAgreementIntro,
  affiliateAgreementSections,
} from "@/lib/legal/affiliate-agreement";
import { buildMetadata } from "@/lib/site/metadata";

export const metadata: Metadata = buildMetadata({
  title: "Affiliate Program Agreement",
  description:
    "Terms for approved Fajita affiliates: attribution, commissions, promotion rules, and payouts.",
  path: "/legal/affiliate-agreement",
});

export default function AffiliateAgreementPage() {
  return (
    <LegalDocument
      eyebrow="Legal"
      title={AFFILIATE_AGREEMENT_META.title}
      effectiveLabel={`Effective ${AFFILIATE_AGREEMENT_META.effectiveDate} · Version ${AFFILIATE_AGREEMENT_META.version}`}
      intro={affiliateAgreementIntro}
      sections={affiliateAgreementSections}
    />
  );
}
