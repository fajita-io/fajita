import Link from "next/link";

import { FajitaLogo } from "@/components/brand/logo/fajita-logo";
import { BrandButtonLink } from "@/components/design-system/primitives";
import { SiteHeaderFeaturesMenu } from "@/components/site/site-header-features-menu";
import { SiteHeaderScroll } from "@/components/site/site-header-scroll";
import { DataFastGoals } from "@/lib/analytics/goals";
import { cta } from "@/lib/site/site-config";

export function SiteHeaderContent({ pathname }: { pathname: string }) {
  const pricingCurrent = pathname === "/pricing" ? ("page" as const) : undefined;

  return (
    <>
      <SiteHeaderScroll />
      <header className="fj-header" data-scrolled="false">
        <div className="fj-container fj-header__inner">
          <Link href="/" className="fj-header__logo" aria-label="Fajita home">
            <FajitaLogo orientation="horizontal" size={30} />
          </Link>

          <nav className="fj-header__nav" aria-label="Main">
            <SiteHeaderFeaturesMenu />
            <Link
              href="/pricing"
              className="fj-nav-link"
              aria-current={pricingCurrent}
            >
              Pricing
            </Link>
          </nav>

          <div className="fj-header__actions">
            <Link href="/login" className="fj-nav-link fj-header__login">
              Log in
            </Link>
            <BrandButtonLink
              href={cta.primary.href}
              size="sm"
              data-fast-goal={DataFastGoals.navCta}
            >
              {cta.primary.label}
            </BrandButtonLink>
          </div>
        </div>
      </header>
    </>
  );
}
