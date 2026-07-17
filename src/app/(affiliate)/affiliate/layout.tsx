import { redirect } from "next/navigation";
import Link from "next/link";

import { getCurrentProfile } from "@/lib/auth/context";
import { getAffiliateForCurrentUser } from "@/lib/affiliates/context";
import { AffiliateNav } from "@/components/affiliate/affiliate-nav";

export const dynamic = "force-dynamic";

export const metadata = {
  title: "Affiliate",
  robots: { index: false, follow: false },
};

/**
 * Affiliate dashboard shell. Person-scoped (not organization-scoped): access is
 * gated on being an approved affiliate, never on an org role. People without an
 * affiliate record are sent to the public program page.
 */
export default async function AffiliateLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  const profile = await getCurrentProfile();
  if (!profile) redirect("/login?redirect=/affiliate");

  const { affiliate } = await getAffiliateForCurrentUser();
  if (!affiliate) redirect("/affiliates");

  return (
    <div className="fj-affiliate">
      <header className="fj-affiliate__topbar">
        <div className="fj-container fj-affiliate__topbar-inner">
          <Link href="/affiliate" className="fj-affiliate__brand">
            Fajita Affiliates
          </Link>
          <AffiliateNav />
        </div>
      </header>
      <main className="fj-container fj-affiliate__main">{children}</main>
    </div>
  );
}
