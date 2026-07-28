import Link from "next/link";

import { FajitaLogo } from "@/components/brand/logo/fajita-logo";
import { ThermalStack } from "@/components/brand/thermal-stack/thermal-stack";
import { FajitaClerkProvider } from "@/components/auth/fajita-clerk-provider";

import "@/styles/app.css";

/**
 * Auth shell. Fajita chrome around Clerk's security-critical flows: brand
 * story on the left, focused sign-in surface on the right. No marketing
 * header or footer. Theme follows the site preference set on marketing pages.
 */
export default function AuthLayout({
  children,
}: Readonly<{ children: React.ReactNode }>) {
  return (
    <FajitaClerkProvider>
    <div className="fj-authshell">
      <aside className="fj-authshell__brand" aria-label="Fajita">
        <Link href="/" className="fj-authshell__brand-logo" aria-label="Fajita home">
          <FajitaLogo orientation="horizontal" size={28} />
        </Link>

        <div className="fj-authshell__brand-visual">
          <ThermalStack state="operational" simplified />
        </div>

        <div className="fj-authshell__brand-copy">
          <p className="fj-eyebrow">Monitors · alerts · status</p>
          <p className="fj-heading-3 fj-authshell__brand-headline">
            Walk in already right.
          </p>
          <p className="fj-body-sm fj-authshell__brand-lede">
            Fajita watches your websites, APIs, certificates, and cron jobs,
            and tells your team before your customers do.
          </p>
        </div>

        <p className="fj-authshell__brand-foot">Fajita · monitoring access</p>
      </aside>

      <main id="main" className="fj-authshell__panel">
        <div className="fj-authshell__panel-mobile-logo">
          <Link href="/" aria-label="Fajita home">
            <FajitaLogo orientation="horizontal" size={24} />
          </Link>
        </div>

        <div className="fj-authshell__form">{children}</div>
      </main>
    </div>
    </FajitaClerkProvider>
  );
}
