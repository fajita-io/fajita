import type { Metadata } from "next";
import Link from "next/link";

import { BrandButtonLink } from "@/components/design-system/primitives";
import { AppSection, EmptyState, PageHeader } from "@/components/app/ui";

export const metadata: Metadata = {
  title: "Not available yet",
  robots: { index: false, follow: false },
};

export default function ComingSoonPage() {
  return (
    <>
      <PageHeader
        title="Not available yet"
        description="This area is not available yet."
      />
      <AppSection>
        <EmptyState
          icon="overview"
          title="Coming soon"
          description="Platform admins see upcoming features here so navigation stays clear. Customers never land on this page."
          action={
            <div className="fj-empty__actions">
              <BrandButtonLink href="/app">Back to overview</BrandButtonLink>
              <Link className="fj-link-button" href="/app/support">
                Contact support
              </Link>
            </div>
          }
        />
      </AppSection>
    </>
  );
}
