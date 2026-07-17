import type { Metadata } from "next";

import { AppSection, PageHeader } from "@/components/app/ui";
import { AskFajitaChat } from "@/components/support/ask-fajita-chat";
import { PoweredByPamphlet } from "@/components/support/powered-by-pamphlet";
import { requireActiveContext } from "@/lib/app/page-context";
import {
  DOCS_SEARCH_HREF,
  FALLBACK_SUPPORT_HREF,
  SUPPORT_COPY,
  TROUBLESHOOTING_HREF,
} from "@/lib/support/copy";
import { suggestedPromptsFor } from "@/lib/support/suggested-prompts";

export const metadata: Metadata = {
  title: "Support",
  robots: { index: false, follow: false },
};

export default async function AppSupportPage() {
  await requireActiveContext();

  return (
    <>
      <PageHeader
        title="Support"
        description="Ask about this organization’s monitors, incidents, alerts, status pages, usage, or account setup."
      />
      <AppSection title="Ask Fajita">
        <AskFajitaChat
          mode="authenticated"
          variant="page"
          open
          pageContext={{ route: "/app/support", productArea: "support" }}
          suggestedPrompts={suggestedPromptsFor("authenticated", {
            route: "/app/support",
            productArea: "support",
          })}
        />
        <PoweredByPamphlet />
      </AppSection>
      <AppSection title="If chat is unavailable">
        <p>{SUPPORT_COPY.providerUnavailableBody}</p>
        <ul className="fj-support-list">
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
      </AppSection>
    </>
  );
}
