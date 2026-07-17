import type { Metadata } from "next";

import { AppSection, PageHeader } from "@/components/app/ui";
import { PoweredByPamphlet } from "@/components/support/powered-by-pamphlet";
import { requireActiveContext } from "@/lib/app/page-context";

export const metadata: Metadata = {
  title: "Support notifications",
  robots: { index: false, follow: false },
};

export default async function SupportNotificationSettingsPage() {
  await requireActiveContext();

  return (
    <>
      <PageHeader
        title="Support notifications"
        description="How you hear about human support replies and conversation updates."
      />
      <AppSection title="Channels">
        <p>
          Human support replies use the existing notification and email systems
          when a handoff is active. Pamphlet remains the conversation system of
          record when its API is verified. Fajita does not send duplicate emails
          for the same event.
        </p>
        <p>
          Required security and billing messages cannot be disabled here.
          Support contact is not marketing consent.
        </p>
        <PoweredByPamphlet />
      </AppSection>
    </>
  );
}