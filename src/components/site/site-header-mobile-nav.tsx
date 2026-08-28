"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";
import { useEffect, useId, useRef, useState } from "react";

import { BrandButtonLink } from "@/components/design-system/primitives";
import { GitHubStarLinkLive } from "@/components/site/oss/github-star-link-live";
import { SiteHeaderFeaturesMenu } from "@/components/site/site-header-features-menu";
import { DataFastGoals } from "@/lib/analytics/goals";
import { cta } from "@/lib/site/site-config";

function MobileMenuIcon() {
  return (
    <svg
      className="fj-header-mobile-toggle__icon"
      width="18"
      height="18"
      viewBox="0 0 18 18"
      aria-hidden
    >
      <path
        className="fj-header-mobile-toggle__line fj-header-mobile-toggle__line--top"
        d="M2.5 5.25h13"
        stroke="currentColor"
        strokeWidth="1.5"
        strokeLinecap="round"
      />
      <path
        className="fj-header-mobile-toggle__line fj-header-mobile-toggle__line--mid"
        d="M2.5 9h13"
        stroke="currentColor"
        strokeWidth="1.5"
        strokeLinecap="round"
      />
      <path
        className="fj-header-mobile-toggle__line fj-header-mobile-toggle__line--bot"
        d="M2.5 12.75h13"
        stroke="currentColor"
        strokeWidth="1.5"
        strokeLinecap="round"
      />
    </svg>
  );
}

/**
 * Mobile navigation drawer for the marketing header. Desktop nav hides below
 * 63.75rem; this keeps core routes reachable on small screens.
 */
export function SiteHeaderMobileNav({
  showGithubStar = false,
}: {
  showGithubStar?: boolean;
}) {
  const pathname = usePathname();
  const [open, setOpen] = useState(false);
  const navId = useId();
  const toggleRef = useRef<HTMLButtonElement>(null);
  const panelRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    setOpen(false);
  }, [pathname]);

  useEffect(() => {
    if (!open) return;
    document.body.classList.add("fj-header-mobile-nav-open");

    const firstFocusable = panelRef.current?.querySelector<HTMLElement>(
      'a, button:not([disabled]), input, select, textarea, [tabindex]:not([tabindex="-1"])',
    );
    firstFocusable?.focus();

    const onKey = (e: KeyboardEvent) => {
      if (e.key === "Escape") {
        setOpen(false);
        toggleRef.current?.focus();
        return;
      }

      if (e.key !== "Tab" || !panelRef.current) return;

      const focusables = Array.from(
        panelRef.current.querySelectorAll<HTMLElement>(
          'a, button:not([disabled]), input, select, textarea, [tabindex]:not([tabindex="-1"])',
        ),
      ).filter((el) => el.offsetParent !== null);

      if (focusables.length === 0) return;

      const first = focusables[0];
      const last = focusables[focusables.length - 1];

      if (e.shiftKey && document.activeElement === first) {
        e.preventDefault();
        last.focus();
      } else if (!e.shiftKey && document.activeElement === last) {
        e.preventDefault();
        first.focus();
      }
    };

    window.addEventListener("keydown", onKey);
    return () => {
      document.body.classList.remove("fj-header-mobile-nav-open");
      window.removeEventListener("keydown", onKey);
    };
  }, [open]);

  const close = () => {
    setOpen(false);
    toggleRef.current?.focus();
  };

  return (
    <>
      <button
        ref={toggleRef}
        type="button"
        className="fj-header-mobile-toggle"
        aria-expanded={open}
        aria-controls={navId}
        aria-label={open ? "Close menu" : "Open menu"}
        onClick={() => setOpen((v) => !v)}
      >
        <MobileMenuIcon />
      </button>
      {open ? (
        <>
          <button
            type="button"
            className="fj-header-mobile-backdrop"
            aria-label="Close menu"
            onClick={close}
          />
          <div
            ref={panelRef}
            id={navId}
            className="fj-header-mobile-nav"
            role="dialog"
            aria-modal="true"
            aria-label="Site navigation"
          >
            <nav className="fj-header-mobile-nav__links" aria-label="Mobile">
              <SiteHeaderFeaturesMenu layout="mobile" />
              <Link
                href="/pricing"
                className="fj-nav-link fj-header-mobile-nav__link"
                aria-current={pathname === "/pricing" ? "page" : undefined}
                onClick={close}
              >
                Pricing
              </Link>
              <Link
                href="/docs"
                className="fj-nav-link fj-header-mobile-nav__link"
                onClick={close}
              >
                Docs
              </Link>
              <Link
                href="/blog"
                className="fj-nav-link fj-header-mobile-nav__link"
                onClick={close}
              >
                Blog
              </Link>
              {showGithubStar ? (
                <div className="fj-header-mobile-nav__github">
                  <GitHubStarLinkLive />
                </div>
              ) : null}
              <Link
                href="/login"
                className="fj-nav-link fj-header-mobile-nav__link"
                onClick={close}
              >
                Log in
              </Link>
            </nav>
            <div className="fj-header-mobile-nav__footer">
              <BrandButtonLink
                href={cta.primary.href}
                size="sm"
                className="fj-header-mobile-nav__cta"
                data-fast-goal={DataFastGoals.navCta}
                onClick={close}
              >
                {cta.primary.label}
              </BrandButtonLink>
            </div>
          </div>
        </>
      ) : null}
    </>
  );
}
