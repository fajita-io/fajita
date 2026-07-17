import Link from "next/link";

const LINKS = [
  { href: "/internal/scale/overview", label: "Overview" },
  { href: "/internal/scale/readiness", label: "Readiness" },
  { href: "/internal/scale/channels", label: "Channels" },
  { href: "/internal/scale/campaigns", label: "Campaigns" },
  { href: "/internal/scale/capacity", label: "Capacity" },
  { href: "/internal/scale/forecast", label: "Forecast" },
  { href: "/internal/scale/hiring", label: "Hiring" },
  { href: "/internal/scale/risks", label: "Risks" },
  { href: "/internal/scale/reviews", label: "Reviews" },
] as const;

export function ScaleSubnav({ current }: { current?: string }) {
  return (
    <nav aria-label="Scale sections" className="fj-ops-subnav">
      <ul className="fj-ops-subnav__list">
        {LINKS.map((link) => {
          const active = current === link.href;
          return (
            <li key={link.href}>
              <Link
                href={link.href}
                className={
                  active
                    ? "fj-ops-subnav__link fj-ops-subnav__link--active"
                    : "fj-ops-subnav__link"
                }
                aria-current={active ? "page" : undefined}
              >
                {link.label}
              </Link>
            </li>
          );
        })}
      </ul>
    </nav>
  );
}
