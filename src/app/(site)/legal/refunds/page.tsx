import type { Metadata } from "next";

import { LegalDocument } from "@/components/site/legal-document";
import { REFUNDS_META, refundsIntro, refundsSections } from "@/lib/legal/refunds";
import { buildMetadata } from "@/lib/site/metadata";

export const metadata: Metadata = buildMetadata({
  title: "Refund Policy",
  description: "How Fajita handles refunds and billing disputes.",
  path: "/legal/refunds",
});

export default function RefundsPage() {
  return (
    <LegalDocument
      eyebrow="Legal"
      title={REFUNDS_META.title}
      effectiveLabel={`Effective ${REFUNDS_META.effectiveDate} · Version ${REFUNDS_META.version}`}
      intro={refundsIntro}
      sections={refundsSections}
    />
  );
}
