import Link from "next/link";

import { FajitaLogo } from "@/components/brand/logo/fajita-logo";
import { ThermalStack } from "@/components/brand/thermal-stack/thermal-stack";

/**
 * Auth shell. Fajita chrome around Clerk's security-critical flows: a branded
 * header with a way back to the marketing site, the auth surface centered, and
 * a calm proof panel. No marketing header/footer here; this is a focused
 * moment. Theme is inherited from the root layout's no-flash script.
 */
export default function AuthLayout({
  children,
}: Readonly<{ children: React.ReactNode }>) {
  return (
    <div className="fj-authshell">
      <header className="fj-authshell__bar">
        <Link href="/" aria-label="Fajita home">
          <FajitaLogo orientation="horizontal" size={28} />
        </Link>
        <Link href="/" className="fj-nav-link">
          Back to site
        </Link>
      </header>

      <main id="main" className="fj-authshell__main">
        <div className="fj-authshell__form">{children}</div>

        <aside className="fj-authshell__aside" aria-hidden="true">
          <div className="fj-authshell__aside-inner">
            <ThermalStack state="operational" simplified />
            <p className="fj-heading-3" style={{ marginTop: "var(--space-6)" }}>
              Walk in already right.
            </p>
            <p className="fj-body-sm" style={{ marginTop: "var(--space-3)" }}>
              Fajita watches your websites, APIs, certificates, and cron jobs,
              and tells your team before your customers do.
            </p>
          </div>
        </aside>
      </main>
    </div>
  );
}
