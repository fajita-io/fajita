import type { Metadata } from "next";

import { AskFajitaChat } from "@/components/support/ask-fajita-chat";
import { PoweredByPamphlet } from "@/components/support/powered-by-pamphlet";
import {
  DOCS_SEARCH_HREF,
  FALLBACK_SUPPORT_HREF,
  SUPPORT_COPY,
  TROUBLESHOOTING_HREF,
} from "@/lib/support/copy";
import { suggestedPromptsFor } from "@/lib/support/suggested-prompts";
import { appUrl } from "@/lib/env";

export const metadata: Metadata = {
  title: "Support",
  description:
    "Ask Fajita about monitoring, alerts, status pages, and pricing. Answers cite approved documentation. Powered by Pamphlet.",
  alternates: { canonical: `${appUrl}/support` },
  openGraph: {
    title: "Fajita Support",
    description:
      "Ask product questions, find documentation, or send a conversation to Fajita support.",
    url: `${appUrl}/support`,
    siteName: "Fajita",
    type: "website",
  },
};

export default function PublicSupportPage() {
  return (
    <div className="fj-support-page fj-container">
      <header className="fj-support-page__intro">
        <h1>Support</h1>
        <p>
          Ask a question about monitoring, alerts, status pages, pricing, or
          setup. Answers come from Fajita’s approved documentation.
        </p>
        <PoweredByPamphlet />
      </header>

      <AskFajitaChat
        mode="public"
        variant="page"
        open
        pageContext={{ route: "/support", productArea: "support" }}
        suggestedPrompts={suggestedPromptsFor("public", {
          route: "/support",
          productArea: "support",
        })}
      />

      <section className="fj-support-fallback" id="handoff" aria-labelledby="fallback-title">
        <h2 id="fallback-title">{SUPPORT_COPY.providerUnavailableTitle}</h2>
        <p>{SUPPORT_COPY.providerUnavailableBody}</p>
        <ul>
          <li>
            <a href={DOCS_SEARCH_HREF}>{SUPPORT_COPY.searchDocs}</a>
          </li>
          <li>
            <a href={TROUBLESHOOTING_HREF}>{SUPPORT_COPY.openTroubleshooting}</a>
          </li>
          <li>
            <a href={FALLBACK_SUPPORT_HREF}>{SUPPORT_COPY.contactSupport}</a>
          </li>
        </ul>
        <PoweredByPamphlet compact />
      </section>
    </div>
  );
}
