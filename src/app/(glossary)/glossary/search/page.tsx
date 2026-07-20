import Link from "next/link";
import type { Metadata } from "next";

import { GlossarySearch } from "@/components/glossary/search";
import { buildMetadata } from "@/lib/site/metadata";

export const metadata: Metadata = {
  ...buildMetadata({
    title: "Search the Glossary",
    description: "Search Fajita glossary terms, acronyms, and synonyms.",
    path: "/glossary/search",
    noindex: true,
  }),
  robots: { index: false, follow: false },
};

export default function GlossarySearchPage() {
  return (
    <article className="fj-glossary-index">
      <header className="fj-glossary-index__hero">
        <p className="fj-eyebrow">
          <Link href="/glossary">Glossary</Link>
        </p>
        <h1 className="fj-heading-1">Search the glossary</h1>
        <p className="fj-body-lg">
          Find definitions by term, acronym, synonym, or short phrase.
        </p>
      </header>
      <GlossarySearch variant="inline" autoFocus />
    </article>
  );
}
