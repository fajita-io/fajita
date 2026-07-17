import type { Metadata } from "next";
import { redirect } from "next/navigation";
import Link from "next/link";

import { FajitaLogo } from "@/components/brand/logo/fajita-logo";
import { AccountStateScreen } from "@/components/app/account-state-screen";
import { getCurrentProfile } from "@/lib/auth/context";

export const metadata: Metadata = {
  title: "Set up Fajita",
  robots: { index: false, follow: false },
};

/**
 * Minimal, centered layout for the first-organization and standalone account
 * flows. Deliberately outside the app shell so a brand-new user with no
 * organization never sees an empty sidebar, and so the shell layout can safely
 * redirect no-membership users here without a loop.
 */
export default async function OnboardingLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  const profile = await getCurrentProfile();
  if (!profile) redirect("/login");
  if (profile.suspended_at) return <AccountStateScreen kind="suspended" />;

  return (
    <div className="fj-flow">
      <header className="fj-flow__bar">
        <Link href="/app" aria-label="Fajita">
          <FajitaLogo orientation="horizontal" size={26} />
        </Link>
      </header>
      <main id="main" className="fj-flow__main">
        {children}
      </main>
    </div>
  );
}
