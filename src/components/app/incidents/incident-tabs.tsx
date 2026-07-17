"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";

/** Real, linkable tabs for an incident (matches the monitor detail pattern). */
export function IncidentTabs({ incidentId }: { incidentId: string }) {
  const pathname = usePathname();
  const base = `/app/incidents/${incidentId}`;
  const tabs = [
    { label: "Overview", href: base },
    { label: "Timeline", href: `${base}/timeline` },
    { label: "Evidence", href: `${base}/evidence` },
    { label: "Updates", href: `${base}/updates` },
    { label: "Settings", href: `${base}/settings` },
  ];

  return (
    <nav className="fj-tabs" aria-label="Incident sections">
      {tabs.map((t) => {
        const active =
          t.href === base ? pathname === base : pathname === t.href || pathname.startsWith(`${t.href}/`);
        return (
          <Link key={t.href} href={t.href} className="fj-tab" aria-current={active ? "page" : undefined}>
            {t.label}
          </Link>
        );
      })}
    </nav>
  );
}
