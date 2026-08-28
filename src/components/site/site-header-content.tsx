import Link from "next/link";

import { FajitaLogo } from "@/components/brand/logo/fajita-logo";
import { BrandButtonLink } from "@/components/design-system/primitives";
import { GitHubStarLinkLive } from "@/components/site/oss/github-star-link-live";
import { SiteHeaderFeaturesMenu } from "@/components/site/site-header-features-menu";
import { SiteHeaderMobileNav } from "@/components/site/site-header-mobile-nav";
import { SiteHeaderScroll } from "@/components/site/site-header-scroll";
import { SiteNavLink } from "@/components/site/site-nav-link";
import { DataFastGoals } from "@/lib/analytics/goals";
import { ossPublicVisible } from "@/lib/site/oss-config";
import { cta } from "@/lib/site/site-config";

export function SiteHeaderContent() {
  const showOss = ossPublicVisible();

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
            <SiteNavLink href="/pricing" className="fj-nav-link">
              Pricing
            </SiteNavLink>
            <Link href="/docs" className="fj-nav-link">
              Docs
            </Link>
            <Link href="/blog" className="fj-nav-link">
              Blog
            </Link>
          </nav>

          <div className="fj-header__actions">
            {showOss ? (
              <GitHubStarLinkLive className="fj-header__github" />
            ) : null}
            <SiteHeaderMobileNav showGithubStar={showOss} />
            <Link href="/login" className="fj-nav-link fj-header__login">
              Log in
            </Link>
            <BrandButtonLink
              href={cta.primary.href}
              size="sm"
              className="fj-header__cta"
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
