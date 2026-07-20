import Link from "next/link";
import type { Metadata } from "next";
import { notFound } from "next/navigation";

import { GlossaryAlphabet } from "@/components/glossary/alphabet";
import {
  alphabetAvailability,
  termsByLetter,
} from "@/lib/glossary/registry";
import { buildMetadata } from "@/lib/site/metadata";

interface Params {
  letter: string;
}

export const dynamicParams = false;

export function generateStaticParams(): Params[] {
  return alphabetAvailability()
    .filter((l) => l.count > 0)
    .map((l) => ({ letter: l.letter }));
}

export async function generateMetadata({
  params,
}: {
  params: Promise<Params>;
}): Promise<Metadata> {
  const { letter } = await params;
  const upper = letter.toUpperCase();
  return buildMetadata({
    title: `Glossary Terms: ${upper}`,
    description: `Software reliability glossary terms beginning with ${upper}.`,
    path: `/glossary/letter/${letter.toLowerCase()}`,
  });
}

export default async function GlossaryLetterPage({
  params,
}: {
  params: Promise<Params>;
}) {
  const { letter: raw } = await params;
  const letter = raw.toLowerCase();
  if (!/^[a-z]$/.test(letter)) notFound();
  const terms = termsByLetter(letter);
  if (terms.length === 0) notFound();
  const letters = alphabetAvailability();

  return (
    <article className="fj-glossary-index">
      <header className="fj-glossary-index__hero">
        <p className="fj-eyebrow">
          <Link href="/glossary">Glossary</Link>
        </p>
        <h1 className="fj-heading-1">Terms: {letter.toUpperCase()}</h1>
      </header>
      <GlossaryAlphabet letters={letters} active={letter} />
      <ul className="fj-glossary-term-list">
        {terms.map((t) => (
          <li key={t.meta.slug}>
            <Link href={`/glossary/${t.meta.slug}`}>
              <strong>{t.meta.term}</strong>
              <span>{t.meta.shortDefinition}</span>
            </Link>
          </li>
        ))}
      </ul>
    </article>
  );
}
