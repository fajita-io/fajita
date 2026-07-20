import type { Metadata } from "next";

import { AppSection, PageHeader } from "@/components/app/ui";
import { GeniusInlineTrigger, GeniusTriggerButton } from "@/components/genius";
import { requireActiveContext } from "@/lib/app/page-context";
import {
  DOCS_SEARCH_HREF,
  FALLBACK_SUPPORT_HREF,
  SUPPORT_COPY,
  TROUBLESHOOTING_HREF,
} from "@/lib/support/copy";

export const metadata: Metadata = {
  title: "Support",
  description:
    "Documentation, troubleshooting, and product feedback for your Fajita organization.",
  robots: { index: false, follow: false },
};

export default async function AppSupportPage() {
  await requireActiveContext();

  return (
    <>
      <PageHeader
        title="Support"
        description="Find answers in the docs, check service status, or send product feedback to the team."
      />
      <AppSection title="Documentation">
        <ul className="fj-support-list">
          <li>
            <a href={DOCS_SEARCH_HREF}>{SUPPORT_COPY.searchDocs}</a>
          </li>
          <li>
            <a href={TROUBLESHOOTING_HREF}>{SUPPORT_COPY.openTroubleshooting}</a>
          </li>
          <li>
            <a href="/status" target="_blank" rel="noreferrer">
              View service status
            </a>
          </li>
        </ul>
      </AppSection>
      <AppSection title="Product feedback">
        <p>
          Short notes on what would make Fajita better land with the product team.{" "}
          <GeniusInlineTrigger source="support_page" /> or open the form directly.
        </p>
        <div className="fj-support-actions">
          <GeniusTriggerButton source="support_page" />
        </div>
      </AppSection>
      <AppSection title="Contact support">
        <p>{SUPPORT_COPY.providerUnavailableBody}</p>
        <ul className="fj-support-list">
          <li>
            <a href={FALLBACK_SUPPORT_HREF}>{SUPPORT_COPY.contactSupport}</a>
          </li>
        </ul>
      </AppSection>
    </>
  );
}
