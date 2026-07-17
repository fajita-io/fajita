"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";

export interface SettingsNavItem {
  label: string;
  href: string;
}

export function SettingsNav({ items }: { items: SettingsNavItem[] }) {
  const pathname = usePathname();
  return (
    <nav className="fj-settings-nav" aria-label="Settings">
      {items.map((item) => {
        const active =
          item.href === "/app/settings"
            ? pathname === item.href
            : pathname === item.href || pathname.startsWith(`${item.href}/`);
        return (
          <Link
            key={item.href}
            href={item.href}
            aria-current={active ? "page" : undefined}
          >
            {item.label}
          </Link>
        );
      })}
    </nav>
  );
}
