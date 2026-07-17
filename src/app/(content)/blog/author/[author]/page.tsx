import Link from "next/link";
import type { Metadata } from "next";
import { notFound } from "next/navigation";

import { AUTHORS, getAuthor } from "@/lib/content/authors";
import { articlesByAuthor } from "@/lib/content/registry";
import { buildMetadata } from "@/lib/site/metadata";

interface Params {
  author: string;
}

export const dynamicParams = false;

export function generateStaticParams(): Params[] {
  return AUTHORS.map((a) => ({ author: a.slug }));
}

export async function generateMetadata({
  params,
}: {
  params: Promise<Params>;
}): Promise<Metadata> {
  const { author: slug } = await params;
  const author = getAuthor(slug);
  if (!author) return {};
  return buildMetadata({
    title: `${author.name}`,
    description: author.bio.slice(0, 160),
    path: `/blog/author/${author.slug}`,
  });
}

export default async function BlogAuthorPage({
  params,
}: {
  params: Promise<Params>;
}) {
  const { author: slug } = await params;
  const author = getAuthor(slug);
  if (!author) notFound();
  const articles = articlesByAuthor(author.slug);

  return (
    <div>
      <header className="fj-content-index__hero">
        <p className="fj-eyebrow">
          <Link href="/blog">Blog</Link>
        </p>
        <h1 className="fj-heading-1">{author.name}</h1>
        <p className="fj-body-lg">{author.bio}</p>
        <p className="fj-content-meta">
          {author.role}
          {author.organizationAuthor ? " · Organization author" : ""}
        </p>
        <p className="fj-body-sm">Expertise: {author.expertise.join(", ")}</p>
      </header>
      <section aria-labelledby="authored-heading">
        <h2 id="authored-heading" className="fj-heading-2">
          Published articles
        </h2>
        {articles.length ? (
          <ul className="fj-content-grid">
            {articles.map((a) => (
              <li key={a.meta.slug}>
                <Link href={`/blog/${a.meta.slug}`} className="fj-content-card">
                  {a.meta.title}
                </Link>
              </li>
            ))}
          </ul>
        ) : (
          <p>No published articles for this author yet.</p>
        )}
      </section>
    </div>
  );
}
