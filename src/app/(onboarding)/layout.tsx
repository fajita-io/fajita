import type { Metadata } from "next";
import { redirect } from "next/navigation";
import Link from "next/link";

import { FajitaLogo } from "@/components/brand/logo/fajita-logo";
import { AccountStateScreen } from "@/components/app/account-state-screen";
import { ToastProvider } from "@/components/app/toast";
import { FajitaClerkProvider } from "@/components/auth/fajita-clerk-provider";
import { getCurrentProfile, getSessionUserId } from "@/lib/auth/context";

import "@/styles/app.css";

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
  let profile;
  try {
    profile = await getCurrentProfile();
  } catch (error) {
    console.error("[onboarding layout] profile load failed", error);
    return (
      <FajitaClerkProvider>
        <div className="fj-flow">
          <main id="main" className="fj-flow__main">
            <div
              className="fj-flow__card"
              style={{ display: "grid", gap: "var(--space-4)" }}
            >
              <p
                className="fj-body-sm"
                style={{ margin: 0, color: "var(--color-text-muted)" }}
              >
                Setup interrupted
              </p>
              <h1 className="fj-flow__title">We could not load your account.</h1>
              <p className="fj-flow__lede">
                Your sign-in looks fine. Give us a moment, then refresh to
                continue setup.
              </p>
            </div>
          </main>
        </div>
      </FajitaClerkProvider>
    );
  }
  if (!profile) {
    const userId = await getSessionUserId();
    if (!userId) redirect("/login");
    return (
      <FajitaClerkProvider>
        <div className="fj-flow">
          <main id="main" className="fj-flow__main">
            <div
              className="fj-flow__card"
              style={{ display: "grid", gap: "var(--space-4)" }}
            >
              <p
                className="fj-body-sm"
                style={{ margin: 0, color: "var(--color-text-muted)" }}
              >
                Finishing sign-in
              </p>
              <h1 className="fj-flow__title">Setting up your account.</h1>
              <p className="fj-flow__lede">
                This usually takes a second right after signup. Refresh to
                continue.
              </p>
            </div>
          </main>
        </div>
      </FajitaClerkProvider>
    );
  }
  if (profile.suspended_at) return <AccountStateScreen kind="suspended" />;

  return (
    <FajitaClerkProvider>
      <ToastProvider>
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
      </ToastProvider>
    </FajitaClerkProvider>
  );
}
