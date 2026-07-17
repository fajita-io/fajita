import type { Metadata } from "next";

import { GlossarySearch } from "@/components/glossary/search";
import { PoweredByWiki } from "@/components/glossary/powered-by-wiki";
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
    <article className="fj-glossary-search-page">
      <h1 className="fj-heading-1">Search the glossary</h1>
      <p className="fj-body">
        Find definitions by term, acronym, synonym, or short phrase.
      </p>
      <GlossarySearch variant="inline" autoFocus />
      <PoweredByWiki />
    </article>
  );
}
