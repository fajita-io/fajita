"use client";

import { useEffect, useId, useRef, useState } from "react";
import Link from "next/link";
import { usePathname } from "next/navigation";

import { BrandIcon } from "@/components/design-system/icons";
import { featureOrder, features } from "@/lib/site/features";

const featureLinks = featureOrder.map((slug) => ({
  href: `/features/${slug}`,
  name: features[slug].name,
  desc: features[slug].metaDescription.split(":")[0].replace(/^Fajita /, ""),
  icon: features[slug].icon,
}));

type SiteHeaderFeaturesMenuProps = {
  layout?: "desktop" | "mobile";
};

/** Features nav control — desktop dropdown or mobile accordion inside the drawer. */
export function SiteHeaderFeaturesMenu({
  layout = "desktop",
}: SiteHeaderFeaturesMenuProps) {
  const pathname = usePathname();
  const [open, setOpen] = useState(false);
  const navRef = useRef<HTMLDivElement>(null);
  const featuresMenuId = useId();

  useEffect(() => {
    setOpen(false);
  }, [pathname]);

  useEffect(() => {
    if (!open) return;
    const onKey = (e: KeyboardEvent) => {
      if (e.key === "Escape") setOpen(false);
    };
    const onClick = (e: MouseEvent) => {
      if (navRef.current && !navRef.current.contains(e.target as Node)) {
        setOpen(false);
      }
    };
    document.addEventListener("keydown", onKey);
    document.addEventListener("mousedown", onClick);
    return () => {
      document.removeEventListener("keydown", onKey);
      document.removeEventListener("mousedown", onClick);
    };
  }, [open]);

  const isMobile = layout === "mobile";

  return (
    <div
      className={`fj-nav-item${isMobile ? " fj-nav-item--mobile" : ""}`}
      ref={navRef}
    >
      <button
        type="button"
        className={`fj-nav-link${isMobile ? " fj-header-mobile-nav__link" : ""}`}
        aria-expanded={open}
        aria-controls={featuresMenuId}
        onClick={() => setOpen((value) => !value)}
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
      {open ? (
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
  );
}
