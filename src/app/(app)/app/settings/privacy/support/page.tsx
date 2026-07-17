import type { Metadata } from "next";

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
        <ul>
          <li>Authenticated support conversations: kept for continuity, then expired by policy.</li>
          <li>Public anonymous chats: short retention unless handed off.</li>
          <li>Billing and security reports: longer restricted retention.</li>
          <li>Message bodies are not stored in Fajita by default. Metadata and redaction events may remain.</li>
        </ul>
      </AppSection>
      <AppSection title="What you can do">
        <ul>
          <li>
            <a href="/app/support">Review your support conversations</a>
          </li>
          <li>Request export from a conversation you own</li>
          <li>Request deletion where policy and legal holds allow</li>
        </ul>
        <p>
          Required security and billing notices are not controlled from this
          page. Support contact is not marketing consent.
        </p>
        <PoweredByPamphlet />
      </AppSection>
    </>
  );
}
