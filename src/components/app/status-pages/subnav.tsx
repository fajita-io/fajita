"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";

const TABS = [
  { seg: "", label: "Overview" },
  { seg: "components", label: "Components" },
  { seg: "incidents", label: "Incidents" },
  { seg: "maintenance", label: "Maintenance" },
  { seg: "subscribers", label: "Subscribers" },
  { seg: "appearance", label: "Appearance" },
  { seg: "domain", label: "Domain" },
  { seg: "seo", label: "SEO" },
  { seg: "versions", label: "Versions" },
  { seg: "preview", label: "Preview" },
  { seg: "settings", label: "Settings" },
];

export function StatusPageSubnav({ statusPageId }: { statusPageId: string }) {
  const pathname = usePathname();
  const base = `/app/status-pages/${statusPageId}`;

  return (
    <nav className="fj-sp-subnav" aria-label="Status page sections">
      {TABS.map((tab) => {
        const href = tab.seg ? `${base}/${tab.seg}` : base;
        const active = tab.seg ? pathname === href || pathname.startsWith(`${href}/`) : pathname === base;
        return (
          <Link
            key={tab.seg || "overview"}
            href={href}
            className="fj-sp-subnav__link"
            aria-current={active ? "page" : undefined}
          >
            {tab.label}
          </Link>
        );
      })}
    </nav>
  );
}
