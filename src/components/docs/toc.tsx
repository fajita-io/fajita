import Link from "next/link";

import type { TocEntry } from "@/lib/docs/blocks";
import type { NavLink } from "@/lib/docs/registry";

/** On-page table of contents from the page's headings. */
export function DocsToc({ entries }: { entries: TocEntry[] }) {
  if (entries.length < 2) return null;
  return (
    <nav className="fj-docs-toc" aria-label="On this page">
      <p className="fj-docs-toc__label">On this page</p>
      <ul>
        {entries.map((e) => (
          <li key={e.id} className={`fj-docs-toc__item fj-docs-toc__item--${e.level}`}>
            <a href={`#${e.id}`}>{e.text}</a>
          </li>
        ))}
      </ul>
    </nav>
  );
}

export function DocsBreadcrumbs({ crumbs }: { crumbs: { label: string; href: string }[] }) {
  return (
    <nav aria-label="Breadcrumb" className="fj-docs-breadcrumbs">
      <ol>
        {crumbs.map((c, i) => (
          <li key={c.href}>
            {i < crumbs.length - 1 ? (
              <Link href={c.href}>{c.label}</Link>
            ) : (
              <span aria-current="page">{c.label}</span>
            )}
          </li>
        ))}
      </ol>
    </nav>
  );
}

export function DocsPrevNext({ prev, next }: { prev?: NavLink; next?: NavLink }) {
  if (!prev && !next) return null;
  return (
    <nav className="fj-docs-prevnext" aria-label="Previous and next">
      {prev ? (
        <Link href={`/docs/${prev.slug}`} className="fj-docs-prevnext__link">
          <span className="fj-docs-prevnext__dir">Previous</span>
          <span className="fj-docs-prevnext__title">{prev.title}</span>
        </Link>
      ) : (
        <span />
      )}
      {next ? (
        <Link href={`/docs/${next.slug}`} className="fj-docs-prevnext__link fj-docs-prevnext__link--next">
          <span className="fj-docs-prevnext__dir">Next</span>
          <span className="fj-docs-prevnext__title">{next.title}</span>
        </Link>
      ) : (
        <span />
      )}
    </nav>
  );
}

export function DocsRelated({ pages }: { pages: { slug: string; title: string }[] }) {
  if (pages.length === 0) return null;
  return (
    <section className="fj-docs-related" aria-label="Related pages">
      <p className="fj-docs-related__label">Related</p>
      <ul>
        {pages.map((p) => (
          <li key={p.slug}>
            <Link href={`/docs/${p.slug}`}>{p.title}</Link>
          </li>
        ))}
      </ul>
    </section>
  );
}
