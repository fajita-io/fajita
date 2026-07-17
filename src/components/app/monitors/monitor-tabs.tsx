"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";

/**
 * Tab navigation for a monitor. Real routes (not client-only state) so each tab
 * is linkable and back/forward works. Heartbeat and SSL monitors hide tabs that
 * do not apply to them.
 */
export function MonitorTabs({
  monitorId,
  monitorType,
}: {
  monitorId: string;
  monitorType: string;
}) {
  const pathname = usePathname();
  const base = `/app/monitors/${monitorId}`;

  const tabs: Array<{ label: string; href: string }> = [
    { label: "Overview", href: base },
    { label: "Checks", href: `${base}/checks` },
    { label: "History", href: `${base}/history` },
    { label: "Configuration", href: `${base}/configuration` },
    { label: "Versions", href: `${base}/versions` },
    { label: "Security", href: `${base}/security` },
    { label: "Settings", href: `${base}/settings` },
  ];

  // Heartbeat monitors run no outbound checks: hide the history chart tab.
  const visible =
    monitorType === "heartbeat"
      ? tabs.filter((t) => t.label !== "History")
      : tabs;

  return (
    <nav className="fj-tabs" aria-label="Monitor sections">
      {visible.map((t) => {
        const active = t.href === base ? pathname === base : pathname === t.href || pathname.startsWith(`${t.href}/`);
        return (
          <Link key={t.href} href={t.href} className="fj-tab" aria-current={active ? "page" : undefined}>
            {t.label}
          </Link>
        );
      })}
    </nav>
  );
}
