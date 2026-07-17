import type { Metadata } from "next";

import { LegalDocument } from "@/components/site/legal-document";
import { COOKIES_META, cookiesIntro, cookiesSections } from "@/lib/legal/cookies";
import { buildMetadata } from "@/lib/site/metadata";

export const metadata: Metadata = buildMetadata({
  title: "Cookie Notice",
  description: "What Fajita stores in your browser and what it is for.",
  path: "/legal/cookies",
});

export default function CookiesPage() {
  return (
    <LegalDocument
      eyebrow="Legal"
      title={COOKIES_META.title}
      effectiveLabel={`Effective ${COOKIES_META.effectiveDate} · Version ${COOKIES_META.version}`}
      intro={cookiesIntro}
      sections={cookiesSections}
    />
  );
}
