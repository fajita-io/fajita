import type { Metadata } from "next";

import { LegalDocument } from "@/components/site/legal-document";
import { SLA_META, slaIntro, slaSections } from "@/lib/legal/sla";
import { buildMetadata } from "@/lib/site/metadata";

export const metadata: Metadata = buildMetadata({
  title: "Service Level Agreement",
  description:
    "Availability commitments and service credits for paid Fajita subscriptions.",
  path: "/legal/sla",
});

export default function SlaPage() {
  return (
    <LegalDocument
      eyebrow="Legal"
      title={SLA_META.title}
      effectiveLabel={`Effective ${SLA_META.effectiveDate} · Version ${SLA_META.version}`}
      intro={slaIntro}
      sections={slaSections}
    />
  );
}
