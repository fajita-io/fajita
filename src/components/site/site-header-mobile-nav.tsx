"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";
import { useEffect, useState } from "react";

import { BrandButtonLink } from "@/components/design-system/primitives";
import { GitHubStarLinkView } from "@/components/site/oss/github-star-link";
import { SiteHeaderFeaturesMenu } from "@/components/site/site-header-features-menu";
import { DataFastGoals } from "@/lib/analytics/goals";
import { OSS_ROUTES, ossPublicVisible } from "@/lib/site/oss-config";
import { cta } from "@/lib/site/site-config";

/**
 * Mobile navigation drawer for the marketing header. Desktop nav hides below
 * 63.75rem; this keeps Open Source and core routes reachable on small screens.
 */
export function SiteHeaderMobileNav({
  showGithubStar = false,
  githubStarCount = null,
}: {
  showGithubStar?: boolean;
  githubStarCount?: number | null;
}) {
  const pathname = usePathname();
  const [open, setOpen] = useState(false);
  const showOss = ossPublicVisible();

  useEffect(() => {
    setOpen(false);
  }, [pathname]);

  useEffect(() => {
    if (!open) return;
    const onKey = (e: KeyboardEvent) => {
      if (e.key === "Escape") setOpen(false);
    };
    window.addEventListener("keydown", onKey);
    return () => window.removeEventListener("keydown", onKey);
  }, [open]);

  return (
    <>
      <button
        type="button"
        className="fj-header-mobile-toggle"
        aria-expanded={open}
        aria-controls="fj-header-mobile-nav"
        onClick={() => setOpen((v) => !v)}
      >
        {open ? "Close menu" : "Menu"}
      </button>
      {open ? (
        <div
          id="fj-header-mobile-nav"
          className="fj-header-mobile-nav"
          role="dialog"
          aria-label="Site navigation"
        >
          <nav aria-label="Mobile">
            <SiteHeaderFeaturesMenu />
            <Link
              href="/pricing"
              className="fj-nav-link fj-header-mobile-nav__link"
              aria-current={pathname === "/pricing" ? "page" : undefined}
            >
              Pricing
            </Link>
            {showOss ? (
              <Link
                href={OSS_ROUTES.openSource}
                className="fj-nav-link fj-header-mobile-nav__link"
                aria-current={
                  pathname === OSS_ROUTES.openSource ? "page" : undefined
                }
              >
                Open Source
              </Link>
            ) : null}
            <Link href="/docs" className="fj-nav-link fj-header-mobile-nav__link">
              Docs
            </Link>
            <Link href="/blog" className="fj-nav-link fj-header-mobile-nav__link">
              Blog
            </Link>
            {showGithubStar ? (
              <div className="fj-header-mobile-nav__github">
                <GitHubStarLinkView starCount={githubStarCount} />
              </div>
            ) : null}
            <Link href="/login" className="fj-nav-link fj-header-mobile-nav__link">
              Log in
            </Link>
          </nav>
          <BrandButtonLink
            href={cta.primary.href}
            size="sm"
            data-fast-goal={DataFastGoals.navCta}
          >
            {cta.primary.label}
          </BrandButtonLink>
        </div>
      ) : null}
    </>
  );
}
