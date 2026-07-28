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
        description="This area is planned but not open in the current release."
      />
      <AppSection>
        <EmptyState
          icon="overview"
          title="Still on the roadmap"
          description="Platform admins see planned features here so nothing looks broken in navigation. Customers never land on this page."
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
