"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";

import { BrandIcon } from "@/components/design-system/icons";
import { AccountMenu } from "./account-menu";
import { NotificationCenter } from "./notification-center";
import { useApp } from "@/lib/app/app-context";

const SEGMENT_LABELS: Record<string, string> = {
  app: "Overview",
  team: "Team",
  settings: "Settings",
  profile: "Profile",
  organization: "Organization",
  security: "Security",
  preferences: "Preferences",
  notifications: "Notifications",
  data: "Data",
  onboarding: "Setup",
  "new-organization": "New organization",
  support: "Support",
  "coming-soon": "Unavailable",
};

interface Crumb {
  label: string;
  href: string;
}

function crumbsFor(pathname: string): Crumb[] {
  const parts = pathname.split("/").filter(Boolean); // ["app", ...]
  const crumbs: Crumb[] = [];
  let href = "";
  for (const part of parts) {
    href += `/${part}`;
    crumbs.push({ label: SEGMENT_LABELS[part] ?? part, href });
  }
  return crumbs;
}

export function Topbar({
  onOpenCommand,
}: {
  onOpenCommand: () => void;
}) {
  const { unreadNotifications } = useApp();
  const pathname = usePathname();
  const crumbs = crumbsFor(pathname);

  return (
    <header className="fj-topbar">
      <div className="fj-topbar__left">
        <nav aria-label="Breadcrumb" className="fj-breadcrumbs">
          <ol>
            {crumbs.map((c, i) => (
              <li key={c.href}>
                {i < crumbs.length - 1 ? (
                  <>
                    <Link href={c.href}>{c.label}</Link>
                    <BrandIcon name="chevron-right" size={12} />
                  </>
                ) : (
                  <span aria-current="page">{c.label}</span>
                )}
              </li>
            ))}
          </ol>
        </nav>
      </div>

      <div className="fj-topbar__right">
        <button
          type="button"
          className="fj-topbar__search"
          onClick={onOpenCommand}
          aria-label="Search and commands"
        >
          <BrandIcon name="search" size={16} />
          <span className="fj-topbar__search-text">Search</span>
          <kbd>⌘K</kbd>
        </button>
        <NotificationCenter initialUnread={unreadNotifications} />
        <AccountMenu />
      </div>
    </header>
  );
}
