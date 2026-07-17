import Link from "next/link";

import type { NavLink } from "@/lib/glossary/registry";
import type { CtaVariant } from "@/lib/glossary/frontmatter";
import { DataFastGoals } from "@/lib/analytics/goals";

export function GlossaryBreadcrumbs({
  crumbs,
}: {
  crumbs: { label: string; href: string }[];
}) {
  return (
    <nav className="fj-docs-breadcrumbs" aria-label="Breadcrumb">
      <ol>
        {crumbs.map((c, i) => (
          <li key={c.href}>
            {i < crumbs.length - 1 ? (
              <Link href={c.href}>{c.label}</Link>
            ) : (
              <span aria-current="page">{c.label}</span>
            )}
            {i < crumbs.length - 1 ? (
              <span className="fj-docs-breadcrumbs__sep" aria-hidden="true">
                /
              </span>
            ) : null}
          </li>
        ))}
      </ol>
    </nav>
  );
}

export function GlossaryRelated({
  terms,
}: {
  terms: { slug: string; term: string }[];
}) {
  if (!terms.length) return null;
  return (
    <section className="fj-glossary-related" aria-labelledby="glossary-related-heading">
      <h2 id="glossary-related-heading" className="fj-heading-3">
        Related terms
      </h2>
      <ul className="fj-glossary-related__list">
        {terms.map((t) => (
          <li key={t.slug}>
            <Link
              href={`/glossary/${t.slug}`}
              data-fast-goal={DataFastGoals.glossaryRelatedSelected}
              data-fast-goal-slug={t.slug}
            >
              {t.term}
            </Link>
          </li>
        ))}
      </ul>
    </section>
  );
}

export function GlossaryPrevNext({
  prev,
  next,
}: {
  prev?: NavLink;
  next?: NavLink;
}) {
  if (!prev && !next) return null;
  return (
    <nav className="fj-docs-prevnext" aria-label="Adjacent terms">
      {prev ? (
        <Link href={`/glossary/${prev.slug}`} className="fj-docs-prevnext__link">
          <span className="fj-docs-prevnext__label">Previous</span>
          <span className="fj-docs-prevnext__title">{prev.title}</span>
        </Link>
      ) : (
        <span />
      )}
      {next ? (
        <Link href={`/glossary/${next.slug}`} className="fj-docs-prevnext__link fj-docs-prevnext__link--next">
          <span className="fj-docs-prevnext__label">Next</span>
          <span className="fj-docs-prevnext__title">{next.title}</span>
        </Link>
      ) : null}
    </nav>
  );
}

export function GlossaryDocLinks({
  links,
}: {
  links: { href: string; label: string }[];
}) {
  if (!links.length) return null;
  return (
    <section className="fj-glossary-docs" aria-labelledby="glossary-docs-heading">
      <h2 id="glossary-docs-heading" className="fj-heading-3">
        Related documentation
      </h2>
      <ul>
        {links.map((l) => (
          <li key={l.href}>
            <Link
              href={l.href}
              data-fast-goal={DataFastGoals.glossaryDocsLinkSelected}
            >
              {l.label}
            </Link>
          </li>
        ))}
      </ul>
    </section>
  );
}

const CTA_COPY: Record<
  Exclude<CtaVariant, "none">,
  { title: string; body: string; href: string; label: string }
> = {
  monitor: {
    title: "Monitor your first endpoint with Fajita",
    body: "Create a website, API, certificate, or heartbeat monitor and test it before monitoring begins.",
    href: "/signup",
    label: "Start monitoring",
  },
  alert: {
    title: "Route alerts where your team already works",
    body: "Connect email, Slack, Discord, or a webhook and decide who hears about verified failures.",
    href: "/integrations",
    label: "See integrations",
  },
  "status-page": {
    title: "Publish a status page customers can trust",
    body: "Show components, incidents, maintenance, and uptime history on a page you control.",
    href: "/features/status-pages",
    label: "Explore status pages",
  },
  documentation: {
    title: "Read the implementation guide",
    body: "Glossary pages explain concepts. Documentation shows the exact product steps.",
    href: "/docs",
    label: "Open docs",
  },
};

/** Server-safe CTA (no client hook). Analytics via data-fast-goal attributes. */
export function GlossaryProductCTA({ variant }: { variant: CtaVariant }) {
  if (variant === "none") return null;
  const copy = CTA_COPY[variant];
  return (
    <aside className="fj-glossary-cta" aria-label="Next step with Fajita">
      <h2 className="fj-heading-3">{copy.title}</h2>
      <p className="fj-body">{copy.body}</p>
      <Link
        href={copy.href}
        className="fj-button fj-button--primary"
        data-fast-goal={DataFastGoals.glossaryProductCta}
        data-fast-goal-variant={variant}
      >
        {copy.label}
      </Link>
    </aside>
  );
}
