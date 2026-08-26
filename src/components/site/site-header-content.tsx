import Link from "next/link";

import { FajitaLogo } from "@/components/brand/logo/fajita-logo";
import { BrandButtonLink } from "@/components/design-system/primitives";
import { GitHubStarLinkView } from "@/components/site/oss/github-star-link";
import { SiteHeaderFeaturesMenu } from "@/components/site/site-header-features-menu";
import { SiteHeaderMobileNav } from "@/components/site/site-header-mobile-nav";
import { SiteHeaderScroll } from "@/components/site/site-header-scroll";
import { DataFastGoals } from "@/lib/analytics/goals";
import { OSS_ROUTES, ossPublicVisible } from "@/lib/site/oss-config";
import { cta } from "@/lib/site/site-config";

export function SiteHeaderContent({
  pathname,
  githubStarCount = null,
}: {
  pathname: string;
  githubStarCount?: number | null;
}) {
  const pricingCurrent = pathname === "/pricing" ? ("page" as const) : undefined;
  const openSourceCurrent =
    pathname === OSS_ROUTES.openSource ? ("page" as const) : undefined;
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
            <Link
              href="/pricing"
              className="fj-nav-link"
              aria-current={pricingCurrent}
            >
              Pricing
            </Link>
            {showOss ? (
              <Link
                href={OSS_ROUTES.openSource}
                className="fj-nav-link"
                aria-current={openSourceCurrent}
              >
                Open Source
              </Link>
            ) : null}
            <Link href="/docs" className="fj-nav-link">
              Docs
            </Link>
            <Link href="/blog" className="fj-nav-link">
              Blog
            </Link>
          </nav>

          <div className="fj-header__actions">
            {showOss ? (
              <GitHubStarLinkView
                starCount={githubStarCount}
                className="fj-header__github"
              />
            ) : null}
            <SiteHeaderMobileNav
              showGithubStar={showOss}
              githubStarCount={githubStarCount}
            />
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
