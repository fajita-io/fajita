import type { Metadata } from "next";
import Link from "next/link";

import { AppSection, PageHeader } from "@/components/app/ui";
import { PoweredByPamphlet } from "@/components/support/powered-by-pamphlet";
import { requireActiveContext } from "@/lib/app/page-context";

export const metadata: Metadata = {
  title: "Support privacy",
  robots: { index: false, follow: false },
};

export default async function SupportPrivacySettingsPage() {
  await requireActiveContext();

  return (
    <>
      <PageHeader
        title="Support privacy"
        description="How Ask Fajita handles conversations, retention, and handoff."
      />
      <AppSection title="What we keep">
        <ul className="fj-support-list">
          <li>Authenticated support conversations: kept for continuity, then expired by policy.</li>
          <li>Public anonymous chats: short retention unless handed off.</li>
          <li>Billing and security reports: longer restricted retention.</li>
          <li>Message bodies are not stored in Fajita by default. Metadata and redaction events may remain.</li>
        </ul>
      </AppSection>
      <AppSection title="What you can do">
        <ul className="fj-support-list">
          <li>
            <Link className="fj-link-button" href="/app/support">
              Open support
            </Link>{" "}
            for docs, service status, and product feedback.
          </li>
          <li>
            <Link className="fj-link-button" href="/app/settings/data">
              Request a data export
            </Link>{" "}
            from Data &amp; account settings.
          </li>
          <li>
            <Link className="fj-link-button" href="/app/settings/data">
              Schedule account or organization deletion
            </Link>{" "}
            where policy and legal holds allow.
          </li>
        </ul>
        <p className="fj-app-section__desc">
          Required security and billing notices are not controlled from this
          page. Support contact is not marketing consent.
        </p>
        <PoweredByPamphlet />
      </AppSection>
    </>
  );
}
