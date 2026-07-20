"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";
import { useEffect, useId, useRef, useState } from "react";

import { FajitaLogo } from "@/components/brand/logo/fajita-logo";
import { BrandButtonLink } from "@/components/design-system/primitives";
import { BrandIcon } from "@/components/design-system/icons";
import { DataFastGoals } from "@/lib/analytics/goals";
import { featureOrder, features } from "@/lib/site/features";
import { cta } from "@/lib/site/site-config";

const featureLinks = featureOrder.map((slug) => ({
  href: `/features/${slug}`,
  name: features[slug].name,
  desc: features[slug].metaDescription.split(":")[0].replace(/^Fajita /, ""),
  icon: features[slug].icon,
}));

/**
 * Global navigation. Sticky, translucent over the hero, solid after scroll.
 * Centered Features and Pricing, login, and the primary CTA on desktop.
 * Mobile shows logo and primary CTA only.
 */
export function SiteHeader() {
  const pathname = usePathname();
  const [scrolled, setScrolled] = useState(false);
  const [openMenu, setOpenMenu] = useState<"features" | null>(null);
  const navRef = useRef<HTMLElement>(null);
  const featuresMenuId = useId();

  useEffect(() => {
    const onScroll = () => setScrolled(window.scrollY > 8);
    onScroll();
    window.addEventListener("scroll", onScroll, { passive: true });
    return () => window.removeEventListener("scroll", onScroll);
  }, []);

  /* Close menus on navigation. */
  useEffect(() => {
    setOpenMenu(null);
  }, [pathname]);

  /* Escape and click-outside close desktop dropdowns. */
  useEffect(() => {
    if (!openMenu) return;
    const onKey = (e: KeyboardEvent) => {
      if (e.key === "Escape") setOpenMenu(null);
    };
    const onClick = (e: MouseEvent) => {
      if (navRef.current && !navRef.current.contains(e.target as Node)) {
        setOpenMenu(null);
      }
    };
    document.addEventListener("keydown", onKey);
    document.addEventListener("mousedown", onClick);
    return () => {
      document.removeEventListener("keydown", onKey);
      document.removeEventListener("mousedown", onClick);
    };
  }, [openMenu]);

  const isCurrent = (href: string) =>
    pathname === href ? ("page" as const) : undefined;

  return (
    <header className="fj-header" data-scrolled={scrolled}>
      <div className="fj-container fj-header__inner" ref={navRef as never}>
        <Link href="/" className="fj-header__logo" aria-label="Fajita home">
          <FajitaLogo orientation="horizontal" size={30} />
        </Link>

        <nav className="fj-header__nav" aria-label="Main">
          <div className="fj-nav-item">
            <button
              type="button"
              className="fj-nav-link"
              aria-expanded={openMenu === "features"}
              aria-controls={featuresMenuId}
              onClick={() =>
                setOpenMenu(openMenu === "features" ? null : "features")
              }
            >
              Features
              <svg
                className="fj-nav-caret"
                width="10"
                height="10"
                viewBox="0 0 10 10"
                aria-hidden
              >
                <path
                  d="M2 3.5L5 6.5L8 3.5"
                  stroke="currentColor"
                  strokeWidth="1.5"
                  fill="none"
                  strokeLinecap="round"
                />
              </svg>
            </button>
            {openMenu === "features" ? (
              <div
                className="fj-nav-menu fj-nav-menu--features"
                id={featuresMenuId}
              >
                <div className="fj-nav-menu__list">
                  {featureLinks.map((f) => (
                    <Link key={f.href} href={f.href} className="fj-nav-menu__link">
                      <BrandIcon name={f.icon} size={18} className="fj-nav-menu__icon" />
                      <span className="fj-nav-menu__body">
                        <span className="fj-nav-menu__name">{f.name}</span>
                        <span className="fj-nav-menu__desc">{f.desc}</span>
                      </span>
                    </Link>
                  ))}
                </div>
                <div className="fj-nav-menu__footer">
                  <Link href="/features" className="fj-nav-menu__link">
                    <BrandIcon name="uptime" size={18} className="fj-nav-menu__icon" />
                    <span className="fj-nav-menu__body">
                      <span className="fj-nav-menu__name">All features</span>
                      <span className="fj-nav-menu__desc">
                        Watch, verify, alert, communicate, learn
                      </span>
                    </span>
                  </Link>
                </div>
              </div>
            ) : null}
          </div>

          <Link
            href="/pricing"
            className="fj-nav-link"
            aria-current={isCurrent("/pricing")}
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
  );
}
