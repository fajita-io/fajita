"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";
import { useEffect } from "react";

import { BrandIcon } from "@/components/design-system/icons";
import { FajitaMark } from "@/components/brand/logo/fajita-mark";
import { GeniusSidebarTrigger } from "@/components/genius/genius-sidebar-trigger";
import { AvailabilityBadge } from "./ui";
import { OrgSwitcher } from "./org-switcher";
import { useApp } from "@/lib/app/app-context";
import { buildNav, isPlannedItem } from "@/lib/app/nav-model";

/**
 * Mobile navigation sheet. Not a squeezed desktop sidebar: a full-height panel
 * with the org switcher, grouped destinations, and safe-area padding. Closes on
 * navigation and Escape; focus returns to the trigger (handled by the button).
 */
export function MobileNav({
  open,
  onClose,
}: {
  open: boolean;
  onClose: () => void;
}) {
  const app = useApp();
  const pathname = usePathname();

  useEffect(() => {
    onClose();
    // Close whenever the route changes.
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [pathname]);

  useEffect(() => {
    if (!open) return;
    const onKey = (e: KeyboardEvent) => {
      if (e.key === "Escape") onClose();
    };
    document.body.dataset.appNavOpen = "true";
    document.addEventListener("keydown", onKey);
    return () => {
      delete document.body.dataset.appNavOpen;
      document.removeEventListener("keydown", onKey);
    };
  }, [open, onClose]);

  const groups = buildNav({
    features: app.features,
    permissions: app.permissions,
    isPlatformAdmin: app.isPlatformAdmin,
  });

  if (!open) return null;

  return (
    <div className="fj-mobilenav" role="dialog" aria-modal="true" aria-label="Navigation">
      <div className="fj-mobilenav__backdrop" onClick={onClose} />
      <div className="fj-mobilenav__panel">
        <div className="fj-mobilenav__head">
          <FajitaMark size={26} label="Fajita" />
          <button
            type="button"
            className="fj-icon-button"
            aria-label="Close navigation"
            onClick={onClose}
          >
            <BrandIcon name="close" size={18} />
          </button>
        </div>

        <div className="fj-mobilenav__org">
          <OrgSwitcher />
        </div>

        <nav aria-label="Application sections" className="fj-mobilenav__nav">
          {groups.map((group, gi) => (
            <div className="fj-mobilenav__group" key={group.label ?? `g${gi}`}>
              {group.label ? (
                <p className="fj-sidenav__grouplabel">{group.label}</p>
              ) : null}
              {group.items.map((item) => {
                const planned = isPlannedItem(item, app.features);
                const active =
                  item.href === "/app"
                    ? pathname === "/app"
                    : pathname.startsWith(item.href);
                return (
                  <Link
                    key={item.href}
                    href={planned ? "/app/coming-soon" : item.href}
                    className="fj-mobilenav__link"
                    aria-current={active ? "page" : undefined}
                    {...(item.external ? { target: "_blank", rel: "noreferrer" } : {})}
                  >
                    <BrandIcon name={item.icon} size={18} />
                    <span>{item.label}</span>
                    {planned ? <AvailabilityBadge /> : null}
                  </Link>
                );
              })}
            </div>
          ))}
          <div className="fj-mobilenav__feedback">
            <GeniusSidebarTrigger collapsed={false} />
          </div>
        </nav>
      </div>
    </div>
  );
}
