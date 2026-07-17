import Link from "next/link";

import { getAuthor } from "@/lib/content/authors";
import { getArticle } from "@/lib/content/registry";

export function ContentBreadcrumbs({
  items,
}: {
  items: { href: string; label: string }[];
}) {
  return (
    <nav aria-label="Breadcrumb" className="fj-content-breadcrumbs">
      <ol>
        {items.map((item, i) => (
          <li key={item.href}>
            {i < items.length - 1 ? (
              <Link href={item.href}>{item.label}</Link>
            ) : (
              <span aria-current="page">{item.label}</span>
            )}
          </li>
        ))}
      </ol>
    </nav>
  );
}

export function RelatedArticles({ slugs }: { slugs: string[] }) {
  const articles = slugs
    .map((s) => getArticle(s))
    .filter((a): a is NonNullable<typeof a> => Boolean(a));
  if (!articles.length) return null;
  return (
    <section aria-labelledby="related-articles-heading" className="fj-content-related">
      <h2 id="related-articles-heading" className="fj-heading-3">
        Related articles
      </h2>
      <ul>
        {articles.map((a) => (
          <li key={a.meta.slug}>
            <Link href={`/blog/${a.meta.slug}`}>{a.meta.title}</Link>
          </li>
        ))}
      </ul>
    </section>
  );
}

export function RelatedLinks({
  title,
  links,
}: {
  title: string;
  links: { href: string; label: string }[];
}) {
  if (!links.length) return null;
  return (
    <section className="fj-content-related">
      <h2 className="fj-heading-3">{title}</h2>
      <ul>
        {links.map((l) => (
          <li key={l.href}>
            <Link href={l.href}>{l.label}</Link>
          </li>
        ))}
      </ul>
    </section>
  );
}

export function AuthorByline({ authorSlug }: { authorSlug: string }) {
  const author = getAuthor(authorSlug);
  if (!author) return null;
  return (
    <p className="fj-content-byline">
      <Link href={`/blog/author/${author.slug}`}>{author.name}</Link>
      <span aria-hidden="true"> · </span>
      <span>{author.role}</span>
    </p>
  );
}
