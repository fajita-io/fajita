"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";

import { FajitaMark } from "@/components/brand/logo/fajita-mark";
import { BrandIcon } from "@/components/design-system/icons";
import { Tooltip } from "@/components/design-system/primitives";
import { GeniusSidebarTrigger } from "@/components/genius/genius-sidebar-trigger";
import { AvailabilityBadge } from "./ui";
import { OrgSwitcher } from "./org-switcher";
import { useApp } from "@/lib/app/app-context";
import { buildNav, isPlannedItem, type NavItem } from "@/lib/app/nav-model";

function itemActive(pathname: string, href: string): boolean {
  if (href === "/app") return pathname === "/app";
  return pathname === href || pathname.startsWith(`${href}/`);
}

function SidebarLink({
  item,
  collapsed,
  active,
  planned,
}: {
  item: NavItem;
  collapsed: boolean;
  active: boolean;
  planned: boolean;
}) {
  const inner = (
    <>
      <BrandIcon name={item.icon} size={18} />
      {!collapsed ? (
        <>
          <span className="fj-sidenav__label">{item.label}</span>
          {planned ? <AvailabilityBadge /> : null}
          {item.external ? <BrandIcon name="external" size={13} /> : null}
        </>
      ) : null}
    </>
  );

  // Planned (unavailable) destinations are shown only to platform admins and
  // never link into a broken flow: they route to a truthful pre-feature page.
  const href = planned ? "/app/coming-soon" : item.href;

  const link = (
    <Link
      href={href}
      className="fj-sidenav__link"
      aria-current={active ? "page" : undefined}
      aria-disabled={planned || undefined}
      data-planned={planned || undefined}
      {...(item.external ? { target: "_blank", rel: "noreferrer" } : {})}
    >
      {inner}
    </Link>
  );

  if (collapsed) {
    return <Tooltip content={item.label}>{link}</Tooltip>;
  }
  return link;
}

export function Sidebar({
  collapsed,
  onToggle,
}: {
  collapsed: boolean;
  onToggle: () => void;
}) {
  const app = useApp();
  const pathname = usePathname();
  const groups = buildNav({
    features: app.features,
    permissions: app.permissions,
    isPlatformAdmin: app.isPlatformAdmin,
  });

  return (
    <aside
      className="fj-sidebar"
      data-collapsed={collapsed || undefined}
      aria-label="Primary"
    >
      <div className="fj-sidebar__top">
        <Link href="/app" className="fj-sidebar__brand" aria-label="Fajita">
          <FajitaMark size={26} label="" />
          {!collapsed ? <span className="fj-sidebar__brandword">Fajita</span> : null}
        </Link>
      </div>

      {!collapsed ? (
        <div className="fj-sidebar__org">
          <OrgSwitcher />
        </div>
      ) : null}

      <nav className="fj-sidebar__nav" aria-label="Application sections">
        {groups.map((group, gi) => (
          <div className="fj-sidenav__group" key={group.label ?? `g${gi}`}>
            {group.label && !collapsed ? (
              <p className="fj-sidenav__grouplabel">{group.label}</p>
            ) : null}
            {group.items.map((item) => (
              <SidebarLink
                key={item.href}
                item={item}
                collapsed={collapsed}
                active={itemActive(pathname, item.href)}
                planned={isPlannedItem(item, app.features)}
              />
            ))}
          </div>
        ))}
      </nav>

      <div className="fj-sidebar__feedback">
        <GeniusSidebarTrigger collapsed={collapsed} />
      </div>

      <button
        type="button"
        className="fj-sidebar__collapse"
        aria-label={collapsed ? "Expand sidebar" : "Collapse sidebar"}
        aria-pressed={collapsed}
        onClick={onToggle}
      >
        <BrandIcon name={collapsed ? "chevron-right" : "chevron-down"} size={16} />
        {!collapsed ? <span>Collapse</span> : null}
      </button>
    </aside>
  );
}
