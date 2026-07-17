import type { Metadata } from "next";

import { AppSection } from "@/components/app/ui";
import { SecurityPanel } from "@/components/app/security-panel";

export const metadata: Metadata = {
  title: "Security settings",
  robots: { index: false, follow: false },
};

export default function SecuritySettingsPage() {
  return (
    <AppSection
      title="Security"
      description="Fajita never stores your password. Credentials, sessions, and factors are managed by our sign-in provider. Here is exactly what is available today."
    >
      <SecurityPanel />
    </AppSection>
  );
}
