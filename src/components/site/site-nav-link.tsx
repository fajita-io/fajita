"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";

/** Marketing nav link with pathname-aware `aria-current`. */
export function SiteNavLink({
  href,
  className,
  children,
}: {
  href: string;
  className?: string;
  children: React.ReactNode;
}) {
  const pathname = usePathname();

  return (
    <Link
      href={href}
      className={className}
      aria-current={pathname === href ? "page" : undefined}
    >
      {children}
    </Link>
  );
}
