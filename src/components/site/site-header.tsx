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

const resourceLinks = [
  { href: "/docs", name: "Docs" },
  { href: "/glossary", name: "Glossary" },
  { href: "/blog", name: "Blog" },
  { href: "/compare", name: "Compare" },
  { href: "/tools", name: "Tools" },
  { href: "/about", name: "About" },
  { href: "/changelog", name: "Changelog" },
  { href: "/roadmap", name: "Roadmap" },
  { href: "/contact", name: "Contact" },
  { href: "/status", name: "Service status" },
];

/**
 * Global navigation. Sticky, translucent over the hero, solid after scroll.
 * One dropdown (Features), four direct links, login, and the primary CTA.
 * Mobile gets a composed full-screen panel, not a squeezed dropdown.
 */
export function SiteHeader() {
  const pathname = usePathname();
  const [scrolled, setScrolled] = useState(false);
  const [openMenu, setOpenMenu] = useState<"features" | "resources" | null>(null);
  const [mobileOpen, setMobileOpen] = useState(false);
  const navRef = useRef<HTMLElement>(null);
  const featuresMenuId = useId();
  const resourcesMenuId = useId();

  useEffect(() => {
    const onScroll = () => setScrolled(window.scrollY > 8);
    onScroll();
    window.addEventListener("scroll", onScroll, { passive: true });
    return () => window.removeEventListener("scroll", onScroll);
  }, []);

  /* Close menus on navigation. */
  useEffect(() => {
    setOpenMenu(null);
    setMobileOpen(false);
  }, [pathname]);

  /* Body scroll lock for the mobile panel. */
  useEffect(() => {
    document.body.dataset.navOpen = mobileOpen ? "true" : "false";
    return () => {
      delete document.body.dataset.navOpen;
    };
  }, [mobileOpen]);

  /* Escape and click-outside close desktop dropdowns. */
  useEffect(() => {
    if (!openMenu && !mobileOpen) return;
    const onKey = (e: KeyboardEvent) => {
      if (e.key === "Escape") {
        setOpenMenu(null);
        setMobileOpen(false);
      }
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
  }, [openMenu, mobileOpen]);

  const isCurrent = (href: string) =>
    pathname === href ? ("page" as const) : undefined;

  return (
    <header className="fj-header" data-scrolled={scrolled || mobileOpen}>
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
          <Link
            href="/integrations"
            className="fj-nav-link"
            aria-current={isCurrent("/integrations")}
          >
            Integrations
          </Link>
          <Link
            href="/security"
            className="fj-nav-link"
            aria-current={isCurrent("/security")}
          >
            Security
          </Link>

          <div className="fj-nav-item">
            <button
              type="button"
              className="fj-nav-link"
              aria-expanded={openMenu === "resources"}
              aria-controls={resourcesMenuId}
              onClick={() =>
                setOpenMenu(openMenu === "resources" ? null : "resources")
              }
            >
              Company
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
            {openMenu === "resources" ? (
              <div className="fj-nav-menu" id={resourcesMenuId}>
                {resourceLinks.map((r) => (
                  <Link key={r.href} href={r.href} className="fj-nav-menu__link">
                    <span className="fj-nav-menu__name">{r.name}</span>
                  </Link>
                ))}
              </div>
            ) : null}
          </div>
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
          <button
            type="button"
            className="fj-header__menu-button"
            aria-expanded={mobileOpen}
            aria-controls="fj-mobile-panel"
            aria-label={mobileOpen ? "Close menu" : "Open menu"}
            onClick={() => setMobileOpen((o) => !o)}
          >
            {mobileOpen ? (
              <svg width="20" height="20" viewBox="0 0 20 20" aria-hidden>
                <path
                  d="M5 5l10 10M15 5L5 15"
                  stroke="currentColor"
                  strokeWidth="1.75"
                  strokeLinecap="round"
                />
              </svg>
            ) : (
              <svg width="20" height="20" viewBox="0 0 20 20" aria-hidden>
                <path
                  d="M3 6h14M3 10h14M3 14h14"
                  stroke="currentColor"
                  strokeWidth="1.75"
                  strokeLinecap="round"
                />
              </svg>
            )}
          </button>
        </div>
      </div>

      <div id="fj-mobile-panel" className="fj-mobile-panel" hidden={!mobileOpen}>
        <nav aria-label="Mobile">
          <div className="fj-mobile-panel__group">
            <p className="fj-mobile-panel__label">Features</p>
            <div className="fj-mobile-panel__links">
              {featureLinks.map((f) => (
                <Link key={f.href} href={f.href} className="fj-mobile-panel__link">
                  <BrandIcon name={f.icon} size={18} />
                  {f.name}
                </Link>
              ))}
            </div>
          </div>
          <div className="fj-mobile-panel__group">
            <p className="fj-mobile-panel__label">Product</p>
            <div className="fj-mobile-panel__links">
              <Link href="/features" className="fj-mobile-panel__link">
                All features
              </Link>
              <Link href="/pricing" className="fj-mobile-panel__link">
                Pricing
              </Link>
              <Link href="/integrations" className="fj-mobile-panel__link">
                Integrations
              </Link>
              <Link href="/security" className="fj-mobile-panel__link">
                Security
              </Link>
            </div>
          </div>
          <div className="fj-mobile-panel__group">
            <p className="fj-mobile-panel__label">Company</p>
            <div className="fj-mobile-panel__links">
              {resourceLinks.map((r) => (
                <Link key={r.href} href={r.href} className="fj-mobile-panel__link">
                  {r.name}
                </Link>
              ))}
            </div>
          </div>
          <div className="fj-mobile-panel__cta">
            <BrandButtonLink
              href={cta.primary.href}
              data-fast-goal={DataFastGoals.navCta}
            >
              {cta.primary.label}
            </BrandButtonLink>
            <BrandButtonLink href="/login" variant="secondary">
              Log in
            </BrandButtonLink>
          </div>
        </nav>
      </div>
    </header>
  );
}
