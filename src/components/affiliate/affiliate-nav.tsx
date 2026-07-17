"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";

const LINKS = [
  { href: "/affiliate", label: "Overview" },
  { href: "/affiliate/performance", label: "Performance" },
  { href: "/affiliate/links", label: "Links" },
  { href: "/affiliate/resources", label: "Resources" },
  { href: "/affiliate/payouts", label: "Payouts" },
  { href: "/affiliate/settings", label: "Settings" },
];

export function AffiliateNav() {
  const pathname = usePathname();
  return (
    <nav className="fj-affiliate__nav" aria-label="Affiliate">
      {LINKS.map((link) => {
        const active =
          link.href === "/affiliate"
            ? pathname === "/affiliate"
            : pathname.startsWith(link.href);
        return (
          <Link
            key={link.href}
            href={link.href}
            className="fj-affiliate__navlink"
            aria-current={active ? "page" : undefined}
          >
            {link.label}
          </Link>
        );
      })}
    </nav>
  );
}
